import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';
import { connect } from 'react-redux'
import { LoginManager } from 'react-native-fbsdk';
import { logout, } from '../../../store/actions/auth';
import Config from '../../../config';
import alerts from '../../../common/services/alerts';
import { openExternalUrl } from '../../../common/services/utility';
import { translate } from '../../../common/services/translate';
import apiFactory from '../../../common/services/apiFactory';
import Theme from '../../../theme';
import RouteNames from '../../../routes/names';
import ProfileAvatarView from '../components/ProfileAvatarView';
import ProfileInfoItem from '../components/ProfileInfoItem';
import { setInvitationRewards, setReferralsRewards, getReferralsRewardsSetting, getMembershipSetting, getSystemSettings, getStudentVerifySettings } from '../../../store/actions/app';
import Svg_address from '../../../common/assets/svgs/profile/address.svg';
import Svg_blog from '../../../common/assets/svgs/profile/blog.svg';
import Svg_card from '../../../common/assets/svgs/profile/card.svg';
import Svg_heart from '../../../common/assets/svgs/profile/heart.svg';
import Svg_logout from '../../../common/assets/svgs/profile/logout.svg';
import Svg_promotion from '../../../common/assets/svgs/profile/promotion.svg';
import Svg_setting from '../../../common/assets/svgs/profile/setting.svg';
import Svg_snapfood from '../../../common/assets/svgs/profile/snapfood.svg';
import Svg_report from '../../../common/assets/svgs/profile/report-problem.svg';
import Svg_star from '../../../common/assets/svgs/profile/star.svg';
import Svg_userplus from '../../../common/assets/svgs/profile/user-plus.svg';
import Svg_vendor from '../../../common/assets/svgs/profile/vendor.svg';
import Svg_wallet from '../../../common/assets/svgs/profile/wallet.svg';
import Svg_transaction from '../../../common/assets/svgs/profile/transaction.svg';
import LogoutModal from '../../../common/components/modals/LogoutModal';
import ProfileGalleryItem from '../components/ProfileGalleryItem';
import ProfileMembershipItem from '../components/ProfileMembershipItem';

const ProfileScreen = (props) => {
	const [isLogoutModal, showLogoutModal] = useState(false);
	useEffect(() => {
		const focusListener = props.navigation.addListener('focus', () => {
			
			getRewardsSetting();
			props.getSystemSettings();
			props.getStudentVerifySettings();
			props.getReferralsRewardsSetting();
			props.getMembershipSetting();
		});
		return focusListener;
	}, [props.navigation])

	const getBtns = () => {
		const tmp_btns = [
			{ name: 'wallet', link: RouteNames.WalletScreen, icon: <Svg_wallet /> },
			{ name: 'invite_reward', link: RouteNames.InviteScreen, icon: <Svg_userplus /> },
			{ name: 'earn_reward', link: RouteNames.EarnScreen, icon: <Svg_userplus /> },
			{ name: 'addresses', link: RouteNames.AddressesScreen, icon: <Svg_address /> },
			{ name: 'payment_method', link: RouteNames.PaymentMethodsScreen, icon: <Svg_card /> },
			{ name: 'transactions', link: RouteNames.DepositTransferHistScreen, icon: <Svg_transaction width={25} height={25} /> },
			{ name: 'promotions_menu', link: RouteNames.PromotionsScreen, icon: <Svg_promotion /> },
			{ name: 'preferred', link: RouteNames.FavouritesScreen, icon: <Svg_heart /> },
			{ name: 'blog_menu', link: RouteNames.BlogScreen, icon: <Svg_blog /> },
			{ name: 'report_problem', link: RouteNames.ReportFeedbackScreen, icon: <Svg_report /> },
			{ name: 'settings', link: RouteNames.SettingScreen, icon: <Svg_setting /> },
			{ name: 'rate_app', icon: <Svg_star /> },
			{ name: 'become_a_partner', icon: <Svg_vendor /> },
			{ name: 'about', icon: <Svg_snapfood /> },
			{ name: 'logout', icon: <Svg_logout /> },
		];

		let btns = [];
		tmp_btns.forEach(btn => {
			if (btn.name == 'invite_reward') {
				if (props.referralsRewardsSetting.show_referral_module == true) {
					btns.push(btn);
				}
			}
			else if (btn.name == 'earn_reward') {
				if (props.referralsRewardsSetting.show_earn_invitation_module == true) {
					btns.push(btn);
				}
			}
			else if (btn.name == 'transactions') {
				if (props.systemSettings.enable_deposit_transfer_module == 1) {
					btns.push(btn);
				}
			}
			else if (btn.name == 'report_problem') {
				if (props.systemSettings.enable_problem_report == 1) {
					btns.push(btn);
				}
			}
			else {
				btns.push(btn);
			}
		});

		return btns;
	}

	const getRewardsSetting = () => {
		apiFactory.get(`invite-earn/get-rewards-setting`)
			.then(res => {
				if (res.data) {
					props.setInvitationRewards(res.data.rewards || []);
				}
			})
			.catch(err => {
				
			});
	}

	const handleReview = () => {
		Config.isAndroid
			? openExternalUrl(`https://play.google.com/store/apps/details?id=com.snapfood.app&hl=en`)
			: openExternalUrl(`https://itunes.apple.com/al/app/snapfood-food%20delivery/id1314003561?l=en&mt=8`);
	};

	const openMerchantRegister = () => {
		openExternalUrl('https://snapfood.al/merchant/');
	};

	const openAboutUs = () => {
		openExternalUrl('https://snapfood.al/about');
	};

	const dologout = async () => {
		showLogoutModal(false);
		try {
			LoginManager.logOut();
		} catch (e) {
			
		}
		try {
			await props.logout();
		} catch (e) {
			
		}
		if (props.hometab_navigation != null) {
			props.hometab_navigation.jumpTo(RouteNames.HomeStack)
		}
		props.rootStackNav.navigate(RouteNames.WelcomeScreen, { backRoute: RouteNames.BottomTabs });
	};

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			<FlatList
				keyboardShouldPersistTaps='always'
				style={styles.listContainer}
				data={getBtns()}
				numColumns={2}
				keyExtractor={item => item.name}
				renderItem={({ item }, index) => (
					<TouchableOpacity
						delayPressIn={100}
						style={[Theme.styles.row_center, styles.itemView]}
						onPress={() => {
							if (item.name == 'rate_app') {
								handleReview()
							}
							else if (item.name == 'become_a_partner') {
								openMerchantRegister()
							}
							else if (item.name == 'about') {
								openAboutUs()
							}
							else if (item.name == 'logout') {
								showLogoutModal(true)
							}
							else if (item.name == 'invite_reward') {
								props.rootStackNav.navigate(RouteNames.InviteScreen, { fromPush: false })
							}
							else if (item.name == 'earn_reward') {
								props.rootStackNav.navigate(RouteNames.EarnScreen, { fromPush: false })
							}
							else {
								props.rootStackNav.navigate(item.link);
							}
						}}
					>
						{item.icon}
						<Text style={[styles.itemTxt, Theme.styles.flex_1]}>{translate('account.' + item.name)}</Text>
					</TouchableOpacity>
				)}
				ListHeaderComponent={() => (
					<View style={{ width: '100%', paddingHorizontal: 7, }}>
						<ProfileAvatarView
							photo={props.user.photo}
							full_name={props.user.full_name}
							username={props.user.username}
							birthdate={props.user.birthdate}
							city={props.address.city}
							country={props.address.country}
							has_membership={props.user.has_membership == 1 && props.systemSettings.enable_membership == 1}
							onEdit={() => {
								props.rootStackNav.navigate(RouteNames.ProfileEditScreen);
							}}
						/>
						<ProfileMembershipItem onPress={() => { props.rootStackNav.navigate(RouteNames.MembershipScreen); }} />
						<ProfileInfoItem email={props.user.email} phone={props.user.phone} />
						{
							props.systemSettings.enable_interests == 1 &&
							<ProfileGalleryItem
								title={translate('interests.interests')}
								tooltip_title={translate('tooltip.interests_title')}
								tooltip_desc={translate('tooltip.interests_desc')}
								icon={'star'}
								btn={translate('account.manage_preference')}
								onPress={() => {
									props.rootStackNav.navigate(RouteNames.ProfileInterestScreen);
								}}
							/>
						}
						{
							props.systemSettings.enable_profile_gallery == 1 &&
							<ProfileGalleryItem
								onPress={() => {
									props.rootStackNav.navigate(RouteNames.GalleryScreen);
								}}
							/>
						}
					</View>
				)}
				ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
				ListFooterComponent={() => <View style={{ height: 30 }} />}
			/>
			<LogoutModal
				showModal={isLogoutModal}
				onClose={() => showLogoutModal(false)}
				onLogout={dologout}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	name: { marginRight: 4, paddingBottom: 4, fontSize: 18, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	listContainer: { flex: 1, width: '100%', marginTop: 48, paddingHorizontal: 13, backgroundColor: Theme.colors.white },
	itemView: { flex: 1, marginHorizontal: 7, height: 68, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: Theme.colors.gray8, borderRadius: 15, },
	itemTxt: { marginLeft: 10, marginBottom: Platform.OS === 'android' ? 4 : 0, fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	spaceCol: {
		height: 17
	},
})

const mapStateToProps = ({ app }) => ({
	user: app.user,
	address: app.address || {},
	hometab_navigation: app.hometab_navigation,
	referralsRewardsSetting: app.referralsRewardsSetting || {},
	systemSettings: app.systemSettings || {},
	membershipSetting: app.membershipSetting || {},
});

export default connect(mapStateToProps, {
	logout, setInvitationRewards, setReferralsRewards, getReferralsRewardsSetting, getMembershipSetting, getSystemSettings, getStudentVerifySettings
})(ProfileScreen);
