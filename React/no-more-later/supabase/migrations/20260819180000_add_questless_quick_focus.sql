alter table public.focus_sessions
add column session_kind text not null default 'quest'
check (session_kind in ('quest', 'quick'));

create function public.complete_quick_focus_review(
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
begin
    if v_user_id is null then
        raise exception
            'You must be signed in to complete a Review.';
    end if;

    if p_outcome not in (
        'completed',
        'progressed',
        'blocked',
        'stopped'
    ) then
        raise exception
            'Invalid Review outcome.';
    end if;

    if p_planned_minutes <= 0 or p_actual_seconds < 0 then
        raise exception
            'Focus Session durations must be valid.';
    end if;

    if jsonb_typeof(coalesce(p_timeline_events, '[]'::jsonb)) <> 'array' then
        raise exception
            'Focus Session timeline events must be an array.';
    end if;

    select
        focus_sessions.quest_title,
        focus_sessions.earned_xp
    into
        v_existing_quest_title,
        v_existing_earned_xp
    from public.focus_sessions
    where focus_sessions.id = p_focus_session_id
      and focus_sessions.user_id = v_user_id;

    if found then
        select coalesce(sum(focus_sessions.earned_xp), 0)
        into v_total_xp
        from public.focus_sessions
        where focus_sessions.user_id = v_user_id;

        return query
        select
            p_focus_session_id,
            v_existing_quest_title,
            v_existing_earned_xp,
            v_total_xp,
            null::text;

        return;
    end if;

    if p_outcome <> 'stopped' then
        if p_planned_minutes = 15 then
            v_earned_xp := v_earned_xp + 20;
        elsif p_planned_minutes = 25 then
            v_earned_xp := v_earned_xp + 40;
        elsif p_planned_minutes = 50 then
            v_earned_xp := v_earned_xp + 70;
        end if;
    end if;

    -- Completing the Review. Quest-completion XP is intentionally not
    -- awarded because this session is not attached to a Quest.
    v_earned_xp := v_earned_xp + 10;

    if
        p_outcome <> 'completed'
        and btrim(coalesce(p_next_action, '')) <> ''
    then
        v_earned_xp := v_earned_xp + 10;
    end if;

    insert into public.focus_sessions (
        id,
        user_id,
        journey_id,
        quest_id,
        quest_title,
        session_kind,
        planned_minutes,
        actual_seconds,
        outcome,
        accomplishment,
        next_action,
        earned_xp,
        completed_at,
        timeline_events
    )
    values (
        p_focus_session_id,
        v_user_id,
        null,
        null,
        'Quick Focus',
        'quick',
        p_planned_minutes,
        p_actual_seconds,
        p_outcome,
        coalesce(p_accomplishment, ''),
        coalesce(p_next_action, ''),
        v_earned_xp,
        now(),
        coalesce(p_timeline_events, '[]'::jsonb)
    )
    returning focus_sessions.id
    into v_focus_session_id;

    select coalesce(sum(focus_sessions.earned_xp), 0)
    into v_total_xp
    from public.focus_sessions
    where focus_sessions.user_id = v_user_id;

    return query
    select
        v_focus_session_id,
        'Quick Focus'::text,
        v_earned_xp,
        v_total_xp,
        null::text;
end;
$function$;

revoke execute on function public.complete_quick_focus_review(
    uuid,
    integer,
    integer,
    text,
    text,
    text,
    jsonb
)
from public;

revoke execute on function public.complete_quick_focus_review(
    uuid,
    integer,
    integer,
    text,
    text,
    text,
    jsonb
)
from anon;

grant execute on function public.complete_quick_focus_review(
    uuid,
    integer,
    integer,
    text,
    text,
    text,
    jsonb
)
to authenticated;
