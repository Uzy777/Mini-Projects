-- Simplify Work back to one optional organisational layer: Project -> Task.
-- Keep the previous migration in history so this is safe for databases where
-- work folders have already been applied.

drop policy if exists "Users can create their own journeys" on public.journeys;
drop policy if exists "Users can update their own journeys" on public.journeys;
drop policy if exists "Users can create their own quests" on public.quests;
drop policy if exists "Users can update their own quests" on public.quests;

alter table public.quests
drop constraint if exists quests_single_parent_check;

alter table public.quests
drop column if exists folder_id;

alter table public.journeys
drop column if exists folder_id;

drop table if exists public.work_folders;

create policy "Users can create their own journeys"
on public.journeys for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own journeys"
on public.journeys for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can create their own quests"
on public.quests for insert to authenticated
with check (
    (select auth.uid()) = user_id
    and (
        journey_id is null
        or exists (
            select 1 from public.journeys
            where journeys.id = quests.journey_id
              and journeys.user_id = (select auth.uid())
        )
    )
);

create policy "Users can update their own quests"
on public.quests for update to authenticated
using ((select auth.uid()) = user_id)
with check (
    (select auth.uid()) = user_id
    and (
        journey_id is null
        or exists (
            select 1 from public.journeys
            where journeys.id = quests.journey_id
              and journeys.user_id = (select auth.uid())
        )
    )
);
