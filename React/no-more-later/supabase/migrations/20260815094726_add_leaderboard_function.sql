create or replace function public.get_leaderboard()
returns table (
    user_id uuid,
    display_name text,
    total_xp bigint
)
language sql
security definer
set search_path = ''
as $$
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
    order by
        total_xp desc,
        p.display_name asc
    limit 25;
$$;

revoke execute on function public.get_leaderboard() from public;
revoke execute on function public.get_leaderboard() from anon;

grant execute on function public.get_leaderboard() to authenticated;