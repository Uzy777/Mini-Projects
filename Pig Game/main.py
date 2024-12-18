import time


# Main Menu
def main_menu():
    while True:
        print("\nWelcome .. . . . .. . ")
        print("--- Game Settings ---")
        print("1: xxxxxxSingle Playerxxxxxx")
        print("2: Two Players")
        print("--- Sound Settings ---")
        print("S: Sound Toggle (on/off)")

        option = input("Type an option: ").lower()

        # Single Player Mode
        if option == "1":
            pass

        # Two Players Mode
        elif option == "2":
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
def player_name():
    while True:
        name = input("\nPlease input your name: ").title()

        # Name Validation Checking
        if not name.isalpha():
            print("This is an invalid name. Try again!")
            continue

        # Name Confirmation Check (yes/no) with Validation
        name_confirmation = input(f"You have selected {name} as your name. Is this correct? (yes/no): ").lower()
        if name_confirmation in ["yes", "y"]:
            print("yes")
            break
        elif name_confirmation in ["no", "n"]:
            pass
        else:
            print("Please enter 'yes' or 'no'")


# player_name()

main_menu()
