-- XP V2
-- - 3 XP per complete credited focus minute after a five-minute minimum.
-- - A completed outcome adds a 20% bonus.
-- - At most 360 focus minutes per UTC day are credited for XP/leaderboards.
-- - Existing XP is preserved as version 1; new reviewed sessions use version 2.

alter table public.focus_sessions
add column if not exists credited_focus_seconds integer not null default 0,
add column if not exists base_xp integer not null default 0,
add column if not exists bonus_xp integer not null default 0,
add column if not exists xp_version smallint not null default 1,
add column if not exists xp_credit_status text not null default 'legacy',
add column if not exists credit_day date;

update public.focus_sessions
set
    credited_focus_seconds = case
        when session_kind in ('quest', 'quick')
         and least(coalesce(actual_seconds, planned_minutes * 60), planned_minutes * 60) >= 300
        then least(coalesce(actual_seconds, planned_minutes * 60), planned_minutes * 60)
        else 0
    end,
    base_xp = earned_xp,
    bonus_xp = 0,
    xp_version = 1,
    xp_credit_status = 'legacy',
    credit_day = (completed_at at time zone 'UTC')::date
where xp_version = 1;

alter table public.focus_sessions
drop constraint if exists focus_sessions_credited_focus_seconds_check;

alter table public.focus_sessions
add constraint focus_sessions_credited_focus_seconds_check
check (credited_focus_seconds >= 0 and credited_focus_seconds <= 21600);

alter table public.focus_sessions
drop constraint if exists focus_sessions_base_xp_check;

alter table public.focus_sessions
add constraint focus_sessions_base_xp_check check (base_xp >= 0);

alter table public.focus_sessions
drop constraint if exists focus_sessions_bonus_xp_check;

alter table public.focus_sessions
add constraint focus_sessions_bonus_xp_check check (bonus_xp >= 0);

alter table public.focus_sessions
drop constraint if exists focus_sessions_xp_version_check;

alter table public.focus_sessions
add constraint focus_sessions_xp_version_check check (xp_version in (1, 2));

alter table public.focus_sessions
drop constraint if exists focus_sessions_xp_credit_status_check;

alter table public.focus_sessions
add constraint focus_sessions_xp_credit_status_check
check (xp_credit_status in ('legacy', 'credited', 'under_minimum', 'daily_limit', 'unverified', 'break'));

create index if not exists focus_sessions_leaderboard_credit_idx
on public.focus_sessions (user_id, credit_day, completed_at)
where session_kind in ('quest', 'quick') and credited_focus_seconds > 0;

create table if not exists public.focus_session_runs (
    id uuid primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    planned_minutes integer not null check (planned_minutes between 10 and 120),
    session_kind text not null check (session_kind in ('quest', 'quick')),
    state text not null check (state in ('running', 'paused', 'completed', 'abandoned')),
    accumulated_seconds integer not null default 0 check (accumulated_seconds >= 0),
    started_at timestamptz not null default now(),
    last_resumed_at timestamptz,
    ended_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists focus_session_runs_user_state_idx
on public.focus_session_runs (user_id, state);

alter table public.focus_session_runs enable row level security;
revoke all on table public.focus_session_runs from public;
revoke all on table public.focus_session_runs from anon;
revoke all on table public.focus_session_runs from authenticated;

drop policy if exists "Users can create their own focus sessions" on public.focus_sessions;
revoke insert on table public.focus_sessions from authenticated;

create or replace function public.start_focus_session_run(
    p_focus_session_id uuid,
    p_planned_minutes integer,
    p_session_kind text
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_user_id uuid := auth.uid();
    v_existing_user_id uuid;
begin
    if v_user_id is null then
        raise exception 'You must be signed in to start a credited Focus Session.';
    end if;

    if p_planned_minutes < 10 or p_planned_minutes > 120 then
        raise exception 'Focus Session duration must be between 10 and 120 minutes.';
    end if;

    if p_session_kind not in ('quest', 'quick') then
        raise exception 'Invalid Focus Session type.';
    end if;

    select runs.user_id
    into v_existing_user_id
    from public.focus_session_runs runs
    where runs.id = p_focus_session_id;

    if found then
        if v_existing_user_id <> v_user_id then
            raise exception 'Focus Session ID is already in use.';
        end if;

        return;
    end if;

    update public.focus_session_runs
    set state = 'abandoned', ended_at = now(), updated_at = now()
    where user_id = v_user_id
      and state in ('running', 'paused');

    insert into public.focus_session_runs (
        id, user_id, planned_minutes, session_kind, state, last_resumed_at
    ) values (
        p_focus_session_id, v_user_id, p_planned_minutes, p_session_kind, 'running', now()
    );
end;
$function$;

create or replace function public.pause_focus_session_run(p_focus_session_id uuid)
returns integer
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_user_id uuid := auth.uid();
    v_accumulated_seconds integer;
begin
    if v_user_id is null then
        raise exception 'You must be signed in to pause a credited Focus Session.';
    end if;

    update public.focus_session_runs
    set
        accumulated_seconds = least(
            planned_minutes * 60,
            accumulated_seconds + greatest(0, floor(extract(epoch from (now() - last_resumed_at)))::integer)
        ),
        state = 'paused',
        last_resumed_at = null,
        updated_at = now()
    where id = p_focus_session_id
      and user_id = v_user_id
      and state = 'running'
    returning accumulated_seconds into v_accumulated_seconds;

    if not found then
        select runs.accumulated_seconds
        into v_accumulated_seconds
        from public.focus_session_runs runs
        where runs.id = p_focus_session_id
          and runs.user_id = v_user_id;
    end if;

    return v_accumulated_seconds;
end;
$function$;

create or replace function public.resume_focus_session_run(p_focus_session_id uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_user_id uuid := auth.uid();
begin
    if v_user_id is null then
        raise exception 'You must be signed in to resume a credited Focus Session.';
    end if;

    update public.focus_session_runs
    set state = 'running', last_resumed_at = now(), updated_at = now()
    where id = p_focus_session_id
      and user_id = v_user_id
      and state = 'paused'
      and accumulated_seconds < planned_minutes * 60;
end;
$function$;

create or replace function public.finish_focus_session_run(p_focus_session_id uuid)
returns integer
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_user_id uuid := auth.uid();
    v_accumulated_seconds integer;
begin
    if v_user_id is null then
        raise exception 'You must be signed in to finish a credited Focus Session.';
    end if;

    update public.focus_session_runs
    set
        accumulated_seconds = least(
            planned_minutes * 60,
            accumulated_seconds + case
                when state = 'running' and last_resumed_at is not null
                then greatest(0, floor(extract(epoch from (now() - last_resumed_at)))::integer)
                else 0
            end
        ),
        state = 'completed',
        last_resumed_at = null,
        ended_at = coalesce(ended_at, now()),
        updated_at = now()
    where id = p_focus_session_id
      and user_id = v_user_id
      and state in ('running', 'paused', 'completed')
    returning accumulated_seconds into v_accumulated_seconds;

    return v_accumulated_seconds;
end;
$function$;

revoke execute on function public.start_focus_session_run(uuid, integer, text) from public, anon;
revoke execute on function public.pause_focus_session_run(uuid) from public, anon;
revoke execute on function public.resume_focus_session_run(uuid) from public, anon;
revoke execute on function public.finish_focus_session_run(uuid) from public, anon;
grant execute on function public.start_focus_session_run(uuid, integer, text) to authenticated;
grant execute on function public.pause_focus_session_run(uuid) to authenticated;
grant execute on function public.resume_focus_session_run(uuid) to authenticated;
grant execute on function public.finish_focus_session_run(uuid) to authenticated;

drop function if exists public.calculate_focus_session_xp(integer, text, boolean);

create function public.calculate_focus_session_xp(
    p_credited_seconds integer,
    p_outcome text
)
returns integer
language sql
immutable
set search_path to ''
as $function$
    select case
        when p_credited_seconds < 300 then 0
        else
            (floor(p_credited_seconds / 60.0)::integer * 3)
            + case
                when p_outcome = 'completed'
                then floor((floor(p_credited_seconds / 60.0)::integer * 3) * 0.20)::integer
                else 0
              end
    end;
$function$;

revoke execute on function public.calculate_focus_session_xp(integer, text) from public, anon;
grant execute on function public.calculate_focus_session_xp(integer, text) to authenticated;

drop function if exists public.complete_review(uuid, uuid, uuid, integer, integer, text, text, text);
drop function if exists public.complete_review(uuid, uuid, uuid, integer, integer, text, text, text, jsonb);
drop function if exists public.complete_review(uuid, uuid, uuid, integer, integer, text, text, text, jsonb, boolean);

create function public.complete_review(
    p_focus_session_id uuid,
    p_journey_id uuid,
    p_quest_id uuid,
    p_planned_minutes integer,
    p_actual_seconds integer,
    p_outcome text,
    p_accomplishment text,
    p_next_action text,
    p_timeline_events jsonb,
    p_finish_line_confirmed boolean
)
returns table(
    focus_session_id uuid,
    quest_title text,
    earned_xp integer,
    total_xp bigint,
    journey_status text,
    base_xp integer,
    bonus_xp integer,
    credited_focus_seconds integer,
    daily_credited_seconds integer,
    xp_credit_status text
)
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_user_id uuid := auth.uid();
    v_quest_title text;
    v_quest_done_when text;
    v_journey_status text;
    v_existing public.focus_sessions%rowtype;
    v_run public.focus_session_runs%rowtype;
    v_actual_seconds integer := 0;
    v_daily_before integer := 0;
    v_daily_after integer := 0;
    v_daily_remaining integer := 0;
    v_credited_seconds integer := 0;
    v_base_xp integer := 0;
    v_bonus_xp integer := 0;
    v_earned_xp integer := 0;
    v_total_xp bigint := 0;
    v_credit_status text := 'unverified';
    v_planned_minutes integer := p_planned_minutes;
begin
    if v_user_id is null then
        raise exception 'You must be signed in to complete a Review.';
    end if;

    if p_outcome not in ('completed', 'progressed', 'blocked', 'stopped') then
        raise exception 'Invalid Review outcome.';
    end if;

    if p_planned_minutes < 10 or p_planned_minutes > 120 or p_actual_seconds < 0 then
        raise exception 'Focus Session duration must be valid.';
    end if;

    if jsonb_typeof(coalesce(p_timeline_events, '[]'::jsonb)) <> 'array' then
        raise exception 'Focus Session timeline events must be an array.';
    end if;

    -- Serialise Reviews per user so duplicate submissions and the daily cap
    -- are both evaluated against committed data inside this transaction.
    perform 1 from public.profiles profiles where profiles.id = v_user_id for update;

    select sessions.* into v_existing
    from public.focus_sessions sessions
    where sessions.id = p_focus_session_id
      and sessions.user_id = v_user_id;

    if found then
        select journeys.status into v_journey_status
        from public.journeys journeys
        where journeys.id = p_journey_id
          and journeys.user_id = v_user_id;

        select coalesce(sum(sessions.earned_xp), 0) into v_total_xp
        from public.focus_sessions sessions
        where sessions.user_id = v_user_id;

        select least(coalesce(sum(sessions.credited_focus_seconds), 0), 21600)::integer
        into v_daily_after
        from public.focus_sessions sessions
        where sessions.user_id = v_user_id
          and sessions.credit_day = v_existing.credit_day
          and sessions.session_kind in ('quest', 'quick');

        return query select
            v_existing.id, v_existing.quest_title, v_existing.earned_xp, v_total_xp,
            v_journey_status, v_existing.base_xp, v_existing.bonus_xp,
            v_existing.credited_focus_seconds, v_daily_after, v_existing.xp_credit_status;
        return;
    end if;

    if p_journey_id is not null then
        perform 1 from public.journeys journeys
        where journeys.id = p_journey_id and journeys.user_id = v_user_id
        for update;

        if not found then
            raise exception 'Journey not found or access denied.';
        end if;
    end if;

    select quests.title, quests.done_when into v_quest_title, v_quest_done_when
    from public.quests quests
    where quests.id = p_quest_id
      and quests.user_id = v_user_id
      and ((p_journey_id is null and quests.journey_id is null) or quests.journey_id = p_journey_id);

    if not found then
        raise exception 'Quest not found or access denied.';
    end if;

    if p_outcome <> 'stopped' and nullif(trim(coalesce(p_accomplishment, '')), '') is null then
        raise exception 'Describe what you accomplished before completing the Review.';
    end if;

    if p_outcome = 'completed'
       and nullif(trim(coalesce(v_quest_done_when, '')), '') is not null
       and not coalesce(p_finish_line_confirmed, false) then
        raise exception 'Confirm that the Quest finish line was met.';
    end if;

    select runs.* into v_run
    from public.focus_session_runs runs
    where runs.id = p_focus_session_id
      and runs.user_id = v_user_id
      and runs.session_kind = 'quest'
    for update;

    if found then
        v_planned_minutes := v_run.planned_minutes;
        v_actual_seconds := least(
            v_run.planned_minutes * 60,
            v_run.accumulated_seconds + case
                when v_run.state = 'running' and v_run.last_resumed_at is not null
                then greatest(0, floor(extract(epoch from (now() - v_run.last_resumed_at)))::integer)
                else 0
            end
        );

        update public.focus_session_runs
        set accumulated_seconds = v_actual_seconds, state = 'completed', last_resumed_at = null,
            ended_at = coalesce(ended_at, now()), updated_at = now()
        where id = p_focus_session_id;

        select least(coalesce(sum(sessions.credited_focus_seconds), 0), 21600)::integer
        into v_daily_before
        from public.focus_sessions sessions
        where sessions.user_id = v_user_id
          and sessions.credit_day = (now() at time zone 'UTC')::date
          and sessions.session_kind in ('quest', 'quick');

        v_daily_remaining := greatest(0, 21600 - v_daily_before);

        if v_actual_seconds < 300 then
            v_credit_status := 'under_minimum';
        elsif v_daily_remaining = 0 then
            v_credit_status := 'daily_limit';
        else
            v_credited_seconds := least(v_actual_seconds, v_daily_remaining);
            v_base_xp := floor(v_credited_seconds / 60.0)::integer * 3;
            v_bonus_xp := case when p_outcome = 'completed' then floor(v_base_xp * 0.20)::integer else 0 end;
            v_earned_xp := v_base_xp + v_bonus_xp;
            v_credit_status := 'credited';
        end if;
    else
        v_actual_seconds := least(p_actual_seconds, p_planned_minutes * 60);
        v_credit_status := 'unverified';
    end if;

    v_daily_after := least(21600, v_daily_before + v_credited_seconds);

    insert into public.focus_sessions (
        id, user_id, journey_id, quest_id, quest_title, session_kind,
        planned_minutes, actual_seconds, outcome, accomplishment, next_action,
        earned_xp, completed_at, timeline_events, credited_focus_seconds,
        base_xp, bonus_xp, xp_version, xp_credit_status, credit_day
    ) values (
        p_focus_session_id, v_user_id, p_journey_id, p_quest_id, v_quest_title, 'quest',
        v_planned_minutes, v_actual_seconds, p_outcome, coalesce(p_accomplishment, ''), coalesce(p_next_action, ''),
        v_earned_xp, now(), coalesce(p_timeline_events, '[]'::jsonb), v_credited_seconds,
        v_base_xp, v_bonus_xp, 2, v_credit_status, (now() at time zone 'UTC')::date
    );

    update public.quests
    set
        status = case when p_outcome = 'completed' then 'completed' else 'active' end,
        last_accomplishment = nullif(coalesce(p_accomplishment, ''), ''),
        next_action = case when p_outcome = 'completed' then null else nullif(coalesce(p_next_action, ''), '') end
    where id = p_quest_id
      and user_id = v_user_id
      and ((p_journey_id is null and journey_id is null) or journey_id = p_journey_id);

    if p_journey_id is not null then
        select case
            when exists (select 1 from public.quests quests where quests.journey_id = p_journey_id)
             and not exists (select 1 from public.quests quests where quests.journey_id = p_journey_id and quests.status <> 'completed')
            then 'completed'
            else 'active'
        end into v_journey_status;

        update public.journeys set status = v_journey_status
        where id = p_journey_id and user_id = v_user_id;
    else
        v_journey_status := null;
    end if;

    select coalesce(sum(sessions.earned_xp), 0) into v_total_xp
    from public.focus_sessions sessions
    where sessions.user_id = v_user_id;

    return query select
        p_focus_session_id, v_quest_title, v_earned_xp, v_total_xp,
        v_journey_status, v_base_xp, v_bonus_xp, v_credited_seconds,
        v_daily_after, v_credit_status;
end;
$function$;

drop function if exists public.complete_quick_focus_review(uuid, integer, integer, text, text, text, jsonb);

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
    journey_status text,
    base_xp integer,
    bonus_xp integer,
    credited_focus_seconds integer,
    daily_credited_seconds integer,
    xp_credit_status text
)
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_user_id uuid := auth.uid();
    v_existing public.focus_sessions%rowtype;
    v_run public.focus_session_runs%rowtype;
    v_actual_seconds integer := 0;
    v_daily_before integer := 0;
    v_daily_after integer := 0;
    v_daily_remaining integer := 0;
    v_credited_seconds integer := 0;
    v_base_xp integer := 0;
    v_bonus_xp integer := 0;
    v_earned_xp integer := 0;
    v_total_xp bigint := 0;
    v_credit_status text := 'unverified';
    v_planned_minutes integer := p_planned_minutes;
begin
    if v_user_id is null then raise exception 'You must be signed in to complete a Review.'; end if;
    if p_outcome not in ('completed', 'progressed', 'blocked', 'stopped') then raise exception 'Invalid Review outcome.'; end if;
    if p_planned_minutes < 10 or p_planned_minutes > 120 or p_actual_seconds < 0 then raise exception 'Focus Session duration must be valid.'; end if;
    if jsonb_typeof(coalesce(p_timeline_events, '[]'::jsonb)) <> 'array' then raise exception 'Focus Session timeline events must be an array.'; end if;
    if p_outcome <> 'stopped' and nullif(trim(coalesce(p_accomplishment, '')), '') is null then
        raise exception 'Describe what you accomplished before completing the Review.';
    end if;

    perform 1 from public.profiles profiles where profiles.id = v_user_id for update;

    select sessions.* into v_existing
    from public.focus_sessions sessions
    where sessions.id = p_focus_session_id and sessions.user_id = v_user_id;

    if found then
        select coalesce(sum(sessions.earned_xp), 0) into v_total_xp
        from public.focus_sessions sessions where sessions.user_id = v_user_id;
        select least(coalesce(sum(sessions.credited_focus_seconds), 0), 21600)::integer into v_daily_after
        from public.focus_sessions sessions
        where sessions.user_id = v_user_id and sessions.credit_day = v_existing.credit_day and sessions.session_kind in ('quest', 'quick');
        return query select v_existing.id, v_existing.quest_title, v_existing.earned_xp, v_total_xp, null::text,
            v_existing.base_xp, v_existing.bonus_xp, v_existing.credited_focus_seconds, v_daily_after, v_existing.xp_credit_status;
        return;
    end if;

    select runs.* into v_run
    from public.focus_session_runs runs
    where runs.id = p_focus_session_id and runs.user_id = v_user_id and runs.session_kind = 'quick'
    for update;

    if found then
        v_planned_minutes := v_run.planned_minutes;
        v_actual_seconds := least(
            v_run.planned_minutes * 60,
            v_run.accumulated_seconds + case
                when v_run.state = 'running' and v_run.last_resumed_at is not null
                then greatest(0, floor(extract(epoch from (now() - v_run.last_resumed_at)))::integer)
                else 0
            end
        );
        update public.focus_session_runs
        set accumulated_seconds = v_actual_seconds, state = 'completed', last_resumed_at = null,
            ended_at = coalesce(ended_at, now()), updated_at = now()
        where id = p_focus_session_id;

        select least(coalesce(sum(sessions.credited_focus_seconds), 0), 21600)::integer into v_daily_before
        from public.focus_sessions sessions
        where sessions.user_id = v_user_id
          and sessions.credit_day = (now() at time zone 'UTC')::date
          and sessions.session_kind in ('quest', 'quick');

        v_daily_remaining := greatest(0, 21600 - v_daily_before);
        if v_actual_seconds < 300 then
            v_credit_status := 'under_minimum';
        elsif v_daily_remaining = 0 then
            v_credit_status := 'daily_limit';
        else
            v_credited_seconds := least(v_actual_seconds, v_daily_remaining);
            v_base_xp := floor(v_credited_seconds / 60.0)::integer * 3;
            v_bonus_xp := case when p_outcome = 'completed' then floor(v_base_xp * 0.20)::integer else 0 end;
            v_earned_xp := v_base_xp + v_bonus_xp;
            v_credit_status := 'credited';
        end if;
    else
        v_actual_seconds := least(p_actual_seconds, p_planned_minutes * 60);
        v_credit_status := 'unverified';
    end if;

    v_daily_after := least(21600, v_daily_before + v_credited_seconds);

    insert into public.focus_sessions (
        id, user_id, journey_id, quest_id, quest_title, session_kind,
        planned_minutes, actual_seconds, outcome, accomplishment, next_action,
        earned_xp, completed_at, timeline_events, credited_focus_seconds,
        base_xp, bonus_xp, xp_version, xp_credit_status, credit_day
    ) values (
        p_focus_session_id, v_user_id, null, null, 'Quick Focus', 'quick',
        v_planned_minutes, v_actual_seconds, p_outcome, coalesce(p_accomplishment, ''), coalesce(p_next_action, ''),
        v_earned_xp, now(), coalesce(p_timeline_events, '[]'::jsonb), v_credited_seconds,
        v_base_xp, v_bonus_xp, 2, v_credit_status, (now() at time zone 'UTC')::date
    );

    select coalesce(sum(sessions.earned_xp), 0) into v_total_xp
    from public.focus_sessions sessions where sessions.user_id = v_user_id;

    return query select p_focus_session_id, 'Quick Focus'::text, v_earned_xp, v_total_xp, null::text,
        v_base_xp, v_bonus_xp, v_credited_seconds, v_daily_after, v_credit_status;
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
security definer
set search_path to ''
as $function$
declare
    v_user_id uuid := auth.uid();
    v_title text;
begin
    if v_user_id is null then raise exception 'You must be signed in to save a Break.'; end if;
    if p_session_kind not in ('short_break', 'long_break') then raise exception 'Invalid Break type.'; end if;
    if p_planned_minutes <= 0 or p_actual_seconds < 0 then raise exception 'Break durations must be valid.'; end if;
    if jsonb_typeof(coalesce(p_timeline_events, '[]'::jsonb)) <> 'array' then raise exception 'Break timeline events must be an array.'; end if;

    perform 1 from public.focus_sessions sessions
    where sessions.id = p_focus_session_id and sessions.user_id = v_user_id;
    if found then return p_focus_session_id; end if;

    v_title := case when p_session_kind = 'short_break' then 'Short Break' else 'Long Break' end;

    insert into public.focus_sessions (
        id, user_id, journey_id, quest_id, quest_title, session_kind,
        planned_minutes, actual_seconds, outcome, accomplishment, next_action,
        earned_xp, completed_at, timeline_events, credited_focus_seconds,
        base_xp, bonus_xp, xp_version, xp_credit_status, credit_day
    ) values (
        p_focus_session_id, v_user_id, null, null, v_title, p_session_kind,
        p_planned_minutes, least(p_actual_seconds, p_planned_minutes * 60), 'completed', '', '',
        0, now(), coalesce(p_timeline_events, '[]'::jsonb), 0,
        0, 0, 2, 'break', (now() at time zone 'UTC')::date
    );

    return p_focus_session_id;
end;
$function$;

revoke execute on function public.complete_review(uuid, uuid, uuid, integer, integer, text, text, text, jsonb, boolean) from public, anon;
revoke execute on function public.complete_quick_focus_review(uuid, integer, integer, text, text, text, jsonb) from public, anon;
revoke execute on function public.complete_break_session(uuid, text, integer, integer, jsonb) from public, anon;
grant execute on function public.complete_review(uuid, uuid, uuid, integer, integer, text, text, text, jsonb, boolean) to authenticated;
grant execute on function public.complete_quick_focus_review(uuid, integer, integer, text, text, text, jsonb) to authenticated;
grant execute on function public.complete_break_session(uuid, text, integer, integer, jsonb) to authenticated;

drop function if exists public.get_leaderboard();
drop function if exists public.get_my_leaderboard_position();

create function public.get_leaderboard(p_period text default '30_days')
returns table (
    user_id uuid,
    display_name text,
    focused_seconds bigint,
    total_xp bigint,
    leaderboard_position bigint
)
language plpgsql
security definer
set search_path to ''
as $function$
begin
    if auth.uid() is null then raise exception 'You must be signed in to view the leaderboard.'; end if;
    if p_period not in ('30_days', 'all_time') then raise exception 'Invalid leaderboard period.'; end if;

    return query
    with daily_focus as (
        select
            sessions.user_id,
            sessions.credit_day,
            least(sum(sessions.credited_focus_seconds), 21600)::bigint as credited_seconds
        from public.focus_sessions sessions
        where sessions.session_kind in ('quest', 'quick')
          and sessions.credited_focus_seconds > 0
          and (p_period = 'all_time' or sessions.completed_at >= now() - interval '30 days')
        group by sessions.user_id, sessions.credit_day
    ),
    focus_totals as (
        select daily_focus.user_id, sum(daily_focus.credited_seconds)::bigint as focused_seconds
        from daily_focus
        group by daily_focus.user_id
    ),
    xp_totals as (
        select sessions.user_id, coalesce(sum(sessions.earned_xp), 0)::bigint as total_xp
        from public.focus_sessions sessions
        group by sessions.user_id
    ),
    ranked as (
        select
            profiles.id as user_id,
            profiles.display_name,
            focus_totals.focused_seconds,
            coalesce(xp_totals.total_xp, 0)::bigint as total_xp,
            dense_rank() over (order by focus_totals.focused_seconds desc) as leaderboard_position
        from focus_totals
        join public.profiles profiles on profiles.id = focus_totals.user_id
        left join xp_totals on xp_totals.user_id = focus_totals.user_id
        where profiles.display_name is not null and btrim(profiles.display_name) <> ''
    )
    select ranked.user_id, ranked.display_name, ranked.focused_seconds, ranked.total_xp, ranked.leaderboard_position
    from ranked
    where ranked.leaderboard_position <= 25
    order by ranked.leaderboard_position, ranked.display_name, ranked.user_id;
end;
$function$;

create function public.get_my_leaderboard_position(p_period text default '30_days')
returns table (
    user_id uuid,
    display_name text,
    focused_seconds bigint,
    total_xp bigint,
    leaderboard_position bigint
)
language plpgsql
security definer
set search_path to ''
as $function$
begin
    if auth.uid() is null then raise exception 'You must be signed in to view the leaderboard.'; end if;
    if p_period not in ('30_days', 'all_time') then raise exception 'Invalid leaderboard period.'; end if;

    return query
    with daily_focus as (
        select sessions.user_id, sessions.credit_day,
            least(sum(sessions.credited_focus_seconds), 21600)::bigint as credited_seconds
        from public.focus_sessions sessions
        where sessions.session_kind in ('quest', 'quick')
          and sessions.credited_focus_seconds > 0
          and (p_period = 'all_time' or sessions.completed_at >= now() - interval '30 days')
        group by sessions.user_id, sessions.credit_day
    ),
    focus_totals as (
        select daily_focus.user_id, sum(daily_focus.credited_seconds)::bigint as focused_seconds
        from daily_focus group by daily_focus.user_id
    ),
    xp_totals as (
        select sessions.user_id, coalesce(sum(sessions.earned_xp), 0)::bigint as total_xp
        from public.focus_sessions sessions group by sessions.user_id
    ),
    ranked as (
        select profiles.id as user_id, profiles.display_name, focus_totals.focused_seconds,
            coalesce(xp_totals.total_xp, 0)::bigint as total_xp,
            dense_rank() over (order by focus_totals.focused_seconds desc) as leaderboard_position
        from focus_totals
        join public.profiles profiles on profiles.id = focus_totals.user_id
        left join xp_totals on xp_totals.user_id = focus_totals.user_id
        where profiles.display_name is not null and btrim(profiles.display_name) <> ''
    )
    select ranked.user_id, ranked.display_name, ranked.focused_seconds, ranked.total_xp, ranked.leaderboard_position
    from ranked where ranked.user_id = auth.uid();
end;
$function$;

revoke execute on function public.get_leaderboard(text) from public, anon;
revoke execute on function public.get_my_leaderboard_position(text) from public, anon;
grant execute on function public.get_leaderboard(text) to authenticated;
grant execute on function public.get_my_leaderboard_position(text) to authenticated;

create function public.get_daily_focus_credit_status()
returns integer
language sql
security definer
set search_path to ''
as $function$
    select case
        when auth.uid() is null then 0
        else least(
            coalesce((
                select sum(sessions.credited_focus_seconds)
                from public.focus_sessions sessions
                where sessions.user_id = auth.uid()
                  and sessions.credit_day = (now() at time zone 'UTC')::date
                  and sessions.session_kind in ('quest', 'quick')
            ), 0),
            21600
        )::integer
    end;
$function$;

revoke execute on function public.get_daily_focus_credit_status() from public, anon;
grant execute on function public.get_daily_focus_credit_status() to authenticated;
