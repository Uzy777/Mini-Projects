import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
    /* =====================
       GAME STATE
    ====================== */
    const [gameMode, setGameMode] = useState("human-ai"); // "human-ai" | "human-human"
    const [playerCount, setPlayerCount] = useState(2);
    const [targetScore, setTargetScore] = useState(100);
    const [players, setPlayers] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [turnScore, setTurnScore] = useState(0);
    const [diceValue, setDiceValue] = useState(null);
    const [gameStatus, setGameStatus] = useState("setup"); // playing | end
    const [winner, setWinner] = useState(null);

    const currentPlayer = players[currentPlayerIndex];

    /* =====================
       PLAYER LOGIC
    ====================== */
    function createPlayers(mode, count) {
        if (mode === "human-ai") {
            return [
                { name: "Player", score: 0, isAI: false },
                { name: "Computer", score: 0, isAI: true },
            ];
        }

        return Array.from({ length: count }, (_, i) => ({
            name: `Player ${i + 1}`,
            score: 0,
            isAI: false,
        }));
    }

    /* =====================
       RESET GAME
    ====================== */
    function resetGame(overrides = {}) {
        const mode = overrides.gameMode ?? gameMode;
        const count = overrides.playerCount ?? playerCount;

        setPlayers(createPlayers(mode, count));
        setCurrentPlayerIndex(0);
        setTurnScore(0);
        setDiceValue(null);
        setWinner(null);
        setGameStatus("setup");
    }

    useEffect(() => {
        resetGame();
    }, []);

    /* =====================
       GAME LOGIC
    ====================== */
    function nextPlayer() {
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
        setTurnScore(0);
    }

    function rollDie() {
        if (gameStatus === "setup") {
            setGameStatus("playing");
        }
        const roll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(roll);

        if (roll === 1) {
            nextPlayer();
        } else {
            setTurnScore((prev) => prev + roll);
        }
    }

    function holdDie() {
        const updatedPlayers = [...players];
        const player = updatedPlayers[currentPlayerIndex];

        player.score += turnScore;

        if (player.score >= targetScore) {
            setPlayers(updatedPlayers);
            setWinner(player.name);
            setGameStatus("end");
            return;
        }

        setPlayers(updatedPlayers);
        nextPlayer();
    }

    /* =====================
       AI TURN
    ====================== */
    useEffect(() => {
        if (!currentPlayer || !currentPlayer.isAI) return;
        if (gameStatus !== "playing") return;

        const timeout = setTimeout(() => {
            if (turnScore >= 20) {
                holdDie();
            } else {
                rollDie();
            }
        }, 800);

        return () => clearTimeout(timeout);
    }, [currentPlayerIndex, turnScore, gameStatus]);

    if (!currentPlayer) return null;

    console.log(gameStatus);

    /* =====================
       UI
    ====================== */
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-xl shadow space-y-5">
                <h1 className="text-2xl font-bold text-center">🎲 Pig Dice Game</h1>

                {/* SETUP */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Game Mode</label>
                    <select
                        value={gameMode}
                        onChange={(e) => {
                            setGameMode(e.target.value);
                            resetGame();
                        }}
                        className="w-full border rounded p-1"
                        disabled={gameStatus === "playing"}
                    >
                        <option value="human-ai">Human vs Computer</option>
                        <option value="human-human">Human vs Human</option>
                    </select>

                    {gameMode === "human-human" && (
                        <>
                            <label className="block text-sm font-medium">Players (2–8)</label>
                            <input
                                type="number"
                                min={2}
                                max={8}
                                value={playerCount}
                                onChange={(e) => {
                                    const count = Number(e.target.value);
                                    setPlayerCount(count);
                                    resetGame({ playerCount: count });
                                }}
                                className="w-full border rounded p-1"
                                disabled={gameStatus === "playing"}
                            />
                        </>
                    )}

                    <label className="block text-sm font-medium">Target Score</label>
                    <input
                        type="number"
                        min={25}
                        step={5}
                        value={targetScore}
                        onChange={(e) => {
                            setTargetScore(Number(e.target.value));
                            resetGame();
                        }}
                        className="w-full border rounded p-1"
                        disabled={gameStatus === "playing"}
                    />
                </div>

                {/* STATUS */}
                <p className="text-center text-sm text-gray-600">{gameStatus === "end" ? `🏆 ${winner} wins!` : `${currentPlayer.name}'s turn`}</p>

                {/* PLAYERS */}
                <div className="space-y-2">
                    {players.map((p, i) => (
                        <div key={i} className={`p-2 rounded ${i === currentPlayerIndex ? "bg-blue-200" : "bg-gray-100"}`}>
                            <p className="font-semibold">{p.name}</p>
                            <p>Score: {p.score}</p>
                        </div>
                    ))}
                </div>

                {/* DICE */}
                <div className="text-center">
                    <p className="text-5xl font-bold">{diceValue ?? "-"}</p>
                    <p className="text-sm">Turn Score: {turnScore}</p>
                </div>

                {/* CONTROLS */}
                <div className="flex gap-3">
                    <button onClick={rollDie} disabled={currentPlayer.isAI} className="flex-1 py-2 bg-blue-500 text-white rounded disabled:opacity-40">
                        Roll
                    </button>
                    <button
                        onClick={holdDie}
                        disabled={currentPlayer.isAI || gameStatus !== "playing"}
                        className="flex-1 py-2 bg-green-500 text-white rounded disabled:opacity-40"
                    >
                        Hold
                    </button>
                </div>

                <button onClick={resetGame} className="w-full py-2 bg-gray-300 rounded">
                    Reset Game
                </button>
            </div>
        </div>
    );
}
