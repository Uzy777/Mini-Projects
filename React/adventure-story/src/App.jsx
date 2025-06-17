import { useState, useEffect } from "react";

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

// Custom Hook - Persistent State
function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    try {
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });

  // Update on Value Change
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function App() {
  const [playerName, setName] = usePersistentState("playerName", "ABC");
  // const [health, setHealth] = usePersistentState("health", 100);
  const [coin, setCoin] = usePersistentState("coin", 50);
  const [miniGameStatus, setMiniGameStatus] = usePersistentState("miniGameStatus", true);
  const [risk, setRisk] = usePersistentState("risk", 5);

  const handleReset = () => {
    // setHealth(100);
    setCoin(50);
    setMiniGameStatus(true);
    setRisk(5);
  };

  // Player Stats
  // const [health, setHealth] = useState(100)

  const [currentScene, setCurrentScene] = useState("start");

  const scene = storyData[currentScene];

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  // Input Name Change
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");

  const handleSave = () => {
    if (tempName.trim()) {
      setName(tempName);
    }
    setTempName("");
    setIsEditing(false);
  };

  // Mini Game Mechanic

  const handleMiniGame = () => {
    // Calculate Fail Chance
    const failChance = Math.floor(Math.random() * 100);
    console.log("fail chance:", failChance);

    // When Mini Game Status = True
    if (miniGameStatus === true) {
      setCoin(coin + Math.floor(Math.random() * 10) + 1);

      setRisk((prevRisk) => prevRisk + 5);

      // 1% Chance to earn 1000 coin
      if (Math.random() < 0.01) {
        setCoin((prevCoin) => prevCoin + 1000);
      }

      // Risk to great - loose coin and unable to continue
      if (risk > failChance) {
        const lossCoinAmount = Math.floor(coin * 0.75);
        setCoin((prevCoin) => prevCoin - lossCoinAmount);
        console.log("coin:", coin);

        console.log("lost:", { lossCoinAmount });

        setMiniGameStatus(false);
      }
    }
  };

  // Sleep Mechanic - Reset traits back to defaults
  const handleSleep = () => {
    setMiniGameStatus(true);
    setRisk(5);
  };

  return (
    <div>
      <h1>Title</h1>
      <h2>Welcome xxx</h2>

      <p>
        Your name is <strong>{playerName}</strong>
      </p>
      <p>Total Coins: {coin}</p>
      <p>Mini Game Status: {String(miniGameStatus)}</p>
      <p>Risk: {risk}%</p>

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
      {isEditing ? (
        <div>
          <input
            type="text"
            value={tempName}
            placeholder="Enter new name"
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave();
              }
            }}
          />
          <button onClick={handleSave}>Save</button>
        </div>
      ) : (
        <button onClick={() => setIsEditing(true)}>Change Name ({playerName})</button>
      )}
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}

export default App;
