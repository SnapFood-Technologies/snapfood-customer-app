import { useState, useEffect } from 'react';
import { NativeModules, Platform, StatusBar, Dimensions } from 'react-native';

const { StatusBarManager } = NativeModules;

export default function useStatusBarHeight() {
	const [height, setHeight] = useState(0);

	useEffect(() => {
		if (Platform.OS === 'ios') {
			const getStatusBarHeight = () => {
				StatusBarManager.getHeight((statusBarFrameData) => {
					setHeight(statusBarFrameData.height);
				});
			};

			getStatusBarHeight();

			// Listen for device orientation changes
			const subscription = Dimensions.addEventListener('change', getStatusBarHeight);

			return () => {
				subscription.remove();
			};
		} else {
			// For Android, we can directly use StatusBar.currentHeight
			setHeight(StatusBar.currentHeight || 0);
		}
	}, []);

	return height;
}