import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet, StatusBar } from 'react-native';
import FastImage from 'react-native-fast-image';
import Entypo from 'react-native-vector-icons/Entypo';
import Tooltip from 'react-native-walkthrough-tooltip';
import Foundation from 'react-native-vector-icons/Foundation';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import * as Progress from 'react-native-progress';
import { connect } from 'react-redux';
import { width } from 'react-native-dimension';
import { isEmpty, getImageFullURL } from '../../../common/services/utility';
import Theme from '../../../theme';
import apiFactory from '../../../common/services/apiFactory';
import { translate } from '../../../common/services/translate';
import { getLoggedInUser } from '../../../store/actions/auth';
import {
	goActiveScreenFromPush
} from '../../../store/actions/app';
import Header1 from '../../../common/components/Header1';
import NoCashback from '../components/NoCashback';
import RouteNames from '../../../routes/names';
import AppTooltip from '../../../common/components/AppTooltip';
import WalletMoreBtn from '../components/WalletMoreBtn';
// svgs
import Svg_earn1 from '../../../common/assets/svgs/wallet/earn1.svg';
import Svg_deposit1 from '../../../common/assets/svgs/wallet/deposit1.svg';
import Svg_cashback1 from '../../../common/assets/svgs/wallet/cashback1.svg';
import Svg_invite from '../../../common/assets/svgs/wallet/invite.svg';
import WalletTransactionItem from '../components/WalletTransactionItem';

const PerPage = 10;

const WalletScreen = (props) => {
	const _isMounted = useRef(true);

	const [loading, setLoading] = useState(null)
	const [cashbacks, setCashbacks] = useState([])
	const [page, setCurPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [showTooltip, setToolTip] = useState(false)
	const [showNextTooltip, setNextToolTip] = useState(false)
	const [walletSumm, setWalletSumm] = useState({
		balance: 0,
		total_invite: 0,
		total_earn: 0,
		total_deposit: 0,
		total_cashback: 0,
	})

	useEffect(() => {
		const focusListener = props.navigation.addListener('focus', () => {
			props.getLoggedInUser();
			loadWalletSumm();
			loadCashback(1, PerPage, true)
		});

		props.goActiveScreenFromPush({
			isWalletVisible: false,
			isGeneralCashbackVisible: false
		});
		return focusListener;
	}, [])

	const loadWalletSumm = () => {
		apiFactory.get(`wallet-summ`)
			.then(({ data }) => {
				setWalletSumm({
					balance: data.balance || 0,
					total_invite: data.total_invite || 0,
					total_earn: data.total_earn || 0,
					total_deposit: data.total_deposit || 0,
					total_cashback: data.total_cashback || 0,
				})
			},
				(error) => {
				});
	}

	const loadCashback = (page, perPage, forceLoading = false) => {
		if (loading && forceLoading == false) {
			return;
		}
		setLoading(true);
		const params = [`page=${page}`, `per_page=${perPage}`];
		apiFactory.get(`wallet-transactions?${params.join('&')}`)
			.then(({ data }) => {
				if (page > 1) {
					const currentOrderIds = cashbacks.map((x) => x.id);
					const newItems = data.data.filter((x) => currentOrderIds.indexOf(x.id) === -1);
					setCurPage(data['current_page']);
					setTotalPages(data['last_page']);
					setCashbacks([...cashbacks, ...newItems])
				} else {
					setCurPage(data['current_page']);
					setTotalPages(data['last_page']);
					setCashbacks(data.data || []);
				}
				setLoading(false);
			},
				(error) => {
					setLoading(false);
					console.log('loadCashback error', error)
					const message = error.message || translate('generic_error');
					alerts.error(translate('alerts.error'), message);
				});
	}

	const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
		return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
	}

	const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
		return contentOffset.y == 0;
	}

	const _renderTooltip = () => {
		return (
			<Tooltip
				isVisible={showTooltip}
				backgroundColor={'transparent'}
				content={
					<View style={styles.tooltip}>
						{props.user.user_category.name == "Silver" && (
							<Text style={styles.title}>{translate('tooltip.member_type_silver')}</Text>
						)}
						{props.user.user_category.name == "Gold" && (
							<Text style={styles.title}>{translate('tooltip.member_type_gold')}</Text>
						)}
						{props.user.user_category.name == "Platinum" && (
							<Text style={styles.title}>{translate('tooltip.member_type_platinium')}</Text>
						)}
						{props.user.user_category.name == "Silver" && (
							<Text style={styles.description}>{translate('tooltip.silver')} </Text>
						)}
						{props.user.user_category.name == "Gold" && (
							<Text style={styles.description}>{translate('tooltip.gold')} </Text>
						)}
						{props.user.user_category.name == "Platinum" && (
							<Text style={styles.description}>{translate('tooltip.platinium')} </Text>
						)}
						{props.user.user_category.name == "Silver" && (
							<Text style={styles.description}>{translate('tooltip.silver_2')} </Text>
						)}
						{props.user.user_category.name == "Gold" && (
							<Text style={styles.description}>{translate('tooltip.gold_2')} </Text>
						)}
						{props.user.user_category.name == "Platinum" && (
							<Text style={styles.description}>{translate('tooltip.platinium_2')} </Text>
						)}
						{props.user.user_category.name == "Silver" && (
							<Text style={styles.description}>{translate('tooltip.silver_3')} </Text>
						)}
						{props.user.user_category.name == "Gold" && (
							<Text style={styles.description}>{translate('tooltip.gold_3')} </Text>
						)}
						<TouchableOpacity onPress={() => setToolTip(false)}><Text style={styles.dismiss}>{translate('tooltip.dismiss')}</Text></TouchableOpacity>
					</View>
				}
				placement="bottom"
				tooltipStyle={{ backgroundColor: 'transparent' }}
				topAdjustment={Platform.OS === 'android' ? - StatusBar.currentHeight : 0}
				contentStyle={{ elevation: 7, borderRadius: 8, }}
				arrowStyle={{ elevation: 8, }}
				showChildInTooltip={false}
				disableShadow={false}
				onClose={() => setToolTip(false)}
			>
				<Text style={styles.goldtxt}>{props.user.user_category.name}</Text>
			</Tooltip>
		)
	}

	const _renderNextLevelTooltip = () => {
		return (
			<Tooltip
				isVisible={showNextTooltip}
				backgroundColor={'transparent'}
				content={
					<View style={styles.tooltip}>
						{props.user.user_category.next_category.name == "Silver" && (
							<Text style={styles.title}>{translate('tooltip.next_member_type_silver')}</Text>
						)}
						{props.user.user_category.next_category.name == "Gold" && (
							<Text style={styles.title}>{translate('tooltip.next_member_type_gold')}</Text>
						)}
						{props.user.user_category.next_category.name == "Platinum" && (
							<Text style={styles.title}>{translate('tooltip.next_member_type_platinium')}</Text>
						)}
						{props.user.user_category.next_category.name == "Silver" && (
							<Text style={styles.description}>{translate('tooltip.silver')} </Text>
						)}
						{props.user.user_category.next_category.name == "Gold" && (
							<Text style={styles.description}>{translate('tooltip.gold')} </Text>
						)}
						{props.user.user_category.next_category.name == "Platinum" && (
							<Text style={styles.description}>{translate('tooltip.platinium')} </Text>
						)}
						{props.user.user_category.next_category.name == "Silver" && (
							<Text style={styles.description}>{translate('tooltip.silver_2')} </Text>
						)}
						{props.user.user_category.next_category.name == "Gold" && (
							<Text style={styles.description}>{translate('tooltip.gold_2')} </Text>
						)}
						{props.user.user_category.next_category.name == "Platinum" && (
							<Text style={styles.description}>{translate('tooltip.platinium_2')} </Text>
						)}
						{props.user.user_category.next_category.name == "Silver" && (
							<Text style={styles.description}>{translate('tooltip.silver_3')} </Text>
						)}
						{props.user.user_category.next_category.name == "Gold" && (
							<Text style={styles.description}>{translate('tooltip.gold_3')} </Text>
						)}
						<TouchableOpacity onPress={() => setNextToolTip(false)}><Text style={styles.dismiss}>{translate('tooltip.dismiss')}</Text></TouchableOpacity>
					</View>
				}
				placement="bottom"
				tooltipStyle={{ backgroundColor: 'transparent' }}
				topAdjustment={Platform.OS === 'android' ? - StatusBar.currentHeight : 0}
				contentStyle={{ elevation: 7, borderRadius: 8, }}
				arrowStyle={{ elevation: 8, }}
				showChildInTooltip={false}
				disableShadow={false}
				onClose={() => setNextToolTip(false)}
			>
				<TouchableOpacity style={[Theme.styles.row_center, { "marginVertical": 8 }]} onPress={() => setNextToolTip(true)}>
					<Foundation name='info' size={22} color={Theme.colors.gray7} />
				</TouchableOpacity>
			</Tooltip>
		)
	}

	const _renderAvatarView = () => {
		console.log('props.user.user_category ', props.user.user_category)

		const getCurOrders = () => {
			return props.user.user_category.order_count - props.user.user_category.orders;
		}

		const getNextOrders = () => {
			return props.user.user_category.next_category.orders - props.user.user_category.orders;
		}

		return <View style={[Theme.styles.col_center, styles.avatarView]}>
			<View style={[Theme.styles.col_center, styles.photoView]}>
				<FastImage
					source={
						(isEmpty(props.user.photo) || props.user.photo == 'x') ?
							require('../../../common/assets/images/user-default.png')
							:
							{ uri: getImageFullURL(props.user.photo) }
					}
					style={styles.avatarImg}
					resizeMode={FastImage.resizeMode.cover}
				/>
			</View>
			<View style={[Theme.styles.row_center,]}>
				<Text style={styles.name}>{props.user.username || props.user.full_name}</Text>
			</View>
			{props.user.user_category != null &&
				<View style={[Theme.styles.col_center, styles.block]}>
					<View style={[Theme.styles.row_center_start, styles.blockheader, { borderBottomWidth: 1, borderBottomColor: Theme.colors.gray6 }]}>
						<View style={[Theme.styles.col_center]}>
							<Text style={styles.blockTxt}>{translate('wallet.mystatus')}</Text>
							<TouchableOpacity style={[Theme.styles.row_center, { marginTop: 4 }]} onPress={() => setToolTip(true)} activeOpacity={1}>
								<View style={[Theme.styles.row_center, props.user.user_category.name == "Silver" ? styles.category_silver : props.user.user_category.name == "Gold" ? styles.category_gold : styles.category_platinium]}>
									<Text style={[styles.goldtxt,
									props.user.user_category.name == "Platinum" && { color: Theme.colors.text, marginRight: 4, }]}>
										{props.user.user_category.name}
									</Text>
									{
										props.user.user_category.name == "Platinum" &&
										<Foundation name='info' size={16} color={Theme.colors.gray7} />
									}
								</View>
							</TouchableOpacity>
							{_renderTooltip()}
						</View>
						{
							props.user.user_category.next_category ?
								<View style={[Theme.styles.col_center, { justifyContent: 'flex-start' }]}>
									<Text style={styles.blockTxt}>{translate('wallet.next_level')}</Text>
									{_renderNextLevelTooltip()}
									<View style={{ flex: 1 }} />
								</View>
								: <View />
						}
					</View>
					<View style={[Theme.styles.col_center, styles.blockcontent]}>
						<Text style={[styles.blockTxt,]}>{translate('wallet.order_made')}</Text>
						{
							props.user.user_category.next_category ?
								<Text style={styles.blockValueTxt}>
									<Text style={{ color: Theme.colors.text }}>{getCurOrders()}</Text> / {getNextOrders()}
								</Text>
								:
								<Text style={styles.blockValueTxt}>
									<Text style={{ color: Theme.colors.text }}>{getCurOrders()}</Text>
								</Text>
						}
						<Progress.Bar height={12} width={width(100) - 80}
							progress={
								props.user.user_category.next_category ?
									(getNextOrders() > 0 ?
										(getCurOrders() / getNextOrders()) : 0)
									:
									1
							}
							color={props.user.user_category.name == "Silver" ? '#C0C0C0' : props.user.user_category.name == "Gold" ? '#ffda0f' : '#E5E4E2'}
							unfilledColor={Theme.colors.gray6}
							borderWidth={0}
						/>
						<Text style={styles.blockDescTxt}>
							{
								props.user.user_category.next_category ?
									translate('wallet.order_away')
										.replace('x', '' + (getNextOrders() - getCurOrders()))
										.replace('###', props.user.user_category.next_category.name)
									:
									translate('wallet.last_category')
							}
						</Text>
					</View>
				</View>
			}
		</View>
	}
	const _renderBalance = () => {
		return (
			<View style={[Theme.styles.col_center, { flex: 1, marginTop: 25, alignItems: 'flex-start' }]}>
				<View style={[Theme.styles.row_center_start, { width: '100%' }]}>
					<Text style={{ marginBottom: 3, marginRight: 3, fontSize: 18, fontFamily: Theme.fonts.bold, color: Theme.colors.text }}>{translate('wallet.your_balance')}</Text>
					<AppTooltip
						title={translate('tooltip.wallet_balance_title')}
						description={translate('tooltip.wallet_balance_desc')}
						placement={'top'}
						anchor={<Foundation name='info' size={20} color={Theme.colors.gray7} />}
					/>
				</View>
				<Text style={styles.balancePrice}>{props.user.cashback_amount || 0} L</Text>
				<View style={[Theme.styles.row_center, { width: '100%', justifyContent: 'space-between', marginTop: 20 }]}>
					<View style={[Theme.styles.col_center]}>
						<View style={[Theme.styles.row_center]}>
							<Text style={styles.balance_value_txt}>{translate('wallet.invite')}</Text>
							<AppTooltip
								title={translate('tooltip.wallet_invite_title')}
								description={translate('tooltip.wallet_invite_desc')}
								placement={'top'}
								anchor={<Foundation name='info' size={20} color={Theme.colors.gray7} />}
							/>
						</View>
						<Text style={styles.balance_value}>{walletSumm.total_invite} L</Text>
						<TouchableOpacity style={[Theme.styles.col_center, styles.iconContainer]}
							onPress={() => {
								if (props.referralsRewardsSetting.show_referral_module == true) {
									props.navigation.navigate(RouteNames.InvitationReferralsHistScreen)
								}
							}}
						>
							<Svg_invite width={38} height={38} />
						</TouchableOpacity>
					</View>
					<View style={[Theme.styles.col_center]}>
						<View style={[Theme.styles.row_center, { left: props.systemSettings.enable_deposit_transfer_module == 1 ? 5 : 0 }]}>
							<Text style={styles.balance_value_txt}>{
								props.systemSettings.enable_deposit_transfer_module == 1 ?
									translate('wallet.deposit_title') :
									translate('wallet.deposit_title_disabled')}</Text>
							<AppTooltip
								title={
									props.systemSettings.enable_deposit_transfer_module == 1 ?
										translate('tooltip.wallet_enabled_deposit_title')
										:
										translate('tooltip.wallet_deposit_title')
								}
								description={
									props.systemSettings.enable_deposit_transfer_module == 1 ?
										translate('tooltip.wallet_enabled_deposit_desc')
										:
										translate('tooltip.wallet_deposit_desc')
								}
								placement={'top'}
								anchor={<Foundation name='info' size={20} color={Theme.colors.gray7} />}
							/>
						</View>
						<Text style={styles.balance_value}>{walletSumm.total_deposit} L</Text>
						<TouchableOpacity style={[Theme.styles.col_center, styles.iconContainer]}
							activeOpacity={props.systemSettings.enable_deposit_transfer_module == 1 ? 0.3 : 1}
							onPress={() => {
								if (props.systemSettings.enable_deposit_transfer_module == 1) {
									props.navigation.navigate(RouteNames.DepositTransferHistScreen)
								}
							}}
						>
							<Svg_deposit1 width={38} height={38} />
						</TouchableOpacity>
					</View>
					<View style={[Theme.styles.col_center]}>
						<View style={[Theme.styles.row_center]}>
							<Text style={styles.balance_value_txt}>{translate('wallet.cashback')}</Text>
							<AppTooltip
								title={translate('tooltip.wallet_cashback_title')}
								description={translate('tooltip.wallet_cashback_desc')}
								placement={'top'}
								anchor={<Foundation name='info' size={20} color={Theme.colors.gray7} />}
							/>
						</View>
						<Text style={styles.balance_value}>{walletSumm.total_cashback} L</Text>
						<TouchableOpacity style={[Theme.styles.col_center, styles.iconContainer]}
							onPress={() => { props.navigation.navigate(RouteNames.CashbackOrdersScreen) }}
						>
							<Svg_cashback1 width={38} height={38} />
						</TouchableOpacity>
					</View>
					<View style={[Theme.styles.col_center]}>
						<View style={[Theme.styles.row_center]}>
							<Text style={styles.balance_value_txt}>{translate('wallet.earn')}</Text>
							<AppTooltip
								title={translate('tooltip.wallet_earn_title')}
								description={translate('tooltip.wallet_earn_desc')}
								placement={'top'}
								anchor={<Foundation name='info' size={20} color={Theme.colors.gray7} />}
							/>
						</View>
						<Text style={styles.balance_value}>{walletSumm.total_earn} L</Text>
						<TouchableOpacity style={[Theme.styles.col_center, styles.iconContainer]}
							onPress={() => {
								if (props.referralsRewardsSetting.show_earn_invitation_module == true) {
									props.navigation.navigate(RouteNames.InvitationHistScreen);
								}
							}}
						>
							<Svg_earn1 width={38} height={38} />
						</TouchableOpacity>
					</View>
				</View>
			</View>
		)
	}

	const renderDate = (prevItem, curItem) => {
		let prev_date = '';
		let cur_date = '';
		let display_date = '';
		if (prevItem) {
			prev_date = moment(prevItem.created_at, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD");
		}
		if (curItem) {
			cur_date = moment(curItem.created_at, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD");
		}

		if (prev_date != cur_date) {
			display_date = cur_date;
			if (moment().format("YYYY-MM-DD") == display_date) {
				display_date = translate('Today');
			}
		}

		if (display_date == '') { return null }
		return (
			<Text style={{ textAlign: 'center', marginBottom: 12, fontSize: 14, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7 }}>
				{display_date}
			</Text>
		)
	}

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			<Header1
				style={{ marginTop: 20, marginBottom: 0, paddingHorizontal: 20 }}
				onLeft={() => { props.navigation.goBack() }}
				title={translate('account.wallet')}
				right={
					<WalletMoreBtn
						onDeposit={() => {
							props.navigation.navigate(RouteNames.DepositCardScreen);
						}}
						onTransfer={() => {
							props.navigation.navigate(RouteNames.TransferScreen);
						}}
						onRegister={() => props.navigation.navigate(RouteNames.InviteScreen, { fromPush: false })}
						onEarn={() => props.navigation.navigate(RouteNames.EarnScreen, { fromPush: false })}
						onCashback={() => { props.navigation.navigate(RouteNames.CashbackOrdersScreen) }}
					/>
				}
			/>

			<ScrollView style={styles.scrollview}
				onScroll={({ nativeEvent }) => {
					if (isCloseToTop(nativeEvent)) {
						loadCashback(1, PerPage)
					}
					if (isCloseToBottom(nativeEvent)) {
						if (page < totalPages) {
							loadCashback(page + 1, PerPage)
						}
					}
				}}
			>
				{_renderAvatarView()}
				{_renderBalance()}
				<Text style={[styles.subjectTitle, { marginTop: 32 }]}>{translate('wallet.activity')}</Text>
				{
					(loading == false && cashbacks.length == 0) ?
						<NoCashback onBtnPressed={() => {
							props.navigation.navigate(RouteNames.HomeScreen)
						}} />
						:
						cashbacks.map((item, index) =>
							<>
								{renderDate((index == 0 ? null : cashbacks[index - 1]), cashbacks[index])}
								<WalletTransactionItem key={index} data={item} style={{ width: '100%', marginBottom: 12, }} onSelect={() => {
									if (item.type == 'cashback' && item.source_id != null) {
										props.navigation.navigate(RouteNames.OrderSummScreen, { isnew: false, order_id: item.source_id });
									}
								}} />
							</>
						)
				}
				<View style={{ height: 40, }} />
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	subjectTitle: { marginTop: 20, marginBottom: 12, fontSize: 20, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	divider: { width: '100%', height: 1, backgroundColor: '#F6F6F9' },
	scrollview: { flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: Theme.colors.white },
	avatarView: { marginTop: 30, },
	photoView: { height: 100, width: 100, borderWidth: 1, borderColor: Theme.colors.gray9, borderRadius: 50, backgroundColor: '#E8D7D0' },
	avatarImg: { width: 100, height: 100, borderRadius: 50, },
	name: { marginTop: 10, marginBottom: 6, fontSize: 19, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	goldtxt: { lineHeight: 17, fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white },
	balanceView: { marginTop: 24, marginBottom: 20, backgroundColor: Theme.colors.white, elevation: 2, borderRadius: 15, paddingLeft: 11, paddingRight: 18, paddingVertical: 23, },
	balanceTxt: { marginBottom: 6, marginRight: 8, fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white },
	balanceDesc: { lineHeight: 17, fontSize: 15, fontFamily: Theme.fonts.medium, color: '#FAFAFCCC' },
	balancePrice: { fontSize: 38, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	unit: { paddingBottom: 5, fontSize: 21, fontFamily: Theme.fonts.bold, color: Theme.colors.white },
	category_silver: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#C0C0C0' },
	category_gold: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffda0f' },
	category_platinium: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E5E4E2' },
	title: { fontSize: 17, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	description: { fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text, marginTop: 8, marginBottom: 6 },
	dismiss: { fontSize: 15, fontFamily: Theme.fonts.medium, color: Theme.colors.red1, marginTop: 16, textAlign: 'center' },
	tooltip: { backgroundColor: '#fff', borderRadius: 20, padding: 16, },
	block: { width: '100%', alignItems: 'flex-start', padding: 16, borderRadius: 12, borderColor: Theme.colors.gray5, borderWidth: 1, marginTop: 12 },
	blockheader: { width: '100%', justifyContent: 'space-between', },
	blockcontent: { width: '100%', alignItems: 'flex-start', paddingTop: 12 },

	blockTxt: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
	blockValueTxt: { marginVertical: 6, fontSize: 19, fontFamily: Theme.fonts.bold, color: Theme.colors.gray7 },
	blockDescTxt: { marginTop: 6, fontSize: 15, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7, },

	balance_value_txt: { marginRight: 3, fontSize: 18, lineHeight: 22, fontFamily: Theme.fonts.medium, color: Theme.colors.cyan2 },
	balance_value: { marginTop: 3, fontSize: 18, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	balance_label: { marginRight: 3, fontSize: 18, lineHeight: 22, fontFamily: Theme.fonts.bold, color: Theme.colors.text },

	iconContainer: { width: 70, height: 70, marginTop: 16, borderRadius: 35, backgroundColor: Theme.colors.gray8 },
})


const mapStateToProps = ({ app }) => ({
	user: app.user || {},
	referralsRewardsSetting: app.referralsRewardsSetting || {},
	systemSettings: app.systemSettings || {}
});

export default connect(mapStateToProps, {
	getLoggedInUser, goActiveScreenFromPush
})(WalletScreen);
