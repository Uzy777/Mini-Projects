begin;

select plan(12);

insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) values (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'xp-v2-test@example.com',
    '',
    now(),
    '{}'::jsonb,
    '{"display_name":"XP V2 Tester"}'::jsonb,
    now(),
    now()
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);

insert into public.quests (id, user_id, journey_id, title, done_when, status)
values ('20000000-0000-0000-0000-000000000001', auth.uid(), null, 'Test Quest', 'The test is finished', 'active');

select public.start_focus_session_run(
    '30000000-0000-0000-0000-000000000001',
    30,
    'quest'
);

update public.focus_session_runs
set state = 'paused', accumulated_seconds = 1500, last_resumed_at = null
where id = '30000000-0000-0000-0000-000000000001';

select throws_ok(
    $$select * from public.complete_review(
        '30000000-0000-0000-0000-000000000001', null,
        '20000000-0000-0000-0000-000000000001', 30, 1, 'completed',
        'Finished the test Quest', '', '[]'::jsonb, false
    )$$,
    'P0001',
    'Confirm that the Quest finish line was met.',
    'a completed Quest requires server-side finish-line confirmation'
);

create temporary table review_result as
select *
from public.complete_review(
    '30000000-0000-0000-0000-000000000001',
    null,
    '20000000-0000-0000-0000-000000000001',
    30,
    1,
    'completed',
    'Finished the test Quest',
    '',
    '[]'::jsonb,
    true
);

select is((select actual_seconds from public.focus_sessions where id = '30000000-0000-0000-0000-000000000001'), 1500, 'Review uses server-tracked time instead of the client value');
select is((select credited_focus_seconds from review_result), 1500, 'eligible server-tracked time is credited');
select is((select base_xp from review_result), 75, 'Review awards 3 XP per complete focused minute');
select is((select bonus_xp from review_result), 15, 'completed work adds a 20 percent bonus');
select is((select earned_xp from review_result), 90, 'Review returns the complete XP award');
select is((select status from public.quests where id = '20000000-0000-0000-0000-000000000001'), 'completed', 'completed Review updates the Quest');

select *
from public.complete_review(
    '30000000-0000-0000-0000-000000000001',
    null,
    '20000000-0000-0000-0000-000000000001',
    30,
    1800,
    'progressed',
    'Attempted a duplicate Review',
    '',
    '[]'::jsonb,
    false
);

select is((select count(*)::integer from public.focus_sessions where id = '30000000-0000-0000-0000-000000000001'), 1, 'duplicate Reviews remain idempotent');
select is((select focused_seconds::integer from public.get_leaderboard('30_days') where user_id = auth.uid()), 1500, 'leaderboard ranks by credited focused time');

update public.focus_sessions
set credited_focus_seconds = 21500
where id = '30000000-0000-0000-0000-000000000001';

select public.start_focus_session_run('30000000-0000-0000-0000-000000000002', 10, 'quick');
update public.focus_session_runs
set state = 'paused', accumulated_seconds = 600, last_resumed_at = null
where id = '30000000-0000-0000-0000-000000000002';

create temporary table capped_result as
select * from public.complete_quick_focus_review(
    '30000000-0000-0000-0000-000000000002', 10, 600, 'progressed',
    'Reached the daily boundary', '', '[]'::jsonb
);

select is((select credited_focus_seconds from capped_result), 100, 'only the remaining daily focus allowance is credited');
select is((select daily_credited_seconds from capped_result), 21600, 'daily credited Focus time is capped at six hours');

select public.start_focus_session_run('30000000-0000-0000-0000-000000000003', 10, 'quick');
update public.focus_session_runs
set state = 'paused', accumulated_seconds = 600, last_resumed_at = null
where id = '30000000-0000-0000-0000-000000000003';

create temporary table limited_result as
select * from public.complete_quick_focus_review(
    '30000000-0000-0000-0000-000000000003', 10, 600, 'progressed',
    'After the daily boundary', '', '[]'::jsonb
);

select is((select xp_credit_status from limited_result), 'daily_limit', 'later sessions report the daily limit without losing personal History');

select * from finish();

rollback;
