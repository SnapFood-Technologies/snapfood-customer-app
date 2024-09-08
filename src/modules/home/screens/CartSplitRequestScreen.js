import React, { useEffect, useState, useRef } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import Config from '../../../config';
import MainBtn from '../../../common/components/buttons/main_button';
import RoundIconBtn from '../../../common/components/buttons/round_icon_button';
import InfoRow from '../../../common/components/InfoRow';
import Header1 from '../../../common/components/Header1';
import 'moment/locale/sq';
import { isEmpty } from '../../../common/services/utility';
import CartProductItem from '../components/CartProductItem';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import { updateProfileDetails } from '../../../store/actions/auth';
import CardItem from '../../../common/components/CardItem';
import RouteNames from '../../../routes/names';
import { AppText, DotBorderButton } from '../../../common/components';
import { goActiveScreenFromPush } from '../../../store/actions/app';

const CartSplitRequestScreen = (props) => {
	const split_id = props.route?.params?.split_id;
	const [splitData, setSplitData] = useState(null);
	const [isRejecting, setIsRejecting] = useState(false);
	const [isAccepting, setIsAccepting] = useState(false);
	const [cards, setCards] = useState([])

	useEffect(() => {
		if (split_id) {
			loadSummaryCartSplit(split_id);
		}
	}, [split_id])

	const loadSummaryCartSplit = (split_id) => {
		apiFactory.get(`checkout/get-summary-cart-split?id=${split_id}`).then(
			({ data }) => {
				setSplitData(data.data);
			},
			(error) => {
				console.log('loadSummaryCartSplit error', error);
				setSplitData(null);
			}
		);
	};

	useEffect(() => {
		props.goActiveScreenFromPush({
			isCartSplitRequestVisible: false
		})
		loadPaymentMethods()
		const focusListener = props.navigation.addListener('focus', () => {
			loadPaymentMethods()
		});

		return focusListener; // remove focus listener when it is unmounted
	}, [props.navigation]);

	const loadPaymentMethods = () => {
		apiFactory.get(`stripe/payment-methods`)
			.then(({ data }) => {
				setCards(data || []);
			},
				(error) => {
					console.log('load Payment Methods error', error)
				});
	}

	const changePrimary = async (card) => {
		try {
			await props.updateProfileDetails({
				default_card_id: card.id
			})
		}
		catch (error) {
			console.log('on changePrimary', error)
			alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
		}
	}

	const onReplyRequest = (status) => {
		let data = {
			split_id: split_id,
			status: status,
			card_id: props.user.default_card_id
		}
		if (status == 'rejected') {
			setIsRejecting(true);
		}
		else {
			setIsAccepting(true);
		}

		apiFactory.post(`checkout/reply-cart-split-request`, data).then(
			(res) => {
				setIsRejecting(false);
				setIsAccepting(false);
				alerts.info('', (status == 'rejected' ?
					translate('cart.rejected_split_bill_request') :
					translate('cart.accepted_split_bill_request')
				)).then((res) => {
					props.navigation.goBack();
				});
			},
			(error) => {
				console.log('onReplyRequest error', error);
				setIsRejecting(false);
				setIsAccepting(false);
				const message = error.message || translate('generic_error');
				alerts.error(translate('alerts.error'), message);
			}
		);
	}

	const renderProducts = () => {
		if (splitData.products == null) { return null; }
		return splitData.products.map((item, index) => <CartProductItem key={index} data={{...item, visible : 1, available : 1}} />)
	}

	const _renderBillSplit = () => {
		if (splitData?.users == null || splitData?.users?.length == 0) { return null; }
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView]}>
				<View style={[Theme.styles.row_center_start, { marginBottom: 8 }]} >
					<Text style={[styles.subjectTitle, {fontSize: 17}]}>{translate('splits_hist.split_bill_some_screen')}</Text>
					<Text style={[{ fontSize: 17, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7 }]}>
						{' '}
						({translate('cart.among')} {splitData?.users.length} {translate('cart.people')})
					</Text>
				</View>
				{
					splitData?.users.map((item, index) => (
						<InfoRow
							key={index}
							name={
								item.person_id == props.user.id ?
									translate('you') :
									(item.person_name + (item.person_id == splitData?.orderer_id ? (' (' + translate('cart.split_bill_orderer') + ')') : ''))
							}
							valueItem={
								<View style={[Theme.styles.row_center,]}>
									<Text style={[styles.splituserAmount]}>{parseInt(item.amount) + ' L'}</Text>
								</View>
							}
						/>
					))
				}
			</View>
		);
	};

	const _renderOrderDetail = () => {
		if (splitData == null) { return null; }
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView, { borderBottomWidth: 0 }]}>
				<View style={[Theme.styles.row_center, { width: '100%', marginBottom: 16 }]}>
					{
						splitData.vendor != null &&
						<View style={[Theme.styles.row_center_start, { flex: 1 }]}>
							<RoundIconBtn
								style={{ ...Theme.styles.col_center, ...styles.LogoView }}
								icon={
									<FastImage
										style={styles.Logo}
										resizeMode={FastImage.resizeMode.contain}
										source={{ uri: Config.IMG_BASE_URL + splitData.vendor.logo_thumbnail_path }}
									/>
								}
								onPress={() => { }}
							/>
							<Text style={styles.LogoText}>{splitData.vendor.title}</Text>
						</View>
					}
				</View>
				<View style={[Theme.styles.col_center, styles.orderInfoView]}>
					{renderProducts()}
					{splitData.total_amount != null &&
						<View
							style={[
								Theme.styles.row_center,
								{
									marginBottom: 6,
									paddingTop: 15,
								},
							]}
						>
							<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>{translate('cart.order_total')}</Text>
							<Text style={[styles.orderTotalTxt]}>{parseInt(splitData.total_amount)} L</Text>
						</View>
					}
					{_renderBillSplit()}
				</View>
			</View>
		);
	};

	const _renderCards = () => {
		return (
			<View style={[Theme.styles.col_center, { width: '100%' }]}>
				{
					cards.map((item, index) =>
						<CardItem
							key={index}
							data={item}
							editable={false}
							checked={props.user.default_card_id == item.id}
							onSelect={changePrimary}
						/>
					)
				}
				<DotBorderButton
					title={translate('payment_method.add_new_card')}
					style={{ width: 200, marginTop: 20}}
					onPress={() => {
						props.navigation.navigate(RouteNames.NewCardScreen)
					}}
				/>
				<View style={{ height: 30, }} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Header1
				style={{ marginBottom: 0, paddingHorizontal: 20 }}
				onLeft={() => { props.navigation.goBack(); }}
				title={translate('cart.split_bill_request')}
			/>
			<ScrollView style={{ flex: 1, width: '100%', paddingHorizontal: 20 }}>
				{_renderOrderDetail()}
				{_renderCards()}
				<View style={{ height: 40 }} />
			</ScrollView>
			<View style={[Theme.styles.row_center, styles.bottom]}>
				<View style={{ flex: 1, paddingRight: 8 }}>
					<MainBtn
						disabled={splitData == null || isRejecting}
						loading={isRejecting}
						style={{backgroundColor: Theme.colors.red1}}
						title={translate('cart.reject')}
						onPress={() => onReplyRequest('rejected')}
					/>
				</View>
				<View style={{ flex: 1, paddingLeft: 8 }}>
					<MainBtn
						disabled={splitData == null || isAccepting || cards.length == 0 || props.user.default_card_id == null}
						loading={isAccepting}
						title={translate('cart.accept')}
						onPress={() => onReplyRequest('accepted')}
					/>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		paddingTop: 20,
		alignItems: 'center',
		backgroundColor: '#ffffff',
	},
	subjectTitle: { fontSize: 19, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	sectionView: {
		width: '100%',
		alignItems: 'flex-start',
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: Theme.colors.gray9,
	},
	LogoText: { color: Theme.colors.text, fontSize: 19, fontFamily: Theme.fonts.bold, marginLeft: 10 },
	LogoView: { width: 34, height: 34, borderRadius: 8, backgroundColor: Theme.colors.white },
	Logo: { width: 28, height: 28 },
	bottom: { width: '100%', paddingHorizontal: 20, paddingBottom: 30, paddingTop: 20, backgroundColor: Theme.colors.white },
	orderInfoView: {
		alignItems: 'flex-start',
		width: '100%',
		padding: 16,
		borderRadius: 15,
		backgroundColor: Theme.colors.gray8,
	},
	orderTotalTxt: { fontSize: 17, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	splituserAmount: { fontSize: 17, color: Theme.colors.text, fontFamily: Theme.fonts.medium },
});

const mapStateToProps = ({ app, shop }) => ({
	user: app.user,
});

export default connect(mapStateToProps, {
	updateProfileDetails, goActiveScreenFromPush
})(CartSplitRequestScreen);
