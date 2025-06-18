import React from "react";

// ICONS //
import settingsIcon from "../assets/icons/fc2.png";

function SettingsIcon() {
  return (
    <div className="flex justify-center gap-4 bg-zinc-900 p-4 rounded-lg">
      <img src={settingsIcon} className="w-6 h-6" />
    </div>
  );
}

export default SettingsIcon;
