import RNLocation from 'react-native-location';
import AndroidOpenSettings from 'react-native-android-open-settings';
import { Linking } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

import apiFactory from './apiFactory';
import Config from '../../config';
import alerts from './alerts';
import { translate } from './translate';
import GLOBAL from '../../common/services/global';

export const NO_PERMISSION = 'NO_PERMISSION';

export const getLatDelta = (distance) => {
	// 1 latitude delta = 69 miles  =  69 * 1609 meters
	let radius = distance + 100; // 100m offset
	let radius_delta = radius / (69 * 1609);
	return radius_delta * 2;
}

export const checkLocationPermission = () => {
	return new Promise((resolve, reject) => {
		RNLocation.checkPermission({
			ios: 'whenInUse',
			android: {
				detail: 'fine',
			},
		}).then(resolve, reject);
	});
};

export const getCurrentLocationPermission = async () => {
	return new Promise((resolve, reject) => {
		RNLocation.getCurrentPermission().then((res) => {
			if (res == 'authorizedAlways') {
				resolve('always');
			}
			else if (res == 'authorizedCoarse' || res == 'authorizedFine' || res == 'authorizedWhenInUse') {
				resolve('inuse');
			}
			else if (res == 'denied' || res == 'restricted') {
				resolve('denied');
			}
			else {
				resolve('');
			}
			console.log('getCurrentPermission ', res)
		})
			.catch(err => {
				console.log(err);
				resolve('');
			});
	});
}

export const setupLocationUpdates = async () => {
	const permission = await getCurrentLocationPermission();

	apiFactory.put('users/update_location', {
		location_permission: permission,
	})
	.then(async ({ data }) => {})
	.catch((err) =>{});

	if (permission == 'denied' || permission == '') {
		return;
	}

	console.log('GLOBAL.watchID ', GLOBAL.watchID)
	if (GLOBAL.watchID) {
		Geolocation.clearWatch(GLOBAL.watchID);
		GLOBAL.watchID = null;
	}

	GLOBAL.watchID = Geolocation.watchPosition(
		(position) => {
			console.log('location Update ', position);
 
			apiFactory.put('users/update_location', {
				map_latitude: position.coords.latitude,
				map_longitude: position.coords.longitude,
				location_permission: permission,
			}).then(async ({ data }) => {})
			.catch((err) =>{});
		},
		(error) => {
			console.log(error);
		},
		{
			accuracy: {
				android: 'high',
				ios: 'best',
			},
			enableHighAccuracy: true,
			distanceFilter: 0,
			interval: 30000,
			fastestInterval: 2000,
			forceRequestLocation: true,
			showLocationDialog: true,
			useSignificantChanges: true,
		},
	);
};

export const showAlertSetting = (resolve, reject) => {
	alerts
		.confirmation(translate('attention'), translate('locationUnavailable'), 'Settings', translate('cancel'))
		.then(
			() => {
				if (Config.isAndroid) {
					AndroidOpenSettings.locationSourceSettings();
				} else {
					Linking.openURL('app-settings:');
				}
			},
			(error) => {
				reject(error);
			}
		);
};

export const requestLocationPermission = () => {
	return new Promise((resolve, reject) => {
		RNLocation.requestPermission({
			ios: 'whenInUse',
			android: {
				detail: 'fine',
			},
		}).then((granted) => {
			if (!granted) {
				showAlertSetting(resolve, reject);
			} else {
				resolve();
			}
		});
	});
};

export const getCurrentLocation = () => {
	return new Promise((resolve, reject) => {
		RNLocation.getLatestLocation({ timeout: 600000 }).then((location) => {

			if (location) {
				resolve(location);
			} else {
				reject({
					code: NO_PERMISSION,
				});
			}
		})
			.catch((error) => {
				reject(error);
			});
	});
};

export const getAddressByCoordinates = ({ latitude, longitude }) => {

	return new Promise((resolve, reject) => {
		apiFactory(
			`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${Config.GOOGLE_MAP_API_KEY}`
		).then((res) => {
			if (res.data.results.length === 0) {
				apiFactory(
					`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${Config.API_KEY_OPEN_CAGE}`
				).then(({ data }) => {
					let addressComponents = data.results[0].components;
					let addressComponentStreet = addressComponents.road;

					if (!addressComponentStreet) {
						addressComponentStreet = addressComponents.suburb;
					} else {
						addressComponentStreet = addressComponents.road;
					}

					//Manage Translate of Pristina
					let addressComponentCity = addressComponents.city;

					if (addressComponentCity === 'Pristina') {
						addressComponentCity = 'Prishtinë';
					} else {
						addressComponentCity = addressComponents.city;
					}

					if (addressComponentCity === 'Tiranë') {
						addressComponentCity = 'Tirana';
					} else {
						addressComponentCity = addressComponents.city;
					}

					//Manage Translate of Kosovo
					let addressComponentCountry = addressComponents.country;

					if (addressComponentCountry === 'Kosovo') {
						addressComponentCountry = 'Kosove';
					} else {
						addressComponentCountry = addressComponents.country;
					}


					let address = {
						city: addressComponentCity,
						country: addressComponentCountry,
						isoCountryCode: '',
						name: addressComponentStreet,
						region: '',
						street: addressComponentStreet,
						building: addressComponents.municipality || ''
					};
					resolve(address);
				});
			} else {
				let street = '';
				let city = '';
				let building = '';
				let country = '';
				var details = res.data.results;
				details.forEach(detail => {
					if (detail.types.includes('route')) {
						for (let i = 0; i < detail.address_components.length; i++) {
							// console.log(details.address_components[i].types, details.address_components[i].long_name) 
							//street
							if (
								detail.address_components[i].types.includes('neighborhood') ||
								detail.address_components[i].types.includes('route')
							) {
								street = detail.address_components[i].long_name;
							}

							// city
							if (
								detail.address_components[i].types.includes('locality') ||
								detail.address_components[i].types.includes('postal_town')
							) {
								city = detail.address_components[i].long_name;
								if (city === 'Tiranë') {
									city = 'Tirana';
								}
							}

							// country
							if (detail.address_components[i].types.includes('country')) {
								country = detail.address_components[i].long_name;
							}

							// building
							if (
								detail.address_components[i].types.includes('premise') ||
								detail.address_components[i].types.includes('floor')
							) {
								building = detail.address_components[i].long_name;
							}
						}
					}
				});


				let address = {
					building: building,
					street: street,
					city: city,
					country: country,
					isoCountryCode: '',
					name: street,
					region: '',
				};

				resolve(address);
			}
		});
	});
};

// export const getAddressByCoordinates = ({ latitude, longitude }) => {
// 	return new Promise((resolve, reject) => {
// 		apiFactory(
// 			`https://maps.googleapis.com/maps/api/geocode/json?address=${latitude},123${longitude}12313123123123123&key=${Config.GOOGLE_MAP_API_KEY}`
// 		).then((res) => {
// 			if (res.data.results.length === 0) {
// 				apiFactory(
// 					`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${Config.API_KEY_OPEN_CAGE}`
// 				).then(({ data }) => {
// 					let addressComponents = data.results[0].components;
// 					console.log('addressComponents', addressComponents)
// 					let addressComponentStreet = addressComponents.road;

// 					if (!addressComponentStreet) {
// 						addressComponentStreet = addressComponents.suburb;
// 					} else {
// 						addressComponentStreet = addressComponents.road;
// 					}

// 					//Manage Translate of Pristina
// 					let addressComponentCity = addressComponents.city;

// 					if (addressComponentCity === 'Pristina') {
// 						addressComponentCity = 'Prishtinë';
// 					} else {
// 						addressComponentCity = addressComponents.city;
// 					}

// 					//Manage Translate of Kosovo
// 					let addressComponentCountry = addressComponents.country;

// 					if (addressComponentCountry === 'Kosovo') {
// 						addressComponentCountry = 'Kosove';
// 					} else {
// 						addressComponentCountry = addressComponents.country;
// 					}
// 					let address = {
// 						city: addressComponentCity,
// 						country: addressComponentCountry,
// 						isoCountryCode: '',
// 						name: addressComponentStreet,
// 						region: '',
// 						street: addressComponentStreet,
// 					};
// 					resolve(address);
// 				});
// 			} else {

// 				let streetName = res.data.results[0].formatted_address.split(',')[0];
// 				let cityName = res.data.results[0].address_components.filter(
// 					(x) => x.types.filter((t) => t === 'locality').length > 0
// 				)[0].short_name;
// 				let countryName = res.data.results[0].address_components.filter(
// 					(x) => x.types.filter((t) => t === 'country').length > 0
// 				)[0].long_name;
// 				let address = {
// 					city: cityName,
// 					country: countryName,
// 					isoCountryCode: '',
// 					name: streetName,
// 					region: '',
// 					street: streetName,
// 				};
// 				resolve(address);
// 			}
// 		});
// 	});
// };
