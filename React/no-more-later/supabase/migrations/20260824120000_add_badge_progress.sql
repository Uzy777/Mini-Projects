-- Read-only badge progress calculated from the same qualifying Focus Sessions
-- used by evaluate_badges(). Keeping this server-side prevents the UI from
-- drifting from the authoritative unlock rules.

create or replace function public.get_my_badge_progress()
returns jsonb
language sql
stable
security definer
set search_path to ''
as $function$
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
        where sessions.user_id = auth.uid()
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
    ),
    metrics as (
        select
            count(*)::bigint as session_count,
            coalesce(sum(qualifying.actual_seconds), 0)::bigint as focus_seconds,
            coalesce((select max(streak_length) from streak_lengths), 0)::bigint as best_streak,
            count(distinct qualifying.quest_id) filter (
                where qualifying.quest_id is not null and qualifying.outcome = 'completed'
            )::bigint as completed_tasks,
            count(*) filter (
                where (qualifying.started_at at time zone qualifying.time_zone)::time < time '09:00'
            )::bigint as early_sessions,
            count(*) filter (
                where (qualifying.started_at at time zone qualifying.time_zone)::time >= time '22:00'
            )::bigint as night_sessions,
            count(*) filter (
                where extract(isodow from (qualifying.started_at at time zone qualifying.time_zone)) in (6, 7)
            )::bigint as weekend_sessions
        from qualifying
    )
    select jsonb_build_object(
        'focus_legend', metrics.session_count,
        'master_of_time', round((metrics.focus_seconds::numeric / 3600), 4),
        'streak_champion', metrics.best_streak,
        'task_master', metrics.completed_tasks,
        'early_bird', metrics.early_sessions,
        'night_owl', metrics.night_sessions,
        'weekend_warrior', metrics.weekend_sessions
    )
    from metrics;
$function$;

revoke execute on function public.get_my_badge_progress() from public, anon;
grant execute on function public.get_my_badge_progress() to authenticated;
