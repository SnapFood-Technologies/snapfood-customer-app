import { OneSignal, LogLevel } from 'react-native-onesignal';

export const androidChannelId = 'SnapfoodAppNotificationChannel';
export const androidChannelDescription = 'Main Channel';

export const PUSH_NOTIFICATION_RECEIVED_EVENT = 'pushNotificationReceivedEvent';
export const PUSH_NOTIFICATION_OPENED_EVENT = 'pushNotificationOpenedEvent';
export const PUSH_NOTIFICATION_NEW_VENDOR = 'pushNotificationNewVendor';
export const PUSH_NOTIFICATION_NEW_BLOG = 'pushNotificationNewBlog';

export const setupPushNotifications = async (userId) => {
	try {
		// Initialize OneSignal
		OneSignal.initialize('723e0d81-3494-4f77-8505-53c7a5c243b9');

		// Enable verbose logging
		OneSignal.Debug.setLogLevel(LogLevel.Verbose);

		// Request notification permissions
		const deviceState = await OneSignal.Notifications.getPermissionAsync();

		if (!deviceState.hasNotificationPermission) {
			await OneSignal.Notifications.requestPermission(true);
		}
		console.log('deviceState', userId);
		await setExternalUserId(userId);

		// Configure notification channel for Android
	} catch (e) {
		console.log('OneSignal setup error:', e);
	}
};

export const setExternalUserId = async (userId) => {
	if (!userId) return;
	console.log('userIduserId', userId);

	try {
		await OneSignal.login(userId.toString());
		console.log('OneSignal: External user ID set successfully');
	} catch (error) {
		console.error('OneSignal: Failed to set external user ID:', error);
	}
};

export const removeExternalUserId = async () => {
	try {
		await OneSignal.logout();
		console.log('OneSignal: External user ID removed successfully');
	} catch (error) {
		console.error('OneSignal: Failed to remove external user ID:', error);
	}
};
