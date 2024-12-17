import json
import random

# Open and read the JSON file
with open("quiz_questions.json", "r") as file:
    quiz_data = json.load(file) 



# NOT IMPLEMENTED YET!
def breakdown_quiz():
    # print("This is your full breakdown of the quiz:")
    # print(question["question"])
    pass


# General Knowledge Quiz
def general_knowledge_quiz():
    pass


# Movies Quiz
def movies_quiz():
    score = 0
    running = 1
    question_number = 0

    quiz_questions = quiz_data["Movies"]
    
    for _ in quiz_questions:
        question = random.choice(quiz_questions)
        question_number += 1
        print(f"\nQuestion: {question_number}")
        print(question["question"])

        for index, option_text in enumerate(question["options"]):
            option_letter = chr(65 + index)  # Convert index to a letter (A, B, C, D)
            print(f"{option_letter}) {option_text}")

        valid_answer = ["A", "B", "C", "D", "Q"]

        while True:
            try:
                answer = input("\nPick your answer: ").upper()

                # Invalid answer
                if answer not in valid_answer:
                    raise ValueError("\nInvalid input! Please enter A, B, C, D or Q(uit).")

                # Correct answer
                if answer == question["answer"]:
                    print("Correct!")
                    print(question["explanation"])
                    score += 1
                    break

                # Quit the program - Return to Main Menu - NOT IMPLEMENTED YET
                elif answer == "Q":
                    print("Thanks for playing!")
                    # running = 0
                    quit()

                # Incorrect answer
                else:
                    print("Incorrect!")
                    print(f"The answer is {question['answer']} - {question['explanation']}")
                    score += 0
                    break

            # Catch ValueError as answer
            except ValueError as e:
                print(e)

    # Display final score     
    print(f"\nYour final score is {score}/10")


    # Breakdown report - questions, user answer, real answer, explanation - NOT IMPLEMENTED YET!
    breakdown_quiz()

# Maths Quiz
def maths_quiz():
    pass



# Categories - General Knowledge, Maths, Movies
def select_category_menu():
    while True:
        print("Welcome to the Quiz Game!")
        print("\nPick a category you would like to be quizzed on!")
        print("1. General Knowledge")
        print("2. Movies")
        print("3. Maths")
        print("Q: Quit")
        select_category = input("Select a category: (1 - 3) or Q(uit)").upper()
    
        if select_category == "1":
            general_knowledge_quiz()

        elif select_category == "2":
            movies_quiz()

        elif select_category == "3":
            maths_quiz()

        elif select_category == "Q":
            print("\nYou have decided to leave. Goodbye!")
            quit()

        else:
            print("\nPlease type a valid number!")




select_category_menu()
