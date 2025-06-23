import React from "react";

const SceneBox = ({ media }) => {
  return (
    <div className="w-full max-w-3xl h-90 bg-zinc-800 rounded-lg overflow-hidden shadow-lg">
      <img src={media} alt="Scene" className="object-cover w-full h-full" />
    </div>
  );
};

export default SceneBox;
