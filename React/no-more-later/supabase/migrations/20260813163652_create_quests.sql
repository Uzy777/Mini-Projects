create table public.quests (
    id uuid primary key default gen_random_uuid(),

    journey_id uuid not null
        references public.journeys(id)
        on delete cascade,

    title text not null,

    status text not null default 'active'
        check (status in ('active', 'completed')),

    done_when text,

    next_action text,

    last_accomplishment text,

    created_at timestamptz not null default now()
);

create index quests_journey_id_idx
on public.quests(journey_id);

alter table public.quests
enable row level security;

create policy "Users can view quests from their own journeys"
on public.quests
for select
to authenticated
using (
    exists (
        select 1
        from public.journeys
        where journeys.id = quests.journey_id
        and journeys.user_id = (select auth.uid())
    )
);

create policy "Users can create quests in their own journeys"
on public.quests
for insert
to authenticated
with check (
    exists (
        select 1
        from public.journeys
        where journeys.id = quests.journey_id
        and journeys.user_id = (select auth.uid())
    )
);

create policy "Users can update quests from their own journeys"
on public.quests
for update
to authenticated
using (
    exists (
        select 1
        from public.journeys
        where journeys.id = quests.journey_id
        and journeys.user_id = (select auth.uid())
    )
)
with check (
    exists (
        select 1
        from public.journeys
        where journeys.id = quests.journey_id
        and journeys.user_id = (select auth.uid())
    )
);

create policy "Users can delete quests from their own journeys"
on public.quests
for delete
to authenticated
using (
    exists (
        select 1
        from public.journeys
        where journeys.id = quests.journey_id
        and journeys.user_id = (select auth.uid())
    )
);

grant select, insert, update, delete
on table public.quests
to authenticated;