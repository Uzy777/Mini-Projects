-- Data-driven, server-awarded Progress badges.
-- A qualifying Focus Session is server-verified, lasts at least five minutes,
-- and is not a break. Badge tier awards are immutable and idempotent.

alter table public.focus_session_runs
add column if not exists time_zone text not null default 'UTC';

create or replace function public.start_focus_session_run(
    p_focus_session_id uuid,
    p_planned_minutes integer,
    p_session_kind text,
    p_time_zone text
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_user_id uuid := auth.uid();
    v_existing_user_id uuid;
    v_time_zone text := coalesce(nullif(trim(p_time_zone), ''), 'UTC');
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

    if not exists (select 1 from pg_catalog.pg_timezone_names where name = v_time_zone) then
        v_time_zone := 'UTC';
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
        id, user_id, planned_minutes, session_kind, state, last_resumed_at, time_zone
    ) values (
        p_focus_session_id, v_user_id, p_planned_minutes, p_session_kind, 'running', now(), v_time_zone
    );
end;
$function$;

revoke execute on function public.start_focus_session_run(uuid, integer, text, text) from public, anon;
grant execute on function public.start_focus_session_run(uuid, integer, text, text) to authenticated;

create table if not exists public.badge_unlocks (
    user_id uuid not null references auth.users(id) on delete cascade,
    badge_id text not null check (badge_id in (
        'focus_legend', 'master_of_time', 'streak_champion', 'task_master',
        'early_bird', 'night_owl', 'weekend_warrior'
    )),
    tier text not null check (tier in ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
    xp_awarded integer not null check (xp_awarded in (50, 100, 200, 400, 800)),
    unlocked_at timestamptz not null default now(),
    trigger_session_id uuid references public.focus_sessions(id) on delete set null,
    award_batch_id uuid not null,
    primary key (user_id, badge_id, tier)
);

create index if not exists badge_unlocks_user_unlocked_idx
on public.badge_unlocks (user_id, unlocked_at desc);

alter table public.badge_unlocks enable row level security;

drop policy if exists "Users can view their own badge unlocks" on public.badge_unlocks;
create policy "Users can view their own badge unlocks"
on public.badge_unlocks for select
to authenticated
using (auth.uid() = user_id);

revoke all on table public.badge_unlocks from public, anon, authenticated;
grant select on table public.badge_unlocks to authenticated;

create or replace function public.get_total_xp_for_user(p_user_id uuid)
returns bigint
language sql
stable
security definer
set search_path to ''
as $function$
    select
        coalesce((
            select sum(sessions.earned_xp)
            from public.focus_sessions sessions
            where sessions.user_id = p_user_id
        ), 0)::bigint
        +
        coalesce((
            select sum(unlocks.xp_awarded)
            from public.badge_unlocks unlocks
            where unlocks.user_id = p_user_id
        ), 0)::bigint;
$function$;

revoke execute on function public.get_total_xp_for_user(uuid) from public, anon, authenticated;

create or replace function public.get_my_total_xp()
returns bigint
language plpgsql
stable
security definer
set search_path to ''
as $function$
begin
    if auth.uid() is null then
        raise exception 'You must be signed in to view XP.';
    end if;

    return public.get_total_xp_for_user(auth.uid());
end;
$function$;

revoke execute on function public.get_my_total_xp() from public, anon;
grant execute on function public.get_my_total_xp() to authenticated;

create or replace function public.evaluate_badges()
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_user_id uuid := auth.uid();
    v_batch_id uuid := gen_random_uuid();
    v_trigger_session_id uuid;
    v_session_count bigint := 0;
    v_focus_seconds bigint := 0;
    v_best_streak bigint := 0;
    v_completed_tasks bigint := 0;
    v_early_sessions bigint := 0;
    v_night_sessions bigint := 0;
    v_weekend_sessions bigint := 0;
    v_badge_xp_awarded bigint := 0;
    v_total_xp bigint := 0;
    v_unlocks jsonb := '[]'::jsonb;
begin
    if v_user_id is null then
        raise exception 'You must be signed in to evaluate badges.';
    end if;

    perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

    with qualifying as (
        select
            sessions.id,
            sessions.quest_id,
            sessions.outcome,
            sessions.actual_seconds,
            sessions.completed_at,
            coalesce(runs.started_at, sessions.completed_at - make_interval(secs => sessions.actual_seconds)) as started_at,
            coalesce(runs.time_zone, 'UTC') as time_zone
        from public.focus_sessions sessions
        left join public.focus_session_runs runs
          on runs.id = sessions.id and runs.user_id = sessions.user_id
        where sessions.user_id = v_user_id
          and sessions.session_kind in ('quest', 'quick')
          and sessions.actual_seconds >= 300
          and sessions.xp_credit_status in ('legacy', 'credited', 'daily_limit')
    ),
    focus_days as (
        select distinct (qualifying.completed_at at time zone qualifying.time_zone)::date as focus_day
        from qualifying
    ),
    streak_groups as (
        select
            focus_day,
            focus_day - (row_number() over (order by focus_day))::integer as streak_group
        from focus_days
    ),
    streak_lengths as (
        select count(*)::bigint as streak_length
        from streak_groups
        group by streak_group
    )
    select
        count(*)::bigint,
        coalesce(sum(qualifying.actual_seconds), 0)::bigint,
        coalesce((select max(streak_length) from streak_lengths), 0)::bigint,
        count(distinct qualifying.quest_id) filter (
            where qualifying.quest_id is not null and qualifying.outcome = 'completed'
        )::bigint,
        count(*) filter (
            where (qualifying.started_at at time zone qualifying.time_zone)::time < time '09:00'
        )::bigint,
        count(*) filter (
            where (qualifying.started_at at time zone qualifying.time_zone)::time >= time '22:00'
        )::bigint,
        count(*) filter (
            where extract(isodow from (qualifying.started_at at time zone qualifying.time_zone)) in (6, 7)
        )::bigint
    into
        v_session_count,
        v_focus_seconds,
        v_best_streak,
        v_completed_tasks,
        v_early_sessions,
        v_night_sessions,
        v_weekend_sessions
    from qualifying;

    select sessions.id
    into v_trigger_session_id
    from public.focus_sessions sessions
    where sessions.user_id = v_user_id
    order by sessions.completed_at desc
    limit 1;

    insert into public.badge_unlocks (
        user_id, badge_id, tier, xp_awarded, trigger_session_id, award_batch_id
    )
    select
        v_user_id,
        candidates.badge_id,
        candidates.tier,
        candidates.xp_awarded,
        v_trigger_session_id,
        v_batch_id
    from (
        values
            ('focus_legend', 'bronze', 10::bigint, 50, v_session_count),
            ('focus_legend', 'silver', 25::bigint, 100, v_session_count),
            ('focus_legend', 'gold', 100::bigint, 200, v_session_count),
            ('focus_legend', 'platinum', 500::bigint, 400, v_session_count),
            ('focus_legend', 'diamond', 1000::bigint, 800, v_session_count),
            ('master_of_time', 'bronze', 18000::bigint, 50, v_focus_seconds),
            ('master_of_time', 'silver', 36000::bigint, 100, v_focus_seconds),
            ('master_of_time', 'gold', 180000::bigint, 200, v_focus_seconds),
            ('master_of_time', 'platinum', 900000::bigint, 400, v_focus_seconds),
            ('master_of_time', 'diamond', 3600000::bigint, 800, v_focus_seconds),
            ('streak_champion', 'bronze', 3::bigint, 50, v_best_streak),
            ('streak_champion', 'silver', 7::bigint, 100, v_best_streak),
            ('streak_champion', 'gold', 30::bigint, 200, v_best_streak),
            ('streak_champion', 'platinum', 100::bigint, 400, v_best_streak),
            ('streak_champion', 'diamond', 365::bigint, 800, v_best_streak),
            ('task_master', 'bronze', 10::bigint, 50, v_completed_tasks),
            ('task_master', 'silver', 25::bigint, 100, v_completed_tasks),
            ('task_master', 'gold', 100::bigint, 200, v_completed_tasks),
            ('task_master', 'platinum', 500::bigint, 400, v_completed_tasks),
            ('task_master', 'diamond', 1000::bigint, 800, v_completed_tasks),
            ('early_bird', 'bronze', 10::bigint, 50, v_early_sessions),
            ('early_bird', 'silver', 25::bigint, 100, v_early_sessions),
            ('early_bird', 'gold', 100::bigint, 200, v_early_sessions),
            ('early_bird', 'platinum', 500::bigint, 400, v_early_sessions),
            ('early_bird', 'diamond', 1000::bigint, 800, v_early_sessions),
            ('night_owl', 'bronze', 10::bigint, 50, v_night_sessions),
            ('night_owl', 'silver', 25::bigint, 100, v_night_sessions),
            ('night_owl', 'gold', 100::bigint, 200, v_night_sessions),
            ('night_owl', 'platinum', 500::bigint, 400, v_night_sessions),
            ('night_owl', 'diamond', 1000::bigint, 800, v_night_sessions),
            ('weekend_warrior', 'bronze', 10::bigint, 50, v_weekend_sessions),
            ('weekend_warrior', 'silver', 25::bigint, 100, v_weekend_sessions),
            ('weekend_warrior', 'gold', 100::bigint, 200, v_weekend_sessions),
            ('weekend_warrior', 'platinum', 500::bigint, 400, v_weekend_sessions),
            ('weekend_warrior', 'diamond', 1000::bigint, 800, v_weekend_sessions)
    ) as candidates(badge_id, tier, threshold, xp_awarded, metric_value)
    where candidates.metric_value >= candidates.threshold
    on conflict (user_id, badge_id, tier) do nothing;

    select
        coalesce(sum(unlocks.xp_awarded), 0)::bigint
    into v_badge_xp_awarded
    from public.badge_unlocks unlocks
    where unlocks.user_id = v_user_id
      and unlocks.award_batch_id = v_batch_id;

    with batch_unlocks as (
        select
            unlocks.*,
            case unlocks.tier
                when 'bronze' then 0
                when 'silver' then 1
                when 'gold' then 2
                when 'platinum' then 3
                else 4
            end as tier_order
        from public.badge_unlocks unlocks
        where unlocks.user_id = v_user_id
          and unlocks.award_batch_id = v_batch_id
    ),
    latest_per_badge as (
        select distinct on (batch_unlocks.badge_id)
            batch_unlocks.badge_id,
            batch_unlocks.tier,
            sum(batch_unlocks.xp_awarded) over (partition by batch_unlocks.badge_id)::integer as xp_awarded,
            batch_unlocks.unlocked_at
        from batch_unlocks
        order by batch_unlocks.badge_id, batch_unlocks.tier_order desc
    )
    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'badge_id', latest_per_badge.badge_id,
                'tier', latest_per_badge.tier,
                'xp_awarded', latest_per_badge.xp_awarded,
                'unlocked_at', latest_per_badge.unlocked_at
            )
            order by latest_per_badge.badge_id
        ),
        '[]'::jsonb
    )
    into v_unlocks
    from latest_per_badge;

    v_total_xp := public.get_total_xp_for_user(v_user_id);

    return jsonb_build_object(
        'unlocks', v_unlocks,
        'badge_xp_awarded', v_badge_xp_awarded,
        'total_xp', v_total_xp
    );
end;
$function$;

revoke execute on function public.evaluate_badges() from public, anon;
grant execute on function public.evaluate_badges() to authenticated;

create or replace function public.get_leaderboard(p_period text default '30_days')
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
    xp_rows as (
        select sessions.user_id, sessions.earned_xp::bigint as xp from public.focus_sessions sessions
        union all
        select unlocks.user_id, unlocks.xp_awarded::bigint as xp from public.badge_unlocks unlocks
    ),
    xp_totals as (
        select xp_rows.user_id, coalesce(sum(xp_rows.xp), 0)::bigint as total_xp
        from xp_rows group by xp_rows.user_id
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
    from ranked
    where ranked.leaderboard_position <= 25
    order by ranked.leaderboard_position, ranked.display_name, ranked.user_id;
end;
$function$;

create or replace function public.get_my_leaderboard_position(p_period text default '30_days')
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
    xp_rows as (
        select sessions.user_id, sessions.earned_xp::bigint as xp from public.focus_sessions sessions
        union all
        select unlocks.user_id, unlocks.xp_awarded::bigint as xp from public.badge_unlocks unlocks
    ),
    xp_totals as (
        select xp_rows.user_id, coalesce(sum(xp_rows.xp), 0)::bigint as total_xp
        from xp_rows group by xp_rows.user_id
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

