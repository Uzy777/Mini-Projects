import React from "react";

// ICONS //
import settingsIcon from "../assets/icons/setting-cog.png";

function SettingsIcon({ onClick }) {
  return (
    <button onClick={onClick} className="flex justify-center gap-4 bg-zinc-900 p-4 rounded-lg" title="Open Settings">
      <img src={settingsIcon} className="w-6 h-6" alt="Settings" />
    </button>
  );
}

export default SettingsIcon;
