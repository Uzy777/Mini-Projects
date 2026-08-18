alter table public.quests
drop constraint quests_journey_id_fkey;

alter table public.quests
add constraint quests_journey_id_fkey
foreign key (journey_id)
references public.journeys(id)
on delete set null;