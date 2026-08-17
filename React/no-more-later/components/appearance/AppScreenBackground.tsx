import { StyleSheet, View } from "react-native";

import { AppBackdrop } from "@/components/appearance/AppBackdrop";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { ReactNode } from "react";

type AppScreenBackgroundProps = {
    children: ReactNode;
};

export function AppScreenBackground({ children }: AppScreenBackgroundProps) {
    const { colours } = useAppearance();

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colours.background,
                },
            ]}
        >
            <AppBackdrop />

            <View style={styles.content}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        flex: 1,
        backgroundColor: "transparent",
    },
});
