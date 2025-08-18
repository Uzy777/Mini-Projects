import React from "react";

import heartIcon from "../assets/icons/heart.png";
import goldIcon from "../assets/icons/gold.png";
import playerIcon from "../assets/icons/skull-fire.png";

import { keyIcons } from "../data/keyIcons";


function KeysCollected({ keys }) {
  if (!keys) return null; // safeguard
  return (
    <div className="grid grid-cols-4 gap-2">
      {Object.entries(keys).map(([keyName, collected]) =>
        collected ? (
          <img
            key={keyName}
            src={keyIcons[keyName]}
            alt={`${keyName} key`}
            title={`${keyName} key`}
            className="w-5 h-5"
          />
        ) : null
      )}
    </div>
  )
}



function StatItem({ icon, label }) {
  return (
    <div className="flex items-center gap-2">
      <img src={icon} alt="" className="w-5 h-5" />
      <span className="text-white font-semibold">{label}</span>
    </div>
  );
}

export default function StatusPanel({ player, activeBiome }) {
  return (
<div className="bg-zinc-900 p-4 rounded-lg mb-5 text-white">
  <div className="flex justify-around">
    <StatItem icon={heartIcon} label={`Health: ${player.health}`} />
    <StatItem icon={goldIcon} label={`Gold: ${player.gold}`} />
    <StatItem icon={playerIcon} label={`Name: ${player.name}`} />
    <div className="flex items-center gap-2">
      <span className="text-white font-semibold">Keys:</span>
      <KeysCollected keys={player.keys} />
    </div>
  </div>

  <div className="flex justify-around bg-zinc-900 mt-4 rounded-lg text-white">
    <p>{activeBiome}</p>
  </div>
</div>

  );
}
