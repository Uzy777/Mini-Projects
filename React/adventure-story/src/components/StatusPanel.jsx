import React from "react";

import heartIcon from "../assets/icons/heart.png";
import goldIcon from "../assets/icons/gold.png";
import playerIcon from "../assets/icons/skull-fire.png";

import bronzeKeyIcon from "../assets/icons/bronze-key.png";
import silverKeyIcon from "../assets/icons/silver-key.png";
import goldKeyIcon from "../assets/icons/gold-key.png";
import titaniumKeyIcon from "../assets/icons/titanium-key.png";
import forestKeyIcon from "../assets/icons/forest-key.png";
import waterKeyIcon from "../assets/icons/water-key.png";
import fireKeyIcon from "../assets/icons/fire-key.png";
import demonKeyIcon from "../assets/icons/demon-key.png";




const keyIcons = {
  bronze: bronzeKeyIcon,
  silver: silverKeyIcon,
  gold: goldKeyIcon,
  titanium: titaniumKeyIcon,
  forest: forestKeyIcon,
  water: waterKeyIcon,
  fire: fireKeyIcon,
  demon: demonKeyIcon,
}

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

export default function StatusPanel({ player }) {
  return (
    <div className="flex justify-around bg-zinc-900 p-4 rounded-lg mb-5 text-white" >
      <StatItem icon={heartIcon} label={`Health: ${player.health}`} />
      <StatItem icon={goldIcon} label={`Gold: ${player.gold}`} />
      <StatItem icon={playerIcon} label={`Name: ${player.name}`} />
      <div className="flex items-center gap-2">
        <span className="text-white font-semibold">Keys:</span>
        <KeysCollected keys={player.keys} />
      </div>
    </div>
  );
}
