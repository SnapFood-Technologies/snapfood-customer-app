import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux'
import moment from 'moment';
import Clipboard from '@react-native-clipboard/clipboard';
import { translate } from '../../../common/services/translate';
import apiFactory from '../../../common/services/apiFactory';
import Theme from '../../../theme';
import AppText from '../../../common/components/AppText';
import SwitchTab from '../../../common/components/SwitchTab';
import Header1 from '../../../common/components/Header1';
import MainBtn from '../../../common/components/buttons/main_button';
import InviteEarnDescItem from '../components/InviteEarnDescItem';
import InviteCodeView from '../components/InviteCodeView';
import Svg_img from '../../../common/assets/svgs/invite/timer.svg';
import AppTooltip from '../../../common/components/AppTooltip';
import { minutes2Days, getHourMin, convertTimeString2Hours } from '../../../common/services/utility';
import RouteNames from '../../../routes/names';
import {
	goActiveScreenFromPush
} from '../../../store/actions/app';
import { ucFirst } from '../../../common/services/utility';
import { setStorageKey, KEYS } from '../../../common/services/storage';
import Toast from 'react-native-toast-message';

const InvitationDetailsScreen = (props) => {
	const _isMounted = useRef(true);

	const [invitationData, setInvitationData] = useState({});

	useEffect(() => {
		props.goActiveScreenFromPush({
			isEarnInviteDetailsVisible: false
		})
		_isMounted.current = true;
		loadData(props.route.params.invitation_id);
		return () => {
			_isMounted.current = false;
		};
	}, [props.route.params.invitation_id])

	const loadData = (invitation_id) => {
		if (invitation_id == null) { return }
		apiFactory.post('/invite-earn/earninvitation',
			{
				invitation_id: invitation_id
			})
			.then(({ data }) => {
				if (_isMounted.current == true) {
					setInvitationData(data.invition || {})
				}
			})
			.catch(err => {
				if (_isMounted.current == true) {
					console.log('err loadData', err)
				}
			});
	}

	const getRemainingDays = () => {
		let time = minutes2Days(invitationData.remaining_time_to_use);
		if (time.length > 2) {
			let flag = false;
			let disp = '';
			if (time[0] > 0) {
				if (time[0] == 1) {
					disp = time[0] + translate('invitation_earn.day') + ' ';
					flag = true;
				}
				else {
					disp = time[0] + translate('invitation_earn.days') + ' ';
					flag = false;
				}
			}

			if (time[1] > 0) {
				if (time[1] == 1) {
					disp = disp + time[1] + translate('invitation_earn.hour') + ' ';
					flag = true;
				}
				else {
					disp = disp + time[1] + translate('invitation_earn.hours') + ' ';
					flag = false;
				}
			}

			if (time[2] > 0) {
				if (time[2] == 1) {
					disp = disp + time[2] + translate('invitation_earn.min') + ' ';
					flag = true;
				}
				else {
					disp = disp + time[2] + translate('invitation_earn.mins') + ' ';
					flag = false;
				}
			}
			return disp + (flag == true ? translate('invitation_earn.remaining') : translate('invitation_earn.remaining1'));
		}
		return '';
	}

	const onUseCode = async () => {
		Clipboard.setString(invitationData.invite_code);
		await setStorageKey(KEYS.INVITE_CODE, invitationData.invite_code);
		// props.setShowAppSnackbar({visible: true, description: translate('code_complete')});
		Toast.show({
            type: 'showInfoToast',
            visibilityTime: 5000,
            position: 'top',
            topOffset: 42,
			
            text1: translate('code_complete')
        });
		if (props.hometab_navigation != null) {
			props.hometab_navigation.jumpTo(RouteNames.HomeStack);
		}
		props.navigation.navigate(RouteNames.BottomTabs);
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
			id='invitation-detail'
			title={translate('invitation_earn.learn_invite_title')}
			content={
				<View style={[Theme.styles.col_center, { marginRight: 8 }]}>
					{
						getGroupedInfo().map((setting, index) =>
							<View key={index} style={styles.tooltipRow}>
								<View style={styles.dot} />
								{
									invitationData.is_received == 1 ?
										<AppText style={styles.tooltipTxt}>
											{translate('invitation_earn.learn_invite_desc3_01')}
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
											{', '}
											{ucFirst(invitationData.sender?.username || invitationData.sender?.full_name)}
											{translate('invitation_earn.learn_invite_desc3_02')}
											<Text style={{ fontFamily: Theme.fonts.bold }}>{setting.rewards_rate}%</Text>
											{translate('invitation_earn.learn_invite_desc3_03')}
										</AppText>
										:
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
								}
							</View>
						)
					}
					<View style={styles.tooltipRow}>
						<View style={styles.dot} />
						{
							invitationData.is_received == 1 ?
								<AppText style={styles.tooltipTxt}>
									{translate('invitation_earn.learn_invite_desc4_01')}
									{ucFirst(invitationData.sender?.username || invitationData.sender?.full_name)}
									{translate('invitation_earn.learn_invite_desc4_02')}
									<Text style={{ fontFamily: Theme.fonts.bold }}>1%</Text>
									{translate('invitation_earn.learn_invite_desc4_03')}
								</AppText>
								:
								<AppText style={styles.tooltipTxt}>
									{translate('invitation_earn.learn_invite_desc2_01')}
									<Text style={{ fontFamily: Theme.fonts.bold }}>1%</Text>
									{translate('invitation_earn.learn_invite_desc2_02')}
								</AppText>
						}
					</View>
				</View>
			}
			anchor={<Text style={styles.learnmore} >
				{invitationData.is_received == 1 ? translate('invitation_earn.how_does_it_work_receiver') :
					translate('invitation_earn.how_does_it_work_sender')
				}
			</Text>}
		/>
	}

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			<Header1
				style={{ marginTop: 10, paddingHorizontal: 20 }}
				onLeft={() => { props.navigation.goBack() }}
				title={translate('invitation_earn.invitation_details')}
				titleStyle={{fontSize: 20, color: Theme.colors.text, fontFamily: Theme.fonts.bold }}
			/>
			{
				invitationData.id != null &&
				<ScrollView style={styles.scrollview}>
					{
						invitationData.is_expired != 1 &&
						<View style={[Theme.styles.col_center, { marginVertical: 25 }]}>
							<Svg_img width={205} />
						</View>
					}
					<View style={[Theme.styles.col_center]} >
						{
							invitationData.is_expired == 1 ?
								<AppText style={styles.expiredTxt}>{translate('invitation_earn.invitation_expired')}</AppText>
								:
								(invitationData.is_used == 0 && <AppText style={styles.remainingTxt}>{getRemainingDays()}</AppText>)
						}
						{
							invitationData.is_expired == 1 ?
								<AppText style={styles.expiredCodeTxt}>{invitationData.invite_code}</AppText>
								:
								<AppText style={styles.codeTxt}>{invitationData.invite_code}</AppText>
						}
					</View>
					<View style={styles.divider} />
					<View style={[{ width: '100%' }]}>
						<TouchableOpacity style={[Theme.styles.flex_between, styles.infoItem]}>
							<AppText style={styles.infoLabel}>{invitationData.is_received == 1 ? translate('invitation_earn.sender') : translate('invitation_earn.receiver')}</AppText>
							<AppText style={styles.infoValue}>{invitationData.is_received == 1 ? ucFirst(invitationData.sender?.username || invitationData.sender?.full_name) : ucFirst(invitationData.receiver?.username || invitationData.receiver?.full_name)}</AppText>
						</TouchableOpacity>
						<TouchableOpacity style={[Theme.styles.flex_between, styles.infoItem]}>
							<AppText style={styles.infoLabel}>{translate('invitation_earn.date')}</AppText>
							<AppText style={styles.infoValue}>{moment(invitationData.invite_time, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY | hh:mm A")}</AppText>
						</TouchableOpacity>
						{
							invitationData.is_used == 0 && invitationData.is_expired != 1 && invitationData.is_received != 1 &&
							<AppText style={styles.description}>{translate('invitation_earn.code_not_used_yet').replace('###', ucFirst(invitationData.receiver?.username || invitationData.receiver?.full_name))}</AppText>
						}
						{invitationData.is_expired != 1 && renderLearnMore()}
					</View>
					<View style={{ height: 30 }} />
				</ScrollView>
			}
			{
				invitationData.is_expired != 1 && invitationData.is_used == 0 && invitationData.is_received == 1 &&
				<View style={styles.bottom}>
					<MainBtn title={translate('invitation_earn.use_code')}
						style={{ width: '100%' }}
						onPress={onUseCode}
					/>
				</View>
			}
		</View>
	);
}

const styles = StyleSheet.create({
	searchView: { width: '100%', paddingHorizontal: 20, marginTop: 48, },
	operationTab: { height: 62, width: '100%', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F6F6F9' },
	codeTxt: { fontSize: 25, marginTop: 12, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	learnmore: { fontSize: 17, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7, textDecorationLine: 'underline' },
	divider: { width: '100%', height: 1, marginVertical: 16, backgroundColor: '#F6F6F9' },
	scrollview: { flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: Theme.colors.white },
	infoItem: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginBottom: 12, backgroundColor: Theme.colors.gray8 },
	infoLabel: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	infoValue: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7 },
	description: { textAlign: 'center', width: '100%', paddingHorizontal: 50, marginVertical: 12, fontSize: 17, lineHeight: 20, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
	dot: { width: 7, height: 7, marginTop: 10, marginRight: 8, borderRadius: 3.5, backgroundColor: Theme.colors.cyan2 },
	tooltipRow: { flexDirection: 'row', width: '100%', marginTop: 12 },
	tooltipTxt: { fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
	remainingTxt: { fontSize: 14, fontFamily: Theme.fonts.medium, color: Theme.colors.red1 },
	expiredTxt: { fontSize: 19, fontFamily: Theme.fonts.semiBold, color: Theme.colors.red1 },
	expiredCodeTxt: { marginTop: 16, textDecorationLine: 'line-through', textDecorationColor: Theme.colors.gray7, fontSize: 25, lineHeight: 28, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7 },
	bottom: { width: '100%', paddingHorizontal: 20, marginBottom: 30 },
})


const mapStateToProps = ({ app }) => ({
	invitationRewardsSetting: app.invitationRewardsSetting,
	hometab_navigation: app.hometab_navigation,
});

export default connect(mapStateToProps, {
	goActiveScreenFromPush
})(InvitationDetailsScreen);