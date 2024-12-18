


# Player Name
def player_name():
    while True:
        name = input("\nPlease input your name: ").title()
        if not name.isalpha():
            print("This is an invalid name. Try again!")
            continue
        name_confirmation = input(f"You have selected {name} as your name. Is this correct? (yes/no): ").lower()
        if name_confirmation in ["yes", "y"]:
            print("yes")
            break
        elif name_confirmation in ["no", "n"]:
            pass
        else:
            print("Please enter 'yes' or 'no'")


player_name()