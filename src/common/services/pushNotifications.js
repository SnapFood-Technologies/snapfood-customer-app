import { LogLevel, OneSignal } from 'react-native-onesignal';
import { Platform } from 'react-native';

export const androidChannelId = 'SnapfoodAppNotificationChannel';

export const PUSH_NOTIFICATION_RECEIVED_EVENT = 'push-notification-received';
export const PUSH_NOTIFICATION_OPENED_EVENT = 'push-notification-opened';
export const PUSH_NOTIFICATION_NEW_VENDOR = 'vendor_notification';
export const PUSH_NOTIFICATION_NEW_BLOG = 'blog_notification';

OneSignal.Debug.setLogLevel(LogLevel.Verbose);

export const setupPushNotifications = async () => {
	try {
		// Initialize OneSignal
		OneSignal.initialize('723e0d81-3494-4f77-8505-53c7a5c243b9');

		// Enable verbose logging
		OneSignal.Debug.setLogLevel(LogLevel.Verbose);

		// Request notification permissions
		const deviceState = await OneSignal.getDeviceState();
		if (!deviceState.hasNotificationPermission) {
			await OneSignal.Notifications.requestPermission(true);
		}

		// Configure notification channel for Android
		if (Platform.OS === 'android') {
			OneSignal.Notifications.createNotificationChannelGroup({
				id: 'snapfood_notifications',
				name: 'Snapfood Notifications',
			});

			OneSignal.Notifications.createNotificationChannel({
				id: androidChannelId,
				name: 'Snapfood Notifications',
				importance: 4, // HIGH
				enableVibrate: true,
				enableSound: true,
				groupId: 'snapfood_notifications',
			});
		}
	} catch (e) {
		console.log('OneSignal setup error:', e);
	}
};

export const setExternalUserId = async (userId) => {
	if (!userId) return;

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

export const addTags = async (tags) => {
	try {
		await OneSignal.User.addTags(tags);
		console.log('OneSignal: Tags added successfully');
	} catch (error) {
		console.error('OneSignal: Failed to add tags:', error);
	}
};

export const deleteTags = async (keys) => {
	try {
		await OneSignal.User.removeTags(keys);
		console.log('OneSignal: Tags removed successfully');
	} catch (error) {
		console.error('OneSignal: Failed to remove tags:', error);
	}
};
