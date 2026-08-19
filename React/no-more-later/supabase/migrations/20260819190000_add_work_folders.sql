-- Optional top-level folders for organising Projects (stored in journeys).
create table public.work_folders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null check (char_length(btrim(title)) between 1 and 120),
    created_at timestamptz not null default now()
);

create index work_folders_user_id_created_at_idx
on public.work_folders(user_id, created_at desc);

alter table public.work_folders enable row level security;

create policy "Users can view their own work folders"
on public.work_folders for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own work folders"
on public.work_folders for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own work folders"
on public.work_folders for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own work folders"
on public.work_folders for delete to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.work_folders to authenticated;

alter table public.journeys
add column folder_id uuid references public.work_folders(id) on delete set null;

create index journeys_folder_id_idx on public.journeys(folder_id);

-- Tasks may also live directly in a Folder when no Project is useful.
alter table public.quests
add column folder_id uuid references public.work_folders(id) on delete set null;

alter table public.quests
add constraint quests_single_parent_check
check (journey_id is null or folder_id is null);

create index quests_folder_id_idx on public.quests(folder_id);

-- A Project may only be assigned to a Folder owned by the same signed-in user.
drop policy if exists "Users can create their own journeys" on public.journeys;
drop policy if exists "Users can update their own journeys" on public.journeys;

create policy "Users can create their own journeys"
on public.journeys for insert to authenticated
with check (
    (select auth.uid()) = user_id
    and (
        folder_id is null
        or exists (
            select 1 from public.work_folders
            where work_folders.id = journeys.folder_id
              and work_folders.user_id = (select auth.uid())
        )
    )
);

create policy "Users can update their own journeys"
on public.journeys for update to authenticated
using ((select auth.uid()) = user_id)
with check (
    (select auth.uid()) = user_id
    and (
        folder_id is null
        or exists (
            select 1 from public.work_folders
            where work_folders.id = journeys.folder_id
              and work_folders.user_id = (select auth.uid())
        )
    )
);

-- Extend Task ownership checks to cover an optional direct Folder assignment.
drop policy if exists "Users can create their own quests" on public.quests;
drop policy if exists "Users can update their own quests" on public.quests;

create policy "Users can create their own quests"
on public.quests for insert to authenticated
with check (
    (select auth.uid()) = user_id
    and not (journey_id is not null and folder_id is not null)
    and (
        journey_id is null
        or exists (
            select 1 from public.journeys
            where journeys.id = quests.journey_id
              and journeys.user_id = (select auth.uid())
        )
    )
    and (
        folder_id is null
        or exists (
            select 1 from public.work_folders
            where work_folders.id = quests.folder_id
              and work_folders.user_id = (select auth.uid())
        )
    )
);

create policy "Users can update their own quests"
on public.quests for update to authenticated
using ((select auth.uid()) = user_id)
with check (
    (select auth.uid()) = user_id
    and not (journey_id is not null and folder_id is not null)
    and (
        journey_id is null
        or exists (
            select 1 from public.journeys
            where journeys.id = quests.journey_id
              and journeys.user_id = (select auth.uid())
        )
    )
    and (
        folder_id is null
        or exists (
            select 1 from public.work_folders
            where work_folders.id = quests.folder_id
              and work_folders.user_id = (select auth.uid())
        )
    )
);
