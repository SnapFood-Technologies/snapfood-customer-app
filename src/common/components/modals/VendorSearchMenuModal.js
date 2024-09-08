import {
	TouchableOpacity,
	View,
	Text,
	StyleSheet,
	TextInput,
	SafeAreaView,
	StatusBar,
	NativeModules,
	Platform,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-native-modal';
import { default as EvilIcon } from 'react-native-vector-icons/EvilIcons';
import { default as Feather } from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Theme from '../../../theme';
import { translate } from '../../services/translate';
import VendorSearchFoodList from '../../../modules/home/components/VendorSearchFoodList';
import { height, width } from 'react-native-dimension';
import AppText from '../AppText';

const { StatusBarManager } = NativeModules;

const VendorSearchMenuModal = ({ visible, props, onClose, products, navigation, vendor_id }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusBarHeight, setStatusBarHeight] = useState(0);

	useEffect(() => {
		if (Platform.OS === 'ios') {
			StatusBarManager.getHeight((response) => setStatusBarHeight(response.height));
		}
	}, [StatusBarManager]);

	const onCloseSearch = () => {
		setSearchTerm('');
		onClose.call();
	};

	return (
		<Modal
			isVisible={visible}
			animationIn={'slideInDown'}
			backdropOpacity={0.66}
			onSwipeComplete={() => onCloseSearch()}
			onBackdropPress={() => onCloseSearch()}
			useNativeDriverForBackdrop={true}
			// swipeDirection={['up']}
			style={{ justifyContent: 'flex-start', margin: 0 }}
			onRequestClose={() => onCloseSearch()}
		>
			<View style={[styles.searchContainer, { paddingTop: statusBarHeight }]}>
				<View style={[Theme.styles.row_center_start, styles.container]}>
					<View style={Theme.styles.row_center_start}>
						<EvilIcon name='search' size={26} color={Theme.colors.dark} style={{ left: 10 }} />
						<View style={{ left: 15 }}>
							<TextInput
								placeholder={translate('search.searchMenu')}
								placeholderTextColor={Theme.colors.gray5}
								value={searchTerm}
								onChangeText={(val) => {
									setSearchTerm(val);
								}}
								style={{fontSize: 18}}
								autoFocus={true}
								autoCapitalize={'none'}
								autoCorrect={false}
							/>
						</View>
					</View>
					<View style={[Theme.styles.row_center]}>
						<Feather
							name='delete'
							size={20}
							color={Theme.colors.dark}
							style={{ left: -15 }}
							onPress={() => setSearchTerm('')}
						/>
						<TouchableOpacity onPress={onCloseSearch} style={styles.close}>
							<AppText style={styles.cancel}>{translate('cancel')}</AppText>
						</TouchableOpacity>
					</View>
				</View>

				<VendorSearchFoodList
					vendor_id={vendor_id}
					navigation={navigation}
					searchTerm={searchTerm}
					onClose={onCloseSearch}
				/>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	screen: { flex: 1, flexDirection: 'row', alignContent: 'stretch', backgroundColor: Theme.colors.white },
	overlay: { width: width(100), height: height(100), flexDirection: 'column', position: 'absolute', top: 0, left: 0 },
	container: {
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 0,
		width: '100%',
		height: 60,
		backgroundColor: Theme.colors.white,
	},
	cancel: { fontSize: 16, color: Theme.colors.text, paddingLeft: 10 },
	close: { borderLeftWidth: 1, borderColor: '#E9E9F7', right: 10, paddingBottom: 4 },
	searchContainer: { backgroundColor: 'white' },
	input: {
		margin: 0,
		flex: 1,
		color: Theme.colors.text,
		fontSize: 16,
		fontFamily: Theme.fonts.medium,
		height: 40,
	},
});
export default VendorSearchMenuModal;
