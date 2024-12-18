# Pig Game Project Specification Checklist

## Overview
The Pig Game is a classic dice game where players take turns rolling a die. The aim is to accumulate points and be the first to reach a set target score. If a player rolls a 1, they lose their turn and any points accumulated during that turn. Additionally, a version with two dice introduces a new layer of risk and strategy.

## Features Checklist

### Must-Have Features
- **Game Setup:**
  - [x] Initialize game with a set number of players (default is 2).
  - [x] Input player names.
  - [ ] Display the number of players and their initial scores.

- **Player Turns:**
  - [ ] Implement turn-based system for multiple players.
  - [ ] Display current player's name and total score.
  - [ ] Indicate whose turn it is and prompt for the player's action.

- **Rolling the Die:**
  - [ ] Simulate rolling a single six-sided die.
  - [ ] Display the result of each roll.
  - [ ] Add the rolled value to the player's turn score if it's not a 1.

- **Turn Score Accumulation:**
  - [ ] Add rolled values to the player's turn score.
  - [ ] Display the accumulated turn score during the player's turn.

- **Turn End Conditions:**
  - [ ] End turn if the player rolls a 1 (turn score resets to 0).
  - [ ] Allow the player to choose to hold, adding the turn score to their total score.
  - [ ] Display updated total scores after holding or rolling a 1.

- **Winning Condition:**
  - [ ] Check if a player’s total score reaches or exceeds the winning score (default 100).
  - [ ] Announce the winner and end the game.
  - [ ] Display a summary of the game with player scores.

- **User Interface:**
  - [ ] Create a console-based interface.
  - [ ] Display player scores and turn options (roll or hold) clearly.
  - [ ] Provide feedback for invalid inputs or actions.

### Bonus Features
- **Two-Dice Version:**
  - [ ] Implement a variant with two dice.
  - [ ] If a player rolls a 1 on either die, their turn ends and their turn score resets to 0.
  - [ ] If a player rolls two 1s, they lose all their accumulated points (both turn and total).

- **Graphical User Interface (GUI):**
  - [ ] Implement a GUI using Tkinter or Pygame.
  - [ ] Display player scores, dice rolls, and game status in the GUI.
  - [ ] Add interactive buttons for rolling the dice and holding the score.

- **Single-Player Mode:**
  - [ ] Implement an AI opponent with basic decision-making.
  - [ ] Allow the player to choose between single-player and multiplayer modes.

- **Advanced AI:**
  - [ ] Develop an advanced AI with improved strategies for higher difficulty.
  - [ ] Provide different difficulty levels for the AI opponent.

- **Save/Load Game:**
  - [ ] Implement functionality to save the game state to a file.
  - [ ] Implement functionality to load a saved game state.
  - [ ] Ensure the game resumes accurately from the saved state.

- **Variable Number of Players:**
  - [ ] Allow customization of the number of players (more than two).
  - [ ] Ensure the game adapts dynamically to different numbers of players.

- **Customizable Winning Score:**
  - [ ] Allow players to set a different winning score before the game starts.
  - [ ] Display the current target score during gameplay.

- **Sound Effects:**
  - [ ] Add sound effects for rolling the die, ending a turn, and winning.
  - [ ] Ensure sounds enhance the user experience without being intrusive.

- **Statistics Tracking:**
  - [ ] Track game statistics (e.g., number of games won, highest turn score).
  - [ ] Display statistics to players upon request.
  - [ ] Provide a summary of game statistics at the end of each game.
