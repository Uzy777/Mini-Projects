// IMPORTS //
// Hooks //
import { useState, useEffect } from "react";
import { usePersistentState } from "./hooks/usePersistentState";
import { useChangeName } from "./hooks/useChangeName";
import { useMiniGame } from "./hooks/useMiniGame";

// Components //
import MiniGame from "./components/MiniGame";
import ChangeName from "./components/ChangeName";
import StatusBanner from "./components/StatusBanner";
import SettingsIcon from "./components/SettingsIcon";

// CSS //
import "./index.css";

// Story Data //
const storyData = {
  start: {
    text: "You wake up in a dark forest. Two paths lie ahead.",
    choices: [
      { text: "Take the left path 🌲", next: "leftPath" },
      { text: "Take the right path 🌳", next: "rightPath" },
    ],
  },
  leftPath: {
    text: "You find a river. It's too wide to cross.",
    choices: [
      { text: "Go back 🔙", next: "start" },
      { text: "Follow the river upstream 🐟", next: "upstream" },
    ],
  },
  rightPath: {
    text: "You encounter a sleeping dragon! 🐉",
    choices: [
      { text: "Try to sneak past 🕵️", next: "sneak" },
      { text: "Run away! 🏃", next: "start" },
    ],
  },
  upstream: {
    text: "You find a small boat. You win! 🛶",
    choices: [],
  },
  sneak: {
    text: "The dragon wakes up and eats you. Game over! ☠️",
    choices: [],
  },
};

function App() {
  // Persistent State Variables //
  const [playerName, setName] = usePersistentState("playerName", "ABC");
  const [health, setHealth] = usePersistentState("health", 100);
  const [coin, setCoin] = usePersistentState("coin", 50);
  const [miniGameStatus, setMiniGameStatus] = usePersistentState("miniGameStatus", true);
  const [risk, setRisk] = usePersistentState("risk", 5);
  const [currentScene, setCurrentScene] = usePersistentState("currentScene", "start");

  // State Variables //
  const [message, setMessage] = useState("");

  // HANDLE BUTTONS //
  // Reset //
  const handleReset = () => {
    setHealth(100);
    setCoin(50);
    setMiniGameStatus(true);
    setRisk(5);
    setMessage("Reset everything!");
  };

  // Sleep Mechanic - Reset traits back to defaults //
  const handleSleep = () => {
    setMiniGameStatus(true);
    setRisk(5);
    setMessage("You go to sleep...");
  };

  const scene = storyData[currentScene];

  // Required for name change
  const { isEditing, tempName, setTempName, setIsEditing, handleSave } = useChangeName(playerName, setName);

  // Required for mini game
  const { handleMiniGame } = useMiniGame({ coin, setCoin, risk, setRisk, miniGameStatus, setMiniGameStatus, message, setMessage });

  // DISPLAY APPLICATION //
  return (
    <div>
      <div className="flex items-center justify-center">
        <StatusBanner health={health} coin={coin} risk={risk} />
      </div>

      <p>Mini Game Status: {String(miniGameStatus)}</p>
      <div>
        <p>
          Status: <strong>{message}</strong>
        </p>
      </div>

      {/* <p>{scene.text}</p>
      <div>
        {scene.choices.map((choice, index) => (
          <button key={index} onClick={() => setCurrentScene(choice.next)}>
            {choice.text}
          </button>
        ))}
      </div> */}

      <button onClick={handleSleep}>Sleep</button>
      <button onClick={handleMiniGame}>Mini Game</button>

      {/* <button>Settings</button>
      <button>How to play</button> */}

      <ChangeName isEditing={isEditing} tempName={tempName} setTempName={setTempName} setIsEditing={setIsEditing} handleSave={handleSave} playerName={playerName} />
      <button onClick={handleReset}>Reset</button>
      <hr></hr>
      <MiniGame handleMiniGame={handleMiniGame} coin={coin} risk={risk} />

      <div className="absolute bottom-2 left-2">
        <SettingsIcon />
      </div>
    </div>
  );
}

export default App;
