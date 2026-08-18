-- ---------------------------------------------------------
-- JOURNEY ASSET
-- ---------------------------------------------------------

alter table public.journeys
add column asset_id text
not null
default 'work';

alter table public.journeys
add constraint journeys_asset_id_check
check (
    asset_id in (
        'work',
        'study',
        'health',
        'home',
        'creative'
    )
);


-- ---------------------------------------------------------
-- QUEST ASSET
-- ---------------------------------------------------------

alter table public.quests
add column asset_id text
not null
default 'task';

alter table public.quests
add constraint quests_asset_id_check
check (
    asset_id in (
        'task',
        'laptop',
        'book',
        'fitness',
        'home',
        'cloud',
        'shield',
        'creative'
    )
);