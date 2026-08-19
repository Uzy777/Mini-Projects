alter table public.profiles
add column daily_focus_goal_minutes integer not null default 180;

alter table public.profiles
add constraint profiles_daily_focus_goal_minutes_check
check (
    daily_focus_goal_minutes between 15 and 1440
);
