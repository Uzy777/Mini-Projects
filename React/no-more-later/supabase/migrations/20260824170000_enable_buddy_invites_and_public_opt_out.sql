-- Remove opted-out users from public leaderboards and add secure buddy invites.

comment on column public.profiles.leaderboard_anonymous is
'When true, removes the profile from public leaderboards. Accepted buddies can still see the profile and display name.';

create table if not exists public.buddy_invites (
    id uuid primary key default gen_random_uuid(),
    inviter_id uuid not null references auth.users(id) on delete cascade,
    code text not null unique check (code ~ '^[A-Z0-9]{8}$'),
    expires_at timestamptz not null,
    used_at timestamptz,
    used_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    check ((used_at is null and used_by is null) or (used_at is not null and used_by is not null))
);

create index if not exists buddy_invites_active_inviter_idx
on public.buddy_invites (inviter_id, expires_at desc)
where used_at is null;

alter table public.buddy_invites enable row level security;

revoke all on table public.buddy_invites from public, anon, authenticated;

create or replace function public.create_buddy_invite()
returns table (code text, expires_at timestamptz)
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_code text;
    v_expires_at timestamptz;
begin
    if auth.uid() is null then
        raise exception 'You must be signed in to create a buddy invite.';
    end if;

    select invites.code, invites.expires_at
    into v_code, v_expires_at
    from public.buddy_invites invites
    where invites.inviter_id = auth.uid()
      and invites.used_at is null
      and invites.expires_at > now() + interval '5 minutes'
    order by invites.created_at desc
    limit 1;

    if found then
        return query select v_code, v_expires_at;
        return;
    end if;

    loop
        v_code := upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 8));
        v_expires_at := now() + interval '7 days';

        begin
            insert into public.buddy_invites (inviter_id, code, expires_at)
            values (auth.uid(), v_code, v_expires_at);
            exit;
        exception when unique_violation then
            -- An extremely unlikely collision; generate another code.
        end;
    end loop;

    return query select v_code, v_expires_at;
end;
$function$;

create or replace function public.preview_buddy_invite(p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
    v_invite public.buddy_invites%rowtype;
    v_display_name text;
begin
    if auth.uid() is null then
        raise exception 'You must be signed in to open a buddy invite.';
    end if;

    select invites.* into v_invite
    from public.buddy_invites invites
    where invites.code = upper(btrim(p_code));

    if not found or v_invite.used_at is not null or v_invite.expires_at <= now() then
        raise exception 'This buddy invite is invalid or has expired.';
    end if;

    if v_invite.inviter_id = auth.uid() then
        raise exception 'You cannot use your own buddy invite.';
    end if;

    select profiles.display_name into v_display_name
    from public.profiles profiles
    where profiles.id = v_invite.inviter_id;

    if v_display_name is null or btrim(v_display_name) = '' then
        raise exception 'This buddy invite is no longer available.';
    end if;

    return jsonb_build_object(
        'code', v_invite.code,
        'inviter_id', v_invite.inviter_id,
        'display_name', v_display_name,
        'expires_at', v_invite.expires_at
    );
end;
$function$;

create or replace function public.accept_buddy_invite(p_code text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_invite public.buddy_invites%rowtype;
    v_display_name text;
begin
    if auth.uid() is null then
        raise exception 'You must be signed in to accept a buddy invite.';
    end if;

    select invites.* into v_invite
    from public.buddy_invites invites
    where invites.code = upper(btrim(p_code))
    for update;

    if not found or v_invite.used_at is not null or v_invite.expires_at <= now() then
        raise exception 'This buddy invite is invalid or has expired.';
    end if;

    if v_invite.inviter_id = auth.uid() then
        raise exception 'You cannot use your own buddy invite.';
    end if;

    update public.buddy_connections connections
    set status = 'accepted', accepted_at = coalesce(connections.accepted_at, now())
    where (connections.requester_id = v_invite.inviter_id and connections.addressee_id = auth.uid())
       or (connections.requester_id = auth.uid() and connections.addressee_id = v_invite.inviter_id);

    if not found then
        begin
            insert into public.buddy_connections (requester_id, addressee_id, status, accepted_at)
            values (v_invite.inviter_id, auth.uid(), 'accepted', now());
        exception when unique_violation then
            update public.buddy_connections connections
            set status = 'accepted', accepted_at = coalesce(connections.accepted_at, now())
            where (connections.requester_id = v_invite.inviter_id and connections.addressee_id = auth.uid())
               or (connections.requester_id = auth.uid() and connections.addressee_id = v_invite.inviter_id);
        end;
    end if;

    update public.buddy_invites invites
    set used_at = now(), used_by = auth.uid()
    where invites.id = v_invite.id;

    select profiles.display_name into v_display_name
    from public.profiles profiles
    where profiles.id = v_invite.inviter_id;

    return jsonb_build_object(
        'user_id', v_invite.inviter_id,
        'display_name', coalesce(v_display_name, 'Buddy')
    );
end;
$function$;

create or replace function public.get_my_buddies()
returns table (user_id uuid, display_name text, connected_at timestamptz)
language sql
stable
security definer
set search_path to ''
as $function$
    select
        case when connections.requester_id = auth.uid()
            then connections.addressee_id else connections.requester_id end as user_id,
        profiles.display_name,
        coalesce(connections.accepted_at, connections.created_at) as connected_at
    from public.buddy_connections connections
    join public.profiles profiles
      on profiles.id = case when connections.requester_id = auth.uid()
            then connections.addressee_id else connections.requester_id end
    where auth.uid() is not null
      and connections.status = 'accepted'
      and (connections.requester_id = auth.uid() or connections.addressee_id = auth.uid())
    order by profiles.display_name, user_id;
$function$;

create or replace function public.get_leaderboard(
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
              (p_scope = 'global' and not profiles.leaderboard_anonymous)
              or (
                  p_scope = 'buddies'
                  and (
                      profiles.id = auth.uid()
                      or exists (
                          select 1 from public.buddy_connections connections
                          where connections.status = 'accepted'
                            and (
                                (connections.requester_id = auth.uid() and connections.addressee_id = profiles.id)
                                or (connections.addressee_id = auth.uid() and connections.requester_id = profiles.id)
                            )
                      )
                  )
              )
          )
    ),
    ranked as (
        select scoped.*, dense_rank() over (order by scoped.focused_seconds desc) as leaderboard_position
        from scoped
    )
    select ranked.user_id, ranked.display_name, ranked.focused_seconds,
        ranked.total_xp, ranked.leaderboard_position, ranked.is_anonymous
    from ranked
    where ranked.leaderboard_position <= 25
    order by ranked.leaderboard_position, ranked.display_name, ranked.user_id;
end;
$function$;

create or replace function public.get_my_leaderboard_position(
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
              (p_scope = 'global' and not profiles.leaderboard_anonymous)
              or (
                  p_scope = 'buddies'
                  and (
                      profiles.id = auth.uid()
                      or exists (
                          select 1 from public.buddy_connections connections
                          where connections.status = 'accepted'
                            and (
                                (connections.requester_id = auth.uid() and connections.addressee_id = profiles.id)
                                or (connections.addressee_id = auth.uid() and connections.requester_id = profiles.id)
                            )
                      )
                  )
              )
          )
    ),
    ranked as (
        select scoped.*, dense_rank() over (order by scoped.focused_seconds desc) as leaderboard_position
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
    v_hidden boolean;
    v_is_buddy boolean := false;
    v_result jsonb;
begin
    if auth.uid() is null then raise exception 'You must be signed in to view leaderboard profiles.'; end if;
    if p_period not in ('30_days', 'all_time') then raise exception 'Invalid leaderboard period.'; end if;

    select profiles.display_name, profiles.leaderboard_anonymous
    into v_display_name, v_hidden
    from public.profiles profiles
    where profiles.id = p_user_id;

    if not found or v_display_name is null or btrim(v_display_name) = '' then
        raise exception 'Leaderboard profile not found.';
    end if;

    select exists (
        select 1 from public.buddy_connections connections
        where connections.status = 'accepted'
          and (
              (connections.requester_id = auth.uid() and connections.addressee_id = p_user_id)
              or (connections.addressee_id = auth.uid() and connections.requester_id = p_user_id)
          )
    ) into v_is_buddy;

    if v_hidden and p_user_id <> auth.uid() and not v_is_buddy then
        raise exception 'Leaderboard profile not found.';
    end if;

    with period_sessions as (
        select sessions.*
        from public.focus_sessions sessions
        where sessions.user_id = p_user_id
          and sessions.session_kind in ('quest', 'quick')
          and sessions.credited_focus_seconds > 0
          and (p_period = 'all_time' or sessions.completed_at >= now() - interval '30 days')
    ),
    period_daily as (
        select sessions.credit_day, least(sum(sessions.credited_focus_seconds), 21600)::bigint as credited_seconds
        from period_sessions sessions group by sessions.credit_day
    ),
    all_daily as (
        select sessions.credit_day, least(sum(sessions.credited_focus_seconds), 21600)::bigint as credited_seconds
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
        select count(*)::bigint as streak_length from streak_groups group by streak_group
    ),
    xp_rows as (
        select sessions.earned_xp::bigint as xp from public.focus_sessions sessions where sessions.user_id = p_user_id
        union all
        select unlocks.xp_awarded::bigint as xp from public.badge_unlocks unlocks where unlocks.user_id = p_user_id
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
        from public.badge_unlocks unlocks where unlocks.user_id = p_user_id
    ),
    badge_summary as (
        select coalesce(jsonb_agg(jsonb_build_object(
            'badge_id', badge_ranked.badge_id,
            'tier', badge_ranked.tier,
            'tier_count', badge_ranked.tier_count,
            'unlocked_at', badge_ranked.unlocked_at
        ) order by badge_ranked.badge_id), '[]'::jsonb) as badges
        from badge_ranked where badge_ranked.tier_position = 1
    )
    select jsonb_build_object(
        'user_id', p_user_id,
        'display_name', v_display_name,
        'is_anonymous', false,
        'is_buddy', v_is_buddy,
        'focused_seconds', coalesce((select sum(period_daily.credited_seconds) from period_daily), 0),
        'all_time_focused_seconds', coalesce((select sum(all_daily.credited_seconds) from all_daily), 0),
        'qualifying_sessions', (select count(*) from period_sessions),
        'completed_tasks', (
            select count(distinct sessions.quest_id) from period_sessions sessions
            where sessions.quest_id is not null and sessions.outcome = 'completed'
        ),
        'best_streak', coalesce((select max(streak_lengths.streak_length) from streak_lengths), 0),
        'total_xp', coalesce((select sum(xp_rows.xp) from xp_rows), 0),
        'badges', badge_summary.badges
    ) into v_result from badge_summary;

    return v_result;
end;
$function$;

revoke execute on function public.create_buddy_invite() from public, anon;
revoke execute on function public.preview_buddy_invite(text) from public, anon;
revoke execute on function public.accept_buddy_invite(text) from public, anon;
revoke execute on function public.get_my_buddies() from public, anon;

grant execute on function public.create_buddy_invite() to authenticated;
grant execute on function public.preview_buddy_invite(text) to authenticated;
grant execute on function public.accept_buddy_invite(text) to authenticated;
grant execute on function public.get_my_buddies() to authenticated;
