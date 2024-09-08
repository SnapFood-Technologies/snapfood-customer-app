import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux'
import Swipeout from 'react-native-swipeout';
import Spinner from 'react-native-loading-spinner-overlay';
import {
	setAddress,
	getAddresses,
	saveAddress,
	deleteAddress,
	setLocallyAddresses,
	setTmpLocationPicked,
} from '../../../store/actions/app';
import { updateProfileDetails } from '../../../store/actions/auth';
import { translate } from '../../../common/services/translate';
import { extractErrorMessage, openExternalUrl } from '../../../common/services/utility';
import alerts from '../../../common/services/alerts';
import Theme from '../../../theme';
import ConfirmModal from '../../../common/components/modals/ConfirmModal'
import MainBtn from '../../../common/components/buttons/main_button';
import Header1 from '../../../common/components/Header1';
import RouteNames from '../../../routes/names';
import AddressItem from '../../../common/components/AddressItem';
import AddressOptionModal from '../../../common/components/modals/AddressOptionModal';

const AddressesScreen = (props) => {

	const isFromCart = props.route.params != null ? props.route.params.isFromCart == true : false;

	const [selectedAddress, setSelectedAddress] = useState(null);
	const [isActionModal, ShowActionModal] = useState(false);
	const [isConfirmModal, ShowConfirmModal] = useState(false);

	const [isLoading, showLoading] = useState(false);

	useEffect(async () => {
		try {
			await props.getAddresses()
		}
		catch (error) {
			console.log('error', error)
		}
	}, [])

	const onEditAddress = (addressItem) => {
		let tmpAddress = {
			...addressItem,
			coords: {
				latitude: addressItem.lat,
				longitude: addressItem.lng,
			},
		}
		props.setTmpLocationPicked(tmpAddress)
		props.navigation.navigate(RouteNames.AddressMapScreen, {
			isEdit: true,
			isFromCart: isFromCart,
			isFromNewAddress : false,
			street: tmpAddress.street || '',
			building: tmpAddress.building || '',
			country: tmpAddress.country || '',
			city: tmpAddress.city || '',
			coords:
				tmpAddress.coords != null && tmpAddress.coords.latitude != null
					? tmpAddress.coords
					: props.coordinates,
		});
	}

	const onAddAddress = () => {
		props.setTmpLocationPicked({})
		props.navigation.navigate(RouteNames.AddressMapScreen, {
			isEdit: false,
			isFromCart: isFromCart,
			isFromNewAddress : false,
			street: '',
			building: '',
			coords: props.coordinates
		});
	}

	const onSelectAddress = async (addressItem) => {
		try {
			ShowActionModal(false)
			if (addressItem == null) { return; }
			showLoading(true);
			let item = { ...addressItem };

			item.favourite = 1;
			await props.saveAddress(item);
			await props.getAddresses();

			await props.updateProfileDetails({
				latitude: addressItem.lat,
				longitude: addressItem.lng,
			});

			await props.setAddress({
				coordinates: {
					latitude: addressItem.lat,
					longitude: addressItem.lng
				},
				address: {
					country: addressItem.country,
					city: addressItem.city,
					street: addressItem.street,
				},
			});

			showLoading(false);
			if (isFromCart) {
				props.navigation.goBack()
			}
		}
		catch (error) {
			showLoading(false);
			console.log('error', error)
			alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(error));
		}
	}

	const onDeleteAddress = async () => {
		try {
			ShowConfirmModal(false)
			if (selectedAddress == null) { return; }
			await props.deleteAddress(selectedAddress.id);
			await props.getAddresses();
		}
		catch (error) {
			console.log('error', error)
			alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(error));
		}
	}

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			<Spinner visible={isLoading} />
			<Header1
				style={{ marginTop: 10, marginBottom: 10, paddingHorizontal: 20 }}
				onLeft={() => { props.navigation.goBack() }}
				title={translate('address_list.header_title')}
			/>
			<ScrollView style={styles.scrollview}>
				{
					props.addresses.map((addressItem, index) =>
						<Swipeout
							autoClose={true}
							key={index}
							disabled={isFromCart || addressItem.favourite == 1}
							backgroundColor={Theme.colors.white}
							style={{ marginBottom: 16 }}
							right={[
								{
									text: translate('address_list.delete'),
									backgroundColor: '#f44336',
									underlayColor: 'rgba(0, 0, 0, 0.6)',
									onPress: () => {
										setSelectedAddress(addressItem);
										ShowConfirmModal(true);
									},
								},
							]}
						>
							<AddressItem
								data={addressItem}
								hideMoreBtn={isFromCart}
								onEdit={() => {
									onEditAddress(addressItem)
								}}
								onMore={() => {
									setSelectedAddress(addressItem);
									ShowActionModal(true);
								}}
								onSelect={() => {
									if (isFromCart) {
										onSelectAddress(addressItem);
									}
								}}
							/>

						</Swipeout>
					)
				}
				<View style={{ height: 20, }} />
			</ScrollView>
			<View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 40 }}>
				<MainBtn
					title={translate('address_list.add_new_address')}
					onPress={onAddAddress}
				/>
			</View>
			<ConfirmModal showModal={isConfirmModal}
				title={translate('address_list.delete_confirm')}
				yes={translate('address_list.delete_confirm_yes')} no={translate('address_list.delete_confirm_no')}
				onYes={onDeleteAddress}
				onClose={() => ShowConfirmModal(false)} />
			<AddressOptionModal
				showModal={isActionModal}
				goDelete={() => {
					ShowActionModal(false)
					ShowConfirmModal(true);
				}}
				goPrimary={() => onSelectAddress(selectedAddress)}
				onClose={() => ShowActionModal(false)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	scrollview: { flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: Theme.colors.white },
	categList: { marginTop: 16, },
	scrollviewHider: { width: '100%', marginTop: -12, height: 15, backgroundColor: Theme.colors.white },

})


const mapStateToProps = ({ app }) => ({
	addresses: app.addresses || [],
	coordinates: app.coordinates,
});

export default connect(mapStateToProps, {
	saveAddress, getAddresses, deleteAddress, setTmpLocationPicked, setLocallyAddresses, updateProfileDetails, setAddress
})(AddressesScreen);
