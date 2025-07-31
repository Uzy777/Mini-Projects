import React from "react";

export default function SceneDisplay({ message }) {
  return (
    <div className="bg-zinc-700 text-zinc-200 p-5 rounded-lg min-h-[100px] mb-5">
      <p>{message}</p>
    </div>
  );
}
