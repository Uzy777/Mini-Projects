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

    function reset() {
        setPlayerScore(0);
        setComputerScore(0);
        setTurnScore(0);
        setCurrentPlayer("player");
        setDiceValue(null);
        setGameStatus("playing");
        setWinner(null);
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-lg space-y-6">
                {/* Title */}
                <h1 className="text-2xl font-bold text-center">\U0001f3b2 Pig Dice Game</h1>

                {/* Status */}
                <p className="text-center text-sm text-gray-600">
                    {gameStatus === "end"
                        ? winner === "player"
                            ? "U0001f389 You win!"
                            : "U0001f916 Computer wins!"
                        : currentPlayer === "player"
                        ? "Your turn"
                        : "Computer thinking..."}
                </p>

                {/* Scoreboard */}
                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg text-center ${currentPlayer === "player" ? "bg-blue-100 border border-blue-400" : "bg-gray-100"}`}>
                        <p className="text-sm text-gray-600">Player</p>
                        <p className="text-2xl font-bold">{playerScore}</p>
                    </div>

                    <div className={`p-4 rounded-lg text-center ${currentPlayer === "computer" ? "bg-red-100 border border-red-400" : "bg-gray-100"}`}>
                        <p className="text-sm text-gray-600">Computer</p>
                        <p className="text-2xl font-bold">{computerScore}</p>
                    </div>
                </div>

                {/* Dice */}
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Dice</p>
                    <p className={`text-5xl font-bold ${diceValue === 1 ? "text-red-500" : "text-gray-800"}`}>{diceValue ?? "-"}</p>
                    <p className="text-sm text-gray-600 mt-2">
                        Turn Score: <span className="font-semibold">{turnScore}</span>
                    </p>
                </div>

                {/* Controls */}
                <div className="flex gap-3">
                    <button
                        onClick={rollDie}
                        disabled={currentPlayer !== "player" || gameStatus !== "playing"}
                        className="flex-1 py-2 rounded-lg bg-blue-500 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Roll
                    </button>

                    <button
                        onClick={holdDie}
                        disabled={currentPlayer !== "player" || gameStatus !== "playing"}
                        className="flex-1 py-2 rounded-lg bg-green-500 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Hold
                    </button>
                </div>

                {/* Reset */}
                <button onClick={reset} className="w-full py-2 rounded-lg bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400">
                    Reset Game
                </button>
            </div>
        </div>
    );
}

export default App;
