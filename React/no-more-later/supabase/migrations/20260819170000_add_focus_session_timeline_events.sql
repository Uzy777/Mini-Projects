alter table public.focus_sessions
add column timeline_events jsonb not null default '[]'::jsonb;

alter table public.focus_sessions
add constraint focus_sessions_timeline_events_is_array
check (jsonb_typeof(timeline_events) = 'array');

create function public.complete_review(
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

    if jsonb_typeof(coalesce(p_timeline_events, '[]'::jsonb)) <> 'array' then
        raise exception
            'Focus Session timeline events must be an array.';
    end if;

    if p_journey_id is not null then
        perform 1
        from public.journeys
        where id = p_journey_id
          and user_id = v_user_id
        for update;

        if not found then
            raise exception
                'Journey not found or access denied.';
        end if;
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
        if p_journey_id is not null then
            select journeys.status
            into v_journey_status
            from public.journeys
            where journeys.id = p_journey_id
              and journeys.user_id = v_user_id;
        else
            v_journey_status := null;
        end if;

        select coalesce(
            sum(focus_sessions.earned_xp),
            0
        )
        into v_total_xp
        from public.focus_sessions
        where focus_sessions.user_id = v_user_id;

        return query
        select
            p_focus_session_id,
            v_existing_quest_title,
            v_existing_earned_xp,
            v_total_xp,
            v_journey_status;

        return;
    end if;

    select quests.title
    into v_quest_title
    from public.quests
    where quests.id = p_quest_id
      and quests.user_id = v_user_id
      and (
          (
              p_journey_id is null
              and quests.journey_id is null
          )
          or quests.journey_id = p_journey_id
      );

    if not found then
        raise exception
            'Quest not found or access denied.';
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

    v_earned_xp := v_earned_xp + 10;

    if p_outcome = 'completed' then
        v_earned_xp := v_earned_xp + 20;
    end if;

    if
        p_outcome <> 'completed'
        and btrim(
            coalesce(p_next_action, '')
        ) <> ''
    then
        v_earned_xp := v_earned_xp + 10;
    end if;

    insert into public.focus_sessions (
        id,
        user_id,
        journey_id,
        quest_id,
        quest_title,
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
        p_journey_id,
        p_quest_id,
        v_quest_title,
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

    update public.quests
    set
        status = case
            when p_outcome = 'completed'
                then 'completed'
            else
                'active'
        end,

        last_accomplishment = nullif(
            coalesce(
                p_accomplishment,
                ''
            ),
            ''
        ),

        next_action = case
            when p_outcome = 'completed'
                then null
            else
                nullif(
                    coalesce(
                        p_next_action,
                        ''
                    ),
                    ''
                )
        end
    where quests.id = p_quest_id
      and quests.user_id = v_user_id
      and (
          (
              p_journey_id is null
              and quests.journey_id is null
          )
          or quests.journey_id = p_journey_id
      );

    if p_journey_id is not null then
        select
            case
                when exists (
                    select 1
                    from public.quests
                    where quests.journey_id =
                        p_journey_id
                )
                and not exists (
                    select 1
                    from public.quests
                    where quests.journey_id =
                        p_journey_id
                      and quests.status <>
                        'completed'
                )
                    then 'completed'
                else
                    'active'
            end
        into v_journey_status;

        update public.journeys
        set status = v_journey_status
        where journeys.id = p_journey_id
          and journeys.user_id = v_user_id;
    else
        v_journey_status := null;
    end if;

    select coalesce(
        sum(focus_sessions.earned_xp),
        0
    )
    into v_total_xp
    from public.focus_sessions
    where focus_sessions.user_id = v_user_id;

    return query
    select
        v_focus_session_id,
        v_quest_title,
        v_earned_xp,
        v_total_xp,
        v_journey_status;
end;
$function$;

revoke execute on function public.complete_review(
    uuid,
    uuid,
    uuid,
    integer,
    integer,
    text,
    text,
    text,
    jsonb
)
from public;

revoke execute on function public.complete_review(
    uuid,
    uuid,
    uuid,
    integer,
    integer,
    text,
    text,
    text,
    jsonb
)
from anon;

grant execute on function public.complete_review(
    uuid,
    uuid,
    uuid,
    integer,
    integer,
    text,
    text,
    text,
    jsonb
)
to authenticated;
