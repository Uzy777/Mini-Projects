import json




# Open and read the JSON file
with open("quiz_questions.json", "r") as file:
    quiz_data = json.load(file) 

# General Knowledge Quiz
def general_knowledge_quiz():
    pass


# Movies Quiz
def movies_quiz():
    score = 0
    movies_quiz_questions = quiz_data["Movies"]
    
    for question in movies_quiz_questions:
        print("\n")
        print(question["question"])

        for index, option_text in enumerate(question["options"]):
            option_letter = chr(65 + index)  # Convert index to a letter (A, B, C, D)
            print(f"{option_letter}) {option_text}")

        valid_answer = ["A", "B", "C", "D"]

        while True:
            try:
                answer = input("\nPick your answer: ").upper()

                # Invalid answer
                if answer not in valid_answer:
                    raise ValueError("\nInvalid input! Please enter A, B, C, or D.")

                # Correct answer
                if answer == question["answer"]:
                    print("Correct!")
                    print(question["explanation"])
                    score += 1
                    break

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


# Maths Quiz
def maths_quiz():
    pass



# Categories - General Knowledge, Maths, Movies
def select_category_menu():
    while True:
        print("\nPick a category you would like to be quizzed on!")
        print("1. General Knowledge")
        print("2. Movies")
        print("3. Maths")
        select_category = int(input("Select a category: (1 - 3) "))
    
        if select_category == 1:
            general_knowledge_quiz()

        elif select_category == 2:
            movies_quiz()

        elif select_category == 3:
            maths_quiz()

        else:
            print("\nPlease type a valid number!")




select_category_menu()
