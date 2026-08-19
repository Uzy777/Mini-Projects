alter table public.focus_sessions
drop constraint if exists focus_sessions_session_kind_check;

alter table public.focus_sessions
add constraint focus_sessions_session_kind_check
check (session_kind in ('quest', 'quick', 'short_break', 'long_break'));

create or replace function public.calculate_focus_session_xp(
    p_actual_seconds integer,
    p_outcome text,
    p_bonus_earned boolean
)
returns integer
language sql
immutable
set search_path to ''
as $function$
    select case
        when p_actual_seconds < 600 then 0
        when p_outcome = 'stopped' then 20
        else least(
            200,
            greatest(20, round(p_actual_seconds / 30.0)::integer)
            + 10
            + case when p_bonus_earned then 10 else 0 end
        )
    end;
$function$;

revoke execute on function public.calculate_focus_session_xp(integer, text, boolean) from public;
revoke execute on function public.calculate_focus_session_xp(integer, text, boolean) from anon;
grant execute on function public.calculate_focus_session_xp(integer, text, boolean) to authenticated;

create or replace function public.complete_review(
    p_focus_session_id uuid,
    p_journey_id uuid,
    p_quest_id uuid,
    p_planned_minutes integer,
    p_actual_seconds integer,
    p_outcome text,
    p_accomplishment text,
    p_next_action text,
    p_timeline_events jsonb
)
returns table(
    focus_session_id uuid,
    quest_title text,
    earned_xp integer,
    total_xp bigint,
    journey_status text
)
language plpgsql
set search_path to ''
as $function$
declare
    v_user_id uuid := auth.uid();
    v_quest_title text;
    v_journey_status text;
    v_focus_session_id uuid;
    v_earned_xp integer := 0;
    v_total_xp bigint;
    v_existing_quest_title text;
    v_existing_earned_xp integer;
    v_rewarded_seconds integer;
    v_bonus_earned boolean;
begin
    if v_user_id is null then
        raise exception 'You must be signed in to complete a Review.';
    end if;

    if p_outcome not in ('completed', 'progressed', 'blocked', 'stopped') then
        raise exception 'Invalid Review outcome.';
    end if;

    if p_planned_minutes <= 0 or p_actual_seconds < 0 then
        raise exception 'Focus Session durations must be valid.';
    end if;

    if jsonb_typeof(coalesce(p_timeline_events, '[]'::jsonb)) <> 'array' then
        raise exception 'Focus Session timeline events must be an array.';
    end if;

    select focus_sessions.quest_title, focus_sessions.earned_xp
    into v_existing_quest_title, v_existing_earned_xp
    from public.focus_sessions
    where focus_sessions.id = p_focus_session_id
      and focus_sessions.user_id = v_user_id;

    if found then
        select journeys.status into v_journey_status
        from public.journeys
        where journeys.id = p_journey_id
          and journeys.user_id = v_user_id;

        select coalesce(sum(focus_sessions.earned_xp), 0)
        into v_total_xp
        from public.focus_sessions
        where focus_sessions.user_id = v_user_id;

        return query select p_focus_session_id, v_existing_quest_title, v_existing_earned_xp, v_total_xp, v_journey_status;
        return;
    end if;

    if p_journey_id is not null then
        perform 1
        from public.journeys
        where id = p_journey_id
          and user_id = v_user_id
        for update;

        if not found then
            raise exception 'Journey not found or access denied.';
        end if;
    end if;

    select quests.title
    into v_quest_title
    from public.quests
    where quests.id = p_quest_id
      and quests.user_id = v_user_id
      and ((p_journey_id is null and quests.journey_id is null) or quests.journey_id = p_journey_id);

    if not found then
        raise exception 'Quest not found or access denied.';
    end if;

    v_rewarded_seconds := least(p_actual_seconds, p_planned_minutes * 60);
    v_bonus_earned := p_outcome = 'completed'
        or (p_outcome <> 'completed' and btrim(coalesce(p_next_action, '')) <> '');
    v_earned_xp := public.calculate_focus_session_xp(
        v_rewarded_seconds,
        case when p_actual_seconds < p_planned_minutes * 60 then 'stopped' else p_outcome end,
        v_bonus_earned
    );

    insert into public.focus_sessions (
        id, user_id, journey_id, quest_id, quest_title, session_kind,
        planned_minutes, actual_seconds, outcome, accomplishment,
        next_action, earned_xp, completed_at, timeline_events
    ) values (
        p_focus_session_id, v_user_id, p_journey_id, p_quest_id, v_quest_title, 'quest',
        p_planned_minutes, p_actual_seconds, p_outcome, coalesce(p_accomplishment, ''),
        coalesce(p_next_action, ''), v_earned_xp, now(), coalesce(p_timeline_events, '[]'::jsonb)
    )
    returning focus_sessions.id into v_focus_session_id;

    update public.quests
    set
        status = case when p_outcome = 'completed' then 'completed' else 'active' end,
        last_accomplishment = nullif(coalesce(p_accomplishment, ''), ''),
        next_action = case when p_outcome = 'completed' then null else nullif(coalesce(p_next_action, ''), '') end
    where quests.id = p_quest_id
      and quests.user_id = v_user_id
      and ((p_journey_id is null and quests.journey_id is null) or quests.journey_id = p_journey_id);

    if p_journey_id is not null then
        select case
            when exists (select 1 from public.quests where quests.journey_id = p_journey_id)
             and not exists (select 1 from public.quests where quests.journey_id = p_journey_id and quests.status <> 'completed')
            then 'completed'
            else 'active'
        end into v_journey_status;

        update public.journeys
        set status = v_journey_status
        where journeys.id = p_journey_id
          and journeys.user_id = v_user_id;
    else
        v_journey_status := null;
    end if;

    select coalesce(sum(focus_sessions.earned_xp), 0)
    into v_total_xp
    from public.focus_sessions
    where focus_sessions.user_id = v_user_id;

    return query select v_focus_session_id, v_quest_title, v_earned_xp, v_total_xp, v_journey_status;
end;
$function$;

create or replace function public.complete_quick_focus_review(
    p_focus_session_id uuid,
    p_planned_minutes integer,
    p_actual_seconds integer,
    p_outcome text,
    p_accomplishment text,
    p_next_action text,
    p_timeline_events jsonb
)
returns table(
    focus_session_id uuid,
    quest_title text,
    earned_xp integer,
    total_xp bigint,
    journey_status text
)
language plpgsql
set search_path to ''
as $function$
declare
    v_user_id uuid := auth.uid();
    v_focus_session_id uuid;
    v_earned_xp integer := 0;
    v_total_xp bigint;
    v_existing_quest_title text;
    v_existing_earned_xp integer;
    v_rewarded_seconds integer;
    v_bonus_earned boolean;
begin
    if v_user_id is null then
        raise exception 'You must be signed in to complete a Review.';
    end if;

    if p_outcome not in ('completed', 'progressed', 'blocked', 'stopped') then
        raise exception 'Invalid Review outcome.';
    end if;

    if p_planned_minutes <= 0 or p_actual_seconds < 0 then
        raise exception 'Focus Session durations must be valid.';
    end if;

    if jsonb_typeof(coalesce(p_timeline_events, '[]'::jsonb)) <> 'array' then
        raise exception 'Focus Session timeline events must be an array.';
    end if;

    select focus_sessions.quest_title, focus_sessions.earned_xp
    into v_existing_quest_title, v_existing_earned_xp
    from public.focus_sessions
    where focus_sessions.id = p_focus_session_id
      and focus_sessions.user_id = v_user_id;

    if found then
        select coalesce(sum(focus_sessions.earned_xp), 0)
        into v_total_xp
        from public.focus_sessions
        where focus_sessions.user_id = v_user_id;

        return query select p_focus_session_id, v_existing_quest_title, v_existing_earned_xp, v_total_xp, null::text;
        return;
    end if;

    v_rewarded_seconds := least(p_actual_seconds, p_planned_minutes * 60);
    v_bonus_earned := p_outcome <> 'completed' and btrim(coalesce(p_next_action, '')) <> '';
    v_earned_xp := public.calculate_focus_session_xp(
        v_rewarded_seconds,
        case when p_actual_seconds < p_planned_minutes * 60 then 'stopped' else p_outcome end,
        v_bonus_earned
    );

    insert into public.focus_sessions (
        id, user_id, journey_id, quest_id, quest_title, session_kind,
        planned_minutes, actual_seconds, outcome, accomplishment,
        next_action, earned_xp, completed_at, timeline_events
    ) values (
        p_focus_session_id, v_user_id, null, null, 'Quick Focus', 'quick',
        p_planned_minutes, p_actual_seconds, p_outcome, coalesce(p_accomplishment, ''),
        coalesce(p_next_action, ''), v_earned_xp, now(), coalesce(p_timeline_events, '[]'::jsonb)
    )
    returning focus_sessions.id into v_focus_session_id;

    select coalesce(sum(focus_sessions.earned_xp), 0)
    into v_total_xp
    from public.focus_sessions
    where focus_sessions.user_id = v_user_id;

    return query select v_focus_session_id, 'Quick Focus'::text, v_earned_xp, v_total_xp, null::text;
end;
$function$;

create or replace function public.complete_break_session(
    p_focus_session_id uuid,
    p_session_kind text,
    p_planned_minutes integer,
    p_actual_seconds integer,
    p_timeline_events jsonb
)
returns uuid
language plpgsql
set search_path to ''
as $function$
declare
    v_user_id uuid := auth.uid();
    v_title text;
begin
    if v_user_id is null then
        raise exception 'You must be signed in to save a Break.';
    end if;

    if p_session_kind not in ('short_break', 'long_break') then
        raise exception 'Invalid Break type.';
    end if;

    if p_planned_minutes <= 0 or p_actual_seconds < 0 then
        raise exception 'Break durations must be valid.';
    end if;

    if jsonb_typeof(coalesce(p_timeline_events, '[]'::jsonb)) <> 'array' then
        raise exception 'Break timeline events must be an array.';
    end if;

    perform 1
    from public.focus_sessions
    where focus_sessions.id = p_focus_session_id
      and focus_sessions.user_id = v_user_id;

    if found then
        return p_focus_session_id;
    end if;

    v_title := case when p_session_kind = 'short_break' then 'Short Break' else 'Long Break' end;

    insert into public.focus_sessions (
        id, user_id, journey_id, quest_id, quest_title, session_kind,
        planned_minutes, actual_seconds, outcome, accomplishment,
        next_action, earned_xp, completed_at, timeline_events
    ) values (
        p_focus_session_id, v_user_id, null, null, v_title, p_session_kind,
        p_planned_minutes, least(p_actual_seconds, p_planned_minutes * 60), 'completed', '',
        '', 0, now(), coalesce(p_timeline_events, '[]'::jsonb)
    );

    return p_focus_session_id;
end;
$function$;

revoke execute on function public.complete_break_session(uuid, text, integer, integer, jsonb) from public;
revoke execute on function public.complete_break_session(uuid, text, integer, integer, jsonb) from anon;
grant execute on function public.complete_break_session(uuid, text, integer, integer, jsonb) to authenticated;
