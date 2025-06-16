# Pig Game Project Specification Checklist

## Overview
The Pig Game is a classic dice game where players take turns rolling a die. The aim is to accumulate points and be the first to reach a set target score. If a player rolls a 1, they lose their turn and any points accumulated during that turn. Additionally, a version with two dice introduces a new layer of risk and strategy.

## Features Checklist

### Must-Have Features
- **Game Setup:**
  - [x] Initialize game with a set number of players (default is 2).
  - [x] Input player names.
  - [x] Display the number of players and their initial scores.

- **Player Turns:**
  - [x] Implement turn-based system for multiple players.
  - [x] Display current player's name and total score.
  - [x] Indicate whose turn it is and prompt for the player's action.

- **Rolling the Die:**
  - [x] Simulate rolling a single six-sided die.
  - [x] Display the result of each roll.
  - [x] Add the rolled value to the player's turn score if it's not a 1.

- **Turn Score Accumulation:**
  - [x] Add rolled values to the player's turn score.
  - [x] Display the accumulated turn score during the player's turn.

- **Turn End Conditions:**
  - [x] End turn if the player rolls a 1 (turn score resets to 0).
  - [x] Allow the player to choose to hold, adding the turn score to their total score.
  - [x] Display updated total scores after holding or rolling a 1.

- **Winning Condition:**
  - [x] Check if a player’s total score reaches or exceeds the winning score (default 100).
  - [x] Announce the winner and end the game.
  - [x] Display a summary of the game with player scores.

- **User Interface:**
  - [x] Create a console-based interface.
  - [x] Display player scores and turn options (roll or hold) clearly.
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
  - [x] Allow the player to choose between single-player and multiplayer modes.

- **Advanced AI:**
  - [ ] Develop an advanced AI with improved strategies for higher difficulty.
  - [ ] Provide different difficulty levels for the AI opponent.

- **Save/Load Game:**
  - [ ] Implement functionality to save the game state to a file.
  - [ ] Implement functionality to load a saved game state.
  - [ ] Ensure the game resumes accurately from the saved state.

- **Variable Number of Players:**
  - [x] Allow customization of the number of players (more than two).
  - [x] Ensure the game adapts dynamically to different numbers of players.

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




**Pixabay**
https://pixabay.com/sound-effects/cool-hip-hop-loop-275527/