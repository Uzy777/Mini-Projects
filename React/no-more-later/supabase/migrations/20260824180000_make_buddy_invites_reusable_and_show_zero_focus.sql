-- Make a shared buddy invite reusable until expiry and keep zero-focus buddies visible.

comment on table public.buddy_invites is
'Expiring buddy-circle invitations. A code may connect multiple authenticated users until it expires.';

create index if not exists buddy_invites_inviter_expiry_idx
on public.buddy_invites (inviter_id, expires_at desc);

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

    if not found then
        raise exception 'Buddy invite code not found.';
    end if;

    if v_invite.expires_at <= now() then
        raise exception 'This buddy invite has expired.';
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

    if not found then
        raise exception 'Buddy invite code not found.';
    end if;

    if v_invite.expires_at <= now() then
        raise exception 'This buddy invite has expired.';
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

    -- Retain first-use audit information without invalidating the shared code.
    update public.buddy_invites invites
    set used_at = coalesce(invites.used_at, now()),
        used_by = coalesce(invites.used_by, auth.uid())
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

create or replace function public._get_leaderboard_rows(
    p_period text,
    p_scope text
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
stable
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
            coalesce(focus_totals.focused_seconds, 0)::bigint as focused_seconds,
            coalesce(xp_totals.total_xp, 0)::bigint as total_xp,
            false as is_anonymous
        from public.profiles profiles
        left join focus_totals on focus_totals.user_id = profiles.id
        left join xp_totals on xp_totals.user_id = profiles.id
        where profiles.display_name is not null
          and btrim(profiles.display_name) <> ''
          and (
              (
                  p_scope = 'global'
                  and not profiles.leaderboard_anonymous
                  and focus_totals.user_id is not null
              )
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
    from ranked;
end;
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
language sql
stable
security definer
set search_path to ''
as $function$
    select rows.user_id, rows.display_name, rows.focused_seconds,
        rows.total_xp, rows.leaderboard_position, rows.is_anonymous
    from public._get_leaderboard_rows(p_period, p_scope) rows
    where rows.leaderboard_position <= 25
    order by rows.leaderboard_position, rows.display_name, rows.user_id;
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
language sql
stable
security definer
set search_path to ''
as $function$
    select rows.user_id, rows.display_name, rows.focused_seconds,
        rows.total_xp, rows.leaderboard_position, rows.is_anonymous
    from public._get_leaderboard_rows(p_period, p_scope) rows
    where rows.user_id = auth.uid();
$function$;

revoke execute on function public._get_leaderboard_rows(text, text) from public, anon, authenticated;
