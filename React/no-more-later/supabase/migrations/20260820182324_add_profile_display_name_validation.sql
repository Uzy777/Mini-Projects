-- Prevent users from bypassing client-side display-name moderation.

create or replace function public.validate_profile_display_name()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
declare
    base_name text;
    no_digits text;
    leet_name text;

    compact_name text;
    compact_no_digits text;
    compact_leet text;

    candidate text;
    candidate_word text;

    reserved_names text[] := array[
        'admin',
        'administrator',
        'admins',
        'moderator',
        'moderators',
        'mod',
        'support',
        'supportteam',
        'staff',
        'official',
        'system',
        'root',
        'superuser',
        'nomorelater',
        'nomorelaterapp',
        'nmladmin',
        'nmlsupport',
        'nmlofficial'
    ];

    blocked_terms text[] := array[
        'fuck',
        'fck',
        'fuk',
        'fukk',
        'fuq',
        'phuck',
        'phuk',

        'shit',
        'shitty',

        'bitch',
        'bastard',

        'asshole',
        'arsehole',

        'cunt',
        'twat',
        'wanker',
        'prick',

        'sex',
        'sexy',

        'porn',
        'porno',
        'xxx',

        'nude',
        'nudes',

        'dick',
        'cock',
        'penis',
        'vagina',
        'pussy',

        'tit',
        'tits',
        'titties',

        'boob',
        'boobs',

        'cum',
        'semen',
        'orgasm',

        'slut',
        'whore',

        'dildo',
        'hentai',

        'retard',

        'nigger',
        'nigga',
        'faggot',
        'kike',
        'chink',
        'gook',
        'spic',
        'wetback',

        'nazi',
        'kkk'
    ];

begin
    /*
     * Display names must exist.
     */
    if new.display_name is null
        or btrim(new.display_name) = ''
    then
        raise exception 'A display name is required.';
    end if;

    /*
     * Match the 40-character limit used by the app.
     */
    if char_length(new.display_name) > 40 then
        raise exception 'Display name must be 40 characters or fewer.';
    end if;

    /*
     * Start with a lowercase version.
     */
    base_name := lower(btrim(new.display_name));

    /*
     * Remove invisible characters that can be used to disguise words.
     */
    base_name := regexp_replace(
        base_name,
        '[​‌‍⁠﻿]',
        '',
        'g'
    );

    /*
     * Create a version with digits removed.
     *
     * F3UCK ME -> FUCK ME
     */
    no_digits := regexp_replace(
        base_name,
        '[0-9]',
        '',
        'g'
    );

    /*
     * Create a common leetspeak version.
     */
    leet_name := base_name;

    leet_name := replace(leet_name, '0', 'o');
    leet_name := replace(leet_name, '1', 'i');
    leet_name := replace(leet_name, '2', 'z');
    leet_name := replace(leet_name, '3', 'e');
    leet_name := replace(leet_name, '4', 'a');
    leet_name := replace(leet_name, '5', 's');
    leet_name := replace(leet_name, '6', 'g');
    leet_name := replace(leet_name, '7', 't');
    leet_name := replace(leet_name, '8', 'b');

    leet_name := replace(leet_name, '@', 'a');
    leet_name := replace(leet_name, '$', 's');
    leet_name := replace(leet_name, '!', 'i');

    /*
     * Handle a few common Unicode lookalike characters.
     */
    leet_name := replace(leet_name, 'а', 'a');
    leet_name := replace(leet_name, 'е', 'e');
    leet_name := replace(leet_name, 'о', 'o');
    leet_name := replace(leet_name, 'р', 'p');
    leet_name := replace(leet_name, 'с', 'c');
    leet_name := replace(leet_name, 'х', 'x');
    leet_name := replace(leet_name, 'у', 'y');
    leet_name := replace(leet_name, 'і', 'i');

    /*
     * Compact versions catch separators.
     *
     * a.d.m.i.n -> admin
     * f_u_c_k   -> fuck
     */
    compact_name := regexp_replace(
        base_name,
        '[^a-z0-9]',
        '',
        'g'
    );

    compact_no_digits := regexp_replace(
        no_digits,
        '[^a-z]',
        '',
        'g'
    );

    compact_leet := regexp_replace(
        leet_name,
        '[^a-z]',
        '',
        'g'
    );

    /*
     * Collapse deliberately repeated characters.
     *
     * TITSS    -> tits
     * FUUUUCK  -> fuck
     * SEXXXXXY -> sexy
     */
    compact_name := regexp_replace(
        compact_name,
        '(.)\1+',
        '\1',
        'g'
    );

    compact_no_digits := regexp_replace(
        compact_no_digits,
        '(.)\1+',
        '\1',
        'g'
    );

    compact_leet := regexp_replace(
        compact_leet,
        '(.)\1+',
        '\1',
        'g'
    );

    /*
     * Check complete words.
     *
     * "Admin Tim" -> ["admin", "tim"]
     * "fuck me"   -> ["fuck", "me"]
     */
    foreach candidate in array array[
        base_name,
        no_digits,
        leet_name
    ]
    loop
        foreach candidate_word in array regexp_split_to_array(
            candidate,
            '[^a-z0-9]+'
        )
        loop
            candidate_word := regexp_replace(
                candidate_word,
                '(.)\1+',
                '\1',
                'g'
            );

            if candidate_word = any(reserved_names) then
                raise exception 'Nice try 😄 That username is reserved.';
            end if;

            if candidate_word = any(blocked_terms) then
                raise exception 'We saw that 👀 Try a more friendly username.';
            end if;
        end loop;
    end loop;

    /*
     * Check compact forms too.
     */
    if
        compact_name = any(reserved_names)
        or compact_no_digits = any(reserved_names)
        or compact_leet = any(reserved_names)
    then
        raise exception 'Nice try 😄 That username is reserved.';
    end if;

    if
        compact_name = any(blocked_terms)
        or compact_no_digits = any(blocked_terms)
        or compact_leet = any(blocked_terms)
    then
        raise exception 'We saw that 👀 Try a more friendly username.';
    end if;

    return new;
end;
$$;


drop trigger if exists validate_profile_display_name
on public.profiles;


create trigger validate_profile_display_name
before insert or update of display_name
on public.profiles
for each row
execute function public.validate_profile_display_name();