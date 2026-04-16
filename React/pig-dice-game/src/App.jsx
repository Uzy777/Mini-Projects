import { useEffect, useState } from "react";

function createPlayers() {
    return [
        { name: "Player 1", score: 0 },
        { name: "Player 2", score: 0 },
    ];
}

export default function App() {
    const [players, setPlayers] = useState(createPlayers);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [turnScore, setTurnScore] = useState(0);
    const [diceValue, setDiceValue] = useState(null);
    const [status, setStatus] = useState("idle");
    const [winner, setWinner] = useState(null);
    const [targetScore, setTargetScore] = useState(100);
    const [darkMode, setDarkMode] = useState(false);
    const [sound, setSound] = useState(true);

    const currentPlayer = players[currentPlayerIndex];

    // Sounds
    const dieRollSound = new Audio("./sounds/dice_roll.mp3");
    const bankRollSound = new Audio("./sounds/bank_roll.mp3");
    const failRollOneSound = new Audio("./sounds/fail.mp3");
    const winnerSound = new Audio("./sounds/win.mp3");

    useEffect(() => {
        const savedTheme = localStorage.getItem("pig-dice-theme");
        setDarkMode(savedTheme === "dark");
    }, []);

    useEffect(() => {
        localStorage.setItem("pig-dice-theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    useEffect(() => {
        function handleKeyPress(e) {
            const key = e.key.toLowerCase();

            if (key === "r") {
                rollDie();
            }

            if (key === "b") {
                bankTurn();
            }
        }

        window.addEventListener("keydown", handleKeyPress);

        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [status, turnScore, currentPlayerIndex, players, targetScore]);

    function playSound(audio) {
        if (!sound) return;

        audio.currentTime = 0;
        audio.play();
    }

    function resetGame(newTargetScore = targetScore) {
        setPlayers(createPlayers());
        setCurrentPlayerIndex(0);
        setTurnScore(0);
        setDiceValue(null);
        setStatus("idle");
        setWinner(null);
        setTargetScore(newTargetScore);
    }

    function switchPlayer() {
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
        setTurnScore(0);
    }

    function rollDie() {
        if (status === "ended") return;

        if (status === "idle") {
            setStatus("playing");
        }

        const roll = Math.floor(Math.random() * 6) + 1;
        playSound(dieRollSound);

        setDiceValue(roll);

        if (roll === 1) {
            switchPlayer();
            playSound(failRollOneSound);
            return;
        }

        setTurnScore((prev) => prev + roll);
    }

    function bankTurn() {
        if (status === "ended" || turnScore === 0) return;

        if (status === "idle") {
            setStatus("playing");
        }

        playSound(bankRollSound);

        const updatedPlayers = players.map((player, index) => (index === currentPlayerIndex ? { ...player, score: player.score + turnScore } : player));

        const updatedCurrentPlayer = updatedPlayers[currentPlayerIndex];

        setPlayers(updatedPlayers);

        if (updatedCurrentPlayer.score >= targetScore) {
            playSound(winnerSound);
            setWinner(updatedCurrentPlayer.name);
            setStatus("ended");
            return;
        }

        switchPlayer();
    }

    if (!currentPlayer) return null;

    return (
        <div className={darkMode ? "dark" : ""}>
            <main className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
                <div className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center p-4">
                    <section className="w-full rounded-2xl bg-white p-6 shadow-lg space-y-6 dark:bg-slate-900 dark:shadow-2xl">
                        <header className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold">Pig Dice Game</h1>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">First to {targetScore} wins</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setDarkMode((prev) => !prev)}
                                        className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                                    >
                                        {darkMode ? "☀ Light" : "🌙 Dark"}
                                    </button>
                                    <button
                                        onClick={() => setSound((prev) => !prev)}
                                        className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                                    >
                                        {sound ? "🔊 On" : "🔇 Off"}
                                    </button>
                                </div>
                            </div>
                        </header>

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => resetGame(50)}
                                disabled={status === "playing"}
                                className={`rounded-xl border px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                    targetScore === 50
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                                }`}
                            >
                                Play to 50
                            </button>

                            <button
                                onClick={() => resetGame(100)}
                                disabled={status === "playing"}
                                className={`rounded-xl border px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                    targetScore === 100
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                                }`}
                            >
                                Play to 100
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {players.map((player, index) => {
                                const isActive = index === currentPlayerIndex;

                                return (
                                    <div
                                        key={player.name}
                                        className={`rounded-xl border p-4 transition ${
                                            isActive
                                                ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/40"
                                                : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold">{player.name}</h2>

                                            {isActive && status !== "ended" && (
                                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                                                    Active
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-3 text-3xl font-bold">{player.score}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Total score</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div
                            className={`rounded-2xl border p-6 text-center space-y-3 transition ${
                                status === "ended"
                                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                                    : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                            }`}
                        >
                            {status === "ended" ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Game Over</p>
                                    <p className="text-3xl font-bold">🎉 {winner} wins!</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">First to {targetScore} points.</p>
                                </div>
                            ) : (
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{currentPlayer.name}'s turn</p>
                            )}

                            <div className="text-6xl font-bold">{diceValue ?? "–"}</div>

                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Turn score</p>
                                <p className="text-2xl font-semibold">{turnScore}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <button
                                onClick={rollDie}
                                disabled={status === "ended"}
                                className="rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Roll [r]
                            </button>

                            <button
                                onClick={bankTurn}
                                disabled={status === "ended" || turnScore === 0}
                                className="rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Bank [b]
                            </button>

                            <button
                                onClick={() => resetGame()}
                                className="rounded-xl bg-slate-200 px-4 py-3 font-medium text-slate-800 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                            >
                                {status === "ended" ? "Play Again" : "Reset"}
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
