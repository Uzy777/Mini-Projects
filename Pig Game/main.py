import time


# Main Menu
def main_menu():
    while True:
        print("\nWelcome .. . . . .. . ")
        print("--- Game Settings ---")
        print("1: Single Player (Not Available)")
        print("2: Two Players")
        print("--- Sound Settings ---")
        print("S: Sound Toggle (on/off)")

        option = input("Type an option: ").lower()

        # Single Player Mode
        if option == "1":
            pass

        # Two Players Mode
        elif option == "2":
            total_players = 2
            player_name(total_players)

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
            print("good")
        print(names)


# player_name()

main_menu()
