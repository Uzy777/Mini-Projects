import { useCallback } from "react";

export function useMiniGame({ coin, setCoin, risk, setRisk, miniGameStatus, setMiniGameStatus }) {
  const handleMiniGame = useCallback(() => {
    const failChance = Math.floor(Math.random() * 100);
    console.log("fail chance:", failChance);

    if (miniGameStatus) {
      const reward = Math.floor(Math.random() * 10) + 1;
      setCoin((prev) => prev + reward);
      setRisk((prev) => prev + 5);

      if (Math.random() < 0.01) {
        setCoin((prev) => prev + 1000);
      }

      if (risk > failChance) {
        const lossCoinAmount = Math.floor(coin * 0.75);
        setCoin((prev) => prev - lossCoinAmount);
        console.log("lost:", { lossCoinAmount });
        setMiniGameStatus(false);
      }
    }
  }, [coin, risk, miniGameStatus, setCoin, setRisk, setMiniGameStatus]);

  return { handleMiniGame };
}
