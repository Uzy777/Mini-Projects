import React, { useState, useEffect, useRef } from "react";
import { usePersistentState } from "./hooks/usePersistentState";
import StatusPanel from "./components/StatusPanel";
import SceneDisplay from "./components/SceneDisplay";
import StoryChoices from "./components/StoryChoices";
import SceneImage from "./components/SceneImage";
import Modal from "./components/ModalKeyFound";

import { weakEnemies, mediumEnemies, strongEnemies } from "./data/enemies";

import { biomes } from "./data/biomes";


const initialPlayer = {
  name: "ABC",
  health: 100,
  gold: 50,
  keys: {
    bronze: false,
    silver: false,
    gold: false,
    titanium: false,
    forest: false,
    water: false,
    fire: false,
    demon: false,
  }
};





const initialScene = {
  message: "You stand at a crossroad. Which way do you go?",
  // image: "/assets/scenes/test.jpg",
  choices: [
    { text: "Go left", next: "left" },
    { text: "Go right", next: "right" },
  ],
};




function NewApp() {
  const [player, setPlayer] = usePersistentState("player", initialPlayer);
  const [scene, setScene] = usePersistentState("scene", initialScene);

  const [currentBiomeId, setCurrentBiomeId] = usePersistentState("currentBiomeId", 0);
  const currentBiome = biomes[currentBiomeId];

  const foundKey = currentBiome.keyToFind;
  const activeBiome = currentBiome.name;

  // const [enemyMessage, setEnemyMessage] = useState(null);

  const audioRef = useRef(null);

  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    if (!currentBiome.backgroundMusic) return;

    // Stop previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Start new audio
    const newAudio = new Audio(currentBiome.backgroundMusic);
    newAudio.loop = true;
    newAudio.play();
    audioRef.current = newAudio;

    // Optional: cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [currentBiomeId]);


  const enemies = currentBiome.enemies;
  const [minDamage, maxDamage] = currentBiome.damageRange;

  const handleChoice = (next) => {
    if (next === "left") {
      setScene({
        message: "You took the left path and found a treasure!",
        choices: [{ text: "Continue", next: "start" }],
      });
      setPlayer((p) => ({ ...p, gold: p.gold + 10 }));

      // Collect a key
      handleKeyFound();

    } else if (next === "right") {
      if (enemies.length > 0) {
        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        const damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;

        console.log(randomEnemy);
        console.log(damage);

        setScene({
          message: `You encountered a ${randomEnemy.name}. ${randomEnemy.description} You lost ${damage} health!`,
          image: randomEnemy.image,
          choices: [{ text: "Run back", next: "start" }],
        });

        setPlayer((p) => ({ ...p, health: Math.max(p.health - damage, 0) }));
      } else {
        setScene({
          message: "You went right, but nothing was there. It's eerily quiet...",
          choices: [{ text: "Run back", next: "start" }],
        });
      }

    } else {
      setScene(initialScene);
    }
  };


  //   } else if (next === "right") {
  //     setScene({
  //       message: "You met a monster and lost some health!",
  //       choices: [{ text: "Run back", next: "start" }],
  //     });
  //     setPlayer((p) => ({ ...p, health: p.health - 20 }));
  //   } else {
  //     setScene(initialScene);
  //   }
  // };

  const handleReset = () => {
    const confirmed = window.confirm("Are you sure you want to reset your progress?");
    if (confirmed) {
      setPlayer(initialPlayer);
      setScene(initialScene);
      setCurrentBiomeId(0)
      localStorage.removeItem("player");
      localStorage.removeItem("scene");

    }
  }

  const handleEnemy = () => {
    const random = Math.random();

    let group;
    let enemyDamage;
    if (random < 0.7) {
      group = weakEnemies;    // 70% Chance
      enemyDamage = Math.floor(Math.random() * 5) + 1;  // 1 - 5 Damage
    } else if (random < 0.95) {
      group = mediumEnemies;  // 25% Chance
      enemyDamage = Math.floor(Math.random() * (15 - 5 + 1)) + 5; // 5 - 15 Damage
    } else {
      group = strongEnemies;  // 5% Chance
      enemyDamage = Math.floor(Math.random() * (30 - 15 + 1)) + 15; // 15 - 30 Damage
    }


    const randomEnemy = group[Math.floor(Math.random() * group.length)];
    // console.log(random);
    // console.log(randomEnemy);
    // console.log(enemyDamage);
  }

  const handleKeyFound = () => {

    const random = Math.random();

    console.log(random)

    if (random < 1) { // CHANGE BACK TO 0.05
      setShowKeyModal(true);
      console.log(foundKey)

      setPlayer(prev => ({
        ...prev,
        keys: {
          ...prev.keys,
          [foundKey]: true
        }
      }))


        ;
    } else {
      return;
    }



  };

  const biomeChange = (keyName) => {
    setCurrentBiomeId(prev => prev + 1); // This triggers the music + background change

    // Find next biome where keyRequired === keyName
    const nextBiome = biomes.find(b => b.keyRequired === keyName);
    if (nextBiome) {
      setCurrentBiomeId(nextBiome.id);
    }
  }


  handleEnemy()

  return (



    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(${currentBiome.background})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: 'black',
      }}

    >
      <div className="max-w-xl mx-auto p-6 font-sans bg-black/60 rounded-lg">
        <StatusPanel player={player} activeBiome={activeBiome} />
        <SceneImage src={scene.image} />
        <SceneDisplay message={scene.message} />
        <StoryChoices choices={scene.choices} onSelect={handleChoice} />

        <div className="mt-6 flex justify-center">
          <button onClick={handleReset} className="">
            Reset Progress
          </button>

          <Modal show={showKeyModal} title="Key Found!" foundKey={foundKey} onClose={() => (setShowKeyModal(false), biomeChange())}
          />



        </div>
      </div>
    </div>

  );
}

export default NewApp;
