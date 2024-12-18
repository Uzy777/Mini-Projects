# Interactive Quiz App Specification

## Prerequisites

- Python 3.9.7 (Recommended)
- Install `.requirements` to pyenv if using.

## Core Features

### 1. Quiz Categories
- [x] The app provides at least **3 quiz categories**:
  - **Science**
  - **Movies**
  - **General Knowledge**
- [x] Each category contains a minimum of **10 multiple-choice questions**.
- [x] Users can **select their desired category** at the start of the quiz.

### 2. Question Structure
- [x] Questions include:
  - The **question text**.
  - **Four multiple-choice options** (A, B, C, D).
  - The **correct answer** (key stored for validation).
  - An **optional explanation** for the correct answer (used for feedback).
- [x] Questions are stored in an **external JSON file** to allow easy modification and reuse.

### 3. Gameplay Flow
- [x] Display a **welcome message** and a menu of quiz categories.
- [x] After a category is selected:
  - Present one question at a time.
  - Display the **question text** and the **multiple-choice options**.
  - Allow the user to **input their answer** (case-insensitive).
- [x] Provide **immediate feedback** for each answer.
  - "Correct!" or "Incorrect. The correct answer is...".
- [ ] After completing all questions:
  - [x] Display the **final score**.
  - [ ] Show a **summary of incorrect answers** with correct answers and explanations.

### 4. Scoring System
- [x] Award **1 point** for each correct answer.
- [x] Track the **total number of questions answered correctly**.

### 5. Error Handling
- [x] Handle **invalid user inputs** gracefully.
- [ ] Allow the user to **restart the quiz** or **return to the main menu** after finishing a category.

---

## Additional Features (Bonus Marks)

### 1. Randomization
- [ ] Randomize the order of questions within each category to keep the quiz fresh.

### 2. Timer for Each Question
- [ ] Add a **time limit** (e.g., 15 seconds) for each question.
- [ ] Mark the question as **incorrect** if the timer runs out and display the correct answer.

### 3. Leaderboard
- [ ] Implement a **leaderboard system**:
  - [ ] Save user scores with their name.
  - [ ] Display the **top 5 high scores** for each category.
- [ ] Store leaderboard data persistently (e.g., in a text file or JSON).

### 4. Custom Quiz Creation
- [ ] Allow users to **create their own quiz categories**:
  - [ ] Accept inputs for questions, options, and correct answers.
  - [ ] Save new quizzes to the external JSON file.

### 5. Difficulty Levels
- [ ] Introduce **difficulty modes** (e.g., Easy, Medium, Hard):
  - [ ] Harder modes reduce the time limit for answering questions.
  - [ ] Increase question complexity for harder difficulty levels.

### 6. Detailed Feedback
- [ ] Display a **detailed report** after the quiz:
  - [ ] List all questions.
  - [ ] Show the user’s answer and the correct answer for each question.
  - [ ] Provide explanations for incorrect answers.

### 7. Graphical Summary
- [ ] Use `matplotlib` to generate a **bar chart** or **pie chart** visualizing the user’s performance.

### 8. Multiplayer Mode
- [ ] Add a **multiplayer mode** where two players take turns answering the same set of questions.
- [ ] Compare their scores at the end to determine the winner.

### 9. Category Unlock System
- [ ] Lock advanced quiz categories initially.
- [ ] Unlock them based on user performance (e.g., “Score 8/10 in General Knowledge to unlock History”).

### 10. Custom Styling for CLI
- [ ] Use libraries like `colorama` or `rich` to add colorful text and formatting to the console output.

---

## Technical Requirements

### 1. Input Validation
- [ ] Ensure user inputs are **case-insensitive** (e.g., "a" or "A" is accepted).
- [ ] Reject invalid answers gracefully with prompts to retry.

### 2. External Data Storage
- [ ] Store questions and answers in an **external JSON file**.
- [ ] Use a modular design to read/write data from the file.

### 3. Code Modularity
- [ ] Divide the application into multiple functions:
  - [ ] A function for displaying questions.
  - [ ] A function for validating answers.
  - [ ] A function for calculating scores.
- [ ] Optionally, organize the code into multiple files.

### 4. Performance
- [ ] Optimize the app for **smooth execution**, even with larger question sets.
- [ ] Handle exceptions (e.g., missing or corrupted JSON files).

---

## Stretch Goals

### 1. GUI Implementation
- [ ] Create a graphical version of the quiz using `tkinter` or `PyQt`.

### 2. Web-Based Quiz
- [ ] Build a web-based version using **Flask** or **Django**.

### 3. Audio Integration
- [x] Add **sound effects** for correct/incorrect answers.
- [ ] Include a **text-to-speech** option to read questions aloud.
