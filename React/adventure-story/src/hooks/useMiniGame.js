import { useCallback } from "react";

export function useMiniGame({ coin, setCoin, risk, setRisk, miniGameStatus, setMiniGameStatus, setMessage }) {
  const handleMiniGame = useCallback(() => {
    // Calculate fail chance to use later to see if risk is greater than
    const failChance = Math.floor(Math.random() * 100);
    console.log("fail chance:", failChance);

    // Success found coins - +5% to risk each time
    if (miniGameStatus) {
      const reward = Math.floor(Math.random() * 10) + 1;
      setCoin((prev) => prev + reward);
      setRisk((prev) => prev + 5);
      setMessage(`Success! You found ${reward} coins`);

      // Success found bonus coins - 1000 coins 1% chance
      if (Math.random() < 0.01) {
        setCoin((prev) => prev + 1000);
        setMessage(`WOW! You found the bonus chest and earned 1000 coins`);
      }

      // Fail lost coins - 75% of total coins lost
      if (risk > failChance) {
        const lossCoinAmount = Math.floor(coin * 0.75);
        setCoin((prev) => prev - lossCoinAmount);
        console.log("lost:", { lossCoinAmount });
        setMiniGameStatus(false);
        setMessage(`Oh no! You lost ${lossCoinAmount} coins`);
      }
    }
  }, [coin, risk, miniGameStatus, setCoin, setRisk, setMiniGameStatus, setMessage]);

  return { handleMiniGame };
}
