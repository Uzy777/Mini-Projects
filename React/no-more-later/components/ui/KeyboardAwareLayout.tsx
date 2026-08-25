import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    type KeyboardAvoidingViewProps,
    type ScrollViewProps,
    type StyleProp,
    type ViewStyle,
} from "react-native";

const DEFAULT_KEYBOARD_BEHAVIOUR = Platform.select<KeyboardAvoidingViewProps["behavior"]>({
    ios: "padding",
    android: "height",
    default: undefined,
});

export function KeyboardAwareView({ behavior = DEFAULT_KEYBOARD_BEHAVIOUR, ...props }: KeyboardAvoidingViewProps) {
    return <KeyboardAvoidingView behavior={behavior} {...props} />;
}

type KeyboardAwareScrollViewProps = ScrollViewProps & {
    keyboardContainerStyle?: StyleProp<ViewStyle>;
    keyboardVerticalOffset?: number;
};

export function KeyboardAwareScrollView({
    keyboardContainerStyle,
    keyboardVerticalOffset = 0,
    keyboardDismissMode = Platform.OS === "ios" ? "interactive" : "on-drag",
    keyboardShouldPersistTaps = "handled",
    automaticallyAdjustKeyboardInsets = Platform.OS === "ios",
    ...scrollViewProps
}: KeyboardAwareScrollViewProps) {
    return (
        <KeyboardAwareView
            keyboardVerticalOffset={keyboardVerticalOffset}
            style={[styles.container, keyboardContainerStyle]}
        >
            <ScrollView
                automaticallyAdjustKeyboardInsets={automaticallyAdjustKeyboardInsets}
                keyboardDismissMode={keyboardDismissMode}
                keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                {...scrollViewProps}
            />
        </KeyboardAwareView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
