import React from "react";

const StoryChoices = ({ choices, onSelect }) => {
  return (
    <div className="w-full max-w-3xl mt-4 flex flex-col gap-3">
      {choices.map((choice, index) => (
        <button key={index} onClick={() => onSelect(choice.next)} className="w-full bg-zinc-700 hover:bg-zinc-600 text-left p-4 rounded-lg">
          ➤ {choice.text}
        </button>
      ))}
    </div>
  );
};

export default StoryChoices;
