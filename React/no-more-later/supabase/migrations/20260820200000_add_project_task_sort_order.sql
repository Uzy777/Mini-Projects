alter table public.journeys
add column if not exists sort_order bigint;

alter table public.quests
add column if not exists sort_order bigint;

with ranked_journeys as (
    select
        id,
        row_number() over (partition by user_id order by created_at desc, id) * 1024 as next_sort_order
    from public.journeys
)
update public.journeys
set sort_order = ranked_journeys.next_sort_order
from ranked_journeys
where journeys.id = ranked_journeys.id
  and journeys.sort_order is null;

with ranked_quests as (
    select
        id,
        row_number() over (partition by user_id order by created_at desc, id) * 1024 as next_sort_order
    from public.quests
)
update public.quests
set sort_order = ranked_quests.next_sort_order
from ranked_quests
where quests.id = ranked_quests.id
  and quests.sort_order is null;

alter table public.journeys
alter column sort_order set default 0,
alter column sort_order set not null;

alter table public.quests
alter column sort_order set default 0,
alter column sort_order set not null;

create index if not exists journeys_user_id_sort_order_idx
on public.journeys(user_id, sort_order, created_at desc);

create index if not exists quests_user_id_sort_order_idx
on public.quests(user_id, sort_order, created_at desc);

create or replace function public.reorder_journeys(p_ordered_ids uuid[])
returns void
language plpgsql
set search_path to ''
as $function$
declare
    v_user_id uuid := auth.uid();
begin
    if v_user_id is null then
        raise exception 'You must be signed in to reorder Projects.';
    end if;

    if cardinality(coalesce(p_ordered_ids, array[]::uuid[])) = 0 then
        return;
    end if;

    if cardinality(p_ordered_ids) <> (select count(distinct item_id) from unnest(p_ordered_ids) as item(item_id)) then
        raise exception 'Project order contains duplicate IDs.';
    end if;

    if exists (
        select 1
        from unnest(p_ordered_ids) as item(item_id)
        left join public.journeys on journeys.id = item.item_id
        where journeys.user_id is distinct from v_user_id
    ) then
        raise exception 'Project order contains an invalid Project.';
    end if;

    update public.journeys
    set sort_order = ordered.ordinality * 1024
    from unnest(p_ordered_ids) with ordinality as ordered(item_id, ordinality)
    where journeys.id = ordered.item_id
      and journeys.user_id = v_user_id;
end;
$function$;

create or replace function public.reorder_quests(p_ordered_ids uuid[])
returns void
language plpgsql
set search_path to ''
as $function$
declare
    v_user_id uuid := auth.uid();
begin
    if v_user_id is null then
        raise exception 'You must be signed in to reorder Tasks.';
    end if;

    if cardinality(coalesce(p_ordered_ids, array[]::uuid[])) = 0 then
        return;
    end if;

    if cardinality(p_ordered_ids) <> (select count(distinct item_id) from unnest(p_ordered_ids) as item(item_id)) then
        raise exception 'Task order contains duplicate IDs.';
    end if;

    if exists (
        select 1
        from unnest(p_ordered_ids) as item(item_id)
        left join public.quests on quests.id = item.item_id
        where quests.user_id is distinct from v_user_id
    ) then
        raise exception 'Task order contains an invalid Task.';
    end if;

    update public.quests
    set sort_order = ordered.ordinality * 1024
    from unnest(p_ordered_ids) with ordinality as ordered(item_id, ordinality)
    where quests.id = ordered.item_id
      and quests.user_id = v_user_id;
end;
$function$;

revoke execute on function public.reorder_journeys(uuid[]) from public;
revoke execute on function public.reorder_journeys(uuid[]) from anon;
grant execute on function public.reorder_journeys(uuid[]) to authenticated;

revoke execute on function public.reorder_quests(uuid[]) from public;
revoke execute on function public.reorder_quests(uuid[]) from anon;
grant execute on function public.reorder_quests(uuid[]) to authenticated;
