import React from "react";

const StoryChoices = () => {
  return (
    <div className="w-full max-w-3xl mt-4 flex flex-col gap-3">
      <button className="w-full bg-zinc-700 hover:bg-zinc-600 text-left p-4 rounded-lg">➤ Take the left path 🌲</button>
      <button className="w-full bg-zinc-700 hover:bg-zinc-600 text-left p-4 rounded-lg">➤ Take the right path 🌳</button>
    </div>
  );
};

export default StoryChoices;
