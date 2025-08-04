import React from "react";

import heartIcon from "../assets/icons/heart.png";
import goldIcon from "../assets/icons/gold.png";
import playerIcon from "../assets/icons/skull-fire.png";

import bronzeKeyIcon from "../assets/icons/bronze-key.png";
import silverKeyIcon from "../assets/icons/silver-key.png";
import goldKeyIcon from "../assets/icons/gold-key.png";
import titaniumKeyIcon from "../assets/icons/titanium-key.png";
import greenKeyIcon from "../assets/icons/green-key.png";
import blueKeyIcon from "../assets/icons/blue-key.png";
import orangeKeyIcon from "../assets/icons/orange-key.png";
import purpleKeyIcon from "../assets/icons/purple-key.png";




const keyIcons = {
  bronze: bronzeKeyIcon,
  silver: silverKeyIcon,
  gold: goldKeyIcon,
  titanium: titaniumKeyIcon,
  green: greenKeyIcon,
  blue: blueKeyIcon,
  orange: orangeKeyIcon,
  purple: purpleKeyIcon,
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
