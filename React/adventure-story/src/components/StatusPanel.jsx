import React from "react";
import heartIcon from "../assets/icons/heart.png";
import goldIcon from "../assets/icons/gold.png";
import playerIcon from "../assets/icons/skull-fire.png";

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
    <div className="flex justify-around bg-zinc-900 p-4 rounded-lg mb-5 text-white">
      <StatItem icon={heartIcon} label={`Health: ${player.health}`} />
      <StatItem icon={goldIcon} label={`Gold: ${player.gold}`} />
      <StatItem icon={playerIcon} label={`Name: ${player.name}`} />
    </div>
  );
}
