import React from "react";

import testImage from "../assets/test.jpg";

const SceneBox = () => {
  return (
    <div className="w-full max-w-3xl h-60 bg-zinc-800 rounded-lg overflow-hidden shadow-lg">
      <img src={testImage} alt="Scene" className="object-cover w-full h-full" />
    </div>
  );
};

export default SceneBox;
