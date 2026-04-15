import { useEffect, useState } from "react";
import "./App.css";

const TARGET_SCORE = 100;
const AI_HOLD_AT = 20;
const AI_DELAY = 800;

function createPlayers() {
    return [
        { name: "You", score: 0, isAI: false },
        { name: "Computer", score: 0, isAI: true },
    ];
}

export default function App() {
    const [players, setPlayers] = useState(createPlayers);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [turnScore, setTurnScore] = useState(0);
    const [diceValue, setDiceValue] = useState(null);
    const [status, setStatus] = useState("idle"); // idle | playing | ended
    const [winner, setWinner] = useState(null);

    const currentPlayer = players[currentPlayerIndex];

    function resetGame() {
        setPlayers(createPlayers());
        setCurrentPlayerIndex(0);
        setTurnScore(0);
        setDiceValue(null);
        setStatus("idle");
        setWinner(null);
    }

    function switchPlayer() {
        setCurrentPlayerIndex((prev) => (prev === 0 ? 1 : 0));
        setTurnScore(0);
    }

    function rollDie() {
        if (status === "ended") return;

        if (status === "idle") {
            setStatus("playing");
        }

        const roll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(roll);

        if (roll === 1) {
            switchPlayer();
            return;
        }

        setTurnScore((prev) => prev + roll);
    }

    function holdTurn() {
        if (status === "ended") return;
        if (turnScore === 0) return;

        if (status === "idle") {
            setStatus("playing");
        }

        const updatedPlayers = players.map((player, index) => (index === currentPlayerIndex ? { ...player, score: player.score + turnScore } : player));

        const updatedCurrentPlayer = updatedPlayers[currentPlayerIndex];

        setPlayers(updatedPlayers);

        if (updatedCurrentPlayer.score >= TARGET_SCORE) {
            setWinner(updatedCurrentPlayer.name);
            setStatus("ended");
            return;
        }

        switchPlayer();
    }

    useEffect(() => {
        if (!currentPlayer) return;
        if (!currentPlayer.isAI) return;
        if (status !== "playing") return;
        if (status === "ended") return;

        const timer = setTimeout(() => {
            if (turnScore >= AI_HOLD_AT) {
                holdTurn();
            } else {
                rollDie();
            }
        }, AI_DELAY);

        return () => clearTimeout(timer);
    }, [currentPlayer, turnScore, status]);

    if (!currentPlayer) return null;

    return (
        <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <section className="w-full max-w-xl rounded-2xl bg-white shadow-lg p-6 space-y-6">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Pig Dice Game</h1>
                    <p className="text-sm text-slate-600">First to {TARGET_SCORE} wins</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {players.map((player, index) => {
                        const isActive = index === currentPlayerIndex;

                        return (
                            <div
                                key={player.name}
                                className={`rounded-xl border p-4 transition ${isActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50"}`}
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">{player.name}</h2>
                                    {isActive && status !== "ended" && (
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">Active</span>
                                    )}
                                </div>

                                <p className="mt-3 text-3xl font-bold text-slate-800">{player.score}</p>
                                <p className="text-sm text-slate-500">Total score</p>
                            </div>
                        );
                    })}
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center space-y-3">
                    <p className="text-sm font-medium text-slate-500">{status === "ended" ? `Winner: ${winner}` : `${currentPlayer.name}'s turn`}</p>

                    <div className="text-6xl font-bold text-slate-800">{diceValue ?? "–"}</div>

                    <div>
                        <p className="text-sm text-slate-500">Turn score</p>
                        <p className="text-2xl font-semibold">{turnScore}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                        onClick={rollDie}
                        disabled={currentPlayer.isAI || status === "ended"}
                        className="rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Roll
                    </button>

                    <button
                        onClick={holdTurn}
                        disabled={currentPlayer.isAI || status === "ended" || turnScore === 0}
                        className="rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Hold
                    </button>

                    <button onClick={resetGame} className="rounded-xl bg-slate-200 px-4 py-3 font-medium text-slate-800">
                        Reset
                    </button>
                </div>
            </section>
        </main>
    );
}
