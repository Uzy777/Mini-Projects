begin;

select plan(7);

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
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'display-name-limit-test@example.com',
    '',
    now(),
    '{}'::jsonb,
    '{"display_name":"Original Name"}'::jsonb,
    now(),
    now()
);

select set_config('request.jwt.claim.sub', '40000000-0000-0000-0000-000000000001', true);

select is(
    (select display_name_change_used from public.profiles where id = auth.uid()),
    false,
    'signup does not consume the display-name change'
);

update public.profiles
set display_name = 'Original Name'
where id = auth.uid();

select is(
    (select display_name_change_used from public.profiles where id = auth.uid()),
    false,
    'saving the same display name does not consume the change'
);

update public.profiles
set display_name = 'Final Name'
where id = auth.uid();

select is(
    (select display_name from public.profiles where id = auth.uid()),
    'Final Name',
    'the first post-signup display-name change succeeds'
);

select is(
    (select display_name_change_used from public.profiles where id = auth.uid()),
    true,
    'the first display-name change consumes the allowance'
);

select throws_ok(
    $$update public.profiles set display_name = 'Another Name' where id = auth.uid()$$,
    'P0001',
    'Your one display name change has already been used.',
    'a second display-name change is rejected by the database'
);

select ok(
    has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE'),
    'authenticated users may update their display name'
);

select ok(
    not has_column_privilege('authenticated', 'public.profiles', 'display_name_change_used', 'UPDATE'),
    'authenticated users cannot reset the server-managed allowance'
);

select * from finish();

rollback;
