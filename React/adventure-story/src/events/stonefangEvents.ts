export const stonefangEvents = {
  1: {
    id: 1,
    text: "You arrive at Stonefang Village. Smoke rises from burned rooftops, and the streets are eerily quiet.",
    image: "",
    choices: [
      { text: "Turn left down a tight alleyway", next: 2 },
      { text: "Turn right to the market", next: 20 },
    ],
  },
  2: {
    id: 2,
    text: "A girl struggles as a rough man clutches her arm.",
    image: "/assets/events/stonefang-village/2.webp",
    choices: [
      { text: "Say something to him", next: 3 },
      { text: "Go back to the main street", next: 1 },
    ],
  },
  3: {
    id: 3,
    text: "You step forward and confront him, voice firm and commanding.",
    image: "",
    choices: [
      { text: "Oi, get off her! Please let her go!", next: 4 },
      { text: "Please let her go!", next: 4 },
    ],
  },
  4: {
    id: 4,
    text: "He glares at you, holding the girl tightly. 'And what will you do about it?' he sneers.",
    image: "",
    choices: [
      { text: "Fight him", next: 5 },
      { text: "Apologize and step back", next: 1 },
    ],
  },
  5: {
    id: 5,
    text: "You prepare to fight. Will your strength be enough?",
    image: "",
    choices: [
      { text: "Win the fight", next: 6 },
      { text: "Lose the fight", next: 7 },
    ],
  },
  6: {
    id: 6,
    text: "He collapses, groaning, and runs off. The girl looks at you with relief.",
    image: "",
    choices: [
      { text: "Go to the girl", next: 8 },
    ],
  },
  7: {
    id: 7,
    text: "You stumble, unable to land a hit. The man laughs and walks away, leaving you bruised.",
    image: "",
    choices: [
      { text: "Return to the start", next: 1 },
    ],
  },
  8: {
    id: 8,
    text: "The girl smiles nervously. 'Thank you so much for saving me!'",
    image: "",
    choices: [
      { text: "What did he want?", next: 9 },
      { text: "Are you okay?", next: 10 },
    ],
  },
  9: {
    id: 9,
    text: "'I think he wanted the bronze key,' she whispers, trembling.",
    image: "",
    choices: [
      { text: "A bronze key?", next: 11 },
    ],
  },
  10: {
    id: 10,
    text: "'Yes, I'm fine,' she says. 'He demanded the bronze key, then grabbed me.'",
    image: "",
    choices: [
      { text: "A bronze key?", next: 11 },
    ],
  },
  11: {
    id: 11,
    text: "'I don't know where it is, but I heard keys are sold in the market,' she adds.",
    image: "",
    choices: [
      { text: "Thank you, let's head to the market", next: 20 },
    ],
  },

  // MARKET PATH
  20: {
    id: 20,
    text: "You reach the market. Colorful stalls line the street, bustling with shadowy figures.",
    image: "/assets/events/stonefang-village/20.webp",
    choices: [
      { text: "Go to the red stall", next: 21 },
      { text: "Go to the blue stall", next: 22 },
      { text: "Go to the green stall", next: 23 },
    ],
  },
  21: {
    id: 21,
    text: "You approach the red stall, its wares glinting in the sunlight.",
    image: "",
    choices: [],
  },
  22: {
    id: 22,
    text: "The blue stall smells of spices and fresh herbs.",
    image: "",
    choices: [],
  },
  23: {
    id: 23,
    text: "At the green stall, vegetables and trinkets are neatly arranged.",
    image: "",
    choices: [],
  },
};
