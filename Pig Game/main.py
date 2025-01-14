import time
import random
import os

# import sys
from playsound import playsound
import pygame


pygame.init()
pygame.mixer.init()


# Variables Defined
sound_effects = True
score_to_win = 100


# Main Menu
def main_menu():
    # Should be using local variable names this is temporary
    global score_to_win
    global ai_voice
    ai_voice = "amelia"

    while True:
        print("\nWelcome .. . . . .. . ")
        print("------ Game Modes ------")
        print("1: Single Player")
        print("2: Two Players")
        print("3: Three Players")
        print("4: Four Players")
        print("5: Five or More Players (Max = 10)")
        print("------ Gameplay Settings ------")
        print("A: Auto Roll (off) (Not Available)")
        print("D: Extra Die (off) (Not Available)")
        print(f"W: Score to Win ({score_to_win})")
        print("------ Sound Settings ------")
        print("S: Sound Effect Toggle ({})".format("on" if sound_effects else "off"))
        print("T: TTS Audio Toggle (off) (Not Available)")
        print(f"P: AI Player Voice ({ai_voice}) (single player)")

        option = input("Type an option: ").lower()

        # Game Modes #
        # Single Player Mode
        if option == "1":
            total_players = 1
            player_name(total_players)

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

                    if total_players == "back":
                        print("\nGoing back...")
                        time.sleep(1)
                        break

                    elif total_players == "quit":
                        print("\nGoodbye see you again!")
                        time.sleep(1)
                        quit()

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
                try:
                    score_to_win = int(input("\nPlease enter your desired score to win: "))

                    # if score_to_win == "back":
                    #     print("\nGoing back...")
                    #     time.sleep(1)
                    #     break

                    # elif score_to_win == "quit":
                    #     print("\nGoodbye see you again!")
                    #     time.sleep(1)
                    #     quit()

                    if score_to_win:
                        print(f"Score to win set to {score_to_win}.")
                        time.sleep(1)
                        break

                    else:
                        score_to_win = 100
                        print("Please enter a valid number!")

                except ValueError:
                    print("Please enter a valid number!")

        # Sound Settings #
        # Sound Effects Toggle
        elif option == "s":
            toggle_sound_effects()
            time.sleep(1)

        elif option == "t":
            pass

        elif option == "p":
            while True:
                print("\nSingle player only!")
                print("------ Voices ------")
                print("A: Amelia (female)")
                print("B: Brian (male)")
                ai_voice = input("\nSelect your AI voice: ").lower()

                if ai_voice in ["a", "amelia"]:
                    ai_voice = "amelia"
                    print(
                        "Hi there! I'm Amelia, your sharp-witted and charming AI opponent.I'm always up\nfor a challenge and ready to show off my skills. With a knack for strategy and a\nbit of flair, I'll make sure every game is a thrilling experience. Let's see if you can\nkeep up with me!"
                    )
                    # playsound("sounds/ai_voice/amelia_intro.wav", block=True)
                    pygame.mixer.Sound("sounds/ai_voice/amelia_intro.wav").play()
                    break

                elif ai_voice in ["b", "brian"]:
                    ai_voice = "brian"
                    print(
                        "Hello, I'm Brian. Known for my unmatched skills and unbeatable strategies,\nI'm the one to watch in any game. With a natural talent for competition and a sharp\nmind for tactics, I bring my A-game every time. People say I'm a bit cocky, but\nthat's only because I know I'm the best. Ready to take me on? Prepare to be\noutplayed and outsmarted!"
                    )
                    # playsound("sounds/ai_voice/brian_intro.wav", block=True)
                    pygame.mixer.Sound("sounds/ai_voice/brian_intro.wav").play()
                    break

                elif ai_voice == "back":
                    print("\nGoing back...")
                    time.sleep(1)
                    break

                elif ai_voice == "quit":
                    print("\nGoodbye see you again!")
                    time.sleep(1)
                    quit()

                else:
                    print("\nPlease select a valid voice!")

        # Quit the program
        elif option == "quit":
            print("\nGoodbye see you again!")
            time.sleep(1)
            quit()

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
            name = input(f"\nPlease input the name for Player {x + 1}: ").title()

            # Name Validation Checking
            if name.isalpha():
                names[f"player{x + 1}"] = {"name": name, "score": 0}

            # if name == "Back":
            #     print("\nGoing back...")
            #     time.sleep(1)
            #     break

            # elif name == "Quit":
            #     print("\nGoodbye see you again!")
            #     time.sleep(1)
            #     quit()

            else:
                print("This is an invalid name. Try again!")
                continue

            # Name Confirmation Check (yes/no) with Validation
            name_confirmation = input(f"You have selected {name} as your name. Is this correct? (yes/no): ").lower()
            if name_confirmation in ["yes", "y"]:
                print(f"{name} is now a player!")
                # play_sound_effect("sounds/effects/player_register.mp3", block=False)
                pygame.mixer.Sound("sounds/effects/player_register.mp3").play()
                break

            elif name_confirmation in ["no", "n"]:
                pass

            elif name_confirmation == "back":
                print("\nGoing back...")
                time.sleep(1)
                break

            elif name_confirmation == "quit":
                print("\nGoodbye see you again!")
                time.sleep(1)
                quit()

            else:
                print("Please try again!")
                continue

        if total_players == len(names):
            if total_players == 1:
                names["AI"] = {"name": "AI", "score": 0}
            print("\nGame will now start!")
            start_game(names, total_players)


def roll_die():
    min_value = 1
    max_value = 6
    roll = random.randint(min_value, max_value)

    # play_sound_effect("sounds/effects/dice_roll.mp3")
    pygame.mixer.Sound("sounds/effects/dice_roll.mp3").play()

    pass
    return roll


def start_game(names, total_players):
    global ai_voice

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
        for player_key in names.keys():
            turn_score = 0
            if player_key == "AI":
                game_session = ai_turn(names, turn_score, score_to_win)
            else:
                game_session = player_turn(player_key, names, turn_score, score_to_win)
            if not game_session:
                break

    print("\n------ Summary of Game ------")
    for player_key in names.keys():
        print(f"{names[player_key]['name']} had a score of {names[player_key]['score']}")

    time.sleep(1)
    print("\nThank you for playing!")


def ai_decision():
    return random.choice(["y", "y", "n"])


def play_ai_phrase(ai_voice="amelia", roll_result=None):
    if ai_voice == "amelia":
        path = "sounds/ai_voice/amelia/"

        if roll_result == 1:
            path = "sounds/ai_voice/amelia/bad_roll/"

    elif ai_voice == "brian":
        path = "sounds/ai_voice/brian/"

        # if roll_result == 1:
        #     path = "sounds/ai_voice/brian/bad_roll/"

    files = os.listdir(path)
    ai_phrase = random.choice(files)

    # playsound(os.path.join(path, ai_phrase))
    pygame.mixer.Sound(os.path.join(path, ai_phrase)).play()


def ai_turn(names, turn_score, score_to_win):
    # thinking_message = "Thinking...\n"

    play_ai_phrase(ai_voice)
    while True:
        print("\nRoll the Die AI (y/n)")
        # for char in thinking_message:
        #     sys.stdout.write(char)
        #     sys.stdout.flush()
        #     time.sleep(0.2)
        roll_choice = ai_decision()

        if roll_choice == "y":
            roll_result = roll_die()
            print(f"AI just rolled {roll_result}")

            if roll_result > 1:
                turn_score += roll_result
                names["AI"]["score"] += roll_result
                print(f"AI has a score of {names['AI']['score']}")

                # TODO Implement logic to determine which player has the highest score for that round and they are the actual winner!
                # THIS IS TEMPORARY TO DECLARE A WINNER!
                if names["AI"]["score"] >= score_to_win:
                    # play_sound_effect("sounds/effects/win.mp3")
                    pygame.mixer.Sound("sounds/effects/win.mp3").play()
                    pass
                    print("Congrats AI you won the game!")
                    return False  # Ends the game session

                continue

            else:
                # turn_score += roll_result
                # play_sound_effect("sounds/effects/fail.mp3")
                pygame.mixer.Sound("sounds/effects/fail.mp3").play()
                pass
                print("\nYour turn ends and your score for this turn does not count!")
                # print(f"TESTING: {turn_score}")
                names["AI"]["score"] -= turn_score
                print(f"AI has a score of {names['AI']['score']}")
                play_ai_phrase(ai_voice, roll_result)
                break

        elif roll_choice == "n":
            print(f"AI has a score of {names['AI']['score']}")
            # play_sound_effect("sounds/effects/end_turn.mp3", block=False)
            pygame.mixer.Sound("sounds/effects/end_turn.mp3").play()
            break
        else:
            print("You must type (y/n)!")
    return True  # Continues the game session


def player_turn(player_key, names, turn_score, score_to_win):
    while True:
        roll_choice = input(f"\nRoll the Die {names[player_key]['name']} (y/n): ").lower()
        if roll_choice == "y":
            roll_result = roll_die()
            print(f"You just rolled {roll_result}")
            # print(f"{names[f'player{x + 1}']['name']} has a score of {names[f'player{x + 1}']['score']}")
            if roll_result > 1:
                turn_score += roll_result
                names[player_key]["score"] += roll_result
                print(f"{names[player_key]['name']} has a score of {names[player_key]['score']}")

                # TODO Implement logic to determine which player has the highest score for that round and they are the actual winner!
                # THIS IS TEMPORARY TO DECLARE A WINNER!
                if names[player_key]["score"] >= score_to_win:
                    # play_sound_effect("sounds/effects/win.mp3")
                    pygame.mixer.Sound("sounds/effects/win.mp3").play()
                    pass
                    print(f"Congrats {names[player_key]['name']} you won the game!")
                    return False  # Ends the game session

                continue

            else:
                # turn_score += roll_result
                # play_sound_effect("sounds/effects/fail.mp3")
                pygame.mixer.Sound("sounds/effects/fail.mp3").play()
                pass
                print("\nYour turn ends and your score for this turn does not count!")
                # print(f"TESTING: {turn_score}")
                names[player_key]["score"] -= turn_score
                print(f"{names[player_key]['name']} has a score of {names[player_key]['score']}")
                break

        elif roll_choice == "n":
            print(f"{names[player_key]['name']} has a score of {names[player_key]['score']}")
            # play_sound_effect("sounds/effects/end_turn.mp3", block=False)
            pygame.mixer.Sound("sounds/effects/end_turn.mp3").play()
            break

        elif roll_choice == "quit":
            print("\nGoodbye see you again!")
            time.sleep(1)
            quit()

        else:
            print("You must type (y/n)!")
    return True  # Continues the game session


main_menu()
