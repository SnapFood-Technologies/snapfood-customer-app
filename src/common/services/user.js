import { isEmpty } from '../../common/services/utility';
import { getAddressByCoordinates, checkLocationPermission } from '../../common/services/location';
import { setStorageKey, getStorageKey, KEYS } from '../../common/services/storage';
import { TIRANA_CITY_LOCATION, NEWYORK_CITY_LOCATION } from '../../config/constants';
import GetLocation from 'react-native-get-location';
import * as RNLocalize from 'react-native-localize';

export const getDefaultCity = () => {
	let DEFAULT_CITY = TIRANA_CITY_LOCATION;
	try {
		let country = RNLocalize.getCountry();
		if (country != null && country.toLowerCase() == 'us') {
			DEFAULT_CITY = NEWYORK_CITY_LOCATION;
		}
	} catch (error) {}
	return DEFAULT_CITY;
};

export const getDefaultPhonePlaceholder = () => {
	let DEFAULT_PLACEHOLDER = 'phone_placeholder.al';
	try {
		let country = RNLocalize.getCountry();
		if (country != null && country.toLowerCase() == 'us') {
			DEFAULT_PLACEHOLDER = 'phone_placeholder.us';
		} else if (country != null && country.toLowerCase() == 'it') {
			DEFAULT_PLACEHOLDER = 'phone_placeholder.it';
		} else if (country != null && country.toLowerCase() == 'gr') {
			DEFAULT_PLACEHOLDER = 'phone_placeholder.gr';
		}
	} catch (error) {}
	return DEFAULT_PLACEHOLDER;
};

export const loadUserSetting = async (props, logged_user_data) => {
	try {
		let diff_city = false;
		let old_address = null;
		let old_location = null;
		let address = null;
		let location = await getStorageKey(KEYS.LAST_COORDINATES);

		if (location != null && location.latitude != null && location.longitude != null) {
			let has_cur_location = false;
			old_location = { ...location };
			old_address = await getAddressByCoordinates(old_location);

			try {
				let hasPermission = await checkLocationPermission();
				if (hasPermission) {
					location = await GetLocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
					address = await getAddressByCoordinates(location);
					has_cur_location = true;
				} else {
				}
			} catch (error) {}

			if (has_cur_location && logged_user_data != null) {
				if (address && address.city && old_address && old_address.city && address.city != old_address.city) {
					diff_city = true;
				}

				if (diff_city == false && old_location && location) {
					try {
						props.checkLocationDiff(location, old_location);
					} catch (error) {}
				}

				await props.setAddress({
					coordinates: {
						latitude: old_location.latitude,
						longitude: old_location.longitude,
					},
					address: old_address,
				});

				if (diff_city) {
					props.setShowChangeCityModal({
						showModal: true,
						new_address: address,
						new_location: location,
					});
				}

				if (logged_user_data != null) {
					if (isEmpty(logged_user_data.latitude) || isEmpty(logged_user_data.longitude)) {
						// for old users
						await props.updateProfileDetails({
							latitude: old_location.latitude,
							longitude: old_location.longitude,
						});
					}
					if (old_address != null) {
						const DEFAULT_CITY = getDefaultCity();
						let address_data = {
							lat: old_location.latitude,
							lng: old_location.longitude,
							country: old_address.country || DEFAULT_CITY.country,
							city: old_address.city || DEFAULT_CITY.city,
							street: old_address.street || DEFAULT_CITY.street,
						};
						await props.addDefaultAddress(address_data);
					}
				}
			}

			if (logged_user_data != null) {
				props.getAddresses();
				props.setAsLoggedIn();
			}

			await props.setUserNeedLogin(false);
		}
	} catch (error) {}
};
