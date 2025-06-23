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
import SettingsModal from "./components/SettingsModal";
import SceneBox from "./components/SceneBox";
import MessageBox from "./components/MessageBox";
import ActionButtons from "./components/ActionButtons";
import StoryChoices from "./components/StoryChoices";

// CSS //
import "./index.css";

// Story Data //
const storyData = {
  start: {
    message: "You wake up in a dark forest. Two paths lie ahead.",
    media: "/assets/scenes/test.jpg", // or a full path: "/assets/scenes/forest.jpg"
    choices: [
      { text: "Take the left path 🌲", next: "leftPath" },
      { text: "Take the right path 🌳", next: "rightPath" },
    ],
  },
  leftPath: {
    message: "You find a river. It's too wide to cross.",
    media: "/assets/scenes/river.jpg",
    choices: [
      { text: "Go back 🔙", next: "start" },
      { text: "Follow the river upstream 🐟", next: "upstream" },
    ],
  },
  rightPath: {
    message: "You encounter a sleeping dragon! 🐉",
    media: "/assets/scenes/dragon.jpg",
    choices: [
      { text: "Try to sneak past 🕵️", next: "sneak" },
      { text: "Run away! 🏃", next: "start" },
    ],
  },
  upstream: {
    message: "You find a small boat. You win! 🛶",
    media: "/assets/scenes/boat.jpg",
    choices: [],
  },
  sneak: {
    message: "The dragon wakes up and eats you. Game over! ☠️",
    media: "/assets/scenes/test.gif",
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
  const [showSettings, setShowSettings] = useState(false);

  // HANDLE BUTTONS //
  // Reset //
  const handleReset = () => {
    setHealth(100);
    setCoin(50);
    setMiniGameStatus(true);
    setRisk(5);
    setCurrentScene("start");
    setMessage("Reset everything!");
  };

  const scene = storyData[currentScene];

  // Required for name change
  const { isEditing, tempName, setTempName, setIsEditing, handleSave } = useChangeName(playerName, setName);

  // DISPLAY APPLICATION //
  return (
    <div>
      <div className="flex items-center justify-center">
        <StatusBanner health={health} coin={coin} risk={risk} />
      </div>

      <p>Mini Game Status: {String(miniGameStatus)}</p>

      {/* <p>{scene.text}</p>
      <div>
        {scene.choices.map((choice, index) => (
          <button key={index} onClick={() => setCurrentScene(choice.next)}>
            {choice.text}
          </button>
        ))}
      </div> */}

      <div className="flex items-center justify-center">
        <SceneBox media={scene.media} />
      </div>
      <br></br>
      <div className="flex items-center justify-center">
        <MessageBox currentScene={scene.message} message={message} />
      </div>
      <div className="flex items-center justify-center">
        <StoryChoices choices={scene.choices} onSelect={setCurrentScene} />
      </div>
      <br></br>
      <div className="flex items-center justify-center">
        <ActionButtons
          setMiniGameStatus={setMiniGameStatus}
          setRisk={setRisk}
          setMessage={setMessage}
          coin={coin}
          setCoin={setCoin}
          risk={risk}
          miniGameStatus={miniGameStatus}
          message={message}
        />
      </div>

      <ChangeName isEditing={isEditing} tempName={tempName} setTempName={setTempName} setIsEditing={setIsEditing} handleSave={handleSave} playerName={playerName} />
      <button onClick={handleReset}>Reset</button>
      <hr></hr>

      <div className="absolute bottom-2 left-2">
        <SettingsIcon onClick={() => setShowSettings(true)} />
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} playerName={playerName} setName={setName} />}
      </div>
    </div>
  );
}

export default App;
