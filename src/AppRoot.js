import React from 'react';
import { StatusBar, View, Platform, Linking, AppState } from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import BottomTabs from './routes/stack';
import { setStorageKey, getStorageKey, KEYS } from './common/services/storage';
import SplashScreen from 'react-native-splash-screen';
import messaging from '@react-native-firebase/messaging';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { connect } from 'react-redux';
import RNContacts from 'react-native-contacts';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import { getLoggedInUser, legacyLogin, setAsLoggedIn, setAsSeenOnboard, setUserNeedLogin } from './store/actions/auth';
import * as RNLocalize from 'react-native-localize';
import { getSearchParamFromURL, isEmpty } from '../src/common/services/utility';
import {
	closeRatingModal,
	getAddresses,
	getLastUnReviewedOrder,
	setAddress,
	setSafeAreaData,
	loadAppLang,
	addDefaultAddress,
	goActiveScreenFromPush,
	setInvitationRewards,
	setShowContactsModal,
	setShowInviteFriendModal,
	setShowEarnInviteRemindModal,
	setAskedContactsPerm,
	setAskedInterests,
	setSharingContent,
	setRefferalCode,
	setShowChangeCityModal,
	checkLocationDiff,
	getReferralsRewardsSetting,
	getSystemSettings,
} from './store/actions/app';
import { updateCartItems, setVendorCart } from './store/actions/shop';
import { updateProfileDetails } from './store/actions/auth';
import { getVendorDetail } from './store/actions/vendors';
import { loadUserSetting } from './common/services/user';
import {
	PUSH_NOTIFICATION_NEW_BLOG,
	PUSH_NOTIFICATION_NEW_VENDOR,
	PUSH_NOTIFICATION_OPENED_EVENT,
	PUSH_NOTIFICATION_RECEIVED_EVENT,
	setupPushNotifications,
	setExternalUserId,
	removeExternalUserId,
} from './common/services/pushNotifications';
import { MenuProvider } from 'react-native-popup-menu';

import { EventRegister } from 'react-native-event-listeners';
import apiFactory from './common/services/apiFactory';
import { openRateAppModal, shouldOpenRateAppModal, updateOpenedAppCount } from './common/services/rate';
import { addLog } from './common/services/debug_log';
import branch from 'react-native-branch';
import RouteNames from './routes/names';
import { Mixpanel } from 'mixpanel-react-native';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { initialize } from 'react-native-clarity';
const trackAutomaticEvents = false;
export const mixpanel = new Mixpanel('12dfedc3c52bab4bc3fbae7a51c3da08', trackAutomaticEvents);
mixpanel.init();

class AppRoot extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			orderDetails: {},
			loadedInfo: false,
			messages: [],
			appState: AppState.currentState,
		};
	}

	_handleAppStateChange = (nextAppState) => {
		try {
			if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
				this.clearIOSBadge();
			}
			this.setState({ appState: nextAppState });
		} catch (e) {}
	};

	getBrachIOHandler = async () => {
		if (Platform.OS != 'ios') {
			return;
		}
		branch.subscribe({
			onOpenStart: ({ uri, cachedInitialEvent }) => {
				console.log('subscribe onOpenStart, will open ' + uri + ' cachedInitialEvent is ' + cachedInitialEvent);
			},
			onOpenComplete: ({ error, params, uri }) => {
				console.log('params', params, error, uri);

				if (error) {
					console.error('subscribe onOpenComplete, Error from opening uri: ' + uri + ' error: ' + error);
					return;
				} else if (params) {
					console.log('params', params, uri);

					if (params['~referring_link']) {
						// Alert.alert("oped", params["~referring_link"]);
					}
				}
			},
		});

		let lastParams = await branch.getLatestReferringParams(); // params from last open
		let installParams = await branch.getFirstReferringParams(); // params from original install
		console.log('lastParams', lastParams['code'], installParams['code']);

		if (lastParams['~referring_link'] && lastParams['code']) {
			this.props.setRefferalCode({
				refferalCode: lastParams['code'],
			});
		}
		if (installParams['~referring_link'] && installParams['code']) {
			this.props.setRefferalCode({
				refferalCode: installParams['code'],
			});
		} else {
		}
	};

	async componentDidMount() {
		const clarityConfig = {
			logLevel: LogLevel.Verbose,
			allowMeteredNetworkUsage: true,
			enableIOS_experimental: true,
		};

		initialize('ololehow3z', clarityConfig);
		this.setIOSBadge();

		// Initialize OneSignal
		await setupPushNotifications();

		// Set up OneSignal notification handlers
		OneSignal.Notifications.addEventListener('click', (event) => {
			console.log('OneSignal: notification clicked:', event);
			this.onNotificationOpened(event.notification);
		});

		// Handle notification received while app in foreground
		OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
			console.log('OneSignal: notification received in foreground:', event);
			// Complete with null means don't show a notification
			event.preventDefault();
			// Handle the notification data
			if (event.notification.additionalData) {
				this.handleForegroundNotification(event.notification);
			}
		});

		// Set external user ID if logged in
		if (this.props.isLoggedIn && this.props.user?.id) {
			await setExternalUserId(this.props.user.id);
		}

		await this.clearIOSBadge();
		await this.loadLoginInfo();
		this.appStateListener = AppState.addEventListener('change', this._handleAppStateChange);
		AppState.addEventListener('change', this.getBrachIOHandler);

		this.getBrachIOHandler();
		dynamicLinks().onLink(this.handleDynamicLink);
	}

	componentDidUpdate(prevProps) {
		// Handle user login/logout for OneSignal
		if (!prevProps.isLoggedIn && this.props.isLoggedIn && this.props.user?.id) {
			setExternalUserId(this.props.user.id);
		}
		if (prevProps.isLoggedIn && !this.props.isLoggedIn) {
			removeExternalUserId();
		}
	}

	handleForegroundNotification = (notification) => {
		const data = notification.additionalData;
		if (data && data.type) {
			this.onNotificationOpened({ data });
		}
	};

	setIOSBadge(isClear = false) {
		if (Platform.OS === 'ios') {
			if (isClear) {
				PushNotificationIOS.setApplicationIconBadgeNumber(0);
				return;
			}
			// PushNotificationIOS.getApplicationIconBadgeNumber((badge) => {
			// 	PushNotificationIOS.setApplicationIconBadgeNumber(badge + 1);
			// });
		}
	}

	componentWillUnmount() {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
		if (this.pushNotiListener) {
			EventRegister.removeEventListener(this.pushNotiListener);
		}
		if (this.shareListener) {
			this.shareListener.remove();
		}
		if (this.localizationListener) {
			this.localizationListener.remove();
		}
		if (this.appStateListener) {
			this.appStateListener.remove();
		}

		// Remove OneSignal listeners
		OneSignal.Notifications.clearAll();
	}

	getRewardSettings = async () => {
		try {
			let res = await apiFactory.get(`invite-earn/get-rewards-setting`);
			if (res.data) this.props.setInvitationRewards(res.data.rewards || []);
		} catch (e) {}
	};

	clearIOSBadge = async () => {
		if (Platform.OS == 'ios') {
			try {
				let res = await apiFactory.get(`users-clear-badge`);
				if (res.data) await PushNotificationIOS.setApplicationIconBadgeNumber(0);
			} catch (e) {}
		}
	};

	goVendorProfile = (vendor_id) => {
		const { goActiveScreenFromPush, coordinates, setVendorCart } = this.props || {};
		let { latitude, longitude } = coordinates;
		getVendorDetail(vendor_id, latitude, longitude)
			.then((data) => {
				setVendorCart(data || {});
				setTimeout(() => {
					goActiveScreenFromPush({
						isVendorVisible: true,
						pushVendorId: vendor_id,
					});
				}, 500);
			})
			.catch((error) => {});
	};

	onNotificationOpened = async (notification) => {
		this.setIOSBadge();
		const data = notification?.data;
		console.log('data', notification);

		const { goActiveScreenFromPush, coordinates, setVendorCart } = this.props || {};
		const {
			conversation_id,
			type,
			date_time,
			vendor_id,
			blog_id,
			invitation_id,
			notification_id,
			referral_id,
			split_id,
		} = data || {};

		console.log('typetypetype', type);

		const callbackByType = {
			order_status_change: async () => {
				await goActiveScreenFromPush({
					isOrderSummVisible: true,
					order: { id: data['order_id'], status: data['status'] },
				});
			},
			user_category_change: async () => await goActiveScreenFromPush({ isWalletVisible: true }),
			friend_request_notification: async () => await goActiveScreenFromPush({ isInvitationVisible: true }),
			group_chat_invite_notification: async () => {
				await goActiveScreenFromPush({
					isChatVisible: true,
					pushConversationId: conversation_id,
					pushChatMsgTime: new Date().getTime(),
				});
			},
			chat_notification: async () => {
				if (Platform.OS == 'ios') {
					PushNotificationIOS.getDeliveredNotifications((notifications) => {
						// remove notification by conversation_id

						let deliveredNotificationIds = notifications
							.filter(({ userInfo }) => userInfo?.type === type)
							.map(({ identifier }) => identifier);
						PushNotificationIOS.removeDeliveredNotifications(deliveredNotificationIds);
					});
				}

				await goActiveScreenFromPush({
					isChatVisible: true,
					pushConversationId: conversation_id,
					pushChatMsgTime: date_time,
				});
			},
			vendor_notification: async () => {
				this.goVendorProfile(vendor_id);
			},
			general_near_vendor_notification: async () => {
				this.goVendorProfile(vendor_id);
			},
			general_near_user_notification: async () => {
				if (this.props.isLoggedIn) {
					await goActiveScreenFromPush({ isSnapfooderVisible: true, pushSnapfooderId: notification_id });
				}
			},

			blog_notification: async () => await goActiveScreenFromPush({ isBlogVisible: true, pushBlogId: blog_id }),
			incoming_call: async () => {
				await goActiveScreenFromPush({ isIncomingCall: true, IncomingCallData: notification.data });
			},
			earn_invitation_notification: async () => {
				await this.getRewardSettings();
				await goActiveScreenFromPush({
					isEarnInviteDetailsVisible: true,
					push_earn_invitation_id: invitation_id,
				});
			},
			referral_notification: async () => {
				await goActiveScreenFromPush({ isReferralVisible: true, push_referral_id: referral_id });
			},
			general_referral_notification: async () => await goActiveScreenFromPush({ isGeneralReferralVisible: true }),
			general_earn_notification: async () => {
				await this.getRewardSettings();
				await goActiveScreenFromPush({ isGeneralEarnVisible: true });
			},
			general_cashback_notification: async () => await goActiveScreenFromPush({ isGeneralCashbackVisible: true }),
			general_story_notification: async () => await goActiveScreenFromPush({ isGeneralStoryVisible: true }),

			general_student_verification_notification: async () =>
				await goActiveScreenFromPush({ isGeneralStudentVerifyVisible: true }),

			split_order_request_notification: async () =>
				await goActiveScreenFromPush({ isCartSplitRequestVisible: true, push_cart_split_id: split_id }),

			from_superadmin_to_map: async () =>
				await goActiveScreenFromPush({ screenNavigate: RouteNames.SnapfoodMapScreen }),
			from_superadmin_to_promotions: async () =>
				await goActiveScreenFromPush({ screenNavigate: RouteNames.PromotionsScreen }),
			from_superadmin_to_promotion_calendar: async () =>
				await goActiveScreenFromPush({ screenNavigate: RouteNames.PromosCalendarScreen }),
			from_superadmin_to_student_acccess: async () =>
				await goActiveScreenFromPush({ screenNavigate: RouteNames.StudentVerifyScreen }),
			from_superadmin_to_favourites: async () =>
				await goActiveScreenFromPush({ screenNavigate: RouteNames.FavouritesScreen }),
			from_superadmin_to_payment_methods: async () =>
				await goActiveScreenFromPush({ screenNavigate: RouteNames.PaymentMethodsScreen }),
			from_superadmin_to_profile: async () =>
				await goActiveScreenFromPush({ screenNavigate: RouteNames.ProfileStack }),
			from_superadmin_to_friends: async () =>
				await goActiveScreenFromPush({ screenNavigate: RouteNames.MyFriendsScreen }),
		};
		if (type && callbackByType[type]) {
			try {
				await callbackByType[type]();
			} catch (error) {}
		}
	};

	handleDynamicLink = async (link) => {
		if (link.url) {
			if (Platform.OS == 'ios') {
				if (link.url.includes('snapfoodies.app.link')) {
					branch.subscribe(({ error, params, uri }) => {
						if (error) {
							console.error('Error from Branch: ' + error);
							return;
						}

						if (params['~referring_link']) {
							// Alert.alert("oped", params["~referring_link"]);
						}
					});
					let lastParams = await branch.getLatestReferringParams(); // params from last open
					let installParams = await branch.getFirstReferringParams(); // params from original install
					if (lastParams['~referring_link'] && lastParams['code']) {
						this.props.setRefferalCode({
							refferalCode: lastParams['code'],
						});
					}

					if (installParams['~referring_link'] && installParams['code']) {
						this.props.setRefferalCode({
							refferalCode: installParams['code'],
						});
					} else {
					}
				}
			}
			if (link.url.includes('snapfood.al/referral')) {
				// link type is 'https://snapfood.al/referral?referral-code='
				const refferal = getSearchParamFromURL(link.url, 'referralCode');

				if (refferal) {
					this.props.setRefferalCode({
						refferalCode: refferal,
					});
				}
			} else if (link.url.includes('snapfood.al/reward') && this.props.isLoggedIn) {
				try {
					const couponCode = getSearchParamFromURL(link.url, 'couponCode');
					const restaurantId = getSearchParamFromURL(link.url, 'restaurantId');
					if (!isEmpty(couponCode)) {
						await this.props.goActiveScreenFromPush({ isGetPromoVisible: true, promo_code: couponCode });
					} else if (restaurantId != null) {
						this.goVendorProfile(restaurantId);
					} else {
						let res = await apiFactory.get(`invite-earn/get-referrals-setting`);
						if (res.data && res.data.show_earn_invitation_module == true) {
							await this.props.goActiveScreenFromPush({
								isGeneralEarnVisible: true,
							});
						}
					}
				} catch (err) {}
			}
		}
	};

	handleLocalizationChange = async () => {
		await this.props.loadAppLang().then();
		this.forceUpdate();
	};

	appLoaded = () => {
		updateOpenedAppCount();
		this.setState({ loadedInfo: true }, () => {
			SplashScreen.hide();
			setupPushNotifications();
		});
	};

	loadDimCarts = async () => {
		try {
			await this.props.setSafeAreaData();
		} catch (e) {}
		try {
			const cartItems = await getStorageKey(KEYS.CART_ITEMS);
			if (cartItems) {
				this.props.updateCartItems(cartItems, false);
			}
		} catch (e) {}
	};

	loadSettings = async () => {
		this.loadDimCarts();

		try {
			await this.props.loadAppLang();
		} catch (e) {}

		try {
			const seenOnboard = await getStorageKey(KEYS.SEEN_ONBOARD);
			if (seenOnboard == true) {
				await this.props.setAsSeenOnboard();
			}
		} catch (e) {}

		try {
			const res = await RNContacts.checkPermission();

			if (res == 'denied') {
				await this.props.setShowContactsModal(true);
			}
		} catch (e) {}

		try {
			await this.props.setShowInviteFriendModal(true);
		} catch (e) {}
		try {
			await this.props.setShowEarnInviteRemindModal(true);
		} catch (e) {}
		try {
			await this.props.getReferralsRewardsSetting();
		} catch (e) {}
		try {
			await this.props.getSystemSettings();
		} catch (e) {}

		try {
			if (Platform.OS == 'ios') {
				const dynamicLink = await Linking.getInitialURL();
				addLog('log-1', `ios Linking.getInitialURL : ${dynamicLink}`);
				if (dynamicLink) {
					await fetch(dynamicLink).then((initialUrl) => {
						addLog('log-2', `ios fetch(dynamicLink) : ${dynamicLink},  initialUrl : ${initialUrl}`);
						this.handleDynamicLink(initialUrl);
					});
				}
			} else {
				const initialUrl = await dynamicLinks().getInitialLink();
				addLog('log-3', `android dynamicLinks().getInitialLink : ${JSON.stringify(initialUrl)}`);
				if (initialUrl) {
					this.handleDynamicLink(initialUrl);
				}
			}
		} catch (e) {
			try {
				addLog('log-4', `ios getInitialURL Error Catch : ` + JSON.stringify(e));
			} catch (error) {}
		}
	};

	loadSharedContent = async () => {
		// ShareMenu.getInitialShare(this.handleInitialShare);
		// this.shareListener = ShareMenu.addNewShareListener(this.handleListenerShare);
		this.shareListener = ReceiveSharingIntent.getReceivedFiles(
			(files) => {
				var content = [];
				var mimeType = '';
				files.forEach((file) => {
					if (file.filePath) {
						content.push(file.filePath);
						mimeType = 'image';
					} else if (file.contentUri) {
						content.push(file.contentUri);
						mimeType = 'image';
					} else if (file.text) {
						content.push(file.text);
						mimeType = 'text';
					} else if (file.weblink) {
						content.push(file.weblink);
						mimeType = 'text';
					}
				});
				this.props.setSharingContent({
					sharedContent: content,
					mimeType: mimeType,
				});
				//[{ filePath: null, text: null, weblink: null, mimeType: null, contentUri: null, fileName: null, extension: null }]
			},
			(error) => {},
			'SnapfoodShareMenu'
		);
	};

	loadLoginInfo = async () => {
		let logged_user_data = null;
		try {
			let token = await getStorageKey(KEYS.TOKEN);
			if (token) {
				if (!token.startsWith('Bearer')) {
					token = `Bearer ${token}`;
				}
				logged_user_data = await this.props.legacyLogin(token);
			}
		} catch (e) {}

		try {
			const askedContacts = await getStorageKey(KEYS.ASKED_CONTACTS_PERMISSION);
			if (askedContacts == true) {
				await this.props.setAskedContactsPerm(true);
			}
		} catch (e) {}

		try {
			const askedInterests = await getStorageKey(KEYS.ASKED_INTERESTS);
			if (askedInterests == true) {
				await this.props.setAskedInterests(true);
			}
		} catch (e) {}

		try {
			await loadUserSetting(this.props, logged_user_data);
		} catch (error) {}

		try {
			await this.loadSettings();
		} catch (error) {}
		try {
			await this.loadSharedContent();
		} catch (error) {}
		this.appLoaded();
	};

	renderContent = () => {
		const { loadedInfo } = this.state;
		if (!loadedInfo) {
			return null;
		}
		return <BottomTabs />;
	};

	render() {
		return (
			<View style={{ flex: 1 }}>
				<MenuProvider>
					<StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
					{/* {!Config.isAndroid && <StatusBar barStyle={'dark-content'} />} */}
					{this.renderContent()}
				</MenuProvider>
			</View>
		);
	}
}

const mapStateToProps = ({ app, auth }) => ({
	isReviewModalVisible: app.isReviewModalVisible,
	reviewModalData: app.reviewModalData,
	coordinates: app.coordinates,
	isLoggedIn: app.isLoggedIn,
	user: app.user,
});

export default connect(mapStateToProps, {
	setAsSeenOnboard,
	updateCartItems,
	setVendorCart,

	setSafeAreaData,
	getLastUnReviewedOrder,
	closeRatingModal,
	legacyLogin,
	loadAppLang,

	setInvitationRewards,
	setAsLoggedIn,
	setUserNeedLogin,
	getLoggedInUser,
	setAddress,
	getAddresses,
	updateProfileDetails,
	addDefaultAddress,
	goActiveScreenFromPush,
	setSharingContent,
	setRefferalCode,
	setShowContactsModal,
	setShowInviteFriendModal,
	setShowEarnInviteRemindModal,
	setAskedContactsPerm,
	setAskedInterests,
	setShowChangeCityModal,
	checkLocationDiff,
	getReferralsRewardsSetting,
	getSystemSettings,
})(AppRoot);
