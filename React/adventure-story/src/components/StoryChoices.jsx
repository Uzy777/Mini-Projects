import React from "react";

export default function StoryChoices({ choices, onSelect }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
      {choices.map((choice, i) => (
        <button
          key={i}
          onClick={() => onSelect(choice.next)}
          className="py-3 px-4 rounded-md bg-zinc-700 text-white text-left text-lg hover:bg-zinc-600 transition-colors"
        >
          {choice.text}
        </button>
      ))}
    </div>
  );
}
