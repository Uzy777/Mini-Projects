import { Profanity } from "@2toad/profanity";

// Expo / Metro compatibility workaround.
// @ts-ignore
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity/dist/index.js";

/*
|--------------------------------------------------------------------------
| Profanity engines
|--------------------------------------------------------------------------
*/

const multilingualProfanity = new Profanity({
    languages: ["en", "es", "fr", "de", "it", "pt", "ru", "ar", "hi", "zh", "ja", "ko"],
    wholeWord: true,
    unicodeWordBoundaries: true,
});

const englishProfanityMatcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
});

/*
|--------------------------------------------------------------------------
| Reserved usernames
|--------------------------------------------------------------------------
|
| These are not necessarily offensive.
| We block them to prevent users pretending to represent No More Later.
|
*/

const RESERVED_USERNAMES = new Set([
    "admin",
    "administrator",
    "admins",

    "moderator",
    "moderators",
    "mod",

    "support",
    "supportteam",

    "staff",

    "official",

    "system",
    "root",
    "superuser",

    "nomorelater",
    "nomorelaterapp",
    "nmladmin",
    "nmlsupport",
    "nmlofficial",
]);

/*
|--------------------------------------------------------------------------
| Additional blocked terms
|--------------------------------------------------------------------------
|
| These supplement the npm packages.
|
| Keep additions here focused on obvious inappropriate terms and common
| spellings that the libraries fail to detect.
|
*/

const ADDITIONAL_BLOCKED_TERMS = new Set([
    /*
     * General profanity
     */

    "fuck",
    "fucks",
    "fucker",
    "fuckers",
    "fucking",
    "fuckoff",
    "motherfuck",
    "motherfucker",
    "motherfuckers",

    "fck",
    "fuk",
    "fuks",
    "fukk",
    "fuker",
    "fuking",
    "fuq",
    "phuck",
    "phuk",

    "shit",
    "shits",
    "shitty",
    "bullshit",
    "shithead",
    "shitface",

    "bitch",
    "bitches",
    "bitching",

    "bastard",
    "bastards",

    "asshole",
    "assholes",
    "arsehole",
    "arseholes",

    "cunt",
    "cunts",

    "twat",
    "twats",

    "wanker",
    "wankers",

    "prick",
    "pricks",

    /*
     * Sexual / explicit
     */

    "sex",
    "sexy",
    "sexxy",
    "sexxxy",
    "sexxxxy",

    "porn",
    "porno",
    "pornography",
    "pornhub",

    "xxx",

    "nude",
    "nudes",
    "naked",

    "dick",
    "dicks",
    "dickhead",
    "dickheads",

    "cock",
    "cocks",

    "penis",
    "penises",

    "vagina",
    "vaginas",

    "pussy",
    "pussies",

    "tits",
    "titss",
    "titties",

    "boob",
    "boobs",
    "boobies",

    "cum",
    "cumming",
    "semen",

    "orgasm",
    "orgasms",

    "masturbate",
    "masturbation",

    "jerkoff",

    "slut",
    "sluts",

    "whore",
    "whores",

    "dildo",
    "dildos",

    "hentai",

    /*
     * Common abusive terms
     */

    "retard",
    "retarded",

    /*
     * Hate / slur terms
     */

    "nigger",
    "niggers",
    "nigga",
    "niggas",

    "faggot",
    "faggots",

    "kike",
    "kikes",

    "chink",
    "chinks",

    "gook",
    "gooks",

    "spic",
    "spics",

    "wetback",
    "wetbacks",

    "paki",
    "pakis",

    "raghead",
    "ragheads",

    /*
     * Obvious extremist / hateful account names
     */

    "kkk",
    "nazis",
    "nazi",
]);

/*
|--------------------------------------------------------------------------
| Leetspeak substitutions
|--------------------------------------------------------------------------
|
| We never modify the user's actual username.
|
| These transformations only create additional versions for checking.
|
*/

const LEET_REPLACEMENTS: Record<string, string> = {
    "0": "o",
    "1": "i",
    "2": "z",
    "3": "e",
    "4": "a",
    "5": "s",
    "6": "g",
    "7": "t",
    "8": "b",
    "9": "g",

    "@": "a",
    $: "s",
    "!": "i",
    "|": "i",
    "+": "t",
};

/*
|--------------------------------------------------------------------------
| Common Unicode lookalikes
|--------------------------------------------------------------------------
|
| Someone could type Latin letters mixed with Cyrillic characters:
|
|     аdmin
|
| where the first "a" isn't actually a Latin "a".
|
| We generate another candidate using common visual equivalents.
|
*/

const CONFUSABLE_CHARACTERS: Record<string, string> = {
    // Cyrillic
    а: "a",
    е: "e",
    о: "o",
    р: "p",
    с: "c",
    х: "x",
    у: "y",
    і: "i",
    ј: "j",
    ѕ: "s",
    к: "k",
    м: "m",
    т: "t",

    // Greek
    α: "a",
    ε: "e",
    ι: "i",
    κ: "k",
    ο: "o",
    ρ: "p",
    τ: "t",
    χ: "x",
};

/*
|--------------------------------------------------------------------------
| Normalisation helpers
|--------------------------------------------------------------------------
*/

function removeInvisibleCharacters(value: string): string {
    return value.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");
}

function removeDiacritics(value: string): string {
    return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function replaceLeetspeak(value: string): string {
    return Array.from(value)
        .map((character) => LEET_REPLACEMENTS[character] ?? character)
        .join("");
}

function replaceConfusableCharacters(value: string): string {
    return Array.from(value)
        .map((character) => CONFUSABLE_CHARACTERS[character] ?? character)
        .join("");
}

function removeDigits(value: string): string {
    return value.replace(/[0-9]/g, "");
}

function collapseRepeatedCharacters(value: string): string {
    return value.replace(/(.)\1+/gu, "$1");
}

function compactUsername(value: string): string {
    return value.replace(/[^\p{L}\p{N}]/gu, "");
}

function getWords(value: string): string[] {
    return value.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/*
|--------------------------------------------------------------------------
| Candidate generation
|--------------------------------------------------------------------------
|
| Example:
|
|     F3.UUU.CK
|
| may generate:
|
|     f3.uuu.ck
|     f.uuu.ck
|     f3uuuck
|     fuuuck
|     fuck
|
| The original username is never changed.
|
*/

function createUsernameCandidates(username: string): string[] {
    const base = removeInvisibleCharacters(username.normalize("NFKC").trim().toLowerCase());

    const candidates = new Set<string>();

    function add(value: string) {
        const trimmedValue = value.trim();

        if (trimmedValue) {
            candidates.add(trimmedValue);
        }
    }

    add(base);

    const withoutDiacritics = removeDiacritics(base);

    add(withoutDiacritics);

    const leetNormalised = replaceLeetspeak(withoutDiacritics);

    add(leetNormalised);

    const confusableNormalised = replaceConfusableCharacters(withoutDiacritics);

    add(confusableNormalised);

    const withoutDigits = removeDigits(withoutDiacritics);

    add(withoutDigits);

    /*
     * Now create transformed forms of everything we've generated so far.
     */

    const currentCandidates = [...candidates];

    for (const candidate of currentCandidates) {
        add(collapseRepeatedCharacters(candidate));

        add(compactUsername(candidate));

        add(collapseRepeatedCharacters(compactUsername(candidate)));

        add(removeDigits(candidate));

        add(compactUsername(removeDigits(candidate)));

        add(collapseRepeatedCharacters(removeDigits(candidate)));
    }

    return [...candidates];
}

/*
|--------------------------------------------------------------------------
| Reserved username detection
|--------------------------------------------------------------------------
*/

function containsReservedUsername(candidates: string[]): boolean {
    for (const candidate of candidates) {
        const words = getWords(candidate);

        /*
         * "Admin Tim"
         * ["admin", "tim"]
         */

        if (words.some((word) => RESERVED_USERNAMES.has(word))) {
            return true;
        }

        /*
         * Catches:
         *
         * a.d.m.i.n
         * a_d_m_i_n
         * admin123
         * adm1n
         */

        const compact = compactUsername(removeDigits(candidate));

        if (RESERVED_USERNAMES.has(compact)) {
            return true;
        }
    }

    return false;
}

/*
|--------------------------------------------------------------------------
| Additional blocked term detection
|--------------------------------------------------------------------------
*/

function containsAdditionalBlockedTerm(candidates: string[]): boolean {
    for (const candidate of candidates) {
        const words = getWords(candidate);

        if (words.some((word) => ADDITIONAL_BLOCKED_TERMS.has(word))) {
            return true;
        }

        /*
         * This catches words deliberately separated:
         *
         * f.u.c.k
         * f_u_c_k
         * t.i.t.s
         */

        const compact = compactUsername(candidate);

        if (ADDITIONAL_BLOCKED_TERMS.has(compact)) {
            return true;
        }

        /*
         * And repeated-letter tricks:
         *
         * TITSS
         * SEXXXXXY
         */

        const collapsed = collapseRepeatedCharacters(compact);

        if (ADDITIONAL_BLOCKED_TERMS.has(collapsed)) {
            return true;
        }
    }

    return false;
}

/*
|--------------------------------------------------------------------------
| Package profanity detection
|--------------------------------------------------------------------------
*/

function containsPackageProfanity(candidates: string[]): boolean {
    for (const candidate of candidates) {
        if (englishProfanityMatcher.hasMatch(candidate)) {
            return true;
        }

        if (multilingualProfanity.exists(candidate)) {
            return true;
        }
    }

    return false;
}

/*
|--------------------------------------------------------------------------
| Public validator
|--------------------------------------------------------------------------
*/

export function getUsernameValidationMessage(username: string): string | null {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
        return "A username is required.";
    }

    const candidates = createUsernameCandidates(trimmedUsername);

    if (containsReservedUsername(candidates)) {
        return "Nice try 😄 That username is reserved.";
    }

    if (containsAdditionalBlockedTerm(candidates) || containsPackageProfanity(candidates)) {
        return "We saw that 👀 Try a more friendly username.";
    }

    return null;
}
