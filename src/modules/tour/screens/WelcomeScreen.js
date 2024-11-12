import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, StatusBar, Text, Image } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FastImage from 'react-native-fast-image';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import appleAuth from '@invertase/react-native-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import alerts from '../../../common/services/alerts';
import { translate } from '../../../common/services/translate';
import { extractErrorMessage } from '../../../common/services/utility';
import { loadUserSetting } from '../../../common/services/user';
import Theme from '../../../theme';
import Header1 from '../../../common/components/Header1';
import AppText from '../../../common/components/AppText';
import MainBtn from '../../../common/components/buttons/main_button';
import TransBtn from '../../../common/components/buttons/trans_button';
import SocialBtn from '../../../common/components/buttons/round_icon_button';
import Logo from '../../../common/assets/images/logo.png';

import RouteNames from '../../../routes/names';
import Config from '../../../config';
import {
	setAsLoggedIn,
	facebookLogin,
	googleLogin,
	getLoggedInUser,
	appleLogin,
	setUserNeedLogin,
	updateProfileDetails,
} from '../../../store/actions/auth';
import {
	getAddresses,
	setAddress,
	addDefaultAddress,
	setShowChangeCityModal,
	checkLocationDiff,
	getReferralsRewardsSetting,
} from '../../../store/actions/app';
import BlockSpinner from '../../../common/components/BlockSpinner';
import { isEmpty } from '../../../common/services/utility';
import { setStorageKey, KEYS } from '../../../common/services/storage';

const WelcomeScreen = (props) => {
	const backRoute = props.route.params != null ? props.route.params.backRoute : null;

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		GoogleSignin.configure({
			webClientId: '82651546395-4r336st98l1570pb45idtp498fmnklcp.apps.googleusercontent.com',
		});
		const focusListener = props.navigation.addListener('focus', () => {
			props.getReferralsRewardsSetting();
		});
		return () => {
			try {
				focusListener();
			} catch (error) {}
		};
	}, []);

	const referralMessage = useMemo(() => {
		let register_rewards = props.referralsRewardsSetting.register_rewards || 100;
		let defaultMsg =
			translate('invitation_earn.welcome_earn_desc1') +
			register_rewards +
			translate('invitation_earn.welcome_earn_desc2');

		if (props.language == 'sq' && isEmpty(props.referralsRewardsSetting.referral_description_message) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_description_message;
		} else if (
			props.language == 'en' &&
			isEmpty(props.referralsRewardsSetting.referral_description_message_en) == false
		) {
			defaultMsg = props.referralsRewardsSetting.referral_description_message_en;
		} else if (
			props.language == 'it' &&
			isEmpty(props.referralsRewardsSetting.referral_description_message_it) == false
		) {
			defaultMsg = props.referralsRewardsSetting.referral_description_message_it;
		}

		defaultMsg = defaultMsg.replace('{amount}', register_rewards + 'L');
		return defaultMsg;
	}, [props.referralsRewardsSetting, props.language]);

	const _rendereEarnByReferral = () => {
		console.log('props.refferalCode', props.refferalCode);

		if (
			props.refferalCode &&
			props.systemSettings?.enable_referral_deeplink == 1 &&
			isEmpty(referralMessage) != true
		) {
			return (
				<View style={[Theme.styles.row_center, styles.itemView]}>
					<Text style={[styles.itemTxt, Theme.styles.flex_1]}>{referralMessage}</Text>
				</View>
			);
		}
		return <View />;
	};

	const _renderDivider = () => {
		return (
			<View style={[Theme.styles.row_center, styles.divider]}>
				<View style={styles.divider_line} />
				<AppText style={styles.ortxt}>{translate('or')}</AppText>
				<View style={styles.divider_line} />
			</View>
		);
	};

	const handleFbLogin = async (accessToken) => {
		setLoading(true);
		props
			.facebookLogin(
				accessToken.toString(),
				props.systemSettings?.enable_referral_deeplink == 1 ? props.refferalCode : null
			)
			.then(
				async (logged_user_data) => {
					setLoading(false);
					await loadUserSetting(props, logged_user_data);
					if (backRoute) {
						props.navigation.goBack();
					}
				},
				(error) => {
					setLoading(false);
					alerts.error(translate('attention'), extractErrorMessage(error));
				}
			);
	};

	const handleAppleLogin = async (appleAuthRequestResponse) => {
		const { user, identityToken, email, fullName } = appleAuthRequestResponse;
		setLoading(true);
		props
			.appleLogin({
				user,
				identityToken,
				email,
				fullName,
				refferalCode: props.systemSettings?.enable_referral_deeplink == 1 ? props.refferalCode : null,
			})
			.then(
				async (logged_user_data) => {
					setLoading(false);
					await loadUserSetting(props, logged_user_data);
					if (backRoute) {
						props.navigation.goBack();
					}
				},
				(error) => {
					setLoading(false);
					alerts.error(translate('attention'), extractErrorMessage(error));
				}
			);
	};

	const handleGoogleLogin = async (id_token) => {
		setLoading(true);
		props
			.googleLogin(id_token, props.systemSettings?.enable_referral_deeplink == 1 ? props.refferalCode : null)
			.then(
				async (logged_user_data) => {
					setLoading(false);
					await loadUserSetting(props, logged_user_data);
					if (backRoute) {
						props.navigation.goBack();
					}
				},
				(error) => {
					setLoading(false);
					alerts.error(translate('attention'), extractErrorMessage(error));
				}
			);
	};

	const onFbLogin = () => {
		if (Config.isAndroid) {
			LoginManager.setLoginBehavior('web_only');
		}
		LoginManager.logInWithPermissions(['public_profile', 'email'])
			.then((result) => {
				if (result.isCancelled) {
					alerts.error(translate('attention'), translate('accept_access'));
				} else {
					AccessToken.getCurrentAccessToken().then(({ accessToken }) => {
						handleFbLogin(accessToken);
					});
				}
			})
			.catch(() => {
				alerts.error(translate('attention'), translate('accept_access'));
			});
	};

	const onAppleButtonPress = async () => {
		try {
			const appleAuthRequestResponse = await appleAuth.performRequest({
				requestedOperation: appleAuth.Operation.LOGIN,
				requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
			});

			const { identityToken, authorizationCode } = appleAuthRequestResponse;

			try {
				await setStorageKey(KEYS.APPLE_LOGIN_AUTH_CODE, authorizationCode);
			} catch (e) {}

			if (identityToken) {
				handleAppleLogin(appleAuthRequestResponse);
			} else {
			}
		} catch (error) {}
	};

	const onGoogleSignin = async () => {
		// Get the users ID token
		const { idToken } = await GoogleSignin.signIn();

		handleGoogleLogin(idToken);
	};

	const _renderSocialBtns = () => {
		if (loading) {
			return (
				<View style={styles.loadingWrapper}>
					<BlockSpinner style={{ minHeight: 80 }} />
				</View>
			);
		} else {
			return (
				<View style={styles.socials}>
					<SocialBtn
						icon={<Fontisto name='facebook' size={26} color={Theme.colors.text} />}
						onPress={onFbLogin}
					/>
					<SocialBtn
						icon={<AntDesign name='google' size={26} color={Theme.colors.text} />}
						onPress={onGoogleSignin}
					/>
					{Config.isAndroid == false && (
						<SocialBtn
							icon={<AntDesign name='apple1' size={26} color={Theme.colors.text} />}
							onPress={onAppleButtonPress}
						/>
					)}
				</View>
			);
		}
	};

	return (
		<View style={[Theme.styles.background, { backgroundColor: '#ffffff' }]}>
			<View style={[Theme.styles.top, { justifyContent: 'space-evenly', alignItems: 'center', paddingTop: 200 }]}>
				<FastImage source={Logo} style={Theme.styles.logo} />
				{_rendereEarnByReferral()}
			</View>
			<View style={{}}>
				<MainBtn
					title={translate('create_account')}
					onPress={() => {
						props.navigation.navigate(RouteNames.LoginScreen, { backRoute: backRoute, page: 'Register' });
					}}
				/>
				<TransBtn
					style={{ marginTop: 10, marginBottom: 20 }}
					title={translate('auth_login.login_button')}
					onPress={() => {
						props.navigation.navigate(RouteNames.LoginScreen, { backRoute: backRoute, page: 'Login' });
					}}
				/>
				{_renderDivider()}
				{_renderSocialBtns()}
			</View>
			{backRoute && (
				<Header1
					style={{ position: 'absolute', left: 20, top: 0 }}
					onLeft={() => {
						props.navigation.goBack();
					}}
					title={''}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	divider: { width: '100%' },
	divider_line: { flex: 1, height: 1, backgroundColor: '#E9E9F7' },
	ortxt: { fontSize: 14, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, marginLeft: 5, marginRight: 5 },
	loadingWrapper: {
		marginTop: 30,
		marginBottom: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	socials: {
		marginTop: 30,
		marginBottom: 40,
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		alignItems: 'center',
	},
	itemView: { width: '100%', padding: 12, backgroundColor: Theme.colors.gray9, borderRadius: 15 },
	itemTxt: { fontSize: 14, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, textAlign: 'center' },
});

function mapStateToProps({ app }) {
	return {
		user: app.user,
		language: app.language,
		refferalCode: app.linkedRefferalCode,
		hasVerifiedPhone: app.hasVerifiedPhone,
		referralsRewardsSetting: app.referralsRewardsSetting,
		systemSettings: app.systemSettings || {},
	};
}

export default connect(mapStateToProps, {
	facebookLogin,
	googleLogin,
	appleLogin,

	setAsLoggedIn,
	setUserNeedLogin,
	getLoggedInUser,
	setAddress,
	getAddresses,
	updateProfileDetails,
	addDefaultAddress,
	getReferralsRewardsSetting,
	setShowChangeCityModal,
	checkLocationDiff,
})(WelcomeScreen);
