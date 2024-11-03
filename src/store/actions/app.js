import { APP } from '../types';
import { KEYS, setStorageKey, getStorageKey } from '../../common/services/storage';
import apiFactory from '../../common/services/apiFactory';
import { getSafeAreaDimensions, isEmpty } from '../../common/services/utility';
import { setI18nConfig, getLanguage, setLanguage } from '../../common/services/translate';
import * as RNLocalize from 'react-native-localize';

export const setHomeTabNavigation = (payload) => {
	return { type: APP.SET_HOMETAB_NAVIGATION, payload: payload };
};
export const setActiveRoute = (payload) => ({ type: APP.SET_ACTIVE_ROUTE, payload });

export const setInitHomeTab = (payload) => {
	return { type: APP.SET_INIT_HOME_TAB, payload: payload };
};

export const setHomeScroller = (payload) => {
	return { type: APP.SET_HOME_SCROLLER, payload: payload };
};

export const setTmpPassChanged = (payload) => {
	return { type: APP.TMP_PASS_CHANGED, payload: payload };
};

export const setTmpLocationPicked = (payload) => {
	return { type: APP.TMP_ADDR_PICKED, payload: payload };
};

export const setTmpFood = (payload) => {
	return { type: APP.TMP_SET_FOOD, payload: payload };
};

export const setTmpOrder = (payload) => {
	return { type: APP.TMP_SET_ORDER, payload: payload };
};

export const setTmpCurStoryVideo = (payload) => {
	return { type: APP.TMP_SET_CUR_PLAYING_VIDEO_STORY, payload: payload };
};

export const setTmpPickedMembershipPlan = (payload) => {
	return { type: APP.SET_TMP_PICKED_MEMBERSHIP_PLAN, payload: payload };
};

export const setHomeVendorFilter = (payload) => async (dispatch) => {
	return new Promise(async (resolve, reject) => {
		try {
			await dispatch({
				type: APP.SET_VENDOR_FILTER,
				payload: payload,
			});
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};

export const setHomeVendorSort = (payload) => {
	return { type: APP.SET_VENDOR_SORT, payload: payload };
};

export const setHomeOrdersFilter = (payload) => {
	return { type: APP.SET_ORDERS_FILTER, payload: payload };
};

export const setProfileBlogs = (payload) => {
	return { type: APP.SET_BLOG_CATEGORIES, payload: payload };
};
export const setProfileBlogFilter = (payload) => {
	return { type: APP.SET_PROFILE_BLOG_FILTER, payload: payload };
};

export const setContacts = (payload) => {
	return { type: APP.SET_CONTACTS, payload: payload };
};

export const setAskedContactsPerm = (payload) => {
	return { type: APP.SET_ASKED_CONTACTS_PERMISSION, payload: payload };
};

export const setAskedInterests = (payload) => {
	return { type: APP.SET_ASKED_INTERESTS, payload: payload };
};

export const setSkipReferralCodeInputView = (payload) => {
	return { type: APP.SET_SKIP_REFERRAL_CODE_INPUT_VIEW, payload: payload };
};

export const addClosedScheduleVendorIdTmp = (vendor_id) => async (dispatch, getState) => {
	let vendor_ids_tmp = getState().app.vendor_ids_tmp || [];
	vendor_ids_tmp = vendor_ids_tmp.slice(0);
	vendor_ids_tmp.push(vendor_id);

	await dispatch({
		type: APP.SET_VENDOR_IDS_TMP,
		payload: vendor_ids_tmp,
	});
};

export const setShowContactsModal = (payload) => (dispatch, getState) => {
	return new Promise(async (resolve) => {
		if (payload == true) {
			let hide_contacts_modal = false;
			try {
				hide_contacts_modal = await getStorageKey(KEYS.HIDE_CONTACTS_MODAL_SHOW);
			} catch (e) {}

			if (hide_contacts_modal == false) {
				let cnt = 0;
				try {
					cnt = await getStorageKey(KEYS.CONTACTS_MODAL_SHOW_CNT);
				} catch (e) {}
				let show_change_city_modal = getState().app.show_change_city_modal || false;
				if (show_change_city_modal) {
					resolve();
					return;
				}

				cnt = cnt + 1;
				if (cnt >= 10) {
					await dispatch({ type: APP.SET_SHOW_INVITE_CONTACTS_FRIEND_MODAL, payload: false });
					await dispatch({ type: APP.SET_SHOW_WHERE_HEARD_FEEDBACK_MODAL, payload: false });
					await dispatch({ type: APP.SET_SHOW_ANNOUNCE_MODAL, payload: false });
					await dispatch({ type: APP.SET_SHOW_REMIND_EARNINVITE_MODAL, payload: false });
					await dispatch({ type: APP.SET_SHOW_CONTACTS_MODAL, payload: payload });
					cnt = 0;
				}

				try {
					await setStorageKey(KEYS.CONTACTS_MODAL_SHOW_CNT, cnt);
				} catch (e) {}
			}
		} else {
			await dispatch({ type: APP.SET_SHOW_CONTACTS_MODAL, payload: payload });
		}
		resolve();
	});
};

export const setShowInviteFriendModal = (payload) => (dispatch) => {
	return new Promise(async (resolve) => {
		if (payload == true) {
			let cnt = 0;
			try {
				cnt = await getStorageKey(KEYS.INVITE_CONTACTS_FRIENDS_MODAL_SHOW_CNT);
			} catch (e) {}

			cnt = cnt + 1;
			if (cnt >= 10) {
				await dispatch({ type: APP.SET_SHOW_CONTACTS_MODAL, payload: false });
				await dispatch({ type: APP.SET_SHOW_WHERE_HEARD_FEEDBACK_MODAL, payload: false });
				await dispatch({ type: APP.SET_SHOW_ANNOUNCE_MODAL, payload: false });
				await dispatch({ type: APP.SET_SHOW_REMIND_EARNINVITE_MODAL, payload: false });
				await dispatch({ type: APP.SET_SHOW_INVITE_CONTACTS_FRIEND_MODAL, payload: payload });
				cnt = 0;
			}

			try {
				await setStorageKey(KEYS.INVITE_CONTACTS_FRIENDS_MODAL_SHOW_CNT, cnt);
			} catch (e) {}
		} else {
			await dispatch({ type: APP.SET_SHOW_INVITE_CONTACTS_FRIEND_MODAL, payload: payload });
		}
		resolve();
	});
};

export const setShowEarnInviteRemindModal = (payload) => (dispatch, getState) => {
	return new Promise(async (resolve) => {
		if (payload == true) {
			let cnt = 2;
			try {
				cnt = await getStorageKey(KEYS.REMIND_EARNINVITE_MODAL_SHOW_CNT);
			} catch (e) {}

			let show_change_city_modal = getState().app.show_change_city_modal || false;
			if (show_change_city_modal) {
				resolve();
				return;
			}

			cnt = cnt + 1;
			if (cnt >= 15) {
				await dispatch({ type: APP.SET_SHOW_CONTACTS_MODAL, payload: false });
				await dispatch({ type: APP.SET_SHOW_WHERE_HEARD_FEEDBACK_MODAL, payload: false });
				await dispatch({ type: APP.SET_SHOW_ANNOUNCE_MODAL, payload: false });
				await dispatch({ type: APP.SET_SHOW_INVITE_CONTACTS_FRIEND_MODAL, payload: false });
				await dispatch({ type: APP.SET_SHOW_REMIND_EARNINVITE_MODAL, payload: payload });
				cnt = 2;
			}

			try {
				await setStorageKey(KEYS.REMIND_EARNINVITE_MODAL_SHOW_CNT, cnt);
			} catch (e) {}
		} else {
			await dispatch({ type: APP.SET_SHOW_REMIND_EARNINVITE_MODAL, payload: payload });
		}
		resolve();
	});
};

export const setShowReferralRemindModal = (payload) => (dispatch, getState) => {
	return new Promise(async (resolve) => {
		if (payload == true) {
			let cnt = 0;
			try {
				cnt = await getStorageKey(KEYS.REMIND_REFERRAL_MODAL_SHOW_CNT);
			} catch (e) {}

			const interval = getState().app.systemSettings?.interval_open_referral_remind_modal;

			cnt = cnt + 1;
			if (cnt >= interval) {
				let referral_code = null;
				try {
					let resp = await apiFactory.post(`/invite-earn/get-refferal-info`);
					referral_code = resp.data?.user_refferal?.referral_code;
				} catch (error) {}

				if (!isEmpty(referral_code)) {
					await dispatch({ type: APP.SET_SHOW_REMIND_REFERRAL_MODAL, payload: payload });
				}

				cnt = 0;
			}

			try {
				await setStorageKey(KEYS.REMIND_REFERRAL_MODAL_SHOW_CNT, cnt);
			} catch (e) {}
		} else {
			await dispatch({ type: APP.SET_SHOW_REMIND_REFERRAL_MODAL, payload: payload });
		}
		resolve();
	});
};

export const setShowOrderNowModal = (payload) => (dispatch, getState) => {
	return new Promise(async (resolve) => {
		if (payload == true) {
			let cnt = 0;
			try {
				cnt = await getStorageKey(KEYS.ORDER_NOW_MODAL_SHOW_CNT);
			} catch (e) {}

			const interval = getState().app.systemSettings?.interval_open_order_earn_modal;

			cnt = cnt + 1;
			if (cnt >= interval) {
				await dispatch({ type: APP.SET_SHOW_ORDER_NOW_MODAL, payload: payload });
				cnt = 0;
			}

			try {
				await setStorageKey(KEYS.ORDER_NOW_MODAL_SHOW_CNT, cnt);
			} catch (e) {}
		} else {
			await dispatch({ type: APP.SET_SHOW_ORDER_NOW_MODAL, payload: payload });
		}
		resolve();
	});
};

export const setAddress =
	({ coordinates, address }) =>
	async (dispatch) => {
		return new Promise(async (resolve, reject) => {
			try {
				try {
					await this.props.setSafeAreaData();
				} catch (e) {}
				await setStorageKey(KEYS.LAST_COORDINATES, coordinates);
				await dispatch({
					type: APP.APPLY_LOCATION,
					payload: {
						coordinates,
						address,
					},
				});
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	};

export const setAppLang = (language) => (dispatch) => {
	return new Promise(async (resolve) => {
		await setLanguage(language).then();
		await dispatch({ type: APP.SET_LANG, payload: language });
		resolve();
	});
};

export const loadAppLang = () => (dispatch) => {
	return new Promise(async (resolve) => {
		await setI18nConfig().then();
		await dispatch({ type: APP.SET_LANG, payload: getLanguage() });
		let country = RNLocalize.getCountry();
		resolve();
	});
};

export const setHasLocation = (value) => (dispatch) => {
	return new Promise(async (resolve) => {
		await dispatch({
			type: APP.SET_HASLOCATION_FLAG,
			payload: !!value,
		});
		resolve();
	});
};

export const updateLanguage = () => {
	return new Promise((resolve) => {
		apiFactory.put('users/update_language').then(
			() => {
				resolve();
			},
			() => resolve()
		);
	});
};

export const getBanners = (latitude, longitude) => (dispatch) => {
	return new Promise((resolve) => {
		apiFactory.get(`banners?lat=${latitude}&lng=${longitude}`).then(
			({ data }) => {
				dispatch({
					type: APP.GET_BANNERS_SUCCESS,
					payload: data.banners,
				});
				resolve(data.banners);
			},
			() => resolve([])
		);
	});
};

export const getLastUnReviewedOrder = () => (dispatch) => {
	return new Promise((resolve) => {
		apiFactory.get('orders/un-reviewed').then(
			({ data }) => {
				dispatch({
					type: APP.SET_UNREVIEWED_ORDER,
					payload: data.order,
				});
				resolve();
			},
			(error) => {
				resolve();
			}
		);
	});
};

export const getFriends = (status, searchTerm, filter_ids, online_payment) => (dispatch) => {
	return new Promise((resolve) => {
		apiFactory
			.post('users/friends', {
				status: status,
				name: searchTerm == '' ? null : searchTerm,
				filter_ids: filter_ids,
				online_payment: online_payment,
			})
			.then(
				({ data }) => {
					resolve(data.friends);
				},
				() => resolve([])
			);
	});
};

export const getAllMyFriends = () => (dispatch) => {
	return new Promise((resolve) => {
		apiFactory.post('users/friends', { status: 'accepted' }).then(
			({ data }) => {
				dispatch({
					type: APP.SET_ALL_FRIENDS,
					payload: data.friends || [],
				});
				resolve(data.friends);
			},
			() => {
				dispatch({
					type: APP.SET_ALL_FRIENDS,
					payload: data.friends || [],
				});
				resolve([]);
			}
		);
	});
};

export const getAddresses = () => (dispatch) => {
	return new Promise((resolve) => {
		apiFactory.get('addresses').then(
			({ data }) => {
				dispatch({
					type: APP.SET_ADDRESSES,
					payload: data.addresses || [],
				});
				resolve(data.addresses);
			},
			() => resolve([])
		);
	});
};

export const setLocallyAddresses = (addresses) => (dispatch) => {
	return new Promise(async (resolve) => {
		const dim = await getSafeAreaDimensions();
		dispatch({
			type: APP.SET_ADDRESSES,
			payload: addresses || [],
		});
		resolve();
	});
};

export const saveAddress = (address) => (dispatch) => {
	return new Promise((resolve, reject) => {
		if (address.id) {
			apiFactory.put(`addresses/${address.id}`, address).then(() => {
				resolve();
			}, reject);
		} else {
			apiFactory.post('addresses', address).then(async ({ data }) => {
				resolve();
			}, reject);
		}
	});
};

export const addDefaultAddress = (address) => (dispatch) => {
	return new Promise((resolve, reject) => {
		apiFactory.post('addresses/default', address).then(async ({ data }) => {
			resolve();
		}, reject);
	});
};

export const deleteAddress = (id) => (dispatch) => {
	return new Promise((resolve, reject) => {
		apiFactory.delete(`addresses/${id}`).then(() => {
			dispatch({
				type: APP.DELETED_ADDRESS,
				payload: id,
			});
			resolve();
		}, reject);
	});
};

export const setAddressAsDefault = (address) => (dispatch) => {
	return new Promise((resolve, reject) => {
		address.favourite = true;
		apiFactory.put(`addresses/${address.id}`, address).then(resolve, reject);
	});
};

export const setSafeAreaData = () => (dispatch) => {
	return new Promise(async (resolve) => {
		const dim = await getSafeAreaDimensions();
		dispatch({
			type: APP.SAFE_AREA_DIMENSIONS,
			payload: dim,
		});
		resolve();
	});
};

export const closeRatingModal = () => async (dispatch) => {
	await dispatch({
		type: APP.CLOSE_REVIEW_MODAL,
	});
};

export const goActiveScreenFromPush = (value) => async (dispatch) => {
	await dispatch({
		type: APP.SET_ACTIVE_SCREEN_FROM_PUSH,
		payload: value,
	});
};

export const setDefaultOrdersTab = (value) => async (dispatch) => {
	await dispatch({
		type: APP.SET_DEFAULT_ORDERS_TAB,
		payload: value,
	});
};
export const setSharingContent = (value) => async (dispatch) => {
	await dispatch({
		type: APP.SET_SHARED_INFORMATION,
		payload: value,
	});
};

export const setRefferalCode = (value) => async (dispatch) => {
	await dispatch({
		type: APP.SET_LINKED_REFFERAL_CODE,
		payload: value,
	});
};

export const removeSharingContent = () => async (dispatch) => {
	await dispatch({
		type: APP.REMOVE_SHARED_INFORMATION,
	});
};

export const setInvitationPickedUser = (value) => async (dispatch) => {
	await dispatch({
		type: APP.SET_INVITE_PICKED_USER,
		payload: value,
	});
};

export const setBalanceTransferPickedUser = (value) => async (dispatch) => {
	await dispatch({
		type: APP.SET_BALANCE_TRANSFER_PICKED_USER,
		payload: value,
	});
};

export const setGiftOrderPickedUser = (value) => async (dispatch) => {
	await dispatch({
		type: APP.SET_GIFT_ORDER_PICKED_USER,
		payload: value,
	});
};

export const setInvitationRewards = (value) => async (dispatch) => {
	await dispatch({
		type: APP.SET_INVITATION_REWARDS,
		payload: value,
	});
};

export const setReferralsRewards = (value) => async (dispatch) => {
	await dispatch({
		type: APP.SET_REFERRALS_REWARDS,
		payload: value,
	});
};

export const getReferralsRewardsSetting = () => async (dispatch, getState) => {
	return new Promise((resolve) => {
		apiFactory.get(`invite-earn/get-referrals-setting`).then(
			async ({ data }) => {
				await dispatch({
					type: APP.SET_REFERRALS_REWARDS,
					payload: {
						cycle_hours_earn_invitation: data.cycle_hours_earn_invitation,
						exp_days_earn_invitation: data.exp_days_earn_invitation,
						user_rewards: data.inviter_earning_amount,
						register_rewards: data.register_earning_amount,
						max_num_referral: data.max_num_referral,
						show_referral_module: data.show_referral_module,
						show_earn_invitation_module: data.show_earn_invitation_module,
						limit_user_referrals: data.limit_user_referrals,
						earninvite_friend_message: data.earninvite_friend_message,
						earninvite_friend_message_en: data.earninvite_friend_message_en,
						earninvite_friend_message_it: data.earninvite_friend_message_it,
						earninvite_timer_popup_message: data.earninvite_timer_popup_message,
						earninvite_timer_popup_message_en: data.earninvite_timer_popup_message_en,
						earninvite_timer_popup_message_it: data.earninvite_timer_popup_message_it,
						referral_description_message: data.referral_description_message,
						referral_description_message_en: data.referral_description_message_en,
						referral_description_message_it: data.referral_description_message_it,
						referral_code_share_message: data.referral_code_share_message,
						referral_code_share_message_en: data.referral_code_share_message_en,
						referral_code_share_message_it: data.referral_code_share_message_it,

						earninvitation_howto_works: data.earninvitation_howto_works,
						earninvitation_howto_works_en: data.earninvitation_howto_works_en,
						earninvitation_howto_works_it: data.earninvitation_howto_works_it,
						referral_howto_works_title: data.referral_howto_works_title,
						referral_howto_works_title_en: data.referral_howto_works_title_en,
						referral_howto_works_title_it: data.referral_howto_works_title_it,
						referral_howto_works_subtitle_1: data.referral_howto_works_subtitle_1,
						referral_howto_works_subtitle_1_en: data.referral_howto_works_subtitle_1_en,
						referral_howto_works_subtitle_1_it: data.referral_howto_works_subtitle_1_it,
						referral_howto_works_desc_1: data.referral_howto_works_desc_1,
						referral_howto_works_desc_1_en: data.referral_howto_works_desc_1_en,
						referral_howto_works_desc_1_it: data.referral_howto_works_desc_1_it,
						referral_howto_works_subtitle_2: data.referral_howto_works_subtitle_2,
						referral_howto_works_subtitle_2_en: data.referral_howto_works_subtitle_2_en,
						referral_howto_works_subtitle_2_it: data.referral_howto_works_subtitle_2_it,
						referral_howto_works_desc_2: data.referral_howto_works_desc_2,
						referral_howto_works_desc_2_en: data.referral_howto_works_desc_2_en,
						referral_howto_works_desc_2_it: data.referral_howto_works_desc_2_it,
					},
				});
				resolve();
			},
			async (err) => {
				await dispatch({
					type: APP.SET_REFERRALS_REWARDS,
					payload: {},
				});
				resolve();
			}
		);
	});
};

export const getMembershipSetting = () => async (dispatch, getState) => {
	return new Promise((resolve) => {
		apiFactory.get(`membership-setting`).then(
			async ({ data }) => {
				await dispatch({
					type: APP.SET_MEMBERSHIP_SETTING,
					payload: data?.settings || {},
				});
				resolve(data?.settings || {});
			},
			async (err) => {
				await dispatch({
					type: APP.SET_MEMBERSHIP_SETTING,
					payload: {},
				});
				resolve({});
			}
		);
	});
};

export const saveInterestsFromOnboard = () => {
	return new Promise(async (resolve) => {
		let interests = [];
		try {
			interests = await getStorageKey(KEYS.INTERESTS);
		} catch (error) {}
		if (interests.length > 0) {
			apiFactory
				.post(`interests`, { interests: interests.map((i) => i.id) })
				.then(async ({ data }) => {
					try {
						await setStorageKey(KEYS.INTERESTS, []);
					} catch (error) {}
					resolve();
				})
				.catch((error) => {
					resolve();
				});
		} else {
			resolve();
		}
	});
};

export const loadInvitationTimerSetting = () => async (dispatch, getState) => {
	return new Promise((resolve) => {
		apiFactory.post(`/invite-earn/check-earninvitation`).then(
			async ({ data }) => {
				let showTimer = false;
				if (data.can_invite == false && data.remaining_time_to_use != null && data.remaining_time_to_use > 0) {
					showTimer = true;
				}

				await dispatch({
					type: APP.SET_INVITATION_TIMER_SETTING,
					payload: {
						can_invite: data.can_invite,
						showTimer: showTimer,
						total_invite_time: data.total_invite_time,
						remaining_time_to_use: data.remaining_time_to_use,
						last_invite_time: data.last_invite_time,
						last_invite_time_diff: data.last_invite_time_diff,
					},
				});
				resolve();
			},
			async (err) => {
				await dispatch({
					type: APP.SET_INVITATION_TIMER_SETTING,
					payload: {},
				});
				resolve();
			}
		);
	});
};

export const setInvitationTimerSetting = (payload) => async (dispatch, getState) => {
	let invitationTimerSetting = getState().app.invitationTimerSetting || {};
	await dispatch({
		type: APP.SET_INVITATION_TIMER_SETTING,
		payload: {
			...invitationTimerSetting,
			...payload,
		},
	});
};

export const setShowChangeCityModal = (payload) => async (dispatch) => {
	await dispatch({ type: APP.SET_SHOW_CONTACTS_MODAL, payload: false });
	await dispatch({ type: APP.SET_SHOW_WHERE_HEARD_FEEDBACK_MODAL, payload: false });
	await dispatch({ type: APP.SET_SHOW_ANNOUNCE_MODAL, payload: false });
	await dispatch({ type: APP.SET_CHANGE_CITY_MODAL, payload: payload });
};

export const checkLocationDiff = (location, old_location) => (dispatch) => {
	const params = [
		`lat=${location.latitude}`,
		`lng=${location.longitude}`,
		`old_lat=${old_location.latitude}`,
		`old_lng=${old_location.longitude}`,
	];

	return new Promise((resolve) => {
		apiFactory.get(`check-location-diff?${params.join('&')}`).then(
			({ data }) => {
				dispatch({
					type: APP.SET_DIFF_LOCATION_TOOLTIP,
					payload: data.message,
				});
				resolve(data);
			},
			(error) => {
				dispatch({
					type: APP.SET_DIFF_LOCATION_TOOLTIP,
					payload: null,
				});
				resolve();
			}
		);
	});
};

export const setLocationDiffTooltip = (payload) => (dispatch) => {
	dispatch({
		type: APP.SET_DIFF_LOCATION_TOOLTIP,
		payload: payload,
	});
};

export const getActiveVendors = (latitude, longitude) => (dispatch) => {
	const params = [`lat=${latitude}`, `lng=${longitude}`];

	return new Promise((resolve) => {
		apiFactory.get(`vendors/active?${params.join('&')}`).then(
			({ data }) => {
				//
				dispatch({
					type: APP.SET_ALL_ACTIVE_VENDORS,
					payload: data.vendors || [],
				});
				dispatch({
					type: APP.SET_UNCONFIRMED_DELIVERY_ORDER,
					payload: data.orders || [],
				});
				dispatch({
					type: APP.SET_HAS_SPLITS_REQUESTS,
					payload: data.has_splits ?? false,
				});
				resolve(data.vendors);
			},
			() => resolve([])
		);
	});
};

export const setShowWhereHeardFeedbackModal = (payload) => (dispatch, getState) => {
	return new Promise(async (resolve) => {
		if (payload == true) {
			let hide_feedback_modal = false;
			try {
				hide_feedback_modal = await getStorageKey(KEYS.HIDE_WHERE_HEARD_MODAL_SHOW);
			} catch (e) {}
			if (hide_feedback_modal == false) {
				let feedback_tags = [];
				try {
					let res = await apiFactory.get(`feedback/tags`);
					if (res.data && res.data.feedback_tags) {
						feedback_tags = res.data.feedback_tags || [];
					}
				} catch (error) {}

				if (feedback_tags.length == 0) {
					resolve();
					return;
				}

				await dispatch({ type: APP.SET_APP_FEEDBACK_TAGS, payload: feedback_tags });

				let cnt = 0;
				try {
					cnt = await getStorageKey(KEYS.WHERE_HEARD_MODAL_SHOW_CNT);
				} catch (e) {}

				let show_change_city_modal = getState().app.show_change_city_modal || false;
				if (show_change_city_modal) {
					resolve();
					return;
				}

				cnt = cnt + 1;
				if (cnt >= 8) {
					await dispatch({ type: APP.SET_SHOW_INVITE_CONTACTS_FRIEND_MODAL, payload: false });
					await dispatch({ type: APP.SET_SHOW_CONTACTS_MODAL, payload: false });
					await dispatch({ type: APP.SET_SHOW_ANNOUNCE_MODAL, payload: false });
					await dispatch({ type: APP.SET_SHOW_REMIND_EARNINVITE_MODAL, payload: false });
					await dispatch({ type: APP.SET_SHOW_WHERE_HEARD_FEEDBACK_MODAL, payload: true });
				}

				try {
					await setStorageKey(KEYS.WHERE_HEARD_MODAL_SHOW_CNT, cnt);
				} catch (e) {}
			}
		} else {
			await setStorageKey(KEYS.HIDE_WHERE_HEARD_MODAL_SHOW, true);
			await dispatch({ type: APP.SET_SHOW_WHERE_HEARD_FEEDBACK_MODAL, payload: false });
		}
		resolve();
	});
};

export const setShowAnnounceModal = (payload) => (dispatch, getState) => {
	return new Promise(async (resolve) => {
		if (payload == true) {
			let prev_announce_id = null;
			try {
				prev_announce_id = await getStorageKey(KEYS.PREV_ANNOUNCE_ID);
			} catch (e) {}

			let announceData = null;
			try {
				let res = await apiFactory.get(`get-announcement`);
				if (res.data && res.data.announce) {
					announceData = res.data.announce;
				}
			} catch (error) {}

			if (
				announceData != null &&
				announceData.id != null &&
				(prev_announce_id == null || announceData.id > prev_announce_id)
			) {
				let show_change_city_modal = getState().app.show_change_city_modal || false;
				if (show_change_city_modal) {
					resolve();
					return;
				}

				await dispatch({ type: APP.SET_APP_ANNOUNCE_DATA, payload: announceData });

				await dispatch({ type: APP.SET_SHOW_INVITE_CONTACTS_FRIEND_MODAL, payload: false });
				await dispatch({ type: APP.SET_SHOW_CONTACTS_MODAL, payload: false });
				await dispatch({ type: APP.SET_SHOW_WHERE_HEARD_FEEDBACK_MODAL, payload: false });
				await dispatch({ type: APP.SET_SHOW_REMIND_EARNINVITE_MODAL, payload: false });
				await dispatch({ type: APP.SET_SHOW_ANNOUNCE_MODAL, payload: true });

				try {
					await setStorageKey(KEYS.PREV_ANNOUNCE_ID, announceData.id);
				} catch (e) {}
			}
		} else {
			await dispatch({ type: APP.SET_SHOW_ANNOUNCE_MODAL, payload: false });
		}
		resolve();
	});
};

export const getSystemSettings = () => (dispatch) => {
	return new Promise((resolve) => {
		apiFactory.get(`get-settings`).then(
			({ data }) => {
				dispatch({
					type: APP.SET_SYSTEM_SETTINGS,
					payload: data.settings || {},
				});
				resolve(data.settings || {});
			},
			() => resolve({})
		);
	});
};

export const getStudentVerifySettings = () => (dispatch) => {
	return new Promise((resolve) => {
		apiFactory.get(`promotions/student-verification-setting`).then(
			({ data }) => {
				dispatch({
					type: APP.SET_STUDENT_VERIFY_SETTINGS,
					payload: data.settings || {},
				});
				resolve(data.settings || {});
			},
			() => resolve({})
		);
	});
};

export const getPromotionBanner =
	(promotion_type = 'vendor') =>
	(dispatch) => {
		return new Promise((resolve) => {
			apiFactory.get(`banners/promotion?promotion_type=${promotion_type}`).then(
				({ data }) => {
					dispatch({
						type: promotion_type == 'vendor' ? APP.SET_BANNER_PROMOTION : APP.SET_STUDENT_BANNER_PROMOTION,
						payload: data.banner,
					});
					resolve(data.banner);
				},
				() => resolve({})
			);
		});
	};

export const getAllPromotionBanners = () => (dispatch) => {
	return new Promise((resolve) => {
		apiFactory.get(`banners/all-promotions`).then(
			({ data }) => {
				dispatch({
					type: APP.SET_ALL_PROMO_BANNERS,
					payload: data.banners,
				});
				resolve(data.banners);
			},
			() => resolve([])
		);
	});
};

export const setShowMutualFriendInviteModal = (payload) => (dispatch, getState) => {
	return new Promise(async (resolve) => {
		if (payload == true) {
			let show_interval = 0;
			try {
				let res = await apiFactory.get(`get-settings`);
				if (res.data && res.data.settings) {
					show_interval = res.data.settings.invite_mutual_friend_display_interval ?? 0;
				}
			} catch (error) {}

			if (show_interval > 0) {
				let cnt = 0;
				try {
					cnt = await getStorageKey(KEYS.MUTUAL_FRIEND_INVITE_MODAL_SHOW_CNT);
				} catch (e) {}

				cnt = cnt + 1;
				if (cnt >= show_interval) {
					try {
						let res = await apiFactory.get(`users/get-mutual-friends-snapfooders`);
						if (res.data && res.data.snapfooders && res.data.snapfooders.length > 0) {
							await dispatch({
								type: APP.SET_SHOW_INVITE_MUTUAL_FRIEND_MODAL,
								show: true,
								data: res.data.snapfooders,
							});
						}
					} catch (error) {}
					cnt = 0;
				}

				try {
					await setStorageKey(KEYS.MUTUAL_FRIEND_INVITE_MODAL_SHOW_CNT, cnt);
				} catch (e) {}
			}
		} else {
			await dispatch({ type: APP.SET_SHOW_INVITE_MUTUAL_FRIEND_MODAL, show: false });
		}
		resolve();
	});
};
