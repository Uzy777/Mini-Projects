import React from "react";

// ICONS //
import scrollIcon from "../assets/icons/paper-writing.png";
import musicIcon from "../assets/icons/music-note.png";

function SettingsModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4 text-center">Settings</h2>

        <p className="mb-4 text-sm text-gray-300 flex justify-center gap-2">
          <img src={scrollIcon} className="w-6 h-6" alt="Scroll Icon" />
          <span>Change Name (ABC)</span>
        </p>
        <p className="mb-4 text-sm text-gray-300 flex justify-center gap-2">
          <img src={musicIcon} className="w-6 h-6" alt="Scroll Icon" />
          <span>Sound Effects (On)</span>
        </p>
        <p className="mb-4 text-sm text-gray-300 flex justify-center gap-2">
          <img src={musicIcon} className="w-6 h-6" alt="Scroll Icon" />
          <span>Music (Off)</span>
        </p>

        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
