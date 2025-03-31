import messaging from '@react-native-firebase/messaging';
import { EventRegister } from 'react-native-event-listeners';

export const androidChannelId = 'SnapfoodAppNotificationChannel';
export const androidChannelDescription = 'Main Channel';

export const PUSH_NOTIFICATION_RECEIVED_EVENT = 'pushNotificationReceivedEvent';
export const PUSH_NOTIFICATION_OPENED_EVENT = 'pushNotificationOpenedEvent';
export const PUSH_NOTIFICATION_NEW_VENDOR = 'pushNotificationNewVendor';
export const PUSH_NOTIFICATION_NEW_BLOG = 'pushNotificationNewBlog';

export const setupPushNotifications = async () => {
	try {
		await messaging().requestPermission();
	} catch (e) {
		console.log('error', e);
	}
};
