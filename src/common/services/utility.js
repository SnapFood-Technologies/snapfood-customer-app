import { Dimensions, Linking, Platform } from 'react-native';
import SafeArea, { type, SafeAreaInsets } from 'react-native-safe-area';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import moment from 'moment';
import Theme from '../../theme';
import alerts from './alerts';
import { translate } from './translate';
import Config from '../../config';
import { string } from 'prop-types';
import * as RNLocalize from 'react-native-localize';

export function isIphoneX() {
	const dim = Dimensions.get('screen');

	return (
		// This has to be iOS
		Platform.OS === 'ios' &&
		// Check either, iPhone X or XR
		(isIPhoneXSize(dim) || isIPhoneXrSize(dim))
	);
}

export function isIPhoneXSize(dim) {
	return dim.height === 812 || dim.width === 812;
}

export function isIPhoneXrSize(dim) {
	return dim.height === 896 || dim.width === 896;
}

export const getSafeAreaDimensions = async () => {
	const { safeAreaInsets } = await SafeArea.getSafeAreaInsetsForRootView();
	return safeAreaInsets;
};

export const extractErrorMessage = (error) => {
	if (error == null) { return translate('generic_error'); }
	if (typeof error === 'string') {
		return error;
	}
	if (typeof error === 'object') {
		if (error.length) {
			error = error[0];
		} else {
			error = error[Object.keys(error)[0]];
			if (typeof error === 'object') {
				error = error[0];
			}
		}
	}
	if (error.error) {
		error = error.error;
	}
	if (error.body) {
		error = error.body.error;
	}
	if (error.data) {
		error = error.data;
	}
	if (typeof error === 'string') {
		return error;
	}
	if (typeof error.message === 'string') {
		return error.message;
	}
	try {
		Object.keys(error.message).forEach((key) => {
			if (typeof error.message[key] === 'string') {
				return error.message[key];
			} else {
				error.message[key].forEach((message) => {
					return message;
				});
			}
		});
	} catch (e) {
		return translate('generic_error');
	}
};

export const openExternalUrl = (url) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (await InAppBrowser.isAvailable()) {
				await InAppBrowser.open(url, {
					dismissButtonStyle: 'close',
					preferredBarTintColor: 'white',
					preferredControlTintColor: Theme.colors.primary,
					readerMode: false,
					animated: true,
					modalPresentationStyle: 'overFullScreen',
					modalTransitionStyle: 'crossDissolve',
					modalEnabled: true,
					enableBarCollapsing: false,
					// Android Properties
					showTitle: true,
					toolbarColor: Theme.colors.primary,
					secondaryToolbarColor: 'black',
					enableUrlBarHiding: true,
					enableDefaultShare: true,
					forceCloseOnRedirection: false,
					animations: {
						startEnter: 'slide_in_right',
						startExit: 'slide_out_left',
						endEnter: 'slide_in_left',
						endExit: 'slide_out_right',
					},
				});
				resolve();
			} else {
				Linking.openURL(url);
				resolve();
			}
		} catch (error) {
			reject(error);
		}
	});
};

export const isEmpty = (str) => {
	if (str == null || str == '') {
		return true
	}
	return false
}

export const isFullURL = (str) => {
	if (str == null) { return false; }
	return str.includes('http');
}

export const getImageFullURL = (photo) => {
	if (isFullURL(photo)) {
		return photo;
	}
	if (photo == 'x') {
		return Config.USER_PROFILE_IMG_BASE_URL + 'default?';
	}
	if (photo == 'default') {
		return Config.USER_PROFILE_IMG_BASE_URL + 'default?';
	}
	return Config.USER_PROFILE_IMG_BASE_URL + (isEmpty(photo) ? 'default?' : photo);
}

export const seconds2Time = (seconds) => {
	const h = parseInt(seconds / (60 * 60));
	const m = parseInt(seconds % (60 * 60) / 60);
	const s = parseInt(seconds % 60);

	return ((m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s));
	// return ((h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s));
}

export const minutes2Days = (minutes) => {
	if (minutes == null) { return [] }
	const d = parseInt(minutes / (60 * 24));
	const h = parseInt((minutes % (60 * 24)) / 60);
	const m = parseInt(minutes % 60);

	return [d, h, m];
}

export const getHourMin = (timestring) => {
	if (timestring == null) { return '' }
	let tmp = timestring.split(':');
	if (tmp.length > 1) {
		return tmp[0] + ':' + tmp[1];
	}
	return '';
}

export const convertTimestamp2Date = (timestamp) => {
	if (timestamp == null) return new Date();
	return new Date(timestamp.seconds * 1000)
}

export const convertTimeString2Hours = (time) => {
	if (time) {
		let tmpArray = time.split(':');
		if (tmpArray.length == 1) {
			return parseInt(tmpArray[0]);
		}
		else if (tmpArray.length > 1) {
			return parseInt(tmpArray[0]) + parseInt(tmpArray[1]) / 60;
		}
	}
	return 0;
}

export const getElapsedTime = (start_time_as_mili_seconds) => {
	// console.log('getElapsedTime ', start_time_as_mili_seconds)
	if (start_time_as_mili_seconds == null) {
		return '';
	}
	let diff_days = moment(new Date()).diff(moment(new Date(start_time_as_mili_seconds)), 'days');
	let diff_hours = moment(new Date()).diff(moment(new Date(start_time_as_mili_seconds)), 'hours');
	let diff_mins = moment(new Date()).diff(moment(new Date(start_time_as_mili_seconds)), 'minutes');
	let diff_seconds = moment(new Date()).diff(moment(new Date(start_time_as_mili_seconds)), 'seconds');

	// console.log('getElapsedTime ', diff_days, diff_hours, diff_mins)

	if (diff_days > 0) {
		return `${diff_days}d`
	}
	else if (diff_hours > 0) {
		return `${diff_hours}h`
	}
	else if (diff_mins > 0) {
		return `${diff_mins}m`
	}
	else if (diff_seconds > 0) {
		return `${diff_seconds}s`
	}
	return '';
}

export const validateEmailAddress = (email) => {
	let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return reg.test(email);
};

export const validatePhoneNumber = (text) => {
	let phone = trimPhoneNumber(text);
	
	// let AL_PHONE_REGEXP = /^(((066|067|068|069)\d{7})){1}$/;
	// let US_PHONE_REGEXP = /^([2-9]\d{2}[2-9]\d{2}\d{4}){1}$/;
	
	let AL_OR_US_PHONE = /^(((((066|067|068|069)\d{7})){1}$)|(([2-9]\d{2}[2-9]\d{2}\d{4}){1}$))/;

	return AL_OR_US_PHONE.test(phone);
};

export const replaceAll = function (target, search, replacement) {
	if (target == null) { return null; }
	return target.split(search).join(replacement);
};

export const trimPhoneNumber = (text) => {
	if (text == null) return text;
	text = replaceAll(text, '+1', '');
	text = replaceAll(text, '-', '');
	text = replaceAll(text, '(', '');
	text = replaceAll(text, ')', '');
	text = replaceAll(text, ' ', '');
	return text;
};

export const validateUserData = ({ full_name, email, phone, password, pass2 }, isNew) => {
	return new Promise((resolve, reject) => {
		const mobileValidate = phone && validatePhoneNumber(phone.replace(/\s/g, ''));
		const emailValidate = email && validateEmailAddress(email);

		if (!full_name || !email || !phone || !phone.replace(/\s/g, '') || (isNew && !password)) {
			alerts.error(translate('attention'), translate('fill_all_fields'));
			reject();
		} else if (isNew && password != pass2) {
			alerts.error(translate('attention'), translate('password_mismatch'));
			reject();
		} else if (emailValidate === false) {
			alerts.error(translate('attention'), translate('wrong_email_format'));
			reject();
		} else if (mobileValidate === false) {
			alerts.error(translate('attention'), translate('wrong_phone_format'));
			reject();
		}
		else {
			resolve();
		}
	});
};

export const validatePassword = (curPass, password, passwordConfirmation) => {
	return new Promise(async (resolve, reject) => {
		if (!curPass || !password || !passwordConfirmation) {
			alerts.error(translate('attention'), translate('fill_all_fields'));
			reject();
		}
		else if (!password || password != passwordConfirmation) {
			alerts.error(translate('attention'), translate('password_mismatch'));
			reject();
		} else if (curPass == password) {
			alerts.error(translate('attention'), translate('cannot_use_old_password'));
			reject();
		} else {
			resolve();
		}
	});
};

export const calculateCartTotal = (items) => {
	let total = 0;

	items.map((item) => {
		let productPrice = parseInt(item.price);
		if (item.discount_price != null && parseInt(item.discount_price) > 0) {
			productPrice = parseInt(item.price - item.discount_price);
		}

		if (item.options) {
			item.options.map((option) => (productPrice += parseFloat(option.price)));
		}
		total += productPrice * parseInt(item.quantity);
	});

	return total;
};

export const compareProductItems = (product1, product2) => {
	if (product1.id == product2.id) {
		if (product1.options == null && product2.options == null) {
			return true;
		}
		else if (product1.options != null && product2.options != null) {
			let arr1 = product1.options.map(o => o.id);
			let arr2 = product2.options.map(o => o.id);
			console.log('========= ', arr1, arr2)
			if (JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort())) {
				return true;
			}
		}
	}
	return false;
}

export const checkInSameWeek = (date = new Date()) => {
	let week_days = [];
	let today = new Date();
	let day_week = today.getDay();
	for (var i = -day_week; i < 0; i++) {
		week_days.push(moment(today).add(i, 'days').format('DD/MM/YYYY'));
	}
	for (var i = 0; i < (7 - day_week); i++) {
		week_days.push(moment(today).add(i, 'days').format('DD/MM/YYYY'));
	}
	return week_days.includes(moment(date).format('DD/MM/YYYY'));
}

export const getStaticMapUrl = (coordinates) => {
	const location = `${coordinates.latitude},${coordinates.longitude}`;
	return `https://maps.googleapis.com/maps/api/staticmap?center=${location}&zoom=15&scale=2&size=200x200&maptype=roadmap&key=${Config.GOOGLE_MAP_API_KEY}&format=png&visual_refresh=true&markers=size:mid%7Ccolor:0x00aef0%7Clabel:%7C${location}`;
};

export const formatPrice = (price, decimalPlaces = 0) => {
	return parseFloat(parseFloat(price)).toFixed(decimalPlaces);
};

export const groupBy = (items, key) =>
	items.reduce(
		(result, item) => ({
			...result,
			[item[key]]: [...(result[item[key]] || []), item],
		}),
		{}
	);

export const sum = (items, prop) => {
	return items.reduce(function (a, b) {
		return a + b[prop];
	}, 0);
};

export const prepareOrderProducts = (order) => {
	let discountInfo = order.discount;
	if (!discountInfo) {
		discountInfo = order.coupon;
	}
	const mappedProducts = groupBy(order.products, 'product_id');
	const products = [];
	Object.keys(mappedProducts).map((key) => {
		const data = mappedProducts[key][0];
		const quantity = sum(mappedProducts[key], 'quantity');
		const discount_total_price = sum(mappedProducts[key], 'total_price');
		const hasDiscount =
			mappedProducts[key].length !== 1 ||
			(discountInfo && mappedProducts[key][0].id === discountInfo.orders_product_id);
		const p = {
			...data,
			quantity: !hasDiscount || !discountInfo ? quantity : quantity - discountInfo.value,
			has_discount: hasDiscount,
			total_quantity: quantity,
			discount_total_price,
		};
		products.push(p);
	});
	return products;
};

export const getOrderDiscountValue = (order) => {
	return order.discount
		? parseFloat(order['discount_amount'])
		: order.coupon
			? parseFloat(order['coupon_amount'])
			: 0;
};

const hasOrderFreeDelivery = (order) => {
	return (
		(order.discount && order.discount.type === 'free_delivery') ||
		(order.coupon && order.coupon.type === 'free_delivery')
	);
};

export const getOpenTime = (vendorData) => {
	if (vendorData.vendor_opening_days != null) {
		let day_index = vendorData.vendor_opening_days.findIndex((i) => i.week_day == new Date().getDay().toString());
		if (day_index != -1) {
			if (vendorData.vendor_opening_days[day_index].time_open != null) {
				let open_time = moment(vendorData.vendor_opening_days[day_index].time_open, 'HH:mm:ss').format(
					'h:mm A'
				);
				return open_time;
			}
		}
	}
	return null;
};

export const getOrderRealDeliveryFee = (order) => {
	let realDeliveryFee = 0;
	if (hasOrderFreeDelivery(order)) {
		if (order.discount && order.discount.value > 0) {
			realDeliveryFee = order.discount.value;
		} else if (order.coupon && order.coupon.value > 0) {
			realDeliveryFee = order.coupon.value;
		}
	}
	return realDeliveryFee;
};

export const getFirstChar = (str) => {
	if (str == null) {
		return null;
	}
	str = str.trim();
	if (str.length == 0) {
		return null;
	}
	if (!isNaN(str[0])) {
		return '#';
	}
	return str[0].toUpperCase();
}

export const ucFirst = (str) => {
	if (str == null || str == "") { return '' }
	return str.split(" ").map(s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase()).join(" ")
}

export const getTweakSearch = (keyword) => {
	if (keyword == '🍕') {
		return 'pica'
	}
	else if (keyword == '🍔') {
		return 'hamburger'
	}
	else if (keyword == '🥪') {
		return 'tost'
	}
	else if (keyword == '🌭') {
		return 'doner'
	}
	else if (keyword == '🍰') {
		return 'tort'
	}
	else if (keyword == '🥗') {
		return 'sallat'
	}
	else if (keyword == '🍳') {
		return 'vez'
	}
	else if (keyword == '🍣') {
		return 'sushi'
	}
	else if (keyword == '🍦') {
		return 'akullore'
	}
	else if (keyword == '🍨') {
		return 'akullore'
	}
	else if (keyword == '🎂') {
		return 'tort'
	}
	else if (keyword == '🥩') {
		return 'mish'
	}
	else if (keyword == '🍩') {
		return 'embelsir'
	}
	else if (keyword == '🥘') {
		return 'sup'
	}
	else if (keyword == '🍪') {
		return 'embelsir'
	}
	else if (keyword == '🍺') {
		return 'bir'
	}
	else if (keyword == '🍻') {
		return 'bir'
	}
	else if (keyword == '🥂') {
		return 'ver'
	}
	else if (keyword == '🍮') {
		return 'embelsir'
	}

	return keyword;
}


export const getSearchParamFromURL = (url, param) => {
	const include = url.includes(param)

	if (!include) return null

	const params = url.split(/([?,=,&])/)
	const index = params.indexOf(param)
	const value = params[index + 2]
	return value
}