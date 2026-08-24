-- Qualify pgcrypto because buddy functions intentionally use an empty search path.

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

-- Preserve the current-user position even when it falls outside the public top 25.
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
