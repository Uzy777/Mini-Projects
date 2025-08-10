export const biomes = [
    {
        id: 0,
        name: "Stonefang Village",
        keyRequired: null,          // no key needed to enter
        keyToFind: "bronze",        // key hidden here
        background: "/assets/biomes/stonefang-village.webp",
        enemies: [
            { name: "Angry Hen", description: "A farm hen defends its eggs with surprising fury.", image: "/assets/enemies/stonefang-village/angry-hen.webp" },
            { name: "Drunken Villager", description: "A clumsy villager swings a broken bottle.", image: "/assets/enemies/stonefang-village/drunken-villager.webp" },
            { name: "Territorial Goose", description: "It hisses and charges beak-first!", image: "/assets/enemies/stonefang-village/territorial-goose.webp" },
            { name: "The Butcher", description: "xxxx", image: "/assets/enemies/stonefang-village/the-butcher.webp" },
            { name: "Feral Cat", description: "It hisses and rakes your leg with sharp claws.", image: "/assets/enemies/stonefang-village/feral-cat.webp" },
            { name: "Rat Swarm", description: "A swarm of rats bursts from a grain sack.", image: "/assets/enemies/stonefang-village/rat-swarm.webp" }
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
            { name: "Iron-Willed Guard", description: "A relentless defender strikes in practiced arcs.", image: "/assets/enemies/vault-of-titanium/iron-willed-guard.webp" },
            { name: "Runic Statue", description: "It comes to life, slamming the ground.", image: "/assets/enemies/vault-of-titanium/runic-statue.webp" },
            { name: "Molten Crawler", description: "This bug-like construct drips burning metal.", image: "/assets/enemies/vault-of-titanium/molten-crawler.webp" }
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
            { name: "Wailing Dryad", description: "Her scream shatters your sense of peace.", image: "/assets/enemies/whispering-forest/wailing-dryad.webp" },
            { name: "Thornfiend", description: "Vines whip at you with razor tips.", image: "/assets/enemies/whispering-forest/thornfiend.webp" },
            { name: "Spirit Stag", description: "Its ghostly antlers impale with grace.", image: "/assets/enemies/whispering-forest/spirit-stag.webp" },
            { name: "Forest Lady", description: "She smerks and slashes at you.", image: "/assets/enemies/whispering-forest/forest-lady.webp" },
            { name: "Swamp Lurker", description: "It rises silently and bites deep.", image: "/assets/enemies/whispering-forest/swamp-lurker.webp" },
            { name: "Possessed Owl", description: "It dives and slashes with glowing talons.", image: "/assets/enemies/whispering-forest/possessed-owl.webp" }
        ],
        damageRange: [15, 25],
    },

    {
        id: 5,
        name: "Temple of the Tides",
        keyRequired: "forest",
        keyToFind: "water",
        background: "/assets/biomes/temple-of-the-tides.webp",
        enemies: [
            { name: "Tidal Serpent", description: "It coils around you, suffocating and biting.", image: "/assets/enemies/temple-of-the-tides/tidal-serpent.webp" },
            { name: "Coral Knight", description: "A barnacled blade swings with crushing weight.", image: "/assets/enemies/temple-of-the-tides/coral-knight.webp" },
            { name: "Temple Siren", description: "Her mournful hymn conjures devastating tidal currents that shatter bone and spirit.", image: "/assets/enemies/temple-of-the-tides/temple-siren.webp" },
            { name: "Kraken Spawn", description: "Tentacles strike from every direction.", image: "/assets/enemies/temple-of-the-tides/kraken-spawn.webp" },
            { name: "Ghost Sailor", description: "His harpoon strikes with bone-piercing force.", image: "/assets/enemies/temple-of-the-tides/ghost-sailor.webp" },
            { name: "Water Elemental", description: "It slams like a wall of living sea.", image: "/assets/enemies/temple-of-the-tides/water-elemental.webp" }
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
            { name: "Lava Fiend", description: "It spits fire and burns everything nearby.", image: "/assets/enemies/forge-of-the-flameborn/lava-fiend.webp" },
            { name: "Fireborn Gladiator", description: "Wielding magma-forged blades, it charges fiercely.", image: "/assets/enemies/forge-of-the-flameborn/fireborn-gladiator.webp" },
            { name: "Ash Wyrm", description: "A serpent of fire coils and lashes.", image: "/assets/enemies/forge-of-the-flameborn/ash-wyrm.webp" },
            { name: "Ember Matron", description: "She slams the ground, unleashing waves of flame.", image: "/assets/enemies/forge-of-the-flameborn/ember-matron.webp" },
            { name: "Cinder Huntress", description: "She leaps with blazing claws and a searing howl.", image: "/assets/enemies/forge-of-the-flameborn/cinder-huntress.webp" },
            { name: "Pyromancer Shade", description: "Explosive fire orbs circle and detonate.", image: "/assets/enemies/forge-of-the-flameborn/pyromancer-shade.webp" }
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
            { name: "Demon General", description: "He strikes with hellforged weapons and rage.", image: "/assets/enemies/demonreach-keep/demon-general.webp" },
            { name: "The Bloodbound Seer", description: "She sees through flesh, and speaks in tongues carved into bone.", image: "/assets/enemies/demonreach-keep/the-bloodbound-seer.webp" },
            { name: "The Bleeding Matron", description: "She tends the cursed halls in robes soaked with centuries of suffering.", image: "/assets/enemies/demonreach-keep/the-bleeding-matron.webp" },
            { name: "Undying Knight", description: "An unholy champion who never falls.", image: "/assets/enemies/demonreach-keep/undying-knight.webp" },
            { name: "Bloodchant Temptress", description: "Her voice twists minds and rends flesh from within.", image: "/assets/enemies/demonreach-keep/bloodchant-temptress.webp" },
            { name: "The Choirless Nun", description: "She sings no hymns only the silence of slaughter.", image: "/assets/enemies/demonreach-keep/the-choirless-nun.webp" },
        ],
        damageRange: [15, 40],
    },
];
