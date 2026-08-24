-- Privacy-aware leaderboard profiles and a future-ready buddy relationship.

alter table public.profiles
add column if not exists leaderboard_anonymous boolean not null default false;

comment on column public.profiles.leaderboard_anonymous is
'Redacts the display name on the public leaderboard while preserving ranking and stats.';

revoke update on public.profiles from authenticated;
grant update (display_name, daily_focus_goal_minutes, leaderboard_anonymous)
on public.profiles to authenticated;

create table if not exists public.buddy_connections (
    id uuid primary key default gen_random_uuid(),
    requester_id uuid not null references auth.users(id) on delete cascade,
    addressee_id uuid not null references auth.users(id) on delete cascade,
    status text not null default 'pending' check (status in ('pending', 'accepted')),
    created_at timestamptz not null default now(),
    accepted_at timestamptz,
    check (requester_id <> addressee_id)
);

create unique index if not exists buddy_connections_unique_pair_idx
on public.buddy_connections (
    least(requester_id::text, addressee_id::text),
    greatest(requester_id::text, addressee_id::text)
);

create index if not exists buddy_connections_requester_idx
on public.buddy_connections (requester_id, status);

create index if not exists buddy_connections_addressee_idx
on public.buddy_connections (addressee_id, status);

alter table public.buddy_connections enable row level security;

drop policy if exists "Buddy participants can view their connections"
on public.buddy_connections;

create policy "Buddy participants can view their connections"
on public.buddy_connections for select
to authenticated
using (auth.uid() = requester_id or auth.uid() = addressee_id);

revoke all on table public.buddy_connections from public, anon, authenticated;
grant select on table public.buddy_connections to authenticated;

drop function if exists public.get_leaderboard(text);
drop function if exists public.get_leaderboard(text, text);

create function public.get_leaderboard(
    p_period text default '30_days',
    p_scope text default 'global'
)
returns table (
    user_id uuid,
    display_name text,
    focused_seconds bigint,
    total_xp bigint,
    leaderboard_position bigint,
    is_anonymous boolean
)
language plpgsql
security definer
set search_path to ''
as $function$
begin
    if auth.uid() is null then raise exception 'You must be signed in to view the leaderboard.'; end if;
    if p_period not in ('30_days', 'all_time') then raise exception 'Invalid leaderboard period.'; end if;
    if p_scope not in ('global', 'buddies') then raise exception 'Invalid leaderboard scope.'; end if;

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
    scoped as (
        select
            profiles.id as user_id,
            case
                when profiles.leaderboard_anonymous
                    and p_scope = 'global'
                    and profiles.id <> auth.uid()
                then 'Anonymous Focuser'::text
                else profiles.display_name
            end as display_name,
            focus_totals.focused_seconds,
            coalesce(xp_totals.total_xp, 0)::bigint as total_xp,
            (
                profiles.leaderboard_anonymous
                and p_scope = 'global'
                and profiles.id <> auth.uid()
            ) as is_anonymous
        from focus_totals
        join public.profiles profiles on profiles.id = focus_totals.user_id
        left join xp_totals on xp_totals.user_id = focus_totals.user_id
        where profiles.display_name is not null
          and btrim(profiles.display_name) <> ''
          and (
              p_scope = 'global'
              or profiles.id = auth.uid()
              or exists (
                  select 1
                  from public.buddy_connections connections
                  where connections.status = 'accepted'
                    and (
                        (connections.requester_id = auth.uid() and connections.addressee_id = profiles.id)
                        or (connections.addressee_id = auth.uid() and connections.requester_id = profiles.id)
                    )
              )
          )
    ),
    ranked as (
        select scoped.*,
            dense_rank() over (order by scoped.focused_seconds desc) as leaderboard_position
        from scoped
    )
    select ranked.user_id, ranked.display_name, ranked.focused_seconds,
        ranked.total_xp, ranked.leaderboard_position, ranked.is_anonymous
    from ranked
    where ranked.leaderboard_position <= 25
    order by ranked.leaderboard_position, ranked.display_name, ranked.user_id;
end;
$function$;

drop function if exists public.get_my_leaderboard_position(text);
drop function if exists public.get_my_leaderboard_position(text, text);

create function public.get_my_leaderboard_position(
    p_period text default '30_days',
    p_scope text default 'global'
)
returns table (
    user_id uuid,
    display_name text,
    focused_seconds bigint,
    total_xp bigint,
    leaderboard_position bigint,
    is_anonymous boolean
)
language plpgsql
security definer
set search_path to ''
as $function$
begin
    if auth.uid() is null then raise exception 'You must be signed in to view the leaderboard.'; end if;
    if p_period not in ('30_days', 'all_time') then raise exception 'Invalid leaderboard period.'; end if;
    if p_scope not in ('global', 'buddies') then raise exception 'Invalid leaderboard scope.'; end if;

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
    scoped as (
        select profiles.id as user_id, profiles.display_name,
            focus_totals.focused_seconds,
            coalesce(xp_totals.total_xp, 0)::bigint as total_xp,
            false as is_anonymous
        from focus_totals
        join public.profiles profiles on profiles.id = focus_totals.user_id
        left join xp_totals on xp_totals.user_id = focus_totals.user_id
        where profiles.display_name is not null
          and btrim(profiles.display_name) <> ''
          and (
              p_scope = 'global'
              or profiles.id = auth.uid()
              or exists (
                  select 1
                  from public.buddy_connections connections
                  where connections.status = 'accepted'
                    and (
                        (connections.requester_id = auth.uid() and connections.addressee_id = profiles.id)
                        or (connections.addressee_id = auth.uid() and connections.requester_id = profiles.id)
                    )
              )
          )
    ),
    ranked as (
        select scoped.*,
            dense_rank() over (order by scoped.focused_seconds desc) as leaderboard_position
        from scoped
    )
    select ranked.user_id, ranked.display_name, ranked.focused_seconds,
        ranked.total_xp, ranked.leaderboard_position, ranked.is_anonymous
    from ranked
    where ranked.user_id = auth.uid();
end;
$function$;

create or replace function public.get_leaderboard_profile(
    p_user_id uuid,
    p_period text default '30_days'
)
returns jsonb
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
    v_display_name text;
    v_anonymous boolean;
    v_is_buddy boolean := false;
    v_can_view_name boolean := false;
    v_result jsonb;
begin
    if auth.uid() is null then raise exception 'You must be signed in to view leaderboard profiles.'; end if;
    if p_period not in ('30_days', 'all_time') then raise exception 'Invalid leaderboard period.'; end if;

    select profiles.display_name, profiles.leaderboard_anonymous
    into v_display_name, v_anonymous
    from public.profiles profiles
    where profiles.id = p_user_id;

    if not found or v_display_name is null or btrim(v_display_name) = '' then
        raise exception 'Leaderboard profile not found.';
    end if;

    select exists (
        select 1
        from public.buddy_connections connections
        where connections.status = 'accepted'
          and (
              (connections.requester_id = auth.uid() and connections.addressee_id = p_user_id)
              or (connections.addressee_id = auth.uid() and connections.requester_id = p_user_id)
          )
    ) into v_is_buddy;

    v_can_view_name := p_user_id = auth.uid() or not v_anonymous or v_is_buddy;

    with period_sessions as (
        select sessions.*
        from public.focus_sessions sessions
        where sessions.user_id = p_user_id
          and sessions.session_kind in ('quest', 'quick')
          and sessions.credited_focus_seconds > 0
          and (p_period = 'all_time' or sessions.completed_at >= now() - interval '30 days')
    ),
    period_daily as (
        select sessions.credit_day,
            least(sum(sessions.credited_focus_seconds), 21600)::bigint as credited_seconds
        from period_sessions sessions
        group by sessions.credit_day
    ),
    all_daily as (
        select sessions.credit_day,
            least(sum(sessions.credited_focus_seconds), 21600)::bigint as credited_seconds
        from public.focus_sessions sessions
        where sessions.user_id = p_user_id
          and sessions.session_kind in ('quest', 'quick')
          and sessions.credited_focus_seconds > 0
        group by sessions.credit_day
    ),
    streak_groups as (
        select all_daily.credit_day,
            all_daily.credit_day - (row_number() over (order by all_daily.credit_day))::integer as streak_group
        from all_daily
    ),
    streak_lengths as (
        select count(*)::bigint as streak_length
        from streak_groups
        group by streak_group
    ),
    xp_rows as (
        select sessions.earned_xp::bigint as xp
        from public.focus_sessions sessions where sessions.user_id = p_user_id
        union all
        select unlocks.xp_awarded::bigint as xp
        from public.badge_unlocks unlocks where unlocks.user_id = p_user_id
    ),
    badge_ranked as (
        select unlocks.badge_id, unlocks.tier, unlocks.unlocked_at,
            count(*) over (partition by unlocks.badge_id)::integer as tier_count,
            row_number() over (
                partition by unlocks.badge_id
                order by case unlocks.tier
                    when 'bronze' then 1 when 'silver' then 2 when 'gold' then 3
                    when 'platinum' then 4 when 'diamond' then 5 else 0 end desc
            ) as tier_position
        from public.badge_unlocks unlocks
        where unlocks.user_id = p_user_id
    ),
    badge_summary as (
        select coalesce(
            jsonb_agg(
                jsonb_build_object(
                    'badge_id', badge_ranked.badge_id,
                    'tier', badge_ranked.tier,
                    'tier_count', badge_ranked.tier_count,
                    'unlocked_at', badge_ranked.unlocked_at
                ) order by badge_ranked.badge_id
            ),
            '[]'::jsonb
        ) as badges
        from badge_ranked
        where badge_ranked.tier_position = 1
    )
    select jsonb_build_object(
        'user_id', p_user_id,
        'display_name', case when v_can_view_name then v_display_name else 'Anonymous Focuser' end,
        'is_anonymous', v_anonymous and not v_can_view_name,
        'is_buddy', v_is_buddy,
        'focused_seconds', coalesce((select sum(period_daily.credited_seconds) from period_daily), 0),
        'all_time_focused_seconds', coalesce((select sum(all_daily.credited_seconds) from all_daily), 0),
        'qualifying_sessions', (select count(*) from period_sessions),
        'completed_tasks', (
            select count(distinct sessions.quest_id)
            from period_sessions sessions
            where sessions.quest_id is not null and sessions.outcome = 'completed'
        ),
        'best_streak', coalesce((select max(streak_lengths.streak_length) from streak_lengths), 0),
        'total_xp', coalesce((select sum(xp_rows.xp) from xp_rows), 0),
        'badges', badge_summary.badges
    )
    into v_result
    from badge_summary;

    return v_result;
end;
$function$;

revoke execute on function public.get_leaderboard(text, text) from public, anon;
revoke execute on function public.get_my_leaderboard_position(text, text) from public, anon;
revoke execute on function public.get_leaderboard_profile(uuid, text) from public, anon;

grant execute on function public.get_leaderboard(text, text) to authenticated;
grant execute on function public.get_my_leaderboard_position(text, text) to authenticated;
grant execute on function public.get_leaderboard_profile(uuid, text) to authenticated;
