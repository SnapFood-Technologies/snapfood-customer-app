import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store';

export const KEYS = {
	TOKEN: 'token',
	USER: 'user',
	CART_ITEMS: 'cartItems',
	SEEN_ONBOARD : 'seen_onboard',
	CART_RESTAURANT: 'cartRestaurant',
	LANGUAGE: 'language',
	APP_OPENED_COUNT: 'appOpenedCount',
	HAS_RATED: 'hasRated',
	COUPON_CODE: 'couponCode',
	LAST_COORDINATES : 'last_coordinates',
	ASKED_CONTACTS_PERMISSION : 'ASKED_CONTACTS_PERMISSION',
	ASKED_INTERESTS : 'ASKED_INTERESTS',
	INTERESTS : 'INTERESTS',
	HIDE_CONTACTS_MODAL_SHOW : 'HIDE_CONTACTS_MODAL_SHOW',
	CONTACTS_MODAL_SHOW_CNT : 'contacts_modal_show_cnt',
	INVITE_CONTACTS_FRIENDS_MODAL_SHOW_CNT : 'INVITE_CONTACTS_FRIENDS_MODAL_SHOW_CNT',
	REMIND_EARNINVITE_MODAL_SHOW_CNT : 'REMIND_EARNINVITE_MODAL_SHOW_CNT',
	REMIND_REFERRAL_MODAL_SHOW_CNT : 'REMIND_REFERRAL_MODAL_SHOW_CNT',
	ORDER_NOW_MODAL_SHOW_CNT : 'ORDER_NOW_MODAL_SHOW_CNT',
	FAKE_BADGE_LAST_TIME : "FAKE_BADGE_LAST_TIME",
	HIDE_WHERE_HEARD_MODAL_SHOW : "HIDE_WHERE_HEARD_MODAL_SHOW",
	WHERE_HEARD_MODAL_SHOW_CNT : 'WHERE_HEARD_MODAL_SHOW_CNT',
	MUTUAL_FRIEND_INVITE_MODAL_SHOW_CNT : 'MUTUAL_FRIEND_INVITE_MODAL_SHOW_CNT',
	PREV_ANNOUNCE_ID : "PREV_ANNOUNCE_ID",
	INVITE_CODE : "INVITE_CODE",
	APPLE_LOGIN_AUTH_CODE : "APPLE_LOGIN_AUTH_CODE",
	CART_CASHBACK_INPUT : 'CART_CASHBACK_INPUT',
	SNAPMAP_DISTANCE : 'SNAPMAP_DISTANCE'
};

export const setStorageKey = async (key, value) => {
	return new Promise((resolve, reject) => {
		RNSecureKeyStore.set(key, JSON.stringify(value), { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY }).then(
			() => {
				resolve();
			},
			(error) => {
				reject(error);
			}
		);
	});
};

export const getStorageKey = async (key) => {
	return new Promise((resolve, reject) => {
		RNSecureKeyStore.get(key).then(
			(res) => {
				resolve(JSON.parse(res));
			},
			(error) => {
				reject(error);
			}
		);
	});
};

export const removeStorageKey = async (key) => {
	return new Promise((resolve, reject) => {
		RNSecureKeyStore.remove(key).then(
			() => {
				resolve();
			},
			(error) => {
				reject(error);
			}
		);
	});
};
