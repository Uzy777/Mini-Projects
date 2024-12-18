import time
import random


# Main Menu
def main_menu():
    while True:
        print("\nWelcome .. . . . .. . ")
        print("------ Game Modes ------")
        print("1: Single Player (Not Available)")
        print("2: Two Players")
        print("3: Three Players (Not Available)")
        print("4: Four Players (Not Available)")
        print("5: Five or More Players (Not Available)")
        print("------ Gameplay Settings ------")
        print("A: Auto Roll (off) (Not Available)")
        print("D: Extra Die (off) (Not Available)")
        print("------ Sound Settings ------")
        print("S: Sound Effect Toggle (on) (Not Available)")
        print("T: TTS Audio Toggle (off) (Not Available)")

        option = input("Type an option: ").lower()

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
            pass

        # Sound Toggle
        elif option == "s":
            pass

        else:
            print("\nPlease type a valid option!")
            time.sleep(3)


# Number of Players
def number_of_players():
    pass


# Player Name
def player_name(total_players):
    names = {}

    for x in range(total_players):
        while True:
            # for x in range(total_players):
            #     name = input("\nPlease input your name: ").title()
            #     if name.isalpha():
            #         names["player{0}".format(x)] = name
            #         break
            #     else:
            #         print("Wrong try again!")

            # print(names)

            name = input(f"\nPlease input the name for Player {x+1}: ").title()

            # Name Validation Checking
            if name.isalpha():
                names["player{0}".format(x + 1)] = name
            else:
                print("This is an invalid name. Try again!")
                continue

            # Name Confirmation Check (yes/no) with Validation
            name_confirmation = input(f"You have selected {name} as your name. Is this correct? (yes/no): ").lower()
            if name_confirmation in ["yes", "y"]:
                print("xxxxx")
                break
            elif name_confirmation in ["no", "n"]:
                pass
            # BUG - Goes back to the top of the loop instead of Is this correct?
            else:
                print("Please enter 'yes' or 'no'")

        if total_players == len(names):
            print("Game will now start!")
            start_game(names, total_players)
        # print(names)


def roll_die():
    min_value = 1
    max_value = 6
    roll = random.randint(min_value, max_value)

    print(roll)


def start_game(names, total_players):
    # Adding Each Name to a List for Greeting Message
    name_list = []
    for name in names.values():
        name_list.append(name)

    # Joining Each Name Separated by a ','
    greeting = ", ".join(name_list)
    print(f"Hello {greeting} have fun with this game! All the best!")

    # Determine Who Starts First
    for x in range(total_players):
        while True:
            print("\nHighest roll starts the game first!")
            game_position = input(f"Roll the Die {name_list[x]} (y): ")
            if game_position == "y":
                roll_die()
                break
            else:
                print("You must roll the die!")


main_menu()
# roll_die()
