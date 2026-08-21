# No More Later

## Install dependencies

```bash
npm install
```

## Android development

No More Later uses native modules such as Notifee, so it cannot run in Expo Go. Use the custom development client instead.

Build and install the development APK when setting up a device for the first time, or after native dependencies or native configuration change:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile development
```

Install the APK supplied by EAS. For normal day-to-day TypeScript, JavaScript, and styling development, start Metro with:

```bash
npx expo start --dev-client
```

Open the installed No More Later development client rather than Expo Go. Most non-native changes are loaded through Metro with Fast Refresh and do not require another APK.

To compile and install a development build locally on a USB-connected Android device instead of using EAS Build:

```bash
npx expo run:android --device
```

## Preview APK

Create a standalone, release-like APK that runs without Metro:

```bash
npx eas-cli@latest build --platform android --profile preview
```

Download the resulting APK from EAS, install it, and launch No More Later directly.

### Update an installed preview build

After testing changes in the development client, publish compatible TypeScript, JavaScript, styling, and bundled asset changes to the installed preview build:

```bash
npx eas-cli@latest update \
  --channel preview \
  --environment preview \
  --message "Describe the changes"
```

Open the preview app so it can download the update, fully close it, and open it again to apply the update. A second restart may occasionally be needed.

An EAS Update cannot add or change native code. Create and install a new preview APK after changing:

- Native dependencies, including Notifee or `expo-dev-client`.
- Expo config plugins.
- Android permissions, notification icons, notification sounds, or other native configuration.
- Native Android/iOS source code.
- The runtime version in a way that makes the existing APK incompatible.

## Useful EAS commands

```bash
# Confirm which Expo account is signed in
npx eas-cli@latest whoami

# List recent builds
npx eas-cli@latest build:list

# List published updates
npx eas-cli@latest update:list --branch preview
```

## Project checks

```bash
npm run lint
npx tsc --noEmit
npx expo-doctor
```

## Verify the generated Android manifest

Generate the Android project and run Gradle's manifest merge task:

```bash
npx expo prebuild --platform android --no-install

cd android
ANDROID_HOME=/path/to/Android/Sdk ./gradlew :app:processDebugMainManifest
```

The Gradle command should finish with `BUILD SUCCESSFUL`. The generated `android/` directory is ignored because EAS Build generates the native project from the Expo configuration.

## Commit prefixes

```text
feature   New functionality
fix       Bug fix
refactor  Code restructuring without changing behaviour
style     UI/styling changes
docs      Documentation
chore     Maintenance/config/dependencies
test      Tests
```
