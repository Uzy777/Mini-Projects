import { useState } from "react";

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
  const [currentScene, setCurrentScene] = useState("start");
  const [name, setName] = useState("ABC");

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

  return (
    <div>
      <h1>Adventure Game</h1>
      <h2>Welcome xxx</h2>

      <p>
        Your name is <strong>{name}</strong>
      </p>
      {/* <p>{scene.text}</p>
      <div>
        {scene.choices.map((choice, index) => (
          <button key={index} onClick={() => setCurrentScene(choice.next)}>
            {choice.text}
          </button>
        ))}
      </div> */}

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
        <button onClick={() => setIsEditing(true)}>Change Name ({name})</button>
      )}
    </div>
  );
}

export default App;
