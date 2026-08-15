create or replace function public.get_my_leaderboard_position()
returns table (
    user_id uuid,
    display_name text,
    total_xp bigint,
    leaderboard_position bigint
)
language sql
security definer
set search_path = ''
as $$
    with leaderboard_totals as (
        select
            p.id as user_id,
            p.display_name,
            coalesce(sum(fs.earned_xp), 0)::bigint as total_xp
        from public.profiles p
        left join public.focus_sessions fs
            on fs.user_id = p.id
        where
            p.display_name is not null
            and btrim(p.display_name) <> ''
        group by
            p.id,
            p.display_name
    ),
    ranked_users as (
        select
            user_id,
            display_name,
            total_xp,
            row_number() over (
                order by
                    total_xp desc,
                    display_name asc,
                    user_id asc
            ) as leaderboard_position
        from leaderboard_totals
    )
    select
        user_id,
        display_name,
        total_xp,
        leaderboard_position
    from ranked_users
    where user_id = (select auth.uid());
$$;

revoke execute on function public.get_my_leaderboard_position() from public;
revoke execute on function public.get_my_leaderboard_position() from anon;

grant execute on function public.get_my_leaderboard_position() to authenticated;