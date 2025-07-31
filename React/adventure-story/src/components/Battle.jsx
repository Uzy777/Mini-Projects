import React, { useState } from 'react';


export default function Battle({ health, setHealth, setMessage }) {
  // Just an example attack that reduces health by 10
  const attack = () => {
    setHealth((h) => Math.max(0, h - 10));
    setMessage("take 10 damage hahahahahahahahahahaahhaah")
  };

  return (
    <div>
      <h2>Battle</h2>
      <p>Player Health: {health}</p>
      <button onClick={attack}>Attack (take 10 damage)</button>
    </div>
  );
}