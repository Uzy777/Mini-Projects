import { useState, useEffect } from "react";

export function usePersistentState(key, defaultValue) {
    const [state, setState] = useState(() => {
        // On init, try to load saved value from localStorage
        const saved = localStorage.getItem(key);
        if (saved !== null) {
            try {
                return JSON.parse(saved);
            } catch {
                return defaultValue;
            }
        }
        return defaultValue;
    });

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
}
