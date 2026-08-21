const { registerFocusNotificationHandlers } = require("./services/notifications/focusNotificationService");

registerFocusNotificationHandlers();

require("expo-router/entry");
