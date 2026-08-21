begin;

select plan(9);

select is(public.calculate_focus_session_xp(299, 'stopped'), 0, '4:59 earns no XP');
select is(public.calculate_focus_session_xp(300, 'stopped'), 15, '5:00 earns 15 base XP');
select is(public.calculate_focus_session_xp(1500, 'progressed'), 75, '25 progressed minutes earn 75 XP');
select is(public.calculate_focus_session_xp(1500, 'completed'), 90, '25 completed minutes earn 90 XP');
select is(public.calculate_focus_session_xp(7200, 'completed'), 432, '120 completed minutes are capped by duration at 432 XP');
select is(public.calculate_focus_session_xp(1500, 'blocked'), 75, 'blocked work keeps full focused-time XP');
select is(public.calculate_focus_session_xp(1500, 'stopped'), 75, 'an eligible early stop keeps full focused-time XP');
select is(has_table_privilege('authenticated', 'public.focus_sessions', 'INSERT'), false, 'authenticated clients cannot insert arbitrary XP sessions');
select ok(
    (
        select bool_and(prosecdef)
        from pg_proc
        where proname in (
            'start_focus_session_run',
            'pause_focus_session_run',
            'resume_focus_session_run',
            'finish_focus_session_run',
            'complete_review',
            'complete_quick_focus_review'
        )
    ),
    'credited lifecycle and Review functions execute with controlled server privileges'
);

select * from finish();

rollback;
