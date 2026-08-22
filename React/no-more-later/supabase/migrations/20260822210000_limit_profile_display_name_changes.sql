-- Give each account one display-name change after signup and enforce the limit
-- in the database so leaderboard identities cannot be repeatedly replaced by
-- bypassing the app UI.

alter table public.profiles
add column if not exists display_name_change_used boolean not null default false;

comment on column public.profiles.display_name_change_used is
'Whether the account has used its one post-signup display-name change.';

-- Preserve the restriction for existing accounts when their current profile
-- name is already different from the name captured during signup.
update public.profiles profiles
set display_name_change_used = true
from auth.users users
where users.id = profiles.id
    and users.raw_user_meta_data ->> 'display_name' is not null
    and nullif(btrim(profiles.display_name), '') is distinct from
        nullif(btrim(users.raw_user_meta_data ->> 'display_name'), '');

create or replace function public.enforce_profile_display_name_change_limit()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
    -- Updating another profile field, or saving the exact same name, must not
    -- consume the allowance.
    if new.display_name is not distinct from old.display_name then
        new.display_name_change_used := old.display_name_change_used;
        return new;
    end if;

    if old.display_name_change_used then
        raise exception 'Your one display name change has already been used.';
    end if;

    new.display_name_change_used := true;

    return new;
end;
$$;

drop trigger if exists enforce_profile_display_name_change_limit
on public.profiles;

create trigger enforce_profile_display_name_change_limit
before update of display_name, display_name_change_used
on public.profiles
for each row
execute function public.enforce_profile_display_name_change_limit();

-- Clients only need to edit these two profile settings. In particular, they
-- must not be able to reset the server-managed allowance flag directly.
revoke update on public.profiles from authenticated;
grant update (display_name, daily_focus_goal_minutes) on public.profiles to authenticated;
