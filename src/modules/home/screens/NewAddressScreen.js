import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { height } from 'react-native-dimension';
import { TouchableOpacity } from "react-native-gesture-handler";
import MainRNGHButton from '../../../common/components/buttons/mainRNGHbtn';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RBSheet from 'react-native-raw-bottom-sheet';
import { connect } from 'react-redux';
import { setAddress, saveAddress, getAddresses, setTmpLocationPicked } from '../../../store/actions/app';
import { updateProfileDetails } from '../../../store/actions/auth';
import { extractErrorMessage } from '../../../common/services/utility';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import Theme from '../../../theme';
import MainBtn from '../../../common/components/buttons/main_button';
import DotBorderButton from '../../../common/components/buttons/dot_border_button';
import Dropdown from '../components/Dropdown';
import RNGH_Header from '../../../common/components/Header';
import RouteNames from '../../../routes/names';
import CommentView from '../../home/components/CommentView';
import AutoLocInput from '../../../common/components/AutoLocInput';
import AuthInput from '../../../common/components/AuthInput';

const NewAddressScreen = (props) => {
	const isEdit = props.route.params.isEdit;
	const isFromCart = props.route.params.isFromCart;
	const [loading, setLoading] = useState(false);
	const [address_text, setAddressText] = useState('');
	const [address_label, setAddressLabel] = useState('');

	const _RBSheet = useRef(null);

	useEffect(() => {
		return () => {
			console.log('NewAddressScreen screen unmount');
		};
	}, []);

	useEffect(() => {
		let text = props.tmp_new_address.street || '';
		if (props.tmp_new_address.city != null && props.tmp_new_address.city != '') {
			text = `${text} ${props.tmp_new_address.city}`;
		}
		if (props.tmp_new_address.country != null && props.tmp_new_address.country != '') {
			text = `${text}, ${props.tmp_new_address.country}`;
		}
		setAddressText(text);
	}, [props.tmp_new_address]);

	const onlyUnique = (value, index, self) => {
		return self.indexOf(value) === index;
	};

	const _renderType = () => {
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView, { paddingVertical: 20 }]}>
				<View style={[Theme.styles.row_center, { width: '100%' }]}>
					<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>
						{translate('address_new.address_name')}
					</Text>
					<Dropdown
						list_items={
							!props.tmp_new_address.address_type
								? ['Home', 'Work', 'Custom']
								: ['Home', 'Work', 'Custom', props.tmp_new_address.address_type].filter(onlyUnique)
						}
						style={{ width: 155 }}
						item_height={40}
						value={props.tmp_new_address.address_type || 'Home'}
						onChange={(text) => {
							if (text === 'Custom') {
								_RBSheet.current?.open();
							}
							else {
								setAddressLabel('')
								props.setTmpLocationPicked({
									...props.tmp_new_address,
									address_type: text,
								});
							}

						}}
					/>
				</View>
			</View>
		);
	};

	const _renderForm = () => {
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView]}>
				<View style={{ width: '100%', paddingBottom: 20 }}>
					<Text style={[styles.subjectTitle, { marginBottom: 12 }]}>{translate('address_new.street')}</Text>
					<TouchableOpacity activeOpacity={1}>
						<AutoLocInput
							address_text={address_text}
							onChange={(location, address) => {
								let tmpAddress = {
									coords: {
										latitude: location.latitude,
										longitude: location.longitude,
									},
									street: address.street,
									building: address.building,
									country: address.country,
									city: address.city,
								};
								props.setTmpLocationPicked({
									...props.tmp_new_address,
									...tmpAddress,
								});
							}}
						/>
					</TouchableOpacity>
					<View style={{ height: 12 }} />
					<CommentView
						title={translate('address_new.note')}
						placeholder={translate('address_new.note_placeholder')}
						comments={props.tmp_new_address.notes}
						onChangeText={(text) => {
							props.setTmpLocationPicked({
								...props.tmp_new_address,
								notes: text,
							});
						}}
					/>
				</View>
				<DotBorderButton
					title={
						(props.tmp_new_address.street || '') != '' || (props.tmp_new_address.building || '') != ''
							? translate('address_new.relocate_on_map')
							: translate('address_new.find_on_map')
					}
					style={{ width: '100%' }}
					onPress={() => {
						props.navigation.navigate(RouteNames.AddressMapScreen, {
							isEdit: true,
							isFromCart: isFromCart,
							isFromNewAddress: true,
							street: props.tmp_new_address.street || '',
							building: props.tmp_new_address.building || '',
							country: props.tmp_new_address.country || '',
							city: props.tmp_new_address.city || '',
							coords:
								props.tmp_new_address.coords != null && props.tmp_new_address.coords.latitude != null
									? props.tmp_new_address.coords
									: props.coordinates,
						});
					}}
				/>
			</View>
		);
	};


	const _renderBottomSheetForLabel = () => {
		return (
			<RBSheet
				ref={_RBSheet}
				closeOnDragDown={true}
				duration={300}
				closeOnPressBack={true}
				height={250}
				customStyles={{
					container: {
						borderTopLeftRadius: 10,
						borderTopRightRadius: 10,
						alignItems: 'center',
					},
				}}
				onClose={() => {
					console.log('dsad');
				}}
			>
				<View style={styles.rbSheetView}>
					<Text style={[styles.subjectTitle]}>{translate('address_new.address_label')}</Text>
					<AuthInput
						placeholder={translate('address_new.address_label')}
						underlineColorAndroid={'transparent'}
						placeholderTextColor={'#DFDFDF'}
						selectionColor={Theme.colors.cyan2}
						fontSize={17}
						onChangeText={(value) => setAddressLabel(value)}
						autoCapitalize={'none'}
						value={address_label}
						secure={false}
						style={{ marginTop: 10 }}
					/>
					<View style={{ width: '100%', paddingVertical: 20 }}>
						<MainBtn
							disabled={loading}
							loading={loading}
							title={translate('address_new.save_button')}
							onPress={() => {
								console.log('on presss')
								if (address_label.length > 0) {
									props.setTmpLocationPicked({
										...props.tmp_new_address,
										address_type: address_label,
									});
									_RBSheet.current?.close();
								}
							}}
						/>
					</View>
					<RNTouchableOpacity
						style={[Theme.styles.col_center, styles.closeBtn]}
						onPress={() => _RBSheet.current?.close()}
					>
						<Text style={[styles.subjectTitle]}>{translate('cancel')}</Text>
					</RNTouchableOpacity>
				</View>
			</RBSheet >
		);
	};

	const onSaveAddress = async () => {
		if (props.tmp_new_address == null || props.tmp_new_address.coords == null) {
			return alerts.error(translate('attention'), translate('add_new_address.please_enter_address'));
		}

		let lat = props.coordinates.latitude;
		let lng = props.coordinates.longitude;
		if (props.tmp_new_address.coords != null) {
			lat = props.tmp_new_address.coords.latitude || props.coordinates.latitude;
			lng = props.tmp_new_address.coords.longitude || props.coordinates.longitude;
		}

		let country = props.tmp_new_address.country || props.address.country;
		let city = props.tmp_new_address.city || props.address.city;

		let new_address = {
			id: props.tmp_new_address.id,
			address_type: props.tmp_new_address.address_type || 'Home',
			notes: props.tmp_new_address.notes,
			lat: lat,
			lng: lng,
			country: country,
			city: city,
			street: props.tmp_new_address.street || city,
			building: props.tmp_new_address.building,
			floor: props.tmp_new_address.floor,
			apartment: props.tmp_new_address.apartment,
			favourite: 1,
		};

		try {
			setLoading(true);
			await props.saveAddress(new_address);
			await props.getAddresses();

			await props.updateProfileDetails({
				latitude: new_address.lat,
				longitude: new_address.lng,
			});

			await props.setAddress({
				coordinates: {
					latitude: new_address.lat,
					longitude: new_address.lng
				},
				address: {
					country: new_address.country,
					city: new_address.city,
					street: new_address.street,
				},
			});

			setLoading(false);

			if (isFromCart) {
				props.navigation.goBack();
			}
			props.navigation.goBack();
		} catch (error) {
			console.log('error', error);
			setLoading(false);
			alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(error));
		}
	};

	return (
		<View style={styles.container}>
			<RNGH_Header
				style={{ marginBottom: 0, paddingHorizontal: 20 }}
				onLeft={() => {
					props.navigation.goBack();
				}}
				title={isEdit ? translate('address_edit.header_title') : translate('address_new.header_title')}
			/>
			<KeyboardAwareScrollView style={[{ flex: 1, width: '100%', paddingHorizontal: 20 }]} keyboardShouldPersistTaps='handled'>
				<View style={styles.formView}>
					{_renderType()}
					{_renderForm()}
				</View>
				{
					<View style={{ width: '100%', paddingVertical: 20 }}>
						<MainRNGHButton
							disabled={loading}
							loading={loading}
							title={translate('address_new.submit')}
							onPress={() => {
								onSaveAddress();
							}}
						/>
					</View>
				}
			</KeyboardAwareScrollView>
			{_renderBottomSheetForLabel()}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		minHeight: height(100) - 20,
		flexDirection: 'column',
		alignItems: 'center',
		paddingVertical: 20,
		backgroundColor: Theme.colors.white,
	},
	rbSheetView: {
		height: '100%',
		width: '100%',
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		backgroundColor: '#fff',
		padding: 10,
	},
	formView: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '100%',
	},
	marginB20: { marginBottom: 20 },
	subjectTitle: { fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	sectionView: { width: '100%', alignItems: 'flex-start' },
	locationSearch: {
		alignItems: 'flex-start',
		borderWidth: 1,
		borderColor: Theme.colors.gray6,
		borderRadius: 12,
		// height: 45,
		width: '100%',
		paddingLeft: 12,
		backgroundColor: Theme.colors.white,
		marginBottom: 20,
	},
	locPin: { height: 42, width: 30, marginRight: 6 },
});

const mapStateToProps = ({ app }) => ({
	language: app.language,
	tmp_new_address: app.tmp_new_address,
	coordinates: app.coordinates,
	address: app.address,
});

export default connect(mapStateToProps, {
	saveAddress,
	getAddresses,
	setTmpLocationPicked,
	updateProfileDetails,
	setAddress
})(NewAddressScreen);
