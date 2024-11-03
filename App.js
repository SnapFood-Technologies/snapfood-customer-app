import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Provider } from 'react-redux';
import { width } from 'react-native-dimension';
import Feather from 'react-native-vector-icons/Feather';
import { initStripe } from '@stripe/stripe-react-native';
import Toast from 'react-native-toast-message';
import store from './src/store';
import AppRoot from './src/AppRoot';
import { MenuProvider } from 'react-native-popup-menu';
import Config from './src/config';
import Theme from './src/theme';

console.disableYellowBox = true;

const toastConfig = {
	vendorCloseToast: ({ text1, props }) => (
		<TouchableOpacity
			onPress={() => {
				Toast.hide();
			}}
			style={[
				Theme.styles.row_start_center,
				{ padding: 15, borderRadius: 12, width: width(100) - 40, backgroundColor: Theme.colors.cyan2 },
			]}
		>
			<View style={[Theme.styles.row_center]}>
				<Feather name='clock' size={18} color={'#FFF'} />
				<Text
					style={{
						marginLeft: 10,
						flex: 1,
						fontSize: 17,
						lineHeight: 21,
						fontFamily: Theme.fonts.semiBold,
						color: Theme.colors.white,
					}}
				>
					{text1}
				</Text>
			</View>
			<Feather name='x' size={18} color={'#FFF'} />
		</TouchableOpacity>
	),
	showInfoToast: ({ text1, props }) => (
		<TouchableOpacity
			onPress={() => {
				Toast.hide();
			}}
			style={[
				Theme.styles.row_center,
				{ padding: 15, borderRadius: 12, width: width(100) - 40, backgroundColor: Theme.colors.cyan2 },
			]}
		>
			<Text
				style={{
					marginLeft: 10,
					flex: 1,
					fontSize: 17,
					lineHeight: 21,
					fontFamily: Theme.fonts.semiBold,
					color: Theme.colors.white,
				}}
			>
				{text1}
			</Text>
		</TouchableOpacity>
	),
};
class App extends Component {
	componentDidMount() {
		if (Config.isAndroid == false) {
			initStripe({
				// stripe initialize for apple pay
				publishableKey: Config.STRIPE_PUB_KEY,
				merchantIdentifier: Config.APPlE_MERCHANT_ID,
			});
		}
	}

	render() {
		return (
			<MenuProvider>
				<Provider store={store}>
					<View style={{ flex: 1 }}>
						<AppRoot />
						<Toast config={toastConfig} />
					</View>
				</Provider>
			</MenuProvider>
		);
	}
}

export default App;
