import React from "react";
import { usePersistentState } from "./hooks/usePersistentState";
import StatusPanel from "./components/StatusPanel";
import SceneDisplay from "./components/SceneDisplay";
import StoryChoices from "./components/StoryChoices";
import SceneImage from "./components/SceneImage";

const initialPlayer = {
  name: "ABC",
  health: 100,
  gold: 50,
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
