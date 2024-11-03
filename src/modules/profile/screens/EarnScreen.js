import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux'
import Feather from 'react-native-vector-icons/Feather'
import Spinner from 'react-native-loading-spinner-overlay';
import * as Progress from 'react-native-progress';
import { width } from 'react-native-dimension'
import { translate } from '../../../common/services/translate';
import apiFactory from '../../../common/services/apiFactory';
import Theme from '../../../theme';
import AppText from '../../../common/components/AppText';
import SwitchTab from '../../../common/components/SwitchTab';
import Header1 from '../../../common/components/Header1';
import MainBtn from '../../../common/components/buttons/main_button';
import InvitationModal from '../../../common/components/modals/InvitationModal';
import InviteOptionModal from '../../../common/components/modals/InviteOptionModal';
import InviteEarnDescItem from '../components/InviteEarnDescItem';
import InviteCodeView from '../components/InviteCodeView';
import AppTooltip from '../../../common/components/AppTooltip';
import RouteNames from '../../../routes/names';
import { setInvitationPickedUser, loadInvitationTimerSetting, goActiveScreenFromPush } from '../../../store/actions/app';
// import Svg_img from '../../../common/assets/svgs/invite/invite_earn.svg';
import { createSingleChannel, findChannel } from '../../../common/services/chat';
import alerts from '../../../common/services/alerts';
import { isEmpty, getHourMin, convertTimeString2Hours, ucFirst } from '../../../common/services/utility';
import FastImage from 'react-native-fast-image';

const EarnScreen = (props) => {
	const _isMounted = useRef(true);

	const isFromPush = props.route?.params?.fromPush ?? false;

	const [isInviteOptionModal, showInviteOptionModal] = useState(false)
	const [isInviteModal, showInviteModal] = useState(false)
	const timeoutRef = useRef();
	const [isSendingInvitation, setSendingInvitation] = useState(false)
	const [referralsSetting, setReferralsSetting] = useState({
		cycle_hours_earn_invitation: (props.referralsRewardsSetting.cycle_hours_earn_invitation || 1),
		user_rewards: (props.referralsRewardsSetting.user_rewards || 100),
		register_rewards: (props.referralsRewardsSetting.register_rewards || 100),
		max_num_referral: (props.referralsRewardsSetting.max_num_referral || 0),
	})

	useEffect(() => {
		props.goActiveScreenFromPush({
			isGeneralEarnVisible: false
		})
		const focusListener = props.navigation.addListener('focus', () => {
			_isMounted.current = true;
			props.loadInvitationTimerSetting();
		});
		return () => {
			
			if (timeoutRef?.current) clearTimeout(timeoutRef.current);
			_isMounted.current = false;
			try {
				focusListener();
			} catch (error) { }
		};
	}, [])

	const openInviteOptionModal = () => {
		showInviteOptionModal(true);
		props.navigation.setParams({ forceOpenInvitationModal: false });
	}

	const closeInviteOptionModal = () => {
		props.navigation.setParams({ forceOpenInvitationModal: false });
		showInviteOptionModal(false);
	};

	const goOn = (Screen) => {
		closeInviteOptionModal();
		props.navigation.navigate(Screen);
	};

	const goOnFriend = () => goOn(RouteNames.InvitationFriendsScreen)
	const goOnSnapfooder = () => goOn(RouteNames.InvitationSnapfoodersScreen);

	const forceOpenInvitationModal = props?.route?.params?.forceOpenInvitationModal || false;
	useEffect(() => {
		if (forceOpenInvitationModal && !isInviteModal) {
			openInviteOptionModal();
		}
	}, [forceOpenInvitationModal]);

	useEffect(() => {
		if (props.invitationPickedUser) {
			showInviteModal(true);
		}
	}, [props.invitationPickedUser])

	const getEarnHowToWorksDescription = () => {
		let defaultMsg = translate('invitation_earn.earn_desc');
		if (props.language == 'sq' && isEmpty(props.referralsRewardsSetting.earninvitation_howto_works) == false) {
			defaultMsg = props.referralsRewardsSetting.earninvitation_howto_works;
		}
		else if (props.language == 'en' && isEmpty(props.referralsRewardsSetting.earninvitation_howto_works_en) == false) {
			defaultMsg = props.referralsRewardsSetting.earninvitation_howto_works_en;
		}
		else if (props.language == 'it' && isEmpty(props.referralsRewardsSetting.earninvitation_howto_works_it) == false) {
			defaultMsg = props.referralsRewardsSetting.earninvitation_howto_works_it;
		}
		defaultMsg = defaultMsg.replace('XXX', referralsSetting.cycle_hours_earn_invitation);

		return defaultMsg;
	}

	const onEnterChannel = async (partner, invitation_code) => {
		let defaultMsg = translate('invitation_earn.friend_use_this_code')

		if (props.language == 'sq' && isEmpty(props.referralsRewardsSetting.earninvite_friend_message) == false) {
			defaultMsg = props.referralsRewardsSetting.earninvite_friend_message;
		}
		else if (props.language == 'en' && isEmpty(props.referralsRewardsSetting.earninvite_friend_message_en) == false) {
			defaultMsg = props.referralsRewardsSetting.earninvite_friend_message_en;
		}
		else if (props.language == 'it' && isEmpty(props.referralsRewardsSetting.earninvite_friend_message_it) == false) {
			defaultMsg = props.referralsRewardsSetting.earninvite_friend_message_it;
		}

		defaultMsg = defaultMsg.replace('###', ucFirst(partner.username || partner.full_name)).replace('XXX', invitation_code);

		let found_channel = await findChannel(props.user.id, partner.id);
		if (found_channel != null) {
			props.navigation.navigate(RouteNames.MessagesScreen, { channelId: found_channel.id, defaultMsg: defaultMsg, invitation_code: invitation_code });
		} else {
			let channelID = await createSingleChannel(props.user, partner);
			if (channelID != null) {
				props.navigation.goBack();
				props.navigation.navigate(RouteNames.MessagesScreen, { channelId: channelID, defaultMsg: defaultMsg, invitation_code: invitation_code });
			} else {
				alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
			}
		}
	};

	const onSendInvitation = () => {
		let partnerData = { ...props.invitationPickedUser };
		let isFriend = props.invitationPickedUser?.isFriend == true;
		let receiver_id = props.invitationPickedUser?.id;
		if (receiver_id == null) { return };
		setSendingInvitation(true);
		apiFactory.post(`invite-earn/send-earninvitation`, {
			receiver_id: receiver_id
		})
			.then(res => {
				onCloseInvitationModal(false);
				props.loadInvitationTimerSetting();
				if (res.data?.invitation_code && isFriend) {
					onEnterChannel(partnerData, res.data?.invitation_code);
				}
			})
			.catch(err => {
				
				const message = err.message || translate('generic_error');
				alerts.error(translate('alerts.error'), message);
			})
			.finally(() => {
				setSendingInvitation(false);
			})
	}

	const onCloseInvitationModal = (goBack = true) => {
		showInviteModal(false);
		if (props.invitationPickedUser && _isMounted?.current && !!goBack) {
			timeoutRef.current = setTimeout(() => {
				props.invitationPickedUser?.isFriend ? goOnFriend() : goOnSnapfooder();
			}, 150);
		}
		props.navigation.setParams({ forceOpenInvitationModal: false });
		props.setInvitationPickedUser(null);
	}

	const renderLearnMore = () => {
		const invitationRewardsSetting = props.invitationRewardsSetting;
		const getGroupedInfo = () => {
			let slots = [];
			for (let i = 0; i < invitationRewardsSetting.length; i++) {
				let setting = invitationRewardsSetting[i];
				if (setting.from && setting.to && (setting.rewards_rate != null)) {
					let time = `${getHourMin(setting.from)}-${getHourMin(setting.to)}`;
					let index = slots.findIndex(s => s.rewards_rate == setting.rewards_rate);
					if (index != -1) {
						let tmp = slots[index].times || [];
						tmp = tmp.slice(0);
						tmp.push(time);
						tmp.sort((a, b) => convertTimeString2Hours(a) - convertTimeString2Hours(b));
						slots[index].times = tmp;
					}
					else {
						slots.push({
							times: [time],
							rewards_rate: setting.rewards_rate
						})
					}
				}
			}
			return slots;
		}
		return <AppTooltip
			title={translate('invitation_earn.learn_invite_title')}
			content={
				<View>
					{
						getGroupedInfo().map((setting, index) =>
							<View key={index} style={styles.tooltipRow}>
								<View style={styles.dot} />
								<AppText style={styles.tooltipTxt}>
									{translate('invitation_earn.learn_invite_desc1_01')}
									{
										setting.times != null && setting.times.map((tm, idx) =>
											<>
												<Text key={idx} style={{ fontFamily: Theme.fonts.bold }}>
													{tm}
												</Text>
												{(idx < setting.times.length - 1) &&
													translate('and')
												}
											</>
										)
									}

									{translate('invitation_earn.learn_invite_desc1_02')}
									<Text style={{ fontFamily: Theme.fonts.bold }}>{setting.rewards_rate}%</Text>
									{translate('invitation_earn.learn_invite_desc1_03')}
								</AppText>
							</View>
						)
					}
					<View style={styles.tooltipRow}>
						<View style={styles.dot} />
						<AppText style={styles.tooltipTxt}>
							{translate('invitation_earn.learn_invite_desc2_01')}
							<Text style={{ fontFamily: Theme.fonts.bold }}>1%</Text>
							{translate('invitation_earn.learn_invite_desc2_02')}
						</AppText>
					</View>
				</View>
			}
			anchor={<Text style={styles.learnmore} >{translate('invitation_earn.learn_more')}</Text>}
		/>
	}

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			<Spinner visible={isSendingInvitation} />
			<Header1
				style={{ marginBottom: 0, marginTop: 10, paddingHorizontal: 20 }}
				onLeft={() => {
					props.navigation.goBack();
				}}
				title={translate('Invite_Earn')}
			/>
			<ScrollView style={styles.scrollview}>
				<View style={[Theme.styles.col_center, { marginVertical: 10 }]}>
					{/* <Svg_img width={205} /> */}
					<FastImage
						resizeMode={FastImage.resizeMode.contain}
						source={require('../../../common/assets/images/earn_referal.png')}
						style={{ width: 250, height: 250 }}
					/>
				</View>
				<View style={{ height: 20 }} />
				<View style={[Theme.styles.col_center, { width: '100%' }]}>
					<AppText style={styles.earnDesc}>{getEarnHowToWorksDescription()}</AppText>
					<View style={{ height: 20 }} />
					{renderLearnMore()}
					<View style={{ height: 20 }} />
					<MainBtn
						title={
							props.invitationTimerSetting.can_invite == false &&
								props.invitationTimerSetting.remaining_time_to_use
								? translate('invitation_earn.invite_again_later').replace(
									'###',
									props.invitationTimerSetting.remaining_time_to_use.toString()
								)
								: translate('Invite_Earn_btn')
						}
						disabled={
							props.invitationTimerSetting.can_invite == false &&
							props.invitationTimerSetting.remaining_time_to_use
						}
						style={{ width: '100%' }}
						onPress={openInviteOptionModal}
					/>
					<View style={styles.divider} />
					<TouchableOpacity
						style={[Theme.styles.flex_between, styles.histBtn]}
						onPress={() => {
							props.navigation.navigate(RouteNames.InvitationHistScreen, { active: true });
						}}
					>
						<AppText style={styles.histTxt}>{translate('invitation_earn.active_earninvitations')}</AppText>
						<Feather name='chevron-right' color={Theme.colors.text} size={16} />
					</TouchableOpacity>
					<TouchableOpacity
						style={[Theme.styles.flex_between, styles.histBtn, { marginTop: 16 }]}
						onPress={() => {
							props.navigation.navigate(RouteNames.InvitationHistScreen);
						}}
					>
						<AppText style={styles.histTxt}>{translate('invitation_earn.invitation_hist')}</AppText>
						<Feather name='chevron-right' color={Theme.colors.text} size={16} />
					</TouchableOpacity>
				</View>
				<View style={{ height: 40 }} />
			</ScrollView>
			<InviteOptionModal
				showModal={isInviteOptionModal}
				onClose={closeInviteOptionModal}
				onFriend={goOnFriend}
				onSnapfooder={goOnSnapfooder}
			/>
			<InvitationModal
				showModal={isInviteModal}
				name={
					props.invitationPickedUser
						? props.invitationPickedUser.username || props.invitationPickedUser.full_name
						: ''
				}
				onClose={onCloseInvitationModal}
				onSend={onSendInvitation}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	searchView: { width: '100%', paddingHorizontal: 20, marginTop: 48, },
	operationTab: { height: 62, width: '100%', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F6F6F9' },
	subjectTitle: { fontSize: 19, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	learnmore: { fontSize: 17, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7, textDecorationLine: 'underline' },
	divider: { width: '100%', height: 1, marginVertical: 16, backgroundColor: '#F6F6F9' },
	scrollview: { flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: Theme.colors.white },
	histBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: Theme.colors.gray8 },
	histTxt: { fontSize: 21, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	earnDesc: { fontSize: 19, lineHeight: 24, fontFamily: Theme.fonts.medium, color: Theme.colors.text, textAlign: 'center' },
	dot: { width: 7, height: 7, marginTop: 10, marginRight: 8, borderRadius: 3.5, backgroundColor: Theme.colors.cyan2 },
	tooltipRow: { flexDirection: 'row', width: '100%', marginTop: 12 },
	tooltipTxt: { fontSize: 16, lineHeight: 18, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
	referralsNumBlock: { width: '100%', alignItems: 'flex-start', padding: 16, borderRadius: 12, borderColor: Theme.colors.gray5, borderWidth: 1, marginTop: 12 },
	referralsNum: { marginRight: 12, fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
})


const mapStateToProps = ({ app }) => ({
	user: app.user,
	language: app.language,
	invitationPickedUser: app.invitationPickedUser,
	invitationRewardsSetting: app.invitationRewardsSetting,
	referralsRewardsSetting: app.referralsRewardsSetting,
	invitationTimerSetting: app.invitationTimerSetting || {}
});

export default connect(mapStateToProps, {
	setInvitationPickedUser, loadInvitationTimerSetting, goActiveScreenFromPush
})(EarnScreen);