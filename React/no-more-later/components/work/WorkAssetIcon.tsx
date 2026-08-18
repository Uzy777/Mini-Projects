import { BookOpen, Cloud, Dumbbell, Home, Laptop, ListChecks, Palette, ShieldCheck } from "lucide-react-native";

import type { WorkAssetId } from "@/types/work";

type WorkAssetIconProps = {
    assetId: WorkAssetId;
    size?: number;
    color: string;
};

export function WorkAssetIcon({ assetId, size = 24, color }: WorkAssetIconProps) {
    const iconProps = {
        size,
        color,
        strokeWidth: 2,
    };

    switch (assetId) {
        case "laptop":
            return <Laptop {...iconProps} />;

        case "book":
            return <BookOpen {...iconProps} />;

        case "fitness":
            return <Dumbbell {...iconProps} />;

        case "home":
            return <Home {...iconProps} />;

        case "cloud":
            return <Cloud {...iconProps} />;

        case "shield":
            return <ShieldCheck {...iconProps} />;

        case "creative":
            return <Palette {...iconProps} />;

        default:
            return <ListChecks {...iconProps} />;
    }
}

export const WORK_QUEST_ASSETS: {
    id: WorkAssetId;
    label: string;
}[] = [
    {
        id: "task",
        label: "Task",
    },
    {
        id: "laptop",
        label: "Laptop",
    },
    {
        id: "book",
        label: "Book",
    },
    {
        id: "fitness",
        label: "Fitness",
    },
    {
        id: "home",
        label: "Home",
    },
    {
        id: "cloud",
        label: "Cloud",
    },
    {
        id: "shield",
        label: "Shield",
    },
    {
        id: "creative",
        label: "Creative",
    },
];