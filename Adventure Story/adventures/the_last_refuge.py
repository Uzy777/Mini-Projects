from termcolor import colored, cprint

# ============================================
#            🧟 The Last Refuge 🧟
# ============================================

class StorySection:
    def __init__(self, title, text, choices=None, game_over=False):
        self.title = title
        self.text = text
        self.choices = choices if choices else {}
        self.game_over = game_over

    def display(self):
        print(f"\n{self.title}")
        print(self.text)

    def display_choices(self):
        for key, choice in self.choices.items():
            print(colored(f"{key}: ", "green", attrs=["bold"]) + f"{choice['text']}")

# ======================================================================================================================================================================
# ======================================================================================================================================================================
#                                                                           SCENARIO 1
# ======================================================================================================================================================================
# ======================================================================================================================================================================
intro_section = StorySection(
    title="Entering the Safehouse",
    text="You approach the Safehouse, an old, crumbling building that once offered shelter to many. You wonder whether it still holds any secrets.",
    choices={
        'A': {'text': "Enter the Main Hall 🏚️", 'next_section': 'main_hall'},
        'B': {'text': "Go to the Basement 🪔", 'next_section': 'basement'},
        'C': {'text': "Check the Upstairs Rooms 🔼", 'next_section': 'upstairs_room'}
    }
)

main_hall_section = StorySection(
    title="Main Hall",
    text="You push open the creaking door and step into the main hall. The air smells stale, and the floorboards creak under your weight.",
    choices={
        'A': {'text': "Hide Behind the Counter 🤫", 'next_section': 'hide_behind_counter'},
        'B': {'text': "Check the Source of the Noise 🔍", 'next_section': 'check_noise'},
        'C': {'text': "Block the Entrance 🔒", 'next_section': 'block_entrance'}
    }
)

hide_behind_counter_section = StorySection(
    title="Hide Behind the Counter",
    text="You crouch behind the counter, heart pounding. The scratching grows louder, and a decaying hand reaches over the counter. You hold your breath as a zombie shuffles by, missing you by inches.",
    choices={
        'A': {'text': "Stay Hidden 🕰️", 'next_section': 'stay_hidden'},
        'B': {'text': "Run for It 🏃", 'next_section': 'run_for_it'}
    }
)

stay_hidden_section = StorySection(
    title="Stay Hidden",
    text="You wait in silence as the zombie moves away. Hours pass, and you realize you’re safe, but the lack of food and water weakens you.",
    choices={
        'A': {'text': "Go Upstairs 🔼", 'next_section': 'upstairs_room'}
    }
)

run_for_it_section = StorySection(
    title="Run for It",
    text="You dash out from behind the counter, making noise. The zombie turns and chases you, but you manage to escape. However, the effort leaves you exhausted.",
    choices={
        'A': {'text': "Go to the Back Alley 🚪", 'next_section': 'back_alley_escape'}
    }
)

check_noise_section = StorySection(
    title="Check the Noise",
    text="You gather your courage and approach the noise. You discover a hidden room filled with supplies, but your presence alerts a zombie lurking nearby.",
    choices={
        'A': {'text': "Fight the Zombie 🪓", 'next_section': 'fight_zombie'},
        'B': {'text': "Flee 💨", 'next_section': 'flee_zombie'}
    }
)

fight_zombie_section = StorySection(
    title="Fight the Zombie",
    text="With a makeshift weapon, you engage in a brutal fight. The zombie lunges at you, but you manage to kill it, though you sustain injuries.",
    choices={
        'A': {'text': "Go Upstairs 🔼", 'next_section': 'upstairs_room'}
    }
)

flee_zombie_section = StorySection(
    title="Flee",
    text="You grab what you can and make a run for it. The zombie chases you, but you manage to escape.",
    choices={
        'A': {'text': "Go to the Back Alley 🚪", 'next_section': 'back_alley_escape'}
    }
)

block_entrance_section = StorySection(
    title="Block the Entrance",
    text="You barricade the door, making the Safehouse more secure. The scratching noise persists, now coming from the basement.",
    choices={
        'A': {'text': "Stay and Fortify 🛠️", 'next_section': 'fortify_safehouse'},
        'B': {'text': "Investigate the Basement 🪜", 'next_section': 'basement'}
    }
)

fortify_safehouse_section = StorySection(
    title="Fortify the Safehouse",
    text="You fortify the Safehouse, securing windows and doors. But as you work, more zombies gather outside, drawn by the noise.",
    choices={
        'A': {'text': "Go to the Basement 🪜", 'next_section': 'basement'}
    }
)

game_over_section = StorySection(
    title="Game Over",
    text="You have been overwhelmed by zombies. Game Over. Restart to try again.",
    game_over=True
)


# ======================================================================================================================================================================
# ======================================================================================================================================================================
#                                                                           SCENARIO 2
# ======================================================================================================================================================================
# ======================================================================================================================================================================
basement_section = StorySection(
    title="The Basement",
    text="The basement is pitch-black and smells of mold and decay. Your flashlight beam cuts through the darkness, revealing broken shelves and debris. The sound of shuffling feet echoes, sending chills down your spine.",
    choices={
        'A': {'text': "Search for Supplies 🔦", 'next_section': 'search_supplies_basement'},
        'B': {'text': "Find a Hiding Spot 🕳️", 'next_section': 'find_hiding_spot_basement'},
        'C': {'text': "Head Back Upstairs 🚪", 'next_section': 'head_back_upstairs'}
    }
)

search_supplies_basement_section = StorySection(
    title="Search for Supplies",
    text="You carefully search the basement, hoping to find something useful. As you rummage through the clutter, you disturb a group of zombies hidden in the shadows.",
    choices={
        'A': {'text': "Fight Your Way Out 🔫", 'next_section': 'fight_way_out_basement'},
        'B': {'text': "Escape Quickly 🏃", 'next_section': 'escape_quickly_basement'}
    }
)

fight_way_out_basement_section = StorySection(
    title="Fight Your Way Out",
    text="You fight fiercely, but the zombies overwhelm you. You fall to the ground, their teeth tearing into your flesh.",
    choices={
        'A': {'text': "Game Over - Restart 🔄", 'next_section': 'game_over'}
    }
)

escape_quickly_basement_section = StorySection(
    title="Escape Quickly",
    text="You abandon the search and run back upstairs, narrowly escaping the clutches of the undead.",
    choices={
        'A': {'text': "Go Upstairs 🔼", 'next_section': 'upstairs_room'}
    }
)

find_hiding_spot_basement_section = StorySection(
    title="Find a Hiding Spot",
    text="You find a small, dark corner and squeeze into it, staying as quiet as possible. The zombies move past you, unaware of your presence.",
    choices={
        'A': {'text': "Stay Hidden 🕰️", 'next_section': 'stay_hidden_basement'},
        'B': {'text': "Move Upstairs Quietly 🕵️", 'next_section': 'move_upstairs_quietly_basement'}
    }
)

stay_hidden_basement_section = StorySection(
    title="Stay Hidden",
    text="You remain hidden for what feels like hours. The zombies eventually leave, but you’re too weak to move.",
    choices={
        'A': {'text': "Go Upstairs 🔼", 'next_section': 'upstairs_room'}
    }
)

move_upstairs_quietly_basement_section = StorySection(
    title="Move Upstairs Quietly",
    text="You sneak back upstairs, carefully avoiding any noise.",
    choices={
        'A': {'text': "Go Upstairs 🔼", 'next_section': 'upstairs_room'}
    }
)

head_back_upstairs_section = StorySection(
    title="Head Back Upstairs",
    text="You decide the basement is too dangerous and head back upstairs. As you reach the top, you hear noises from another part of the house.",
    choices={
        'A': {'text': "Investigate the Noise 🔍", 'next_section': 'investigate_noise'},
        'B': {'text': "Find Another Exit 🚪", 'next_section': 'find_exit'}
    }
)

investigate_noise_section = StorySection(
    title="Investigate the Noise",
    text="You cautiously approach the noise and find a stash of supplies, but it attracts more zombies.",
    choices={
        'A': {'text': "Go Upstairs 🔼", 'next_section': 'upstairs_room'}
    }
)

find_exit_section = StorySection(
    title="Find Another Exit",
    text="You find a hidden door leading outside. You slip through it and escape into the night.",
    choices={
        'A': {'text': "Go to the Back Alley 🚪", 'next_section': 'back_alley_escape'}
    }
)


# ======================================================================================================================================================================
# ======================================================================================================================================================================
#                                                                           SCENARIO 3
# ======================================================================================================================================================================
# ======================================================================================================================================================================
upstairs_room_section = StorySection(
    title="The Upstairs Rooms",
    text="You make your way to the upper floors of the Safehouse. The air is thick with dust, and the floorboards creak under your weight. Each room is a potential sanctuary—or a deadly trap.",
    choices={
        'A': {'text': "Enter the Bedroom 🛏️", 'next_section': 'enter_bedroom'},
        'B': {'text': "Check the Bathroom 🛁", 'next_section': 'check_bathroom'},
        'C': {'text': "Explore the Attic 🪜", 'next_section': 'explore_attic'}
    }
)

enter_bedroom_section = StorySection(
    title="Enter the Bedroom",
    text="You enter a bedroom, the remnants of a once-comfortable life scattered around. As you search for anything useful, you notice movement behind the curtain.",
    choices={
        'A': {'text': "Check the Curtain 🚪", 'next_section': 'check_curtain'},
        'B': {'text': "Leave Quietly 🤫", 'next_section': 'leave_quietly'}
    }
)

check_curtain_section = StorySection(
    title="Check the Curtain",
    text="You pull back the curtain, and a zombie lunges at you. You fight it off, but not without sustaining injuries.",
    choices={
        'A': {'text': "Go to the Back Alley 🚪", 'next_section': 'back_alley_escape'}
    }
)

leave_quietly_section = StorySection(
    title="Leave Quietly",
    text="You back out of the room quietly, avoiding the potential danger.",
    choices={
        'A': {'text': "Go to the Back Alley 🚪", 'next_section': 'back_alley_escape'}
    }
)

check_bathroom_section = StorySection(
    title="Check the Bathroom",
    text="You push open the bathroom door. The mirror is shattered, and the floor is wet. You hear faint dripping sounds.",
    choices={
        'A': {'text': "Look for Medicine 🚑", 'next_section': 'look_medicine'},
        'B': {'text': "Move On Quickly 💨", 'next_section': 'move_on_quickly'}
    }
)

look_medicine_section = StorySection(
    title="Look for Medicine",
    text="You search the bathroom cabinets and find some medicine, but your actions alert nearby zombies.",
    choices={
        'A': {'text': "Go to the Back Alley 🚪", 'next_section': 'back_alley_escape'}
    }
)

move_on_quickly_section = StorySection(
    title="Move On Quickly",
    text="You leave the bathroom without looking too closely.",
    choices={
        'A': {'text': "Go to the Back Alley 🚪", 'next_section': 'back_alley_escape'}
    }
)

explore_attic_section = StorySection(
    title="Explore the Attic",
    text="The attic is filled with old, forgotten items. As you sift through the dust and cobwebs, you find some useful tools.",
    choices={
        'A': {'text': "Arm Yourself and Stay 💪", 'next_section': 'arm_yourself'},
        'B': {'text': "Leave the Attic Quickly 🏃", 'next_section': 'leave_attic'}
    }
)

arm_yourself_section = StorySection(
    title="Arm Yourself",
    text="You find a weapon and feel more secure, but the noise attracts zombies.",
    choices={
        'A': {'text': "Go to the Back Alley 🚪", 'next_section': 'back_alley_escape'}
    }
)

leave_attic_section = StorySection(
    title="Leave the Attic",
    text="You leave the attic quickly, avoiding the danger.",
    choices={
        'A': {'text': "Go to the Back Alley 🚪", 'next_section': 'back_alley_escape'}
    }
)


# ======================================================================================================================================================================
# ======================================================================================================================================================================
#                                                                           SCENARIO 4
# ======================================================================================================================================================================
# ======================================================================================================================================================================
back_alley_escape_section = StorySection(
    title="The Back Alley Escape",
    text="You find a back door and step into a narrow, grimy alley. The air is thick with the smell of decay, and every shadow seems to conceal a lurking threat. The moonlight barely penetrates the darkness, making it hard to see.",
    choices={
        'A': {'text': "Move Stealthily Through the Alley 🕵️", 'next_section': 'move_stealthily_alley'},
        'B': {'text': "Search for an Alternate Exit 🚪", 'next_section': 'search_exit_alley'},
        'C': {'text': "Hide and Wait 🕰️", 'next_section': 'hide_wait_alley'}
    }
)

move_stealthily_alley_section = StorySection(
    title="Move Stealthily Through the Alley",
    text="You decide to move quietly, stepping over debris and trying not to make a sound. The alley is filled with overturned trash cans and broken bottles, making every step a risk.",
    choices={
        'A': {'text': "Continue Stealthily 🕵️", 'next_section': 'continue_stealthily_alley'},
        'B': {'text': "Run for It 🏃", 'next_section': 'run_for_it_alley'}
    }
)

continue_stealthily_alley_section = StorySection(
    title="Continue Stealthily",
    text="You carefully navigate the alley, avoiding making noise. Suddenly, you see a zombie ahead, shambling aimlessly.",
    choices={
        'A': {'text': "Try to Sneak Past 👣", 'next_section': 'sneak_past_zombie'},
        'B': {'text': "Hide and Observe 👀", 'next_section': 'hide_observe_zombie'}
    }
)

sneak_past_zombie_section = StorySection(
    title="Sneak Past the Zombie",
    text="You hold your breath and slip past the zombie, your heart pounding. It doesn't notice you, and you continue down the alley.",
    choices={
        'A': {'text': "Go to the Roof Escape 🌆", 'next_section': 'roof_escape'}
    }
)

hide_observe_zombie_section = StorySection(
    title="Hide and Observe",
    text="You find a spot to hide and watch the zombie. It eventually moves on, leaving the path clear.",
    choices={
        'A': {'text': "Go to the Roof Escape 🌆", 'next_section': 'roof_escape'}
    }
)

run_for_it_alley_section = StorySection(
    title="Run for It",
    text="You decide to make a run for it, hoping to escape quickly. The noise draws the attention of nearby zombies, who start to chase you.",
    choices={
        'A': {'text': "Find a Hiding Spot 🕳️", 'next_section': 'find_hiding_spot_alley'},
        'B': {'text': "Fight Them Off 🔫", 'next_section': 'fight_zombies_alley'}
    }
)

find_hiding_spot_alley_section = StorySection(
    title="Find a Hiding Spot",
    text="You find a small nook and squeeze into it, holding your breath as the zombies pass by.",
    choices={
        'A': {'text': "Go to the Roof Escape 🌆", 'next_section': 'roof_escape'}
    }
)

fight_zombies_alley_section = StorySection(
    title="Fight Them Off",
    text="You turn to face the zombies, fighting bravely. But there are too many, and you fall, overwhelmed by their sheer numbers.",
    choices={
        'A': {'text': "Game Over - Restart 🔄", 'next_section': 'game_over'}
    }
)

search_exit_alley_section = StorySection(
    title="Search for an Alternate Exit",
    text="You decide to look for another way out of the alley, hoping to find a safer path.",
    choices={
        'A': {'text': "Climb a Fire Escape 🪜", 'next_section': 'climb_fire_escape'},
        'B': {'text': "Break Into a Nearby Building 🏢", 'next_section': 'break_into_building'}
    }
)

climb_fire_escape_section = StorySection(
    title="Climb the Fire Escape",
    text="You spot a rusty fire escape and start climbing. The metal creaks under your weight, but you make it to the roof. From here, you have a better view of the city and can plan your next move.",
    choices={
        'A': {'text': "Stay on the Roof 🌆", 'next_section': 'stay_on_roof'},
        'B': {'text': "Find Another Way Down ⬇️", 'next_section': 'find_way_down'}
    }
)

stay_on_roof_section = StorySection(
    title="Stay on the Roof",
    text="You decide to stay on the roof for now, feeling safer away from the zombies below.",
    choices={
        'A': {'text': "Go to the Roof Escape 🌆", 'next_section': 'roof_escape'}
    }
)

find_way_down_section = StorySection(
    title="Find Another Way Down",
    text="You look for another way down from the roof, eventually finding a safer path.",
    choices={
        'A': {'text': "Go to the Roof Escape 🌆", 'next_section': 'roof_escape'}
    }
)

break_into_building_section = StorySection(
    title="Break Into the Building",
    text="You find a window and break into a nearby building. Inside, it's dark and eerily quiet.",
    choices={
        'A': {'text': "Search the Building 🔦", 'next_section': 'search_building'},
        'B': {'text': "Find a Safe Room 🛏️", 'next_section': 'find_safe_room'}
    }
)

search_building_section = StorySection(
    title="Search the Building",
    text="You cautiously search the building, hoping to find supplies or a safer place. As you move through the rooms, you hear the distant groans of zombies.",
    choices={
        'A': {'text': "Find Useful Items 🧰", 'next_section': 'find_items_building'},
        'B': {'text': "Alert Zombies 🚨", 'next_section': 'alert_zombies_building'}
    }
)

find_items_building_section = StorySection(
    title="Find Useful Items",
    text="You find some useful items that might help you survive.",
    choices={
        'A': {'text': "Go to the Roof Escape 🌆", 'next_section': 'roof_escape'}
    }
)

alert_zombies_building_section = StorySection(
    title="Alert the Zombies",
    text="Your search makes noise, attracting zombies. You need to find a way to escape quickly.",
    choices={
        'A': {'text': "Go to the Roof Escape 🌆", 'next_section': 'roof_escape'}
    }
)

find_safe_room_section = StorySection(
    title="Find a Safe Room",
    text="You find a small room and barricade yourself inside, hoping the zombies won't find you.",
    choices={
        'A': {'text': "Go to the Roof Escape 🌆", 'next_section': 'roof_escape'}
    }
)

hide_wait_alley_section = StorySection(
    title="Hide and Wait",
    text="You decide to hide and wait for the zombies to move on. The alley is dark, and you find a shadowy corner to crouch in.",
    choices={
        'A': {'text': "Stay Hidden 🕰️", 'next_section': 'stay_hidden_alley'},
        'B': {'text': "Move After Waiting 🕵️", 'next_section': 'move_after_waiting_alley'}
    }
)

stay_hidden_alley_section = StorySection(
    title="Stay Hidden",
    text="You remain hidden for what feels like hours. Eventually, the zombies move on, but you're weak from hunger and fear.",
    choices={
        'A': {'text': "Go to the Roof Escape 🌆", 'next_section': 'roof_escape'}
    }
)

move_after_waiting_alley_section = StorySection(
    title="Move After Waiting",
    text="You carefully move out of your hiding spot, finding the alley empty. The path ahead is clear, and you continue your journey.",
    choices={
        'A': {'text': "Go to the Roof Escape 🌆", 'next_section': 'roof_escape'}
    }
)


# ======================================================================================================================================================================
# ======================================================================================================================================================================
#                                                                           SCENARIO 5
# ======================================================================================================================================================================
# ======================================================================================================================================================================
roof_escape_section = StorySection(
    title="The Roof Escape",
    text="From the roof, you have a better view of the city. The moonlight reveals a landscape of ruin and decay. You can see other rooftops, some connected by makeshift bridges. Zombies roam the streets below, unaware of your presence.",
    choices={
        'A': {'text': "Stay on the Roof and Observe 🌃", 'next_section': 'stay_observe_roof'},
        'B': {'text': "Look for a Way Down ⬇️", 'next_section': 'look_way_down_roof'},
        'C': {'text': "Move Across the Rooftops 🏃", 'next_section': 'move_across_rooftops'}
    }
)

stay_observe_roof_section = StorySection(
    title="Stay on the Roof and Observe",
    text="You decide to stay on the roof, observing the movements of the zombies below. From here, you can see potential escape routes and dangers.",
    choices={
        'A': {'text': "Plan Your Next Move 🗺️", 'next_section': 'plan_next_move'},
        'B': {'text': "Set Up a Safe Spot 🛏️", 'next_section': 'set_safe_spot'}
    }
)

plan_next_move_section = StorySection(
    title="Plan Your Next Move",
    text="You study the streets and nearby buildings, planning the safest route.",
    choices={
        'A': {'text': "Go to the Abandoned Warehouse 🏢", 'next_section': 'abandoned_warehouse'}
    }
)

set_safe_spot_section = StorySection(
    title="Set Up a Safe Spot",
    text="You create a makeshift shelter on the roof, giving you a place to rest and gather your thoughts.",
    choices={
        'A': {'text': "Go to the Abandoned Warehouse 🏢", 'next_section': 'abandoned_warehouse'}
    }
)

look_way_down_roof_section = StorySection(
    title="Look for a Way Down",
    text="You decide to find a way down from the roof, hoping to escape the city.",
    choices={
        'A': {'text': "Climb Down the Fire Escape 🪜", 'next_section': 'climb_down_fire_escape'},
        'B': {'text': "Jump to a Nearby Balcony 🏢", 'next_section': 'jump_nearby_balcony'}
    }
)

climb_down_fire_escape_section = StorySection(
    title="Climb Down the Fire Escape",
    text="You carefully climb down the fire escape, but halfway down, it breaks, and you fall to the ground, injuring yourself.",
    choices={
        'A': {'text': "Go to the Abandoned Warehouse 🏢", 'next_section': 'abandoned_warehouse'}
    }
)

jump_nearby_balcony_section = StorySection(
    title="Jump to a Nearby Balcony",
    text="You take a daring leap to a nearby balcony, barely making it. You pull yourself up, heart racing.",
    choices={
        'A': {'text': "Go to the Abandoned Warehouse 🏢", 'next_section': 'abandoned_warehouse'}
    }
)

move_across_rooftops_section = StorySection(
    title="Move Across the Rooftops",
    text="You decide to move across the rooftops, using makeshift bridges and ladders. The journey is treacherous, but you manage to stay above the zombie-infested streets.",
    choices={
        'A': {'text': "Find a Safe Haven 🛡️", 'next_section': 'find_safe_haven'},
        'B': {'text': "Encounter Another Survivor 🧑‍🤝‍🧑", 'next_section': 'encounter_survivor'}
    }
)

find_safe_haven_section = StorySection(
    title="Find a Safe Haven",
    text="You find a rooftop with high walls and a garden, a rare safe haven in the city.",
    choices={
        'A': {'text': "Go to the Abandoned Warehouse 🏢", 'next_section': 'abandoned_warehouse'}
    }
)

encounter_survivor_section = StorySection(
    title="Encounter Another Survivor",
    text="You come across another survivor who is cautious but friendly. You decide to team up and face the dangers together.",
    choices={
        'A': {'text': "Go to the Abandoned Warehouse 🏢", 'next_section': 'abandoned_warehouse'}
    }
)


# ======================================================================================================================================================================
# ======================================================================================================================================================================
#                                                                           SCENARIO 6
# ======================================================================================================================================================================
# ======================================================================================================================================================================
abandoned_warehouse_section = StorySection(
    title="The Abandoned Warehouse",
    text="You and your new ally decide to explore an abandoned warehouse nearby. The place is huge, with many hiding spots and potential dangers. The air is thick with dust, and the silence is unnerving.",
    choices={
        'A': {'text': "Search the Main Floor 🔦", 'next_section': 'search_main_floor'},
        'B': {'text': "Check the Offices 🏢", 'next_section': 'check_offices'},
        'C': {'text': "Explore the Basement 🪜", 'next_section': 'explore_basement'}
    }
)

search_main_floor_section = StorySection(
    title="Search the Main Floor",
    text="The main floor is filled with old machinery and stacks of crates. Every step echoes, and the darkness hides potential threats.",
    choices={
        'A': {'text': "Search for Supplies 🛠️", 'next_section': 'search_supplies_main_floor'},
        'B': {'text': "Secure the Area 🔒", 'next_section': 'secure_area'}
    }
)

search_supplies_main_floor_section = StorySection(
    title="Search for Supplies",
    text="You and your ally start searching through the crates, hoping to find something useful. Suddenly, you hear a loud crash.",
    choices={
        'A': {'text': "Investigate the Noise 🔍", 'next_section': 'investigate_noise_warehouse'},
        'B': {'text': "Hide and Wait 🕰️", 'next_section': 'hide_wait_warehouse'}
    }
)

investigate_noise_warehouse_section = StorySection(
    title="Investigate the Noise",
    text="You approach the source of the noise and find a group of zombies. They spot you and attack.",
    choices={
        'A': {'text': "Game Over - Restart 🔄", 'next_section': 'game_over'}
    }
)

hide_wait_warehouse_section = StorySection(
    title="Hide and Wait",
    text="You and your ally hide behind a stack of crates, holding your breath. The zombies move past you, unaware of your presence.",
    choices={
        'A': {'text': "Go to the Street Ambush 🏙️", 'next_section': 'street_ambush'}
    }
)

secure_area_section = StorySection(
    title="Secure the Area",
    text="You decide to secure the main floor, setting up barricades and traps. As you work, you hear noises from the offices above.",
    choices={
        'A': {'text': "Investigate the Offices 🔍", 'next_section': 'investigate_offices'},
        'B': {'text': "Stay and Fortify 🛠️", 'next_section': 'stay_fortify'}
    }
)

investigate_offices_section = StorySection(
    title="Investigate the Offices",
    text="You head upstairs to investigate the noise, finding more supplies but also alerting zombies.",
    choices={
        'A': {'text': "Go to the Street Ambush 🏙️", 'next_section': 'street_ambush'}
    }
)

stay_fortify_section = StorySection(
    title="Stay and Fortify",
    text="You continue fortifying the main floor, but the zombies are relentless. They break through the barricades.",
    choices={
        'A': {'text': "Game Over - Restart 🔄", 'next_section': 'game_over'}
    }
)

check_offices_section = StorySection(
    title="Check the Offices",
    text="The offices are dark and claustrophobic. You move cautiously, knowing that danger could be lurking in any corner.",
    choices={
        'A': {'text': "Search for Information 🗃️", 'next_section': 'search_information'},
        'B': {'text': "Find a Safe Room 🛏️", 'next_section': 'find_safe_room_offices'}
    }
)

search_information_section = StorySection(
    title="Search for Information",
    text="You search the desks and cabinets, hoping to find clues or useful items. You come across a locked drawer.",
    choices={
        'A': {'text': "Try to Open the Drawer 🔓", 'next_section': 'open_drawer'},
        'B': {'text': "Leave It and Move On 🚶", 'next_section': 'leave_office'}
    }
)

open_drawer_section = StorySection(
    title="Open the Drawer",
    text="You manage to open the drawer and find a map of the city. This could be useful!",
    choices={
        'A': {'text': "Go to the Street Ambush 🏙️", 'next_section': 'street_ambush'}
    }
)

leave_office_section = StorySection(
    title="Leave the Office",
    text="You decide not to risk the noise and leave the drawer.",
    choices={
        'A': {'text': "Go to the Street Ambush 🏙️", 'next_section': 'street_ambush'}
    }
)

find_safe_room_offices_section = StorySection(
    title="Find a Safe Room",
    text="You find a small room that can be easily secured. It’s a good place to rest for a while.",
    choices={
        'A': {'text': "Go to the Street Ambush 🏙️", 'next_section': 'street_ambush'}
    }
)

explore_basement_section = StorySection(
    title="Explore the Basement",
    text="The basement is even darker and more oppressive than the main floor. The air is damp and foul, and you can hear distant moans.",
    choices={
        'A': {'text': "Search for Supplies 🔦", 'next_section': 'search_supplies_basement_warehouse'},
        'B': {'text': "Find a Hiding Spot 🕳️", 'next_section': 'find_hiding_spot_basement_warehouse'}
    }
)

search_supplies_basement_warehouse_section = StorySection(
    title="Search for Supplies in the Basement",
    text="You start searching through the basement, but the darkness makes it difficult to see. Suddenly, you stumble upon a nest of zombies.",
    choices={
        'A': {'text': "Fight Them Off 🪓", 'next_section': 'fight_zombies_basement'},
        'B': {'text': "Run Back Upstairs 🏃", 'next_section': 'run_upstairs_basement'}
    }
)

fight_zombies_basement_section = StorySection(
    title="Fight Them Off",
    text="You and your ally fight bravely, but the zombies are too many.",
    choices={
        'A': {'text': "Game Over - Restart 🔄", 'next_section': 'game_over'}
    }
)

run_upstairs_basement_section = StorySection(
    title="Run Back Upstairs",
    text="You run back upstairs, escaping the zombies.",
    choices={
        'A': {'text': "Go to the Street Ambush 🏙️", 'next_section': 'street_ambush'}
    }
)

find_hiding_spot_basement_warehouse_section = StorySection(
    title="Find a Hiding Spot",
    text="You find a small alcove to hide in. The zombies move past you, unaware of your presence.",
    choices={
        'A': {'text': "Go to the Street Ambush 🏙️", 'next_section': 'street_ambush'}
    }
)


# ======================================================================================================================================================================
# ======================================================================================================================================================================
#                                                                           SCENARIO 7
# ======================================================================================================================================================================
# ======================================================================================================================================================================
street_ambush_section = StorySection(
    title="The Street Ambush",
    text="After leaving the warehouse, you and your ally make your way through the deserted streets. The city is eerily quiet, but the sense of danger is ever-present.",
    choices={
        'A': {'text': "Move Stealthily Through the Streets 🕵️", 'next_section': 'move_stealthily_streets'},
        'B': {'text': "Look for a Vehicle 🚗", 'next_section': 'look_for_vehicle'},
        'C': {'text': "Search for a Safe Building 🏢", 'next_section': 'search_safe_building'}
    }
)

move_stealthily_streets_section = StorySection(
    title="Move Stealthily Through the Streets",
    text="You decide to move quietly, sticking to the shadows and avoiding open areas.",
    choices={
        'A': {'text': "Continue Stealthily 🕵️", 'next_section': 'continue_stealthily_streets'},
        'B': {'text': "Run for It 🏃", 'next_section': 'run_for_it_streets'}
    }
)

continue_stealthily_streets_section = StorySection(
    title="Continue Stealthily",
    text="You move quietly, but suddenly, a zombie ambushes you from a dark alley.",
    choices={
        'A': {'text': "Fight It Off 🪓", 'next_section': 'fight_off_zombie'},
        'B': {'text': "Run and Hide 🏃", 'next_section': 'run_and_hide'}
    }
)

fight_off_zombie_section = StorySection(
    title="Fight It Off",
    text="You fight the zombie and manage to kill it, but you're injured in the process.",
    choices={
        'A': {'text': "Go to the Final Stand 🏙️", 'next_section': 'final_stand'}
    }
)

run_and_hide_section = StorySection(
    title="Run and Hide",
    text="You manage to escape and find a hiding spot, but the encounter leaves you shaken.",
    choices={
        'A': {'text': "Go to the Final Stand 🏙️", 'next_section': 'final_stand'}
    }
)

run_for_it_streets_section = StorySection(
    title="Run for It",
    text="You decide to run through the streets, hoping to outrun any danger. The noise attracts zombies, who start chasing you.",
    choices={
        'A': {'text': "Find a Hiding Spot 🕳️", 'next_section': 'find_hiding_spot_streets'},
        'B': {'text': "Fight Them Off 🔫", 'next_section': 'fight_zombies_streets'}
    }
)

find_hiding_spot_streets_section = StorySection(
    title="Find a Hiding Spot",
    text="You find a small nook to hide in, holding your breath as the zombies pass by.",
    choices={
        'A': {'text': "Go to the Final Stand 🏙️", 'next_section': 'final_stand'}
    }
)

fight_zombies_streets_section = StorySection(
    title="Fight Them Off",
    text="You turn to face the zombies, fighting bravely. But there are too many, and you fall, overwhelmed by their sheer numbers.",
    choices={
        'A': {'text': "Game Over - Restart 🔄", 'next_section': 'game_over'}
    }
)

look_for_vehicle_section = StorySection(
    title="Look for a Vehicle",
    text="You decide to find a vehicle, hoping to make a quick escape from the city. You come across an abandoned car, keys still in the ignition.",
    choices={
        'A': {'text': "Start the Car and Drive 🚗", 'next_section': 'start_car_drive'},
        'B': {'text': "Check the Car for Traps 🚧", 'next_section': 'check_car_traps'}
    }
)

start_car_drive_section = StorySection(
    title="Start the Car and Drive",
    text="You start the car, and it roars to life. You drive through the streets, but the noise attracts more zombies.",
    choices={
        'A': {'text': "Speed Through the Streets 🚗💨", 'next_section': 'speed_through_streets'},
        'B': {'text': "Find a Safe Place to Park 🅿️", 'next_section': 'find_safe_park'}
    }
)

speed_through_streets_section = StorySection(
    title="Speed Through the Streets",
    text="You speed through the streets, narrowly avoiding zombies. You make it to the city outskirts, but the car breaks down.",
    choices={
        'A': {'text': "Go to the Final Stand 🏙️", 'next_section': 'final_stand'}
    }
)

find_safe_park_section = StorySection(
    title="Find a Safe Place to Park",
    text="You find a quiet spot to park and hide, waiting for the zombies to move on.",
    choices={
        'A': {'text': "Go to the Final Stand 🏙️", 'next_section': 'final_stand'}
    }
)

check_car_traps_section = StorySection(
    title="Check the Car for Traps",
    text="You carefully check the car for any signs of danger. Suddenly, you hear a noise from inside the car.",
    choices={
        'A': {'text': "Investigate the Noise 🔍", 'next_section': 'investigate_noise_car'},
        'B': {'text': "Abandon the Car 🚶", 'next_section': 'abandon_car'}
    }
)

investigate_noise_car_section = StorySection(
    title="Investigate the Noise",
    text="You open the car door, and a zombie lunges at you. You fight it off, but you're injured.",
    choices={
        'A': {'text': "Go to the Final Stand 🏙️", 'next_section': 'final_stand'}
    }
)

abandon_car_section = StorySection(
    title="Abandon the Car",
    text="You decide it's too risky and leave the car, continuing on foot.",
    choices={
        'A': {'text': "Go to the Final Stand 🏙️", 'next_section': 'final_stand'}
    }
)

search_safe_building_section = StorySection(
    title="Search for a Safe Building",
    text="You decide to find a safe building to take refuge in. You come across an old, abandoned school.",
    choices={
        'A': {'text': "Search the School for Supplies 🔦", 'next_section': 'search_school_supplies'},
        'B': {'text': "Secure a Safe Room 🛏️", 'next_section': 'secure_safe_room'}
    }
)

search_school_supplies_section = StorySection(
    title="Search the School for Supplies",
    text="You carefully search the school, hoping to find supplies. You come across a classroom with barricaded windows.",
    choices={
        'A': {'text': "Break Into the Classroom 🚪", 'next_section': 'break_into_classroom'},
        'B': {'text': "Search Another Area 🏫", 'next_section': 'search_another_area'}
    }
)

break_into_classroom_section = StorySection(
    title="Break Into the Classroom",
    text="You break into the classroom and find useful supplies, but the noise attracts zombies.",
    choices={
        'A': {'text': "Go to the Final Stand 🏙️", 'next_section': 'final_stand'}
    }
)

search_another_area_section = StorySection(
    title="Search Another Area",
    text="You decide to avoid the noise and search another area, finding some supplies.",
    choices={
        'A': {'text': "Go to the Final Stand 🏙️", 'next_section': 'final_stand'}
    }
)

secure_safe_room_section = StorySection(
    title="Secure a Safe Room",
    text="You find a small room that can be easily secured. It’s a good place to rest for a while.",
    choices={
        'A': {'text': "Go to the Final Stand 🏙️", 'next_section': 'final_stand'}
    }
)


# ======================================================================================================================================================================
# ======================================================================================================================================================================
#                                                                           SCENARIO 8
# ======================================================================================================================================================================
# ======================================================================================================================================================================
final_stand_section = StorySection(
    title="The Final Stand",
    text="As dawn approaches, you realize you can't stay hidden forever. You and your ally decide to make a final stand, hoping to clear a path to safety.",
    choices={
        'A': {'text': "Fight the Zombies Head-On 🪓", 'next_section': 'fight_zombies_head_on'},
        'B': {'text': "Set Up a Defensive Perimeter 🛡️", 'next_section': 'defensive_perimeter'},
        'C': {'text': "Look for an Escape Route 🚪", 'next_section': 'escape_route'}
    }
)

fight_zombies_head_on_section = StorySection(
    title="Fight the Zombies Head-On",
    text="You and your ally decide to face the zombies directly, fighting with everything you have.",
    choices={
        'A': {'text': "Use Melee Weapons 🪓", 'next_section': 'use_melee_weapons'},
        'B': {'text': "Use Firearms 🔫", 'next_section': 'use_firearms'}
    }
)

use_melee_weapons_section = StorySection(
    title="Use Melee Weapons",
    text="You engage the zombies with melee weapons, fighting fiercely. The battle is intense, but you manage to hold your ground.",
    choices={
        'A': {'text': "Move to the Resolution 🏁", 'next_section': 'resolution'}
    }
)

use_firearms_section = StorySection(
    title="Use Firearms",
    text="You use firearms to take down the zombies, but the noise attracts even more. The fight is relentless, and you fall.",
    choices={
        'A': {'text': "Game Over - Restart 🔄", 'next_section': 'game_over'}
    }
)

defensive_perimeter_section = StorySection(
    title="Set Up a Defensive Perimeter",
    text="You set up a defensive perimeter, using barricades and traps to hold off the zombies.",
    choices={
        'A': {'text': "Hold Your Ground 🛡️", 'next_section': 'hold_your_ground'},
        'B': {'text': "Fall Back to a Safe Room 🛏️", 'next_section': 'fall_back_safe_room'}
    }
)

hold_your_ground_section = StorySection(
    title="Hold Your Ground",
    text="You and your ally hold your ground, fighting off the zombies with the defensive perimeter's help.",
    choices={
        'A': {'text': "Move to the Resolution 🏁", 'next_section': 'resolution'}
    }
)

fall_back_safe_room_section = StorySection(
    title="Fall Back to a Safe Room",
    text="You decide to fall back to a safe room, using the perimeter to slow the zombies down.",
    choices={
        'A': {'text': "Move to the Resolution 🏁", 'next_section': 'resolution'}
    }
)

escape_route_section = StorySection(
    title="Look for an Escape Route",
    text="You decide to find an escape route, hoping to avoid the fight altogether.",
    choices={
        'A': {'text': "Search for a Hidden Exit 🔍", 'next_section': 'search_hidden_exit'},
        'B': {'text': "Create a Distraction 🧨", 'next_section': 'create_distraction'}
    }
)

search_hidden_exit_section = StorySection(
    title="Search for a Hidden Exit",
    text="You search the building for a hidden exit and find a tunnel leading out.",
    choices={
        'A': {'text': "Move to the Resolution 🏁", 'next_section': 'resolution'}
    }
)

create_distraction_section = StorySection(
    title="Create a Distraction",
    text="You create a distraction to draw the zombies away, giving you a chance to escape.",
    choices={
        'A': {'text': "Move to the Resolution 🏁", 'next_section': 'resolution'}
    }
)


# ======================================================================================================================================================================
# ======================================================================================================================================================================
#                                                                           SCENARIO 9
# ======================================================================================================================================================================
# ======================================================================================================================================================================
resolution_section = StorySection(
    title="The Resolution",
    text="After enduring countless trials and facing numerous dangers, you and your ally finally find a moment of respite. The horizon hints at a new beginning as you emerge from the chaos of the city.",
    choices={
        'A': {'text': "Reflect on Your Journey 🧘", 'next_section': 'reflect_journey'},
        'B': {'text': "Plan for the Future 🗺️", 'next_section': 'plan_future'},
        'C': {'text': "Say Goodbye to Your Ally 👋", 'next_section': 'say_goodbye'}
    }
)

reflect_journey_section = StorySection(
    title="Reflect on Your Journey",
    text="You take a moment to reflect on everything you've been through. The hardships, the losses, and the victories all culminate in this moment of quiet contemplation.",
    choices={
        'A': {'text': "The End 🌅", 'next_section': 'the_end'}
    }
)

plan_future_section = StorySection(
    title="Plan for the Future",
    text="With the immediate dangers behind you, you and your ally begin to plan for the future. It's time to rebuild and create a new life in this post-apocalyptic world.",
    choices={
        'A': {'text': "The End 🌅", 'next_section': 'the_end'}
    }
)

say_goodbye_section = StorySection(
    title="Say Goodbye to Your Ally",
    text="Your journey together comes to an end as you part ways with your ally. With a final wave, you each head off in different directions, hoping for a brighter future.",
    choices={
        'A': {'text': "The End 🌅", 'next_section': 'the_end'}
    }
)

the_end_section = StorySection(
    title="The End",
    text="Congratulations! You've completed the adventure. Thank you for playing.",
    game_over=True
)


# ======================================================================================================================================================================
# ======================================================================================================================================================================
#                                                                           DICTIONARY
# ======================================================================================================================================================================
# ======================================================================================================================================================================
story = {
    # ======================== SCENARIO 1 ========================
    'intro': intro_section,
    'main_hall': main_hall_section,
    'hide_behind_counter': hide_behind_counter_section,
    'stay_hidden': stay_hidden_section,
    'run_for_it': run_for_it_section,
    'check_noise': check_noise_section,
    'fight_zombie': fight_zombie_section,
    'flee_zombie': flee_zombie_section,
    'block_entrance': block_entrance_section,
    'fortify_safehouse': fortify_safehouse_section,
    'game_over': game_over_section,
# ======================== SCENARIO 2 ========================
    'basement': basement_section,
    'search_supplies_basement': search_supplies_basement_section,
    'fight_way_out_basement': fight_way_out_basement_section,
    'escape_quickly_basement': escape_quickly_basement_section,
    'find_hiding_spot_basement': find_hiding_spot_basement_section,
    'stay_hidden_basement': stay_hidden_basement_section,
    'move_upstairs_quietly_basement': move_upstairs_quietly_basement_section,
    'head_back_upstairs': head_back_upstairs_section,
    'investigate_noise': investigate_noise_section,
    'find_exit': find_exit_section,
# ======================== SCENARIO 3 ========================
    'upstairs_room': upstairs_room_section,
    'enter_bedroom': enter_bedroom_section,
    'check_curtain': check_curtain_section,
    'leave_quietly': leave_quietly_section,
    'check_bathroom': check_bathroom_section,
    'look_medicine': look_medicine_section,
    'move_on_quickly': move_on_quickly_section,
    'explore_attic': explore_attic_section,
    'arm_yourself': arm_yourself_section,
    'leave_attic': leave_attic_section,
# ======================== SCENARIO 4 ========================
    'back_alley_escape': back_alley_escape_section,
    'move_stealthily_alley': move_stealthily_alley_section,
    'continue_stealthily_alley': continue_stealthily_alley_section,
    'sneak_past_zombie': sneak_past_zombie_section,
    'hide_observe_zombie': hide_observe_zombie_section,
    'run_for_it_alley': run_for_it_alley_section,
    'find_hiding_spot_alley': find_hiding_spot_alley_section,
    'fight_zombies_alley': fight_zombies_alley_section,
    'search_exit_alley': search_exit_alley_section,
    'climb_fire_escape': climb_fire_escape_section,
    'stay_on_roof': stay_on_roof_section,
    'find_way_down': find_way_down_section,
    'break_into_building': break_into_building_section,
    'search_building': search_building_section,
    'find_items_building': find_items_building_section,
    'alert_zombies_building': alert_zombies_building_section,
    'find_safe_room': find_safe_room_section,
    'hide_wait_alley': hide_wait_alley_section,
    'stay_hidden_alley': stay_hidden_alley_section,
    'move_after_waiting_alley': move_after_waiting_alley_section,
# ======================== SCENARIO 5 ========================
    'roof_escape': roof_escape_section,
    'stay_observe_roof': stay_observe_roof_section,
    'plan_next_move': plan_next_move_section,
    'set_safe_spot': set_safe_spot_section,
    'look_way_down_roof': look_way_down_roof_section,
    'climb_down_fire_escape': climb_down_fire_escape_section,
    'jump_nearby_balcony': jump_nearby_balcony_section,
    'move_across_rooftops': move_across_rooftops_section,
    'find_safe_haven': find_safe_haven_section,
    'encounter_survivor': encounter_survivor_section,
# ======================== SCENARIO 6 ========================
    'abandoned_warehouse': abandoned_warehouse_section,
    'search_main_floor': search_main_floor_section,
    'search_supplies_main_floor': search_supplies_main_floor_section,
    'investigate_noise_warehouse': investigate_noise_warehouse_section,
    'hide_wait_warehouse': hide_wait_warehouse_section,
    'secure_area': secure_area_section,
    'investigate_offices': investigate_offices_section,
    'stay_fortify': stay_fortify_section,
    'check_offices': check_offices_section,
    'search_information': search_information_section,
    'open_drawer': open_drawer_section,
    'leave_office': leave_office_section,
    'find_safe_room_offices': find_safe_room_offices_section,
    'explore_basement': explore_basement_section,
    'search_supplies_basement_warehouse': search_supplies_basement_warehouse_section,
    'fight_zombies_basement': fight_zombies_basement_section,
    'run_upstairs_basement': run_upstairs_basement_section,
    'find_hiding_spot_basement_warehouse': find_hiding_spot_basement_warehouse_section,
# ======================== SCENARIO 7 ========================
    'street_ambush': street_ambush_section,
    'move_stealthily_streets': move_stealthily_streets_section,
    'continue_stealthily_streets': continue_stealthily_streets_section,
    'fight_off_zombie': fight_off_zombie_section,
    'run_and_hide': run_and_hide_section,
    'run_for_it_streets': run_for_it_streets_section,
    'find_hiding_spot_streets': find_hiding_spot_streets_section,
    'fight_zombies_streets': fight_zombies_streets_section,
    'look_for_vehicle': look_for_vehicle_section,
    'start_car_drive': start_car_drive_section,
    'speed_through_streets': speed_through_streets_section,
    'find_safe_park': find_safe_park_section,
    'check_car_traps': check_car_traps_section,
    'investigate_noise_car': investigate_noise_car_section,
    'abandon_car': abandon_car_section,
    'search_safe_building': search_safe_building_section,
    'search_school_supplies': search_school_supplies_section,
    'break_into_classroom': break_into_classroom_section,
    'search_another_area': search_another_area_section,
    'secure_safe_room': secure_safe_room_section,
# ======================== SCENARIO 8 ========================
    'final_stand': final_stand_section,
    'fight_zombies_head_on': fight_zombies_head_on_section,
    'use_melee_weapons': use_melee_weapons_section,
    'use_firearms': use_firearms_section,
    'defensive_perimeter': defensive_perimeter_section,
    'hold_your_ground': hold_your_ground_section,
    'fall_back_safe_room': fall_back_safe_room_section,
    'escape_route': escape_route_section,
    'search_hidden_exit': search_hidden_exit_section,
    'create_distraction': create_distraction_section,
# ======================== SCENARIO 9 ========================
    'resolution': resolution_section,
    'reflect_journey': reflect_journey_section,
    'plan_future': plan_future_section,
    'say_goodbye': say_goodbye_section,
    'the_end': the_end_section
}

