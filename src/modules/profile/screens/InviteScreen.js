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
import Header1 from '../../../common/components/Header1';
import InviteEarnDescItem from '../components/InviteEarnDescItem';
import InviteCodeView from '../components/InviteCodeView';
import AppTooltip from '../../../common/components/AppTooltip';
import RouteNames from '../../../routes/names';
import { loadInvitationTimerSetting, goActiveScreenFromPush } from '../../../store/actions/app';
import Svg_img from '../../../common/assets/svgs/invite/invite_earn.svg';
import { isEmpty, getHourMin, convertTimeString2Hours, ucFirst } from '../../../common/services/utility';

const InviteScreen = (props) => {
	const _isMounted = useRef(true);

	const isFromPush = props.route?.params?.fromPush ?? false;

	const [referralsSetting, setReferralsSetting] = useState({
		cycle_hours_earn_invitation: (props.referralsRewardsSetting.cycle_hours_earn_invitation || 1),
		user_rewards: (props.referralsRewardsSetting.user_rewards || 100),
		register_rewards: (props.referralsRewardsSetting.register_rewards || 100),
		max_num_referral: (props.referralsRewardsSetting.max_num_referral || 0),
	})
	const [referralStatus, setReferralStatus] = useState({})

	useEffect(() => {
		props.goActiveScreenFromPush({
			isGeneralReferralVisible: false,
		})
		const focusListener = props.navigation.addListener('focus', () => {
			_isMounted.current = true;
			props.loadInvitationTimerSetting();
			getRefferalInfo();
		});
		return () => {
			console.log("InviteEarn screen unmount")
			_isMounted.current = false;
			try {
				focusListener();
			} catch (error) { }
		};
	}, [])

	const getTitle = () => {
		let defaultMsg = translate('invitation_earn.how_refer_work');
		if (props.language == 'sq' && isEmpty(props.referralsRewardsSetting.referral_howto_works_title) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_title;
		}
		else if (props.language == 'en' && isEmpty(props.referralsRewardsSetting.referral_howto_works_title_en) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_title_en;
		}
		else if (props.language == 'it' && isEmpty(props.referralsRewardsSetting.referral_howto_works_title_it) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_title_it;
		}
		defaultMsg = defaultMsg.replace('XXX', referralsSetting.user_rewards + 'L');

		return defaultMsg;
	}

	const getSubjectTitle1 = () => {
		let defaultMsg = translate('invitation_earn.invite_step1');
		if (props.language == 'sq' && isEmpty(props.referralsRewardsSetting.referral_howto_works_subtitle_1) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_subtitle_1;
		}
		else if (props.language == 'en' && isEmpty(props.referralsRewardsSetting.referral_howto_works_subtitle_1_en) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_subtitle_1_en;
		}
		else if (props.language == 'it' && isEmpty(props.referralsRewardsSetting.referral_howto_works_subtitle_1_it) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_subtitle_1_it;
		}
		return defaultMsg;
	}

	const getReferDesc1 = () => {
		let defaultMsg = translate('invitation_earn.invite_step1_desc');
		if (props.language == 'sq' && isEmpty(props.referralsRewardsSetting.referral_howto_works_desc_1) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_desc_1;
		}
		else if (props.language == 'en' && isEmpty(props.referralsRewardsSetting.referral_howto_works_desc_1_en) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_desc_1_en;
		}
		else if (props.language == 'it' && isEmpty(props.referralsRewardsSetting.referral_howto_works_desc_1_it) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_desc_1_it;
		}
		return defaultMsg.replace('XXX', referralsSetting.user_rewards + 'L').replace('YYY', referralsSetting.register_rewards + 'L')
	}

	const getSubjectTitle2 = () => {
		let defaultMsg = translate('invitation_earn.invite_step2');
		if (props.language == 'sq' && isEmpty(props.referralsRewardsSetting.referral_howto_works_subtitle_2) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_subtitle_2;
		}
		else if (props.language == 'en' && isEmpty(props.referralsRewardsSetting.referral_howto_works_subtitle_2_en) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_subtitle_2_en;
		}
		else if (props.language == 'it' && isEmpty(props.referralsRewardsSetting.referral_howto_works_subtitle_2_it) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_subtitle_2_it;
		}
		return defaultMsg;
	}

	const getReferDesc2 = () => {
		let defaultMsg = translate('invitation_earn.invite_step2_desc');
		if (props.language == 'sq' && isEmpty(props.referralsRewardsSetting.referral_howto_works_desc_2) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_desc_2;
		}
		else if (props.language == 'en' && isEmpty(props.referralsRewardsSetting.referral_howto_works_desc_2_en) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_desc_2_en;
		}
		else if (props.language == 'it' && isEmpty(props.referralsRewardsSetting.referral_howto_works_desc_2_it) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_desc_2_it;
		}
		return defaultMsg;
	}

	const getRefferalInfo = () => {
		apiFactory.post(`/invite-earn/get-refferal-info`)
			.then(({ data }) => {
				if (_isMounted.current == true) {
					setReferralStatus({
						max_num_referral: data.max_num_referral,
						used_num: data.used_num,
						referral_code: data.user_refferal?.referral_code || ''
					})
				}
			})
			.catch(err => {
				console.log('getRefferalInfo err ', err);
			});
	}

	const _getReferralTooltipDesc = () => {
		if (referralStatus.used_num < referralStatus.max_num_referral) {
			let desc = '';
			if (referralStatus.used_num == 0) {
				desc = desc + translate('invitation_earn.referrals_made0').replace('XXX', referralStatus.used_num);
			}
			else if (referralStatus.used_num == 1) {
				desc = desc + translate('invitation_earn.referrals_made1').replace('XXX', referralStatus.used_num);
			}
			else {
				desc = desc + translate('invitation_earn.referrals_made').replace('XXX', referralStatus.used_num);
			}

			if (referralStatus.max_num_referral - referralStatus.used_num == 1) {
				desc = desc + `${referralStatus.max_num_referral - referralStatus.used_num} ` + translate('invitation_earn.remaining_referral');
			}
			else {
				desc = desc + `${referralStatus.max_num_referral - referralStatus.used_num} ` + translate('invitation_earn.remaining1_referral');
			}

			return desc;
		}
		return translate('invitation_earn.used_all_referrals').replace('XXX', referralStatus.max_num_referral);
	}

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			<Header1
				style={{ marginBottom: 0, marginTop: 10, paddingHorizontal: 20, }}
				onLeft={() => { props.navigation.goBack() }}
				title={translate('Invite')}

			/>
			<ScrollView style={styles.scrollview}>
				<View style={[Theme.styles.col_center, { marginVertical: 10 }]}>
					<Svg_img width={205} />
				</View>
				<View style={{ height: 20, }} />
				<View style={[{ width: '100%' }]}>
					<AppText style={styles.subjectTitle}>{getTitle()}</AppText>
					<InviteEarnDescItem item={{
						num: 1, subtitle: getSubjectTitle1(), desc: getReferDesc1(),
					}} />
					<InviteEarnDescItem item={{
						num: 2, subtitle: getSubjectTitle2(), desc: getReferDesc2(),
					}} />
					<View style={{ height: 20, }} />
					{
						props.referralsRewardsSetting.limit_user_referrals == true &&
						referralStatus.used_num != null && referralStatus.max_num_referral != null &&
						referralStatus.max_num_referral > 0 &&
						<View style={[Theme.styles.col_center, styles.referralsNumBlock]}>
							<View style={[Theme.styles.row_center_start, { width: '100%' }]}>
								<Text style={[styles.referralsNum,]}>
									{referralStatus.used_num} /
									<Text style={{ color: Theme.colors.gray7 }}> {referralStatus.max_num_referral}</Text>
								</Text>
								<AppTooltip
									title={_getReferralTooltipDesc()}
									content={<View />}
								/>
							</View>
							<Progress.Bar height={12} width={width(100) - 80}
								progress={(referralStatus.used_num / referralStatus.max_num_referral)}
								color={Theme.colors.cyan2}
								unfilledColor={Theme.colors.gray6}
								borderWidth={0}
							/>
						</View>
					}
					{
						!isEmpty(referralStatus.referral_code) &&
						<InviteCodeView code={referralStatus.referral_code} />
					}
					<View style={styles.divider} />
					<TouchableOpacity style={[Theme.styles.flex_between, styles.histBtn]}
						onPress={() => {
							props.navigation.navigate(RouteNames.InvitationReferralsHistScreen)
						}}
					>
						<AppText style={styles.histTxt}>{translate('invitation_earn.referrals_hist')}</AppText>
						<Feather name='chevron-right' color={Theme.colors.text} size={16} />
					</TouchableOpacity>
				</View>
				<View style={{ height: 40 }} />
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	searchView: { width: '100%', paddingHorizontal: 20, marginTop: 48, },
	operationTab: { height: 62, width: '100%', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F6F6F9' },
	subjectTitle: { fontSize: 20, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	learnmore: { fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7, textDecorationLine: 'underline' },
	divider: { width: '100%', height: 1, marginVertical: 16, backgroundColor: '#F6F6F9' },
	scrollview: { flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: Theme.colors.white },
	histBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: Theme.colors.gray8 },
	histTxt: { fontSize: 21, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	earnDesc: { fontSize: 18, lineHeight: 18, fontFamily: Theme.fonts.medium, color: Theme.colors.text, textAlign: 'center' },
	dot: { width: 7, height: 7, marginTop: 10, marginRight: 8, borderRadius: 3.5, backgroundColor: Theme.colors.cyan2 },
	tooltipRow: { flexDirection: 'row', width: '100%', marginTop: 12 },
	tooltipTxt: { fontSize: 16, lineHeight: 18, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
	referralsNumBlock: { width: '100%', alignItems: 'flex-start', padding: 16, borderRadius: 12, borderColor: Theme.colors.gray5, borderWidth: 1, marginTop: 12 },
	referralsNum: { marginRight: 12, fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
})


const mapStateToProps = ({ app }) => ({
	user: app.user,
	language: app.language,
	invitationRewardsSetting: app.invitationRewardsSetting,
	referralsRewardsSetting: app.referralsRewardsSetting,
	invitationTimerSetting: app.invitationTimerSetting || {}
});

export default connect(mapStateToProps, {
	loadInvitationTimerSetting, goActiveScreenFromPush
})(InviteScreen);