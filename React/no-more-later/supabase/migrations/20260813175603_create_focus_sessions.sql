create table public.focus_sessions (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    journey_id uuid
        references public.journeys(id)
        on delete set null,

    quest_id uuid
        references public.quests(id)
        on delete set null,

    quest_title text not null,

    planned_minutes integer not null
        check (planned_minutes > 0),

    actual_seconds integer
        check (actual_seconds >= 0),

    outcome text not null
        check (
            outcome in (
                'completed',
                'progressed',
                'blocked',
                'stopped'
            )
        ),

    accomplishment text not null default '',

    next_action text not null default '',

    earned_xp integer not null default 0
        check (earned_xp >= 0),

    completed_at timestamptz not null,

    created_at timestamptz not null default now()
);

create index focus_sessions_user_completed_at_idx
on public.focus_sessions (
    user_id,
    completed_at desc
);

alter table public.focus_sessions
enable row level security;

create policy "Users can view their own focus sessions"
on public.focus_sessions
for select
to authenticated
using (
    (select auth.uid()) = user_id
);

create policy "Users can create their own focus sessions"
on public.focus_sessions
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);

grant select, insert
on table public.focus_sessions
to authenticated;