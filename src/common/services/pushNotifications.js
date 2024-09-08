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
		const fcmToken = await messaging().getToken();
		console.log('FIREBASE TOKEN: ', fcmToken);

		messaging().onNotificationOpenedApp((remoteMessage) => {
			console.log('onNotification OpenedApp', remoteMessage);
			EventRegister.emit(PUSH_NOTIFICATION_RECEIVED_EVENT, remoteMessage);
		});

		const notificationOpen = await messaging().getInitialNotification();
		if (notificationOpen) {
			console.log('onNotification OpenedApp', notificationOpen);
			EventRegister.emit(PUSH_NOTIFICATION_RECEIVED_EVENT, notificationOpen);
		}
		return notificationOpen;
	} catch (e) {
		console.log(e);
	}
};
