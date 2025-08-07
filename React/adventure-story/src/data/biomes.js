export const biomes = [
    {
        id: 0,
        name: "Stonefang Village",
        keyRequired: null,          // no key needed to enter
        keyToFind: "bronze",        // key hidden here
        background: "/assets/biomes/stonefang-village.webp",
        enemies: [
            { name: "Angry Hen", description: "A farm hen defends its eggs with surprising fury.", image: "/assets/enemies/stonefang-village/angry-hen.webp"},
            { name: "Drunken Villager", description: "A clumsy villager swings a broken bottle." , image: "/assets/enemies/stonefang-village/drunken-villager.webp"},
            { name: "Territorial Goose", description: "It hisses and charges beak-first!" , image: "/assets/enemies/stonefang-village/territorial-goose.webp"},
            { name: "The Butcher", description: "xxxx" , image: "/assets/enemies/stonefang-village/the-butcher.webp"},
            { name: "Feral Cat", description: "It hisses and rakes your leg with sharp claws." , image: "/assets/enemies/stonefang-village/feral-cat.webp"},
            { name: "Rat Swarm", description: "A swarm of rats bursts from a grain sack." , image: "/assets/enemies/stonefang-village/rat-swarm.webp"}
        ],
        damageRange: [1, 5],
    },

    {
        id: 1,
        name: "Stonefang Village",
        keyRequired: "bronze",
        keyToFind: "silver",
        background: "/assets/biomes/stonefang-village.webp",
        enemies: [
            { name: "Grey Wolf", description: "It lunges from the treeline, teeth bared.", image: "/assets/enemies/stonefang-village/grey-wolf.webp" },
            { name: "Burly Thug", description: "He clubs at you with a spiked mace.", image: "/assets/enemies/stonefang-village/burly-thug.webp" },
            { name: "Large Boar", description: "It charges headfirst with brutal strength.", image: "/assets/enemies/stonefang-village/large-boar.webp" },
            { name: "Cave Spider", description: "Its venom stings and blurs your vision.", image: "/assets/enemies/stonefang-village/cave-spider.webp" },
            { name: "Goblin Sneak", description: "It slashes at your back from the shadows.", image: "/assets/enemies/stonefang-village/goblin-sneak.webp" },
            { name: "Bandit Scout", description: "She flicks a knife at your ribs.", image: "/assets/enemies/stonefang-village/bandit-scout.webp" }
        ],
        damageRange: [5, 10],
    },

    {
        id: 2,
        name: "Stonefang Village",
        keyRequired: "silver",
        keyToFind: "gold",
        background: "/assets/biomes/stonefang-village.webp",
        enemies: [
            { name: "Twilight Ghoul", description: "Her claws tear through cloth and skin.", image: "/assets/enemies/stonefang-village/twilight-ghoul.webp" },
            { name: "Cursed Axeman", description: "He swings wildly in a blood frenzy.", image: "/assets/enemies/stonefang-village/cursed-axeman.webp" },
            { name: "Night Stalker", description: "It strikes from the shadows with razor teeth.", image: "/assets/enemies/stonefang-village/night-stalker.webp" },
            { name: "Rogue Sorcerer", description: "Flames burst from her fingertips.", image: "/assets/enemies/stonefang-village/rogue-sorcerer.webp" },
            { name: "Berserker Cultist", description: "He attacks in a trance of pain and fury.", image: "/assets/enemies/stonefang-village/berserker-cultist.webp" },
            { name: "Stone Golem", description: "It crushes foes with its stone fists.", image: "/assets/enemies/stonefang-village/stone-golem.webp" }
        ],
        damageRange: [10, 15],
    },

    {
        id: 3,
        name: "Vault of Titanium",
        keyRequired: "gold",
        keyToFind: "titanium",
        background: "/assets/biomes/vault-of-titanium.webp",
        enemies: [
            { name: "Steel Sentinel", description: "A bronze automaton punches like a smith\u2019s hammer.", image: "/assets/enemies/vault-of-titanium/steel-sentinel.webp" },
            { name: "Enraged Blacksmith", description: "He swings a molten hammer with deadly intent.", image: "/assets/enemies/vault-of-titanium/enraged-blacksmith.webp" },
            { name: "Clockwork Hound", description: "Its gears grind as it clamps onto your arm.", image: "/assets/enemies/vault-of-titanium/clockwork-hound.webp" },
            { name: "Iron-Willed Guard", description: "A relentless defender strikes in practiced arcs.", image: "/assets/enemies/vault-of-titanium/twilight-ghoul.webp" },
            { name: "Runic Statue", description: "It comes to life, slamming the ground.", image: "/assets/enemies/vault-of-titanium/twilight-ghoul.webp" },
            { name: "Molten Crawler", description: "This bug-like construct drips burning metal.", image: "/assets/enemies/vault-of-titanium/twilight-ghoul.webp" }
        ],
        damageRange: [15, 20],
    },

    {
        id: 4,
        name: "Whispering Forest",
        keyRequired: "titanium",
        keyToFind: "forest",
        background: "/assets/biomes/whispering-forest.webp",
        enemies: [
            { name: "Wailing Dryad", description: "Her scream shatters your sense of peace." },
            { name: "Thornfiend", description: "Vines whip at you with razor tips." },
            { name: "Spirit Stag", description: "Its ghostly antlers impale with grace." },
            { name: "Ancient Treant", description: "Its fists crush like falling trees." },
            { name: "Swamp Lurker", description: "It rises silently and bites deep." },
            { name: "Possessed Owl", description: "It dives and slashes with glowing talons." }
        ],
        damageRange: [15, 25],
    },

    {
        id: 5,
        name: "Temple of the Tides",
        keyRequired: "forest",
        keyToFind: "water",
        background: "/assets/biomes/emple-of-the-tides.webp",
        enemies: [
            { name: "Tidal Serpent", description: "It coils around you, suffocating and biting." },
            { name: "Coral Knight", description: "A barnacled blade swings with crushing weight." },
            { name: "Drowned Priest", description: "Chants send violent waves through the air." },
            { name: "Kraken Spawn", description: "Tentacles strike from every direction." },
            { name: "Ghost Sailor", description: "His harpoon strikes with bone-piercing force." },
            { name: "Water Elemental", description: "It slams like a wall of living sea." }
        ],
        damageRange: [15, 30],
    },

    {
        id: 6,
        name: "Forge of the Flameborn",
        keyRequired: "water",
        keyToFind: "fire",
        background: "/assets/biomes/forge-of-the-flameborn.webp",
        enemies: [
            { name: "Lava Fiend", description: "It spits fire and burns everything nearby." },
            { name: "Fireborn Gladiator", description: "Wielding magma-forged blades, it charges fiercely." },
            { name: "Ash Wyrm", description: "A serpent of fire coils and lashes." },
            { name: "Blazing Golem", description: "It smashes the floor, sending flames outward." },
            { name: "Inferno Hound", description: "It leaps with burning breath and claws." },
            { name: "Pyromancer Shade", description: "Explosive fire orbs circle and detonate." }
        ],
        damageRange: [15, 35],
    },

    {
        id: 7,
        name: "Demonreach Keep",
        keyRequired: "fire",
        keyToFind: "demon",
        background: "/assets/biomes/demonreach-keep.webp",
        enemies: [
            { name: "Demon General", description: "He strikes with hellforged weapons and rage." },
            { name: "Soul Reaver", description: "It drains your essence with every touch." },
            { name: "Cursed Warlock", description: "He casts hexes that rend both mind and body." },
            { name: "Undying Knight", description: "An unholy champion who never falls." },
            { name: "Hellbeast", description: "It charges through walls with molten breath." },
            { name: "Abyssal Warden", description: "It speaks doom and crushes hope itself." }
        ],
        damageRange: [15, 40],
    },
];
