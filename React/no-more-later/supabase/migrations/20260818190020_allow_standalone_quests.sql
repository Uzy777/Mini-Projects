-- ---------------------------------------------------------
-- Give every Quest direct ownership.
-- ---------------------------------------------------------

alter table public.quests
add column user_id uuid;


-- Existing Quests already belong to Journeys.
-- Copy the Journey owner onto each existing Quest.
update public.quests
set user_id = journeys.user_id
from public.journeys
where quests.journey_id = journeys.id;


-- Every Quest must always have an owner.
alter table public.quests
alter column user_id set not null;


-- Link Quest ownership to Supabase Auth users.
alter table public.quests
add constraint quests_user_id_fkey
foreign key (user_id)
references auth.users(id)
on delete cascade;


-- A Quest may now exist without a Journey.
alter table public.quests
alter column journey_id drop not null;

drop policy if exists
    "Users can create quests in their own journeys"
on public.quests;

drop policy if exists
    "Users can view quests from their own journeys"
on public.quests;

drop policy if exists
    "Users can update quests from their own journeys"
on public.quests;

drop policy if exists
    "Users can delete quests from their own journeys"
on public.quests;

create policy "Users can create their own quests"
on public.quests
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
    and (
        journey_id is null
        or exists (
            select 1
            from public.journeys
            where journeys.id = quests.journey_id
              and journeys.user_id = (select auth.uid())
        )
    )
);


create policy "Users can view their own quests"
on public.quests
for select
to authenticated
using (
    (select auth.uid()) = user_id
);


create policy "Users can update their own quests"
on public.quests
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
    and (
        journey_id is null
        or exists (
            select 1
            from public.journeys
            where journeys.id = quests.journey_id
              and journeys.user_id = (select auth.uid())
        )
    )
);


create policy "Users can delete their own quests"
on public.quests
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);