import React from "react";

const ActionButtons = () => {
  return (
    <div className="flex gap-4">
      <button className="bg-zinc-800 px-6 py-3 rounded-lg font-bold hover:bg-zinc-700">Sleep</button>
      <button className="bg-zinc-800 px-6 py-3 rounded-lg font-bold hover:bg-zinc-700">Work</button>
      <button className="bg-zinc-800 px-6 py-3 rounded-lg font-bold hover:bg-zinc-700">Battle</button>
    </div>
  );
};

export default ActionButtons;
