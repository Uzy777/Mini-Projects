const { AndroidConfig, withAndroidManifest, withDangerousMod } = require("expo/config-plugins");
const fs = require("fs/promises");
const path = require("path");

const FOREGROUND_SERVICE_PERMISSION = "android.permission.FOREGROUND_SERVICE_SPECIAL_USE";
const NOTIFEE_FOREGROUND_SERVICE = "app.notifee.core.ForegroundService";

const notificationIcon = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M9,2h6v2H9zM11,8h2v5.17l3.24,1.87 -1,1.73L11,14.32zM12,5a8,8 0,1 0,8 8,8 8,0 0,0 -8,-8zM12,19a6,6 0,1 1,6 -6,6 6,0 0,1 -6,6z" />
</vector>
`;

/** @type {import("expo/config-plugins").ConfigPlugin} */
function withNotifeeAndroid(config) {
    config = withAndroidManifest(config, (androidConfig) => {
        androidConfig.modResults = AndroidConfig.Manifest.ensureToolsAvailable(androidConfig.modResults);

        const manifest = androidConfig.modResults.manifest;
        const permissions = manifest["uses-permission"] ?? [];

        if (!permissions.some((permission) => permission.$["android:name"] === FOREGROUND_SERVICE_PERMISSION)) {
            permissions.push({ $: { "android:name": FOREGROUND_SERVICE_PERMISSION } });
        }

        manifest["uses-permission"] = permissions;

        const application = AndroidConfig.Manifest.getMainApplicationOrThrow(androidConfig.modResults);
        const services = application.service ?? [];
        const existingService = services.find((service) => service.$["android:name"] === NOTIFEE_FOREGROUND_SERVICE);
        const foregroundService = existingService ?? {
            $: {
                "android:name": NOTIFEE_FOREGROUND_SERVICE,
                "android:exported": "false",
            },
        };

        foregroundService.$["android:foregroundServiceType"] = "specialUse";
        foregroundService.$["tools:replace"] = "android:foregroundServiceType";
        foregroundService.property = [
            {
                $: {
                    "android:name": "android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE",
                    "android:value": "Keeps a user-started Focus Session countdown active while the app is backgrounded.",
                },
            },
        ];

        if (!existingService) {
            services.push(foregroundService);
        }

        application.service = services;

        return androidConfig;
    });

    return withDangerousMod(config, [
        "android",
        async (androidConfig) => {
            const drawableDirectory = path.join(androidConfig.modRequest.platformProjectRoot, "app", "src", "main", "res", "drawable");

            await fs.mkdir(drawableDirectory, { recursive: true });
            await fs.writeFile(path.join(drawableDirectory, "ic_focus_notification.xml"), notificationIcon);

            return androidConfig;
        },
    ]);
}

module.exports = withNotifeeAndroid;
