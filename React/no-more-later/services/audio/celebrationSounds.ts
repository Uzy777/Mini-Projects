import { useEffect, useRef } from "react";
import { useAudioPlayer, type AudioSource } from "expo-audio";

export type CelebrationSoundRole = "level-up" | "rank-up" | "badge-unlock";

// Keep this false until all three real assets have been added below. This makes
// the celebration UI safe to ship without bundling placeholder or missing files.
const CELEBRATION_SOUNDS_ENABLED = true;

const CELEBRATION_SOUND_SOURCES: Record<CelebrationSoundRole, AudioSource> = {
    // Add require("../../assets/sounds/celebrations/level-up.mp3") here.
    "level-up": require("../../assets/sounds/celebrations/no-more-later-level-up.wav"),
    // Add require("../../assets/sounds/celebrations/rank-up.mp3") here.
    "rank-up": require("../../assets/sounds/celebrations/no-more-later-rank-up.wav"),
    // Add require("../../assets/sounds/celebrations/badge-unlock.mp3") here.
    "badge-unlock": require("../../assets/sounds/celebrations/no-more-later-badge-unlocked.wav"),
};

const CELEBRATION_SOUND_VOLUMES: Record<CelebrationSoundRole, number> = {
    "level-up": 0.48,
    "rank-up": 0.58,
    "badge-unlock": 0.52,
};

export function useCelebrationSound(role: CelebrationSoundRole, celebrationKey: string, enabled = true) {
    const source = CELEBRATION_SOUND_SOURCES[role];
    const player = useAudioPlayer(source);
    const playedKey = useRef<string | null>(null);

    useEffect(() => {
        if (!CELEBRATION_SOUNDS_ENABLED || !enabled || source === null || source === undefined || playedKey.current === celebrationKey) {
            return;
        }

        playedKey.current = celebrationKey;
        player.loop = false;
        player.volume = CELEBRATION_SOUND_VOLUMES[role];

        void player
            .seekTo(0)
            .then(() => player.play())
            .catch((error) => {
                console.warn(`Could not play ${role} celebration sound:`, error);
            });
    }, [celebrationKey, enabled, player, role, source]);
}
