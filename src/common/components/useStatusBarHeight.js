import { useState, useEffect } from 'react';
import { NativeModules, StatusBarIOS, Platform, StatusBar } from 'react-native';

const { StatusBarManager } = NativeModules;

export default function useStatusBarHeight() {
	const [height, setHeight] = useState(StatusBar.currentHeight || 20);

	useEffect(() => {
		if (Platform.OS !== 'ios'){
			setHeight(20);
			return;
		}

		StatusBarManager.getHeight(({ height }) => setHeight(height));
		const listener = StatusBarIOS.addListener('statusBarFrameWillChange', (data) => {
			setHeight(data?.statusBarData?.frame?.height || 20);
		});

		return () => listener.remove();
	}, []);

	return height;
}
