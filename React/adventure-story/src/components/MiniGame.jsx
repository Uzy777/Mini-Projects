import React from "react";

function MiniGame({ handleMiniGame, coin, risk }) {
  return (
    <div>
      <h2>Mini Game</h2>
      <p>Coins: {coin}</p>
      <p>Total Risk: {risk}%</p>
      <button onClick={handleMiniGame}>Play Game</button>
    </div>
  );
}

export default MiniGame;
