import React from "react";
import { usePersistentState } from "./hooks/usePersistentState";
import StatusPanel from "./components/StatusPanel";
import SceneDisplay from "./components/SceneDisplay";
import StoryChoices from "./components/StoryChoices";
import SceneImage from "./components/SceneImage";

import { weakEnemies, mediumEnemies, strongEnemies } from "./data/enemies";



const initialPlayer = {
  name: "ABC",
  health: 100,
  gold: 50,
  keys: {
    bronze: false,
    silver: false,
    gold: false,
    titanium: false,
    green: false,
    blue: false,
    orange: false,
    purple: false,
  }
};

const initialScene = {
  message: "You stand at a crossroad. Which way do you go?",
  image: "/assets/scenes/test.jpg",
  choices: [
    { text: "Go left", next: "left" },
    { text: "Go right", next: "right" },
  ],
};

function NewApp() {
  const [player, setPlayer] = usePersistentState("player", initialPlayer);
  const [scene, setScene] = usePersistentState("scene", initialScene);

  const handleChoice = (next) => {
    if (next === "left") {
      setScene({
        message: "You took the left path and found a treasure!",
        choices: [{ text: "Continue", next: "start" }],
      });
      setPlayer((p) => ({ ...p, gold: p.gold + 10 }));

      // Collect a key
      setPlayer(prev => ({
        ...prev,
        keys: {
          ...prev.keys,
          bronze: true // or whichever key was found
        }
      }));
      
    } else if (next === "right") {
      setScene({
        message: "You met a monster and lost some health!",
        choices: [{ text: "Run back", next: "start" }],
      });
      setPlayer((p) => ({ ...p, health: p.health - 20 }));
    } else {
      setScene(initialScene);
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm("Are you sure you want to reset your progress?");
    if (confirmed) {
      setPlayer(initialPlayer);
      setScene(initialScene);
      localStorage.removeItem("player");
      localStorage.removeItem("scene");
    }
  }

  const handleEnemy = () => {
    const random = Math.random();

    let group;
    let enemyDamage;
    if (random < 0.7) {
      group = weakEnemies;    // 70% Chance
      enemyDamage = Math.floor(Math.random() * 5) + 1;  // 1 - 5 Damage
    } else if (random < 0.95) {
      group = mediumEnemies;  // 25% Chance
      enemyDamage = Math.floor(Math.random() * (15 - 5 + 1)) + 5; // 5 - 15 Damage
    } else {
      group = strongEnemies;  // 5% Chance
      enemyDamage = Math.floor(Math.random() * (30 - 15 + 1)) + 15; // 15 - 30 Damage
    }


    const randomEnemy = group[Math.floor(Math.random() * group.length)];
    console.log(random);
    console.log(randomEnemy);
    console.log(enemyDamage);
  }


  handleEnemy()
  return (
    <div className="max-w-xl mx-auto p-6 font-sans">
      <StatusPanel player={player} />
      <SceneImage src={scene.image} />
      <SceneDisplay message={scene.message} />
      <StoryChoices choices={scene.choices} onSelect={handleChoice} />

      <div className="mt-6 flex justify-center">
        <button onClick={handleReset} className="">Reset Progress</button>
      </div>
    </div>
  );
}

export default NewApp;
