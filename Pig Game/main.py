import time
import random
import os

# import sys
import pygame


pygame.init()
pygame.mixer.init()


# Variables Defined
sound_effects = True
music = False
score_to_win = 100
two_dice_mode = False


# Main Menu
def main_menu():
    """
    Display the main menu of the Pig Dice Game and handle user input.

    This function presents the user with various game modes and settings,
    processes the user's selection, and calls the appropriate functions
    based on the user's choice. The menu also includes options to toggle
    game and sound settings, as well as navigation options to exit the game.
    """

    # Should be using local variable names this is temporary
    global score_to_win
    global ai_voice
    ai_voice = "amelia"
    # global two_dice_mode

    while True:
        print("\nWelcome to the Pig Dice Game!")
        print("------ Game Modes ------")
        print("1: Single Player")
        print("2: Two Players")
        print("3: Three Players")
        print("4: Four Players")
        print("5: Five or More Players (Max = 10)")
        print("------ Gameplay Settings ------")
        print("A: Auto Roll (off) (Not Available)")
        print("D: Extra Die ({})".format("on" if two_dice_mode else "off"))
        print(f"W: Score to Win ({score_to_win})")
        print("------ Sound Settings ------")
        print("S: Sound Effect Toggle ({})".format("on" if sound_effects else "off"))
        print("T: TTS Audio Toggle (off) (Not Available)")
        print(f"P: AI Player Voice ({ai_voice}) (single player)")
        print("M: Music Toggle ({})".format("on" if music else "off"))
        print("------ Navigation ------")
        print("quit: Exit the game")
        print("---------------")

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
                    print("\n------ Navigation ------")
                    print("back: Go back")
                    print("quit: Exit the game")

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
                        time.sleep(1)
                        continue

                except ValueError:
                    print("This is an invalid number!")
                    time.sleep(1)

        # Gameplay Settings #
        # Auto Roll Toggle
        elif option == "a":
            pass

        # Extra Die Toggle
        elif option == "d":
            toggle_two_dice_mode()
            time.sleep(1)

        # Score to Win
        elif option == "w":
            while True:
                try:
                    print("\n------ Navigation ------")
                    print("back: Go back")
                    print("quit: Exit the game")

                    user_input = input("\nPlease enter your desired score to win: ")

                    if user_input == "back":
                        print("\nGoing back...")
                        time.sleep(1)
                        break

                    elif user_input == "quit":
                        print("\nGoodbye see you again!")
                        time.sleep(1)
                        quit()

                    elif user_input.isdigit():
                        score_to_win = int(user_input)
                        print(f"Score to win set to {score_to_win}.")
                        time.sleep(1)
                        break

                    else:
                        score_to_win = 100
                        print("Please enter a valid number!")
                        time.sleep(1)

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
                print("O: Oxley (male)")
                print("------ Navigation ------")
                print("back: Go back")
                print("quit: Exit the game")

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

                elif ai_voice in ["o", "oxley"]:
                    ai_voice = "oxley"
                    print(
                        "I am Oxley, the shadow that lurks in the corners of your mind. Once a brilliant strategist,\nnow a twisted soul consumed by darkness. In this game, I bring my cunning and cruelty to\nthe fore, challenging all who dare to face me. My voice, a mere whisper of the terror that\nawaits. You think you know fear? Think again. Welcome to my domain."
                    )
                    # playsound("sounds/ai_voice/brian_intro.wav", block=True)
                    pygame.mixer.Sound("sounds/ai_voice/oxley_intro.wav").play()
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

        elif option == "m":
            toggle_music()
            time.sleep(1)

        # Quit the program
        elif option == "quit":
            print("\nGoodbye see you again!")
            time.sleep(1)
            quit()

        else:
            print("\nPlease type a valid option!")
            time.sleep(2)


def toggle_two_dice_mode():
    """
    xxxx
    """

    global two_dice_mode

    two_dice_mode = not two_dice_mode
    if two_dice_mode:
        print("Extra die on.")
    else:
        print("Extra die off.")


# Sound
def toggle_sound_effects():
    """
    Toggle the state of sound effects in the game.

    This function switches the global variable 'sound_effects' between True and False,
    turning the sound effects on or off accordingly. It also prints a message to
    indicate the current state of the sound effects.
    """

    global sound_effects

    sound_effects = not sound_effects
    if sound_effects:
        print("Sound effects on.")
    else:
        print("Sound effects off.")


def play_sound_effect(file_path):
    """
    Play a sound effect if sound effects are enabled.

    This function plays a sound effect from the specified file path using
    the pygame mixer, but only if the global 'sound_effects' variable is True.

    Parameters:
    file_path (str): The path to the sound effect file.
    """

    if sound_effects:
        pygame.mixer.Sound(file_path).play()
    else:
        pass


def toggle_music():
    """
    Toggle the background music on and off.

    This function switches the global 'music' variable between True and False,
    turning the background music on or off accordingly. When music is turned on,
    it loads and plays the specified music file on a loop and sets the volume.
    When music is turned off, it pauses the music playback.
    """

    global music

    music = not music
    if music:
        print("Music on.")
        pygame.mixer.music.load("sounds/effects/music.mp3")
        pygame.mixer.music.play(-1)
        pygame.mixer.music.set_volume(0.7)
    else:
        print("Music off.")
        pygame.mixer.music.pause()


# Player Name
def player_name(total_players):
    """
    Collect and validate player names for the specified number of players.

    This function prompts the user to input names for each player, validates the input
    to ensure it contains only alphabetic characters, and confirms the selection with
    the user. If there is only one player, an AI player is added. The function stores
    the player names and scores in a dictionary and calls the start_game function
    once all names have been confirmed.

    Parameters:
    total_players (int): The total number of players in the game.
    """

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
                play_sound_effect("sounds/effects/player_register.mp3")
                break

            elif name_confirmation in ["no", "n"]:
                pass

            # elif name_confirmation == "back":
            #     print("\nGoing back...")
            #     time.sleep(1)
            #     break

            # elif name_confirmation == "quit":
            #     print("\nGoodbye see you again!")
            #     time.sleep(1)
            #     quit()

            else:
                print("Please try again!")
                continue

        if total_players == len(names):
            if total_players == 1:
                names["AI"] = {"name": "AI", "score": 0}
            print("\nGame will now start!")
            start_game(names, total_players)


def roll_die():
    """
    Simulate rolling a die and play a sound effect.

    This function generates a random integer between the specified minimum and
    maximum values (inclusive) to simulate rolling a die. It plays a sound effect
    of a dice roll, waits for the sound to finish, and then returns the result of
    the roll.

    Returns:
    int: The result of the die roll.
    """

    min_value = 1
    max_value = 6
    roll = random.randint(min_value, max_value)

    play_sound_effect("sounds/effects/dice_roll.mp3")
    # Wait for the sound to finish
    while pygame.mixer.get_busy():
        pygame.time.delay(100)

    pass
    return roll


def start_game(names, total_players):
    """
    Start the Pig Dice Game with the provided player names and total number of players.

    This function initializes the game session, greets the players, and manages the
    gameplay loop. It handles each player's turn, including the AI player's turn if present,
    and continues the game until a game-ending condition is met. The function then
    displays a summary of the game results and thanks the players for participating.

    Parameters:
    names (dict): A dictionary containing player names and their scores.
    total_players (int): The total number of players in the game.

    """

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
        names[player_key]["score"] = 0  # Reset scores when game ends

    time.sleep(1)

    while True:
        play_again_input = input("\nPlay again? (same players and rules?) y/n: ")

        if play_again_input == "y":
            start_game(names, total_players)
            break

        elif play_again_input == "n":
            print("\nThank you for playing!")
            break

        else:
            print("Invalid option! Try again!")
            continue


def ai_decision():
    """
    Determine the AI player's decision to roll or hold.

    This function randomly selects a decision for the AI player, with a higher
    probability of choosing to roll ("y") compared to holding ("n").

    Returns:
    str: 'y' for roll or 'n' for hold.
    """

    return random.choice(["y", "y", "n"])


def play_ai_phrase(ai_voice="amelia", roll_result=None):
    """
    Play a random AI phrase based on the AI player's voice and roll result.

    This function selects a random sound file from the directory corresponding to
    the specified AI player's voice (default is "amelia"). If the roll result is 1,
    it plays a phrase from the "bad roll" directory for Amelia. The function then
    plays the selected sound file and waits for the sound to finish before proceeding.

    Parameters:
    ai_voice (str): The voice of the AI player ("amelia" or "brian").
    roll_result (int, optional): The result of the dice roll, used to determine
                                 the phrase directory for certain voices.
    """

    if ai_voice == "amelia":
        path = "sounds/ai_voice/amelia/"

        if roll_result == 1:
            path = "sounds/ai_voice/amelia/bad_roll/"

    elif ai_voice == "brian":
        path = "sounds/ai_voice/brian/"

        if roll_result == 1:
            path = "sounds/ai_voice/brian/bad_roll/"

    elif ai_voice == "oxley":
        path = "sounds/ai_voice/oxley/"

        if roll_result == 1:
            path = "sounds/ai_voice/oxley/bad_roll/"

    files = os.listdir(path)
    ai_phrase = random.choice(files)

    # playsound(os.path.join(path, ai_phrase))
    pygame.mixer.Sound(os.path.join(path, ai_phrase)).play()
    # Delay by 100 ms
    while pygame.mixer.get_busy():
        pygame.time.delay(100)


def ai_turn(names, turn_score, score_to_win):
    """
    Manage the AI player's turn in the Pig Dice Game.

    This function controls the AI player's actions, including rolling the die,
    updating the turn score, and checking for a winning condition. It plays
    appropriate sound effects and AI phrases based on the roll result and
    decisions made. The function continues the AI's turn until a game-ending
    condition is met or the AI decides to hold.

    Parameters:
    names (dict): A dictionary containing player names and their scores.
    turn_score (int): The score accumulated during the AI's current turn.
    score_to_win (int): The target score required to win the game.

    Returns:
    bool: True if the game session continues, False if the AI wins and the game ends.
    """

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
            if two_dice_mode:
                roll_result1 = roll_die()
                roll_result2 = roll_die()
                roll_result = roll_result1 + roll_result2
                print(f"AI just rolled {roll_result1} and {roll_result2} (Total: {roll_result})")

            else:
                roll_result = roll_die()
                print(f"AI just rolled {roll_result}")

            if two_dice_mode and roll_result1 == 1 and roll_result2 == 1:
                print("YOU LOOSE EVERYTHING!!!!!!")
                names["AI"]["score"] = 0
                print(f"AI has a score of {names['AI']['score']}")
                break

            elif two_dice_mode and (roll_result1 == 1 or roll_result2 == 1):
                print("You lost your turn !!!!!!!")

                # turn_score += roll_result
                play_sound_effect("sounds/effects/fail.mp3")
                while pygame.mixer.get_busy():
                    pygame.time.delay(100)
                pass
                print("\nYour turn ends and your score for this turn does not count!")
                # print(f"TESTING: {turn_score}")
                names["AI"]["score"] -= turn_score
                print(f"AI has a score of {names['AI']['score']}")
                play_ai_phrase(ai_voice, roll_result)

                break

            # print(f"{names[f'player{x + 1}']['name']} has a score of {names[f'player{x + 1}']['score']}")
            elif (not two_dice_mode and roll_result > 1) or (two_dice_mode and roll_result > 3):
                if roll_result > 1:
                    turn_score += roll_result
                    names["AI"]["score"] += roll_result
                    print(f"AI has a score of {names['AI']['score']}")

                    # TODO Implement logic to determine which player has the highest score for that round and they are the actual winner!
                    # THIS IS TEMPORARY TO DECLARE A WINNER!
                    if names["AI"]["score"] >= score_to_win:
                        play_sound_effect("sounds/effects/win.mp3")
                        while pygame.mixer.get_busy():
                            pygame.time.delay(100)
                        pass
                        print("Congrats AI you won the game!")
                        return False  # Ends the game session

                    continue

            else:
                # turn_score += roll_result
                play_sound_effect("sounds/effects/fail.mp3")
                while pygame.mixer.get_busy():
                    pygame.time.delay(100)
                pass
                print("\nYour turn ends and your score for this turn does not count!")
                # print(f"TESTING: {turn_score}")
                names["AI"]["score"] -= turn_score
                print(f"AI has a score of {names['AI']['score']}")
                play_ai_phrase(ai_voice, roll_result)
                break

        elif roll_choice == "n":
            print(f"AI has a score of {names['AI']['score']}")
            play_sound_effect("sounds/effects/end_turn.mp3")
            while pygame.mixer.get_busy():
                pygame.time.delay(100)
            break
        else:
            print("You must type (y/n)!")
    return True  # Continues the game session


def player_turn(player_key, names, turn_score, score_to_win):
    """
    Manage a player's turn in the Pig Dice Game.

    This function handles a player's actions during their turn, including rolling the die,
    updating the turn score, and checking for a winning condition. It plays appropriate
    sound effects based on the roll result and player decisions. The function continues
    the player's turn until a game-ending condition is met or the player decides to hold.

    Parameters:
    player_key (str): The key representing the player's data in the names dictionary.
    names (dict): A dictionary containing player names and their scores.
    turn_score (int): The score accumulated during the player's current turn.
    score_to_win (int): The target score required to win the game.

    Returns:
    bool: True if the game session continues, False if the player wins and the game ends.
    """

    while True:
        roll_choice = input(f"\nRoll the Die {names[player_key]['name']} (y/n): ").lower()

        if roll_choice == "y":
            if two_dice_mode:
                roll_result1 = roll_die()
                roll_result2 = roll_die()
                roll_result = roll_result1 + roll_result2
                print(f"You just rolled {roll_result1} and {roll_result2} (Total: {roll_result})")

            else:
                roll_result = roll_die()
                print(f"You just rolled {roll_result}")

            if two_dice_mode and roll_result1 == 1 and roll_result2 == 1:
                print("YOU LOOSE EVERYTHING!!!!!!")
                names[player_key]["score"] = 0
                print(f"{names[player_key]['name']} has a score of {names[player_key]['score']}")
                break

            elif two_dice_mode and (roll_result1 == 1 or roll_result2 == 1):
                print("You lost your turn !!!!!!!")

                # turn_score += roll_result
                play_sound_effect("sounds/effects/fail.mp3")
                while pygame.mixer.get_busy():
                    pygame.time.delay(100)
                pass
                print("\nYour turn ends and your score for this turn does not count!")
                # print(f"TESTING: {turn_score}")
                names[player_key]["score"] -= turn_score
                print(f"{names[player_key]['name']} has a score of {names[player_key]['score']}")
                break

            # print(f"{names[f'player{x + 1}']['name']} has a score of {names[f'player{x + 1}']['score']}")
            elif (not two_dice_mode and roll_result > 1) or (two_dice_mode and roll_result > 3):
                turn_score += roll_result
                names[player_key]["score"] += roll_result
                print(f"{names[player_key]['name']} has a score of {names[player_key]['score']}")

                # TODO Implement logic to determine which player has the highest score for that round and they are the actual winner!
                # THIS IS TEMPORARY TO DECLARE A WINNER!
                if names[player_key]["score"] >= score_to_win:
                    play_sound_effect("sounds/effects/win.mp3")
                    while pygame.mixer.get_busy():
                        pygame.time.delay(100)
                    pass
                    print(f"Congrats {names[player_key]['name']} you won the game!")
                    return False  # Ends the game session

                continue

            else:
                # turn_score += roll_result
                play_sound_effect("sounds/effects/fail.mp3")
                while pygame.mixer.get_busy():
                    pygame.time.delay(100)
                pass
                print("\nYour turn ends and your score for this turn does not count!")
                # print(f"TESTING: {turn_score}")
                names[player_key]["score"] -= turn_score
                print(f"{names[player_key]['name']} has a score of {names[player_key]['score']}")
                break

        elif roll_choice == "n":
            print(f"{names[player_key]['name']} has a score of {names[player_key]['score']}")
            play_sound_effect("sounds/effects/end_turn.mp3")
            while pygame.mixer.get_busy():
                pygame.time.delay(100)
            break

        elif roll_choice == "quit":
            print("\nGoodbye see you again!")
            time.sleep(1)
            quit()

        else:
            print("You must type (y/n)!")
    return True  # Continues the game session


main_menu()
