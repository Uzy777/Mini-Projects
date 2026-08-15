-- Remove the previous complete_review function signatures.
drop function if exists public.complete_review(
    uuid,
    uuid,
    integer,
    integer,
    text,
    text,
    text
);

drop function if exists public.complete_review(
    uuid,
    uuid,
    integer,
    integer,
    text,
    text,
    text,
    integer
);

create function public.complete_review(
    p_focus_session_id uuid,
    p_journey_id uuid,
    p_quest_id uuid,
    p_planned_minutes integer,
    p_actual_seconds integer,
    p_outcome text,
    p_accomplishment text,
    p_next_action text
)
returns table (
    focus_session_id uuid,
    quest_title text,
    earned_xp integer,
    total_xp bigint,
    journey_status text
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_user_id uuid := auth.uid();
    v_quest_title text;
    v_journey_status text;
    v_focus_session_id uuid;
    v_earned_xp integer := 0;
    v_total_xp bigint;
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

    -- Lock this Journey while the Review is processed.
    perform 1
    from public.journeys
    where id = p_journey_id
      and user_id = v_user_id
    for update;

    if not found then
        raise exception
            'Journey not found or access denied.';
    end if;

    -- -------------------------------------------------
    -- IDEMPOTENCY CHECK
    -- -------------------------------------------------
    -- If this exact Focus Session has already been
    -- completed, return its existing result instead of
    -- creating another Focus Session or awarding XP again.
    select
        focus_sessions.quest_title,
        focus_sessions.earned_xp
    into
        v_quest_title,
        v_earned_xp
    from public.focus_sessions
    where id = p_focus_session_id
      and user_id = v_user_id;

    if found then
        select journeys.status
        into v_journey_status
        from public.journeys
        where id = p_journey_id
          and user_id = v_user_id;

        select coalesce(
            sum(focus_sessions.earned_xp),
            0
        )
        into v_total_xp
        from public.focus_sessions
        where user_id = v_user_id;

        return query
        select
            p_focus_session_id,
            v_quest_title,
            v_earned_xp,
            v_total_xp,
            v_journey_status;

        return;
    end if;

    -- Get the real Quest title from the database.
    select quests.title
    into v_quest_title
    from public.quests
    where id = p_quest_id
      and journey_id = p_journey_id;

    if not found then
        raise exception
            'Quest not found or access denied.';
    end if;

    -- -------------------------------------------------
    -- XP CALCULATION
    -- -------------------------------------------------

    -- Duration XP.
    if p_outcome <> 'stopped' then
        if p_planned_minutes = 15 then
            v_earned_xp := v_earned_xp + 20;

        elsif p_planned_minutes = 25 then
            v_earned_xp := v_earned_xp + 40;

        elsif p_planned_minutes = 50 then
            v_earned_xp := v_earned_xp + 70;
        end if;
    end if;

    -- Completing the Review.
    v_earned_xp := v_earned_xp + 10;

    -- Completing the Quest.
    if p_outcome = 'completed' then
        v_earned_xp := v_earned_xp + 20;
    end if;

    -- Setting a next action.
    if
        p_outcome <> 'completed'
        and btrim(
            coalesce(p_next_action, '')
        ) <> ''
    then
        v_earned_xp := v_earned_xp + 10;
    end if;

    -- -------------------------------------------------
    -- CREATE COMPLETED FOCUS SESSION
    -- -------------------------------------------------

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
        completed_at
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
        now()
    )
    returning id
    into v_focus_session_id;

    -- -------------------------------------------------
    -- UPDATE QUEST
    -- -------------------------------------------------

    update public.quests
    set
        status = case
            when p_outcome = 'completed'
                then 'completed'
            else 'active'
        end,

        last_accomplishment =
            nullif(
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
    where id = p_quest_id
      and journey_id = p_journey_id;

    -- -------------------------------------------------
    -- UPDATE JOURNEY
    -- -------------------------------------------------

    select
        case
            when exists (
                select 1
                from public.quests
                where journey_id =
                    p_journey_id
            )
            and not exists (
                select 1
                from public.quests
                where journey_id =
                    p_journey_id
                  and status <> 'completed'
            )
                then 'completed'
            else 'active'
        end
    into v_journey_status;

    update public.journeys
    set status = v_journey_status
    where id = p_journey_id
      and user_id = v_user_id;

    -- -------------------------------------------------
    -- TOTAL XP
    -- -------------------------------------------------

    select coalesce(
        sum(focus_sessions.earned_xp),
        0
    )
    into v_total_xp
    from public.focus_sessions
    where user_id = v_user_id;

    return query
    select
        v_focus_session_id,
        v_quest_title,
        v_earned_xp,
        v_total_xp,
        v_journey_status;
end;
$$;

revoke execute on function public.complete_review(
    uuid,
    uuid,
    uuid,
    integer,
    integer,
    text,
    text,
    text
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
    text
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
    text
)
to authenticated;