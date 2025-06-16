# Required module to use randint and time
import random
import time

# When the game starts, it should display a welcome message along with the rules of the game
print("Welcome to the Number Guessing Game!")
print("I'm thinking of a number between 1 and 100.")
print("You have to guess the correct number.")

# The computer should randomly select a number between 1 and 100
computer = random.randint(1, 101)

print("\nPlease select the difficulty level:")
print("1. Easy (10 chances)")
print("2. Medium (5 chances)")
print("3. Hard (3 chances)")

chance = 0
attempt = 0

# User should select the difficulty level (easy, medium, hard) which will determine the number of chances they get to guess the number
choice = input("\nEnter your choice: ")

if choice == "1":
    chance = 10
    print("\nGreat! You have selected the Easy difficulty level.")
elif choice == "2":
    chance = 5
    print("\nGreat! You have selected the Medium difficulty level.")
elif choice == "3":
    chance = 3
    print("\nGreat! You have selected the Hard difficulty level.")
else:
    print("\nPlease select a valid difficulty!")
    quit()
print("Let's start the game!")

# Add a timer to see how long it takes the user to guess the number.
start_time = time.time()

while True:

    # The user should be able to enter their guess
    guess = input("\nEnter your guess: ")

    # If the user’s guess is correct, the game should display a congratulatory message along with the number of attempts it took to guess the number
    attempt = attempt + 1

    # If the user’s guess is incorrect, the game should display a message indicating whether the number is greater or less than the user’s guess
    # The game should end when the user guesses the correct number or runs out of chances
    if int(guess) == computer:
        print(f"Congratulations! You guessed the correct number in {attempt} attempts.")
        # Add a timer to see how long it takes the user to guess the number
        end_time = time.time()
        elpased_time = round(end_time - start_time, 2)
        print(f"It only took you {elpased_time} seconds.")
        break
    elif int(guess) < computer:
        print(f"Incorrect! The number is greater than {guess}.")
    elif int(guess) > computer:
        print(f"Incorrect! The number is less than {guess}.")
    if attempt == chance:
        print("You have ran out of chances! Please restart the Game!")
        break
    # else:
    #     print("Please enter a valid number as your guess!")
