# Interactive Quiz App Specification

## Core Features

### 1. Quiz Categories
- The app should provide at least **3 quiz categories**, such as:
  - **Science**
  - **Movies**
  - **General Knowledge**
- Each category must contain a minimum of **10 multiple-choice questions**.
- Allow users to **select their desired category** at the start of the quiz.

### 2. Question Structure
Each question should include:
- The **question text**.
- **Four multiple-choice options** (A, B, C, D).
- The **correct answer** (key stored for validation).
- Optionally, an **explanation** for the correct answer (used for feedback).
- Questions should be stored in an **external JSON file** to allow easy modification and reuse.

### 3. Gameplay Flow
- Display a **welcome message** and a menu of quiz categories.
- After a category is selected:
  - Present one question at a time.
  - Display the **question text** and the **multiple-choice options**.
  - Allow the user to **input their answer** (case-insensitive).
- Provide **immediate feedback** for each answer (e.g., “Correct!” or “Incorrect. The correct answer is...”).
- After completing all questions:
  - Display the **final score** (e.g., “You got 7/10 correct!”).
  - Show a **summary of incorrect answers** with the correct answers and explanations.

### 4. Scoring System
- Award **1 point** for each correct answer.
- Track the **total number of questions answered correctly**.

### 5. Error Handling
- Handle **invalid user inputs** gracefully (e.g., if the user enters something other than A, B, C, or D).
- Allow the user to **restart the quiz** or **return to the main menu** after finishing a category.

---

## Additional Features (Bonus Marks)

### 1. Randomization
- **Randomize** the order of questions within each category to keep the quiz fresh every time.

### 2. Timer for Each Question
- Add a **time limit** (e.g., 15 seconds) for each question.
- Mark the question as **incorrect** if the timer runs out, and display the correct answer.

### 3. Leaderboard
- Implement a **leaderboard system**:
  - Save user scores with their name.
  - Display the **top 5 high scores** for each category.
- Store leaderboard data persistently (e.g., in a text file or JSON).

### 4. Custom Quiz Creation
- Allow users to **create their own quiz categories**:
  - Accept inputs for questions, options, and the correct answer.
  - Save new quizzes to the external JSON file.

### 5. Difficulty Levels
- Introduce **difficulty modes** (e.g., Easy, Medium, Hard).
  - Harder modes could reduce the time limit for answering questions.
  - Increase question complexity for higher difficulty levels.

### 6. Detailed Feedback
- After the quiz, display a **detailed report**:
  - List all questions.
  - Show the user’s answer and the correct answer for each question.
  - Provide explanations for incorrect answers.

### 7. Graphical Summary
- Use a library like `matplotlib` to generate a **bar chart** or **pie chart**:
  - Visualize the user’s performance (e.g., percentage of correct answers).

### 8. Multiplayer Mode
- Add a **multiplayer mode** where two players take turns answering the same set of questions.
- Compare their scores at the end to determine the winner.

### 9. Category Unlock System
- Lock advanced quiz categories initially.
- Unlock them based on the user’s performance in other categories (e.g., “Score 8/10 in General Knowledge to unlock History”).

### 10. Custom Styling for CLI
- Use libraries like `colorama` or `rich` to add colorful text and formatting to the console output, making the app visually engaging.

---

## Technical Requirements

### 1. Input Validation
- Ensure user inputs are **case-insensitive** (e.g., "a" or "A" is accepted).
- Reject invalid answers gracefully with prompts to retry.

### 2. External Data Storage
- Store questions and answers in an **external JSON file** for easy management.
- Use a modular design to read/write data from the file.

### 3. Code Modularity
- Divide the application into multiple functions:
  - A function for displaying questions.
  - A function for validating answers.
  - A function for calculating scores.
- Optionally, organize the code into multiple files (e.g., a main script and a separate file for data handling).

### 4. Performance
- Optimize the app for **smooth execution**, even with larger question sets.
- Handle exceptions (e.g., missing or corrupted JSON files).

---

## Stretch Goals

### 1. GUI Implementation
- Create a graphical version of the quiz using `tkinter` or `PyQt` with clickable buttons for answers.

### 2. Web-Based Quiz
- Build a web-based version using **Flask** or **Django**.

### 3. Audio Integration
- Add **sound effects** for correct/incorrect answers.
- Include a **text-to-speech** option to read questions aloud.

---

This specification provides a roadmap for designing and implementing the Interactive Quiz App, with plenty of opportunities to showcase advanced features and creativity.
