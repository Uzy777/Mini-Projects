# \U0001f5fa\ufe0f The Lost Relics \u2013 My Game Design Plan

## \U0001f3ae My Game Concept

**The Lost Relics** is a text-based adventure game I'm building where I explore randomly generated areas, face encounters, and aim to collect 5 hidden relics. It's inspired by classic RPGs but simplified for solo development. The focus is on replayability and a sense of progression without needing a huge hand-written story.

---

## \U0001f501 My Core Game Loop

Here\u2019s the loop I want the player (and myself) to experience:

1. **Explore** a new randomly generated area.
2. **Encounter** a surprise event like:
   - An enemy
   - Treasure
   - A clue about a relic
   - A relic itself
   - Or just a quiet moment
3. **Make a decision** about what to do.
4. **React** to the outcome.
5. **Repeat** until:
   - I collect all 5 relics (WIN \U0001f3c6)
   - I lose all my health (LOSE \u2620\ufe0f)

---

## \U0001f501 Core Mechanics I\u2019m Using

### \U0001f9cd Player Stats
I\u2019ll be tracking the following things:

| Stat      | Description                          |
|-----------|--------------------------------------|
| `health`  | Starts at 100. If it hits 0, game over |
| `coin`    | Used to heal, gamble, or unlock things |
| `risk`    | Affects random event danger/reward     |
| `relics`  | The goal is to collect 5 total         |

---

### \U0001f4cd Types of Scenes/Events

Each scene is going to be randomly generated and fall into one of these types:

- **Battle** \u2013 Fight enemies. I might lose health but earn coins.
- **Treasure** \u2013 Find some coins or healing items.
- **Nothing** \u2013 Just flavor text, helps pace the game.
- **Clue** \u2013 Gives me a hint where a relic might be.
- **Relic** \u2013 One of the 5 relics I need to win!

Each scene will have:
- A `description` or message
- Optionally a background image (`media`)
- A few choices the player can pick from

---

### \U0001f30d Biomes I Want to Include

To keep it interesting, I\u2019ll have different environments (or \u201cbiomes\u201d) for variety:

- Forest \U0001f332
- Mountains \u26f0\ufe0f
- Ancient Ruins \U0001f3db\ufe0f
- Dark Caves \U0001f573\ufe0f
- Desert \U0001f3dc\ufe0f

Each biome will have different enemies, loot, and flavor. I\u2019ll rotate between them for variety using randomness.

---

## \U0001f9f1 My Current Structure

### \u2705 What I Already Have:

| Feature             | Component/Hook          |
|---------------------|-------------------------|
| Scene Display       | `<SceneBox />`          |
| Choices UI          | `<StoryChoices />`      |
| Messages            | `<MessageBox />`        |
| Player Stats        | `<StatusBanner />`      |
| Battle System       | `<Battle />`            |
| MiniGame for Coins  | `<MiniGame />`          |
| Persistent State    | `usePersistentState()`  |
| Name Changing       | `useChangeName()`       |
| Settings UI         | `<SettingsModal />`     |

### \U0001f9e9 What I Plan to Add:

- A `generateScene()` function to procedurally create new scenes
- A way to track collected `relics`
- Logic to detect and display win or lose screens
- Possibly a way to log past events or inventory
- Eventually remove the hardcoded `storyData`

---

## \U0001f3c1 How I\u2019ll Know the Game Ends

### \u2705 Win:
- If I collect all **5 relics**, show a big win message

### \u274c Lose:
- If my health hits **0**, show a game over screen and offer a restart

---

## \U0001f3a8 My Design Values

- **Exploration** \u2013 I want the player to feel like they\u2019re on an unpredictable journey.
- **Progression** \u2013 Coins, relics, and healing give a sense of growth.
- **Danger** \u2013 Random events add suspense and decision-making.
- **Replayability** \u2013 No two runs should feel the same.
- **Simplicity** \u2013 Keep things minimal, focus on fun.

---

## \U0001f52e Future Ideas

Here are things I might try later:

- Add items and inventory
- Add more than 5 relics, maybe some are fake?
- Introduce XP or a leveling system
- Add mini towns where I can rest or trade
- Add random \u201cboss\u201d enemies guarding relics
- Optional side quests or companions?

---

## \U0001f6e0\ufe0f Next Steps For Me

1. Write a `generateScene()` function that returns a random scene object
2. Add a state variable to track how many relics I\u2019ve found
3. Modify `<StoryChoices />` to use this dynamic scene instead of static data
4. Add win/lose logic into the main component
5. Later: consider saving the relics state so it persists across sessions

---

## \U0001f4ad Final Thoughts

This version of the game gives me a **clear goal**, **unlimited playtime**, and a much more sustainable structure than manually writing every path. It keeps my code clean, my focus sharp, and my imagination engaged. I can build this in parts, test it as I go, and expand when I\u2019m ready.

Let\u2019s go find those relics!
