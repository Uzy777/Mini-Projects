import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
    function rollDie() {
        const roll = Math.floor(Math.random() * 6) + 1;

        setDiceValue(roll);

        if (roll === 1) {
            setTurnScore(0);
            setCurrentPlayer((prev) => (prev === "player" ? "computer" : "player"));
        } else {
            setTurnScore((prev) => prev + roll);
        }
    }

    function holdDie() {
        const newScore = playerScore + turnScore;

        setPlayerScore(newScore);
        setTurnScore(0);

        if (newScore >= 100) {
            setWinner("player");
            setGameStatus("end");
        } else {
            setCurrentPlayer("computer");
        }
    }

    function computerTurn() {
        if (turnScore >= 20) {
            computerHold();
        } else {
            rollDie();
        }
    }

    function computerHold() {
        const newScore = computerScore + turnScore;

        setComputerScore(newScore);
        setTurnScore(0);

        if (newScore >= 100) {
            setWinner("computer");
            setGameStatus("end");
        } else {
            setCurrentPlayer("player");
        }
    }

    const [playerScore, setPlayerScore] = useState(0);
    const [computerScore, setComputerScore] = useState(0);
    const [turnScore, setTurnScore] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState("player");
    const [diceValue, setDiceValue] = useState(null);
    const [gameStatus, setGameStatus] = useState("playing");
    const [winner, setWinner] = useState(null);

    useEffect(() => {
        if (currentPlayer !== "computer") return;
        if (gameStatus !== "playing") return;

        const timeout = setTimeout(() => {
            computerTurn();
        }, 800);

        return () => clearTimeout(timeout);
    }, [currentPlayer, gameStatus, turnScore]);

    return (
        <>
            <button onClick={rollDie}>roll</button>
            <button onClick={holdDie}>hold</button>
            <h1 className="text-3xl font-bold underline">Hello world!</h1>
            <p>Dice Value: {diceValue}</p>
            <p>Turn Score: {turnScore}</p>
            <p>Player Score: {playerScore}</p>
            <p>Computer Score: {computerScore}</p>
            <p>Current Player: {currentPlayer}</p>
            <p>Winner: {winner}</p>
            <p>Game Status: {gameStatus}</p>
        </>
    );
}

export default App;
