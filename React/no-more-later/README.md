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

## RevenueCat Test Store

Development builds use RevenueCat's Test Store so Premium purchases can be tested before Google Play and App Store Connect are connected. Configure the RevenueCat dashboard with these exact values:

- Entitlement: `premium`
- Test Store product: `no_more_later_premium_lifetime`
- Product type: lifetime/non-consumable
- Price: `GBP 4.99`
- Offering: `default`, marked as the current offering
- Package: `Lifetime`, attached to the Test Store product

Copy the public Test Store SDK key from **RevenueCat → Project settings → API keys** into `.env.local`:

```bash
EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY=test_your-public-test-store-sdk-key
```

For an EAS development build, add the same public key to the EAS `development` environment:

```bash
npx eas-cli@latest env:create \
  --environment development \
  --name EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY \
  --value test_your-public-test-store-sdk-key \
  --visibility plaintext
```

Then create and install a new development APK because `react-native-purchases` adds native code:

```bash
npx eas-cli@latest build --platform android --profile development
npx expo start --dev-client
```

The Test Store purchase dialog can simulate success, failure, and cancellation. A successful purchase must activate the `premium` entitlement. RevenueCat uses the signed-in Supabase user UUID as its App User ID, so the entitlement follows that account across devices.

Before testing, clear any **Force Premium** local override from the Account screen so access is driven by RevenueCat. To repeat the lifetime purchase for the same test account, find its Supabase user UUID under RevenueCat Customers and delete that sandbox customer before trying again.

Do not add this Test Store key to the EAS `production` environment or ship it in a production build. Replace it with the platform-specific Apple, Google, and web configuration when those stores are connected.

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

## Supabase migrations and tests

XP, Focus Session verification, and leaderboard scoring are calculated in Supabase. Apply pending migrations before testing a new app build:

```bash
npx supabase db push
```

Run the database locally and execute the XP protection tests:

```bash
npx supabase start
npx supabase db reset --local --no-seed
npx supabase test db
npx supabase db lint --local --level warning
```

XP V2 awards 3 XP per complete credited focus minute after five minutes. Completed work adds 20%, every level requires 500 XP, and up to 360 focus minutes per UTC day count toward XP and the focus-time leaderboards. Personal Progress still records time beyond the daily competitive limit.

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
