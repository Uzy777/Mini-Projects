import { useState, useEffect, useRef } from "react";
import "./index.css";

export default function App() {
    const targetText = "i love typing react code";
    const [input, setInput] = useState("");
    const [finalWPM, setFinalWPM] = useState(null);
    const startTimeRef = useRef(null);
    const inputRef = useRef(null);

    // Start timer when user types the first character
    const handleChange = (e) => {
        if (!startTimeRef.current) startTimeRef.current = Date.now();
        const value = e.target.value;
        setInput(value);

        if (value === targetText) {
            // calculate final WPM
            const elapsedTimeMinutes = (Date.now() - startTimeRef.current) / 1000 / 60;
            const lettersTyped = value.length;
            const grossWPM = Math.round(lettersTyped / 5 / elapsedTimeMinutes);
            setFinalWPM(grossWPM);
        }
    };

    // Reset game
    const resetGame = () => {
        setInput("");
        setFinalWPM(null);
        startTimeRef.current = null;
        inputRef.current.focus();
    };

    // Count correct letters
    const correctLetters = input.split("").filter((char, i) => char === targetText[i]).length;

    // Real-time WPM
    const elapsedTimeMinutes = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 / 60 : 0.001; // avoid division by zero
    const realTimeWPM = Math.round(correctLetters / 5 / elapsedTimeMinutes);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
            <h1 className="text-4xl font-bold mb-6">Typing Game</h1>

            <p className="text-lg mb-4">{targetText}</p>

            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleChange}
                className="w-full max-w-lg p-3 rounded border-2 border-gray-700 focus:outline-none focus:border-blue-500 text-white"
                placeholder="Type here..."
            />

            {!finalWPM && (
                <p className="mt-4 text-xl">
                    Letters correct: <span className="font-bold">{correctLetters}</span> | WPM: <span className="font-bold">{realTimeWPM}</span>
                </p>
            )}
            {finalWPM && (
                <div className="mt-6 text-center">
                    <p className="text-2xl text-green-400 font-bold">Well done! 🎉</p>
                    <p className="text-xl mt-2">Final WPM: {finalWPM}</p>
                    <button onClick={resetGame} className="mt-4 px-6 py-3 bg-blu-5e00 rounded hover:bg-blue-600 transition">
                        Play Again
                    </button>
                </div>
            )}
        </div>
    );
}
