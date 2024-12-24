import time
import random
from playsound import playsound


# Variables Defined
sound_effects = True
score_to_win = 100


# Main Menu
def main_menu():
    # Should be using local variable names this is temporary
    global score_to_win

    while True:
        print("\nWelcome .. . . . .. . ")
        print("------ Game Modes ------")
        print("1: Single Player (Not Available)")
        print("2: Two Players")
        print("3: Three Players")
        print("4: Four Players")
        print("5: Five or More Players (Max = 10)")
        print("------ Gameplay Settings ------")
        print("A: Auto Roll (off) (Not Available)")
        print("D: Extra Die (off) (Not Available)")
        print(f"W: Score to Win ({score_to_win}) (Not Available)")
        print("------ Sound Settings ------")
        print("S: Sound Effect Toggle ({})".format("on" if sound_effects else "off"))
        print("T: TTS Audio Toggle (off) (Not Available)")

        option = input("Type an option: ").lower()

        # Game Modes #
        # Single Player Mode
        if option == "1":
            pass

        # Two Players Mode
        elif option == "2":
            total_players = 2
            player_name(total_players)

        # Three Players Mode
        elif option == "3":
            total_players = 3
            player_name(total_players)

        # Four Players Mode
        elif option == "4":
            total_players = 4
            player_name(total_players)

        # Five or More Players Mode
        elif option == "5":
            while True:
                try:
                    total_players = input("\nInput how many players: ")
                    total_players = int(total_players)
                    if total_players in range(2, 11):
                        player_name(total_players)
                        break
                    else:
                        print("Please type your desired number of players (2 - 10)")
                        continue

                except ValueError:
                    print("This is an invalid number!")

        # Gameplay Settings #
        # Auto Roll Toggle
        elif option == "a":
            pass

        # Extra Die Toggle
        elif option == "d":
            pass

        # Score to Win
        elif option == "w":
            while True:
                score_to_win = int(input("\nPlease enter your desired score to win: "))

                if score_to_win:
                    print(f"Score to win set to {score_to_win}.")
                    time.sleep(1)
                    break
                else:
                    score_to_win = 100
                    print("Please enter a valid number!")

        # Sound Settings #
        # Sound Effects Toggle
        elif option == "s":
            toggle_sound_effects()
            time.sleep(1)
        else:
            print("\nPlease type a valid option!")
            time.sleep(2)


# Sound
def toggle_sound_effects():
    global sound_effects

    sound_effects = not sound_effects
    if sound_effects:
        print("Sound effects on.")
    else:
        print("Sound effects off.")


def play_sound_effect(file_path, block=True):
    if sound_effects:
        playsound(file_path, block=block)
    else:
        pass


# Player Name
def player_name(total_players):
    names = {}

    for x in range(total_players):
        while True:
            name = input(f"\nPlease input the name for Player {x+1}: ").title()

            # Name Validation Checking
            if name.isalpha():
                names[f"player{x + 1}"] = {"name": name, "score": 0}
            else:
                print("This is an invalid name. Try again!")
                continue

            # Name Confirmation Check (yes/no) with Validation
            name_confirmation = input(f"You have selected {name} as your name. Is this correct? (yes/no): ").lower()
            if name_confirmation in ["yes", "y"]:
                print(f"{name} is now a player!")
                play_sound_effect("sounds/effects/player_register.mp3", block=False)
                break
            elif name_confirmation in ["no", "n"]:
                pass
            # BUG - Goes back to the top of the loop instead of Is this correct?
            else:
                print("Please enter 'yes' or 'no'")
                continue

        if total_players == len(names):
            print("\nGame will now start!")
            start_game(names, total_players)


def roll_die():
    min_value = 1
    max_value = 6
    roll = random.randint(min_value, max_value)

    play_sound_effect("sounds/effects/dice_roll.mp3")
    pass
    return roll


def start_game(names, total_players):
    game_session = True

    name_list = [name_info["name"] for name_info in names.values()]
    greeting = ", ".join(name_list)
    print(f"Hello {greeting} have fun with this game! All the best!")

    # TODO Determine Who Starts First -
    # for x in range(total_players):
    #     while True:
    #         print("\nHighest roll starts the game first!")
    #         game_position = input(f"Roll the Die {name_list[x]} (y): ")
    #         if game_position == "y":
    #             roll_die()
    #             break
    #         else:
    #             print("You must roll the die!")

    while game_session:
        for x in range(total_players):
            turn_score = 0
            while True:
                roll_choice = input(f"\nRoll the Die {names[f'player{x + 1}']['name']} (y/n): ").lower()
                if roll_choice == "y":
                    roll_result = roll_die()
                    print(f"You just rolled {roll_result}")
                    # print(f"{names[f'player{x + 1}']['name']} has a score of {names[f'player{x + 1}']['score']}")
                    if roll_result > 1:
                        turn_score += roll_result
                        names[f"player{x + 1}"]["score"] += roll_result
                        print(f"{names[f'player{x + 1}']['name']} has a score of {names[f'player{x + 1}']['score']}")

                        # TODO Implement logic to determine which player has the highest score for that round and they are the actual winner!
                        # THIS IS TEMPORARY TO DECLARE A WINNER!
                        if names[f"player{x + 1}"]["score"] >= score_to_win:
                            play_sound_effect("sounds/effects/win.mp3")
                            pass
                            print("Congrats you won the game!")
                            game_session = False
                            break
                        continue

                    else:
                        # turn_score += roll_result
                        play_sound_effect("sounds/effects/fail.mp3")
                        pass
                        print("\nYour turn ends and your score for this turn does not count!")
                        # print(f"TESTING: {turn_score}")
                        names[f"player{x + 1}"]["score"] -= turn_score
                        print(f"{names[f'player{x + 1}']['name']} has a score of {names[f'player{x + 1}']['score']}")
                        break

                elif roll_choice == "n":
                    print(f"{names[f'player{x + 1}']['name']} has a score of {names[f'player{x + 1}']['score']}")
                    break
                else:
                    print("You must type (y/n)!")

    time.sleep(1)
    print("\nThank you for playing! xxxx Is your winner!")


main_menu()
