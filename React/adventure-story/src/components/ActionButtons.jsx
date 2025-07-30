import React from "react";

import { useMiniGame } from "../hooks/useMiniGame";

// ICONS //
import sleepIcon from "../assets/icons/fc1087.png";
import treeIcon from "../assets/icons/fc32.png";
import warIcon from "../assets/icons/fc729.png";

const ActionButtons = ({ coin, setCoin, risk, setRisk, miniGameStatus, setMiniGameStatus, message, setMessage }) => {
  // Required for mini game
  const { handleMiniGame } = useMiniGame({ coin, setCoin, risk, setRisk, miniGameStatus, setMiniGameStatus, message, setMessage });

  // Sleep Mechanic - Reset traits back to defaults //
  const handleSleep = () => {
    setMiniGameStatus(true);
    setRisk(5);
    setMessage("You go to sleep...");
  };

  return (
    <div className="flex gap-4">
      <button onClick={handleSleep} className="bg-zinc-800 px-6 py-3 rounded-lg font-bold hover:bg-zinc-700 flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-md">
        <img src={sleepIcon} className="w-6 h-6" alt="Sleep Icon" />
        <span className="text-white font-bold text-lg">Sleep</span>
      </button>
      <button onClick={handleMiniGame} className="bg-zinc-800 px-6 py-3 rounded-lg font-bold hover:bg-zinc-700 flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-md">
        <img src={treeIcon} className="w-6 h-6" alt="Tree Icon" />
        <span className="text-white font-bold text-lg">Work</span>
      </button>
      <button className="bg-zinc-800 px-6 py-3 rounded-lg font-bold hover:bg-zinc-700 flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-md">
        <img src={warIcon} className="w-6 h-6" alt="War Icon" />
        <span className="text-white font-bold text-lg">Battle</span>
      </button>{" "}
    </div>
  );
};

export default ActionButtons;
