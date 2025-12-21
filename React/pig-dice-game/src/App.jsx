import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
    function rollDie() {
        const roll = Math.floor(Math.random() * 6) + 1;

        setDiceValue(roll);

        if (roll === 1) {
            setTurnScore(0);
            setCurrentPlayer("computer");
        } else {
            setTurnScore((prev) => prev + roll);
        }
    }

    const [playerScore, setPlayerScore] = useState(0);
    const [computerScore, setComputerScore] = useState(0);
    const [turnScore, setTurnScore] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [diceValue, setDiceValue] = useState(null);
    const [gameStatus, setGameStatus] = useState(null);
    const [winner, setWinner] = useState(null);

    return (
        <>
            <button onClick={rollDie}>roll</button>
            <h1 className="text-3xl font-bold underline">Hello world!</h1>
            <p>Dice Value: {diceValue}</p>
            <p>Turn Score: {turnScore}</p>
            <p>Current Player: {currentPlayer}</p>
        </>
    );
}

export default App;
