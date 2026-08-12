create table public.journeys (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    title text not null,

    status text not null default 'active'
        check (status in ('active', 'completed')),

    created_at timestamptz not null default now()
);

create index journeys_user_id_idx
on public.journeys(user_id);

alter table public.journeys
enable row level security;

create policy "Users can view their own journeys"
on public.journeys
for select
to authenticated
using (
    (select auth.uid()) = user_id
);

create policy "Users can create their own journeys"
on public.journeys
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);

create policy "Users can update their own journeys"
on public.journeys
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);

create policy "Users can delete their own journeys"
on public.journeys
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);

grant select, insert, update, delete
on table public.journeys
to authenticated;