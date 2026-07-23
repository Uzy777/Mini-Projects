import { StyleSheet, Text, View } from "react-native";

import type { FocusSessionRecord, SessionOutcome } from "../../types/models";

type FocusSessionHistoryCardProps = {
    session: FocusSessionRecord;
};

const outcomeLabels: Record<SessionOutcome, string> = {
    completed: "Quest completed",
    progressed: "Made progress",
    blocked: "Got blocked",
    stopped: "Stopped early",
};

function formatFocusedTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    if (minutes === 0) {
        return `${seconds} sec`;
    }

    if (seconds === 0) {
        return `${minutes} min`;
    }

    return `${minutes} min ${seconds} sec`;
}

export function FocusSessionHistoryCard({ session }: FocusSessionHistoryCardProps) {
    const focusedSeconds = session.actualSeconds ?? session.plannedMinutes * 60;

    return (
        <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
                <View style={styles.sessionHeading}>
                    <Text style={styles.questTitle}>{session.questTitle}</Text>

                    <Text style={styles.outcomeText}>{outcomeLabels[session.outcome]}</Text>
                </View>

                <Text style={styles.xpText}>+{session.earnedXp} XP</Text>
            </View>

            <View style={styles.durationRow}>
                <View style={styles.durationItem}>
                    <Text style={styles.detailLabel}>Focused</Text>

                    <Text style={styles.durationValue}>{formatFocusedTime(focusedSeconds)}</Text>
                </View>

                <View style={styles.durationItem}>
                    <Text style={styles.detailLabel}>Planned</Text>

                    <Text style={styles.durationValue}>{session.plannedMinutes} min</Text>
                </View>
            </View>

            <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Accomplishment</Text>

                <Text style={styles.detailText}>{session.accomplishment}</Text>
            </View>

            {session.nextAction && (
                <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Next action</Text>

                    <Text style={styles.detailText}>{session.nextAction}</Text>
                </View>
            )}

            <Text style={styles.completedDate}>{new Date(session.completedAt).toLocaleString()}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    sessionCard: {
        width: "100%",
        marginTop: 16,
        padding: 18,
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },
    sessionHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
    },
    sessionHeading: {
        flex: 1,
    },
    questTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    outcomeText: {
        marginTop: 5,
        fontSize: 13,
        fontWeight: "600",
        color: "#666666",
    },
    xpText: {
        fontSize: 15,
        fontWeight: "700",
    },
    durationRow: {
        marginTop: 16,
        flexDirection: "row",
        gap: 12,
    },
    durationItem: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#f2f2f2",
    },
    durationValue: {
        marginTop: 4,
        fontSize: 16,
        fontWeight: "700",
    },
    detailSection: {
        marginTop: 14,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#666666",
    },
    detailText: {
        marginTop: 4,
        fontSize: 14,
        lineHeight: 20,
    },
    completedDate: {
        marginTop: 16,
        fontSize: 12,
        color: "#777777",
    },
});