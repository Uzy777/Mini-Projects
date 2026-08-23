begin;

select plan(15);

insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
    '70000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'badges-test@example.com', '', now(),
    '{}'::jsonb, '{"display_name":"Badge Tester"}'::jsonb, now(), now()
);

select set_config('request.jwt.claim.sub', '70000000-0000-0000-0000-000000000001', true);

select public.start_focus_session_run(
    '71000000-0000-0000-0000-000000000001', 10, 'quick', 'Europe/London'
);

select is(
    (select time_zone from public.focus_session_runs where id = '71000000-0000-0000-0000-000000000001'),
    'Europe/London',
    'a Focus run stores its validated local time zone'
);

create temporary table badge_seed_sessions (
    id uuid primary key default gen_random_uuid(),
    started_at timestamptz not null,
    actual_seconds integer not null,
    quest_id uuid
);

-- Ten five-minute-or-longer Saturday morning sessions qualify for Focus
-- Legend, Early Bird, and Weekend Warrior Bronze.
insert into badge_seed_sessions (started_at, actual_seconds)
select
    (timestamp '2026-01-03 08:00' + (week_number * interval '7 days')) at time zone 'Europe/London',
    600
from generate_series(0, 9) as week_number;

insert into public.focus_session_runs (
    id, user_id, planned_minutes, session_kind, state, accumulated_seconds,
    started_at, ended_at, time_zone
)
select id, auth.uid(), 10, 'quick', 'completed', actual_seconds,
    started_at, started_at + make_interval(secs => actual_seconds), 'Europe/London'
from badge_seed_sessions;

insert into public.focus_sessions (
    id, user_id, quest_title, session_kind, planned_minutes, actual_seconds,
    outcome, accomplishment, next_action, earned_xp, completed_at,
    credited_focus_seconds, base_xp, bonus_xp, xp_version,
    xp_credit_status, credit_day
)
select id, auth.uid(), 'Badge seed', 'quick', 10, actual_seconds,
    'progressed', '', '', 0, started_at + make_interval(secs => actual_seconds),
    actual_seconds, 0, 0, 2, 'credited',
    ((started_at + make_interval(secs => actual_seconds)) at time zone 'UTC')::date
from badge_seed_sessions;

-- A reviewed session below five minutes must not affect any badge metric.
insert into public.focus_sessions (
    user_id, quest_title, session_kind, planned_minutes, actual_seconds,
    outcome, earned_xp, completed_at, credited_focus_seconds, xp_version,
    xp_credit_status, credit_day
) values (
    auth.uid(), 'Too short', 'quick', 10, 299,
    'stopped', 0, now(), 0, 2, 'under_minimum', (now() at time zone 'UTC')::date
);

create temporary table first_badge_evaluation as
select public.evaluate_badges() as result;

select is(
    ((select result from first_badge_evaluation) ->> 'badge_xp_awarded')::integer,
    150,
    'three first-tier badge unlocks award 150 XP once'
);

select is(
    (select count(*)::integer from public.badge_unlocks where user_id = auth.uid()),
    3,
    'only the three earned badge paths are visible'
);

select is(
    (select count(*)::integer from public.badge_unlocks where user_id = auth.uid() and tier <> 'bronze'),
    0,
    'locked higher tiers remain hidden'
);

select ok(
    exists (select 1 from public.badge_unlocks where user_id = auth.uid() and badge_id = 'focus_legend' and tier = 'bronze'),
    'ten qualifying sessions unlock Focus Legend Bronze'
);

select ok(
    exists (select 1 from public.badge_unlocks where user_id = auth.uid() and badge_id = 'early_bird' and tier = 'bronze'),
    'ten locally early sessions unlock Early Bird Bronze'
);

select ok(
    exists (select 1 from public.badge_unlocks where user_id = auth.uid() and badge_id = 'weekend_warrior' and tier = 'bronze'),
    'ten locally weekend sessions unlock Weekend Warrior Bronze'
);

select is(
    (public.evaluate_badges() ->> 'badge_xp_awarded')::integer,
    0,
    're-evaluation cannot duplicate badge XP'
);

-- Ten different completed Tasks unlock Task Master, regardless of repeat work.
insert into public.quests (id, user_id, journey_id, title, status)
select gen_random_uuid(), auth.uid(), null, 'Badge Task ' || task_number, 'completed'
from generate_series(1, 10) as task_number;

insert into badge_seed_sessions (started_at, actual_seconds, quest_id)
select
    timestamp '2026-04-06 12:00' at time zone 'Europe/London' + (row_number() over ()) * interval '1 hour',
    600,
    quests.id
from public.quests quests
where quests.user_id = auth.uid();

insert into public.focus_session_runs (
    id, user_id, planned_minutes, session_kind, state, accumulated_seconds,
    started_at, ended_at, time_zone
)
select id, auth.uid(), 10, 'quest', 'completed', actual_seconds,
    started_at, started_at + make_interval(secs => actual_seconds), 'Europe/London'
from badge_seed_sessions
where quest_id is not null;

insert into public.focus_sessions (
    id, user_id, quest_id, quest_title, session_kind, planned_minutes,
    actual_seconds, outcome, earned_xp, completed_at, credited_focus_seconds,
    xp_version, xp_credit_status, credit_day
)
select id, auth.uid(), quest_id, 'Badge Task', 'quest', 10,
    actual_seconds, 'completed', 0, started_at + make_interval(secs => actual_seconds),
    actual_seconds, 2, 'credited',
    ((started_at + make_interval(secs => actual_seconds)) at time zone 'UTC')::date
from badge_seed_sessions
where quest_id is not null;

select is(
    (public.evaluate_badges() ->> 'badge_xp_awarded')::integer,
    50,
    'ten unique completed Tasks unlock Task Master Bronze'
);

-- Three consecutive qualifying local dates unlock Streak Champion Bronze.
insert into badge_seed_sessions (started_at, actual_seconds)
select timestamp '2026-05-04 12:00' at time zone 'Europe/London' + day_number * interval '1 day', 600
from generate_series(0, 2) as day_number;

insert into public.focus_session_runs (
    id, user_id, planned_minutes, session_kind, state, accumulated_seconds,
    started_at, ended_at, time_zone
)
select seed.id, auth.uid(), 10, 'quick', 'completed', seed.actual_seconds,
    seed.started_at, seed.started_at + make_interval(secs => seed.actual_seconds), 'Europe/London'
from badge_seed_sessions seed
where seed.quest_id is null
  and seed.started_at >= timestamp '2026-05-04 00:00' at time zone 'Europe/London';

insert into public.focus_sessions (
    id, user_id, quest_title, session_kind, planned_minutes, actual_seconds,
    outcome, earned_xp, completed_at, credited_focus_seconds, xp_version,
    xp_credit_status, credit_day
)
select seed.id, auth.uid(), 'Streak seed', 'quick', 10, seed.actual_seconds,
    'progressed', 0, seed.started_at + make_interval(secs => seed.actual_seconds),
    seed.actual_seconds, 2, 'credited',
    ((seed.started_at + make_interval(secs => seed.actual_seconds)) at time zone 'UTC')::date
from badge_seed_sessions seed
where seed.quest_id is null
  and seed.started_at >= timestamp '2026-05-04 00:00' at time zone 'Europe/London';

select is(
    (public.evaluate_badges() ->> 'badge_xp_awarded')::integer,
    50,
    'three consecutive qualifying local dates unlock Streak Champion Bronze'
);

-- Existing qualifying time is 23 * 600 seconds. A 70-minute run reaches five hours.
insert into public.focus_session_runs (
    id, user_id, planned_minutes, session_kind, state, accumulated_seconds,
    started_at, ended_at, time_zone
) values (
    '72000000-0000-0000-0000-000000000001', auth.uid(), 70, 'quick',
    'completed', 4200, timestamp '2026-06-08 12:00' at time zone 'Europe/London',
    timestamp '2026-06-08 13:10' at time zone 'Europe/London', 'Europe/London'
);

insert into public.focus_sessions (
    id, user_id, quest_title, session_kind, planned_minutes, actual_seconds,
    outcome, earned_xp, completed_at, credited_focus_seconds, xp_version,
    xp_credit_status, credit_day
) values (
    '72000000-0000-0000-0000-000000000001', auth.uid(), 'Time seed', 'quick',
    70, 4200, 'progressed', 0,
    timestamp '2026-06-08 13:10' at time zone 'Europe/London', 4200, 2,
    'credited', date '2026-06-08'
);

select is(
    (public.evaluate_badges() ->> 'badge_xp_awarded')::integer,
    50,
    'five cumulative Focus hours unlock Master of Time Bronze'
);

-- One more qualifying session raises the cumulative count from 24 to 25. It
-- unlocks Silver without asking for 25 additional sessions after Bronze.
insert into public.focus_session_runs (
    id, user_id, planned_minutes, session_kind, state, accumulated_seconds,
    started_at, ended_at, time_zone
) values (
    '73000000-0000-0000-0000-000000000001', auth.uid(), 10, 'quick',
    'completed', 600, timestamp '2026-06-09 12:00' at time zone 'Europe/London',
    timestamp '2026-06-09 12:10' at time zone 'Europe/London', 'Europe/London'
);

insert into public.focus_sessions (
    id, user_id, quest_title, session_kind, planned_minutes, actual_seconds,
    outcome, earned_xp, completed_at, credited_focus_seconds, xp_version,
    xp_credit_status, credit_day
) values (
    '73000000-0000-0000-0000-000000000001', auth.uid(), 'Silver seed', 'quick',
    10, 600, 'progressed', 0,
    timestamp '2026-06-09 12:10' at time zone 'Europe/London', 600, 2,
    'credited', date '2026-06-09'
);

select is(
    (public.evaluate_badges() ->> 'badge_xp_awarded')::integer,
    100,
    'tier thresholds are cumulative rather than resetting after Bronze'
);

select is(public.get_my_total_xp()::integer, 400, 'badge rewards are included in total XP');

select is(
    (select total_xp::integer from public.get_my_leaderboard_position('all_time')),
    400,
    'leaderboard XP includes badge rewards without changing its focus-time rank basis'
);

select is(
    has_table_privilege('authenticated', 'public.badge_unlocks', 'INSERT'),
    false,
    'authenticated clients cannot insert arbitrary badge awards'
);

select * from finish();

rollback;
