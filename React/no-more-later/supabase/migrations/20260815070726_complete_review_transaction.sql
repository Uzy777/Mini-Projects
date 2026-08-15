create or replace function public.complete_review(
    p_journey_id uuid,
    p_quest_id uuid,
    p_planned_minutes integer,
    p_actual_seconds integer,
    p_outcome text,
    p_accomplishment text,
    p_next_action text,
    p_earned_xp integer
)
returns table (
    focus_session_id uuid,
    quest_title text,
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
    v_quest_status text;
    v_journey_status text;
    v_focus_session_id uuid;
    v_total_xp bigint;
begin
    if v_user_id is null then
        raise exception 'You must be signed in to complete a Review.';
    end if;

    perform 1
    from public.journeys
    where id = p_journey_id
      and user_id = v_user_id
    for update;

    if not found then
        raise exception 'Journey not found or access denied.';
    end if;

    select title
    into v_quest_title
    from public.quests
    where id = p_quest_id
      and journey_id = p_journey_id;

    if not found then
        raise exception 'Quest not found or access denied.';
    end if;

    v_quest_status :=
        case
            when p_outcome = 'completed'
                then 'completed'
            else 'active'
        end;

    insert into public.focus_sessions (
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
        v_user_id,
        p_journey_id,
        p_quest_id,
        v_quest_title,
        p_planned_minutes,
        p_actual_seconds,
        p_outcome,
        coalesce(p_accomplishment, ''),
        coalesce(p_next_action, ''),
        p_earned_xp,
        now()
    )
    returning id
    into v_focus_session_id;

    update public.quests
    set
        status = v_quest_status,
        last_accomplishment =
            nullif(
                coalesce(p_accomplishment, ''),
                ''
            ),
        next_action =
            case
                when v_quest_status = 'completed'
                    then null
                else nullif(
                    coalesce(p_next_action, ''),
                    ''
                )
            end
    where id = p_quest_id
      and journey_id = p_journey_id;

    select
        case
            when exists (
                select 1
                from public.quests
                where journey_id = p_journey_id
            )
            and not exists (
                select 1
                from public.quests
                where journey_id = p_journey_id
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

    select coalesce(
        sum(earned_xp),
        0
    )
    into v_total_xp
    from public.focus_sessions
    where user_id = v_user_id;

    return query
    select
        v_focus_session_id,
        v_quest_title,
        v_total_xp,
        v_journey_status;
end;
$$;

revoke execute on function public.complete_review(
    uuid,
    uuid,
    integer,
    integer,
    text,
    text,
    text,
    integer
)
from public;

revoke execute on function public.complete_review(
    uuid,
    uuid,
    integer,
    integer,
    text,
    text,
    text,
    integer
)
from anon;

grant execute on function public.complete_review(
    uuid,
    uuid,
    integer,
    integer,
    text,
    text,
    text,
    integer
)
to authenticated;