begin;

select plan(27);

insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
(
    '81000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'viewer@example.com', '', now(),
    '{}'::jsonb, '{"display_name":"Viewer"}'::jsonb, now(), now()
),
(
    '81000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'private@example.com', '', now(),
    '{}'::jsonb, '{"display_name":"Private Buddy"}'::jsonb, now(), now()
),
(
    '81000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'stranger@example.com', '', now(),
    '{}'::jsonb, '{"display_name":"Stranger"}'::jsonb, now(), now()
);

update public.profiles set leaderboard_anonymous = true
where id = '81000000-0000-0000-0000-000000000002';

insert into public.focus_sessions (
    id, user_id, quest_title, session_kind, planned_minutes, actual_seconds,
    outcome, earned_xp, completed_at, credited_focus_seconds, base_xp,
    bonus_xp, xp_version, xp_credit_status, credit_day
) values
(
    '82000000-0000-0000-0000-000000000001',
    '81000000-0000-0000-0000-000000000001', 'Viewer focus', 'quick', 10, 600,
    'progressed', 30, now() - interval '2 days', 600, 30, 0, 2, 'credited', current_date - 2
),
(
    '82000000-0000-0000-0000-000000000002',
    '81000000-0000-0000-0000-000000000002', 'Private focus', 'quick', 10, 900,
    'progressed', 45, now() - interval '40 days', 900, 45, 0, 2, 'credited', current_date - 40
),
(
    '82000000-0000-0000-0000-000000000003',
    '81000000-0000-0000-0000-000000000003', 'Stranger focus', 'quick', 10, 300,
    'progressed', 15, now(), 300, 15, 0, 2, 'credited', current_date
);

insert into public.badge_unlocks (
    user_id, badge_id, tier, xp_awarded, unlocked_at, award_batch_id
) values (
    '81000000-0000-0000-0000-000000000002',
    'focus_legend', 'bronze', 50, now(), '83000000-0000-0000-0000-000000000001'
);

select set_config('request.jwt.claim.sub', '81000000-0000-0000-0000-000000000001', true);

select is(
    (select count(*)::integer from public.get_leaderboard('30_days', 'global') where user_id = '81000000-0000-0000-0000-000000000002'),
    0,
    'public leaderboard removes a profile that opted out'
);

select is(
    (select count(*)::integer from public.get_leaderboard('30_days', 'global') where user_id = '81000000-0000-0000-0000-000000000001'),
    1,
    'public leaderboard keeps profiles that did not opt out'
);

select throws_ok(
    $$select public.get_leaderboard_profile('81000000-0000-0000-0000-000000000002', '30_days')$$,
    'P0001',
    'Leaderboard profile not found.',
    'unrelated users cannot fetch an opted-out profile directly'
);

select is(
    (select count(*)::integer from public.get_leaderboard('30_days', 'buddies') where user_id = '81000000-0000-0000-0000-000000000002'),
    0,
    'unconnected users do not appear in the buddy scope'
);

select set_config('request.jwt.claim.sub', '81000000-0000-0000-0000-000000000002', true);

select is(
    (select count(*)::integer from public.get_my_leaderboard_position('30_days', 'global')),
    0,
    'an opted-out user has no public leaderboard position'
);

create temporary table test_buddy_invite as
select * from public.create_buddy_invite();

select matches(
    (select code from test_buddy_invite),
    '^[A-Z0-9]{8}$',
    'buddy invite codes are compact random tokens'
);

select ok(
    (select expires_at > now() + interval '6 days' from test_buddy_invite),
    'buddy invites expire after a limited window'
);

select set_config('request.jwt.claim.sub', '81000000-0000-0000-0000-000000000001', true);

select is(
    public.preview_buddy_invite((select code from test_buddy_invite)) ->> 'display_name',
    'Private Buddy',
    'a valid invite previews the inviter name'
);

select is(
    public.accept_buddy_invite((select code from test_buddy_invite)) ->> 'display_name',
    'Private Buddy',
    'accepting an invite returns the added buddy'
);

select is(
    (select count(*)::integer from public.buddy_connections
     where status = 'accepted'
       and requester_id = '81000000-0000-0000-0000-000000000002'
       and addressee_id = '81000000-0000-0000-0000-000000000001'),
    1,
    'invite acceptance creates an accepted buddy relationship'
);

select ok(
    (select used_at is not null and used_by = '81000000-0000-0000-0000-000000000001' from public.buddy_invites where code = (select code from test_buddy_invite)),
    'accepted invites are consumed by the accepting user'
);

select set_config('request.jwt.claim.sub', '81000000-0000-0000-0000-000000000003', true);

select is(
    public.accept_buddy_invite((select code from test_buddy_invite)) ->> 'display_name',
    'Private Buddy',
    'the same unexpired invite can connect another authenticated user'
);

select set_config('request.jwt.claim.sub', '81000000-0000-0000-0000-000000000001', true);

select is(
    (select display_name from public.get_leaderboard('30_days', 'buddies') where user_id = '81000000-0000-0000-0000-000000000002'),
    'Private Buddy',
    'buddy leaderboard shows the opted-out buddy real name'
);

select is(
    (select is_anonymous from public.get_leaderboard('30_days', 'buddies') where user_id = '81000000-0000-0000-0000-000000000002'),
    false,
    'buddy leaderboard never labels accepted buddies as anonymous'
);

select is(
    (select focused_seconds::integer from public.get_leaderboard('30_days', 'buddies') where user_id = '81000000-0000-0000-0000-000000000002'),
    0,
    'accepted buddies remain visible with zero qualifying focus in the selected period'
);

select is(
    public.get_leaderboard_profile('81000000-0000-0000-0000-000000000002', '30_days') ->> 'display_name',
    'Private Buddy',
    'accepted buddies can see the real name in profile details'
);

select is(
    jsonb_array_length(public.get_leaderboard_profile('81000000-0000-0000-0000-000000000002', '30_days') -> 'badges'),
    1,
    'buddy profile showcases the highest unlocked badge tier'
);

select is(
    (public.get_leaderboard_profile('81000000-0000-0000-0000-000000000002', '30_days') ->> 'qualifying_sessions')::integer,
    0,
    'buddy profile returns the period session breakdown'
);

select is(
    (select count(*)::integer from public.get_leaderboard('30_days', 'buddies') where user_id = '81000000-0000-0000-0000-000000000003'),
    0,
    'buddy leaderboard excludes unrelated users'
);

select is(
    (select display_name from public.get_my_buddies() where user_id = '81000000-0000-0000-0000-000000000002'),
    'Private Buddy',
    'buddy list includes accepted profiles even when they opted out publicly'
);

select set_config('request.jwt.claim.sub', '81000000-0000-0000-0000-000000000002', true);

select is(
    public.remove_buddy('81000000-0000-0000-0000-000000000001'),
    true,
    'either participant can remove an accepted buddy relationship'
);

select ok(
    (select expires_at <= now() from public.buddy_invites where code = (select code from test_buddy_invite)),
    'removing a buddy retires the remover current invite code'
);

select set_config('request.jwt.claim.sub', '81000000-0000-0000-0000-000000000001', true);

select is(
    (select count(*)::integer from public.get_my_buddies() where user_id = '81000000-0000-0000-0000-000000000002'),
    0,
    'removed buddies disappear from the active buddy list'
);

select is(
    (select count(*)::integer from public.get_leaderboard('30_days', 'buddies') where user_id = '81000000-0000-0000-0000-000000000002'),
    0,
    'removed buddies disappear from the buddy leaderboard'
);

select is(
    has_table_privilege('authenticated', 'public.buddy_connections', 'INSERT'),
    false,
    'clients cannot forge accepted buddy connections directly'
);

select is(
    has_table_privilege('authenticated', 'public.buddy_invites', 'SELECT'),
    false,
    'clients cannot read raw buddy invite records directly'
);

select is(
    has_column_privilege('authenticated', 'public.profiles', 'leaderboard_anonymous', 'UPDATE'),
    true,
    'authenticated users can update the dedicated leaderboard privacy setting'
);

select * from finish();

rollback;
