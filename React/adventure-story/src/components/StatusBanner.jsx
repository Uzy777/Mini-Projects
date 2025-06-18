import React from "react";

// ICONS //
import heartIcon from "../assets/icons/fc659.png";
import coinIcon from "../assets/icons/fc136.png";
import riskIcon from "../assets/icons/fc864.png";

function StatusBanner({ health, coin, risk }) {
  return (
    <div className="flex justify-center gap-4 bg-zinc-900 p-4 rounded-lg">
      <StatBox icon={heartIcon} label={`${health}%`} />
      <StatBox icon={coinIcon} label={coin} />
      <StatBox icon={riskIcon} label={risk} />
    </div>
  );
}

function StatBox({ icon, label }) {
  return (
    <div className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-md">
      <img src={icon} alt="" className="w-6 h-6" />
      <span className="text-white font-bold text-lg">{label}</span>
    </div>
  );
}

export default StatusBanner;
