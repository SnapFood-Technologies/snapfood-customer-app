import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	StatusBar,
	Platform,
	TouchableOpacity,
	InteractionManager,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import StarRating from 'react-native-star-rating';
import { width } from 'react-native-dimension';
import { connect } from 'react-redux';
import Tooltip from 'react-native-walkthrough-tooltip';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Foundation from 'react-native-vector-icons/Foundation';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ContentLoader from '@sarmad1995/react-native-content-loader';
import InAppReview from 'react-native-in-app-review';
import { setInitHomeTab, setTmpOrder, goActiveScreenFromPush, setDefaultOrdersTab } from '../../../store/actions/app';
import { reOrder, setDeliveryInfoCart } from '../../../store/actions/shop';
import { getOrderDetail } from '../../../store/actions/orders';
import { extractErrorMessage, openExternalUrl } from '../../../common/services/utility';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import Theme from '../../../theme';
import Config from '../../../config';
import MainBtn from '../../../common/components/buttons/main_button';
import RoundIconBtn from '../../../common/components/buttons/round_icon_button';
import AddressItem from '../../../common/components/AddressItem';
import OrderStepper from '../../../common/components/order/OrderStepper';
import InfoRow from '../../../common/components/InfoRow';
import Header1 from '../../../common/components/Header1';
import RouteNames from '../../../routes/names';
import {
	OrderType_Delivery,
	OrderType_Reserve,
	OrderType_Pickup,
	Order_Preparing,
	RESERVACTION_PAID,
} from '../../../config/constants';
import moment from 'moment';
import 'moment/locale/sq';
import AppTooltip from '../../../common/components/AppTooltip';
import { getLanguage } from '../../../common/services/translate';
import { getOrderSupportChannel, createOrderSupportChannel } from '../../../common/services/order_support';
import { checkVendorOpen } from '../../../store/actions/vendors';
import { isEmpty } from '../../../common/services/utility';
import PriceLabel from '../../../common/components/vendors/PriceLabel';
import OrderProductItem from '../components/OrderProductItem';
import UnConfirmedOrderToast from '../../../common/components/order/UnConfirmedOrderToast';
import { AppText } from '../../../common/components';

const OrderSummScreen = (props) => {
	const _isMounted = useRef(true);
	const { order } = props;

	const order_status = props.route.params.order_status ?? false;

	const [isNew, setIsNew] = useState(props.route.params.isnew ?? false);

	const past_status = ['delivered', 'picked_up', 'completed'];

	const [isReady, setReady] = useState(false);
	const [isLoaded, setLoaded] = useState(false);
	const [showSmallOrderFeeInfoPop, setShowSmallOrderFeePop] = useState(false);

	useEffect(() => {
		setReady(true);
		setLoaded(false);

		getOrderDetail(props.route.params.order_id)
			.then((order_data) => {
				props.setTmpOrder(order_data);
				setLoaded(true);

				_isMounted.current = true;
				beginOrderSupportRedirection(order_data);
			})
			.catch((error) => {
				setLoaded(true);
			});

		return () => {
			_isMounted.current = false;

			props.goActiveScreenFromPush({
				isOrderSummVisible: false,
			});
		};
	}, [props.route.params.order_id, order_status]);

	useEffect(() => {
		setIsNew(props.route.params.isnew ?? false);

		if (
			props.route.params.isnew &&
			props.systemSettings.enable_inapp_reivew_modal == 1 &&
			InAppReview.isAvailable()
		) {
			checkInAppReview();
		}
	}, [props.route.params.isnew]);

	const confirm_order_tooltip = useMemo(() => {
		if (props.language == 'en' && !isEmpty(props.systemSettings.order_delivery_confirm_order_desc_tooltip_en)) {
			return props.systemSettings.order_delivery_confirm_order_desc_tooltip_en;
		} else if (
			props.language == 'it' &&
			!isEmpty(props.systemSettings.order_delivery_confirm_order_desc_tooltip_it)
		) {
			return props.systemSettings.order_delivery_confirm_order_desc_tooltip_it;
		}
		props.systemSettings.order_delivery_confirm_order_desc_tooltip;
	}, [
		props.language,
		props.systemSettings.order_delivery_confirm_order_desc_tooltip,
		props.systemSettings.order_delivery_confirm_order_desc_tooltip_en,
		props.systemSettings.order_delivery_confirm_order_desc_tooltip_it,
	]);

	const beginOrderSupportRedirection = (order_data) => {
		if (
			order_data.status == 'processing' && // order is accepted
			props.route.params.fromPush == true &&
			order_data.order_type == OrderType_Delivery
		) {
			setTimeout(async () => {
				let channelId = null;
				const channelData = await getOrderSupportChannel(order_data.id);
				if (channelData) {
					channelId = channelData.id;
				} else {
					channelId = await createOrderSupportChannel(order_data, props.user, props.language);
				}

				if (channelId != null) {
					props.navigation.navigate(RouteNames.OrderSupport, { channelId: channelId });
				}
			}, 2000);
		}
	};

	const checkInAppReview = () => {
		InAppReview.RequestInAppReview()
			.then((hasFlowFinishedSuccessfully) => {
				if (hasFlowFinishedSuccessfully) {
					// do something for ios
					// do something for android
				}
			})
			.catch((error) => {});
	};

	const reorderRequest = async (order, restaurant) => {
		props.reOrder(order, restaurant).then(
			async (items) => {
				if (items.length > 0) {
					props.setDeliveryInfoCart({
						handover_method: order.order_type,
					});
					props.navigation.navigate(RouteNames.CartScreen, { isReorder: true });
				} else {
					props.navigation.navigate(RouteNames.VendorScreen);
				}
			},
			async (error) => {
				alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(error));
			}
		);
	};

	const reorder = () => {
		const restaurant = order.vendor;
		if (restaurant == null) {
			return alerts.error(
				translate('restaurant_details.we_are_sorry'),
				translate('order_summary.reorder_unavailable_vendor')
			);
		}

		let items = props.cartItems.filter((i) => i.vendor_id != restaurant.id);
		if (items.length > 0) {
			checkVendorOpen(items[0].vendor_id)
				.then((is_open) => {
					if (is_open == true) {
						alerts
							.confirmation(
								translate('restaurant_details.new_order_question'),
								translate('restaurant_details.new_order_text'),
								translate('confirm'),
								translate('cancel')
							)
							.then(() => {
								reorderRequest(order, restaurant);
							});
					} else {
						reorderRequest(order, restaurant);
					}
				})
				.catch((error) => {
					reorderRequest(order, restaurant);
				});
		} else {
			reorderRequest(order, restaurant);
		}
	};

	const isPastOrder = (order) => {
		if (past_status.find((i) => i == order.status) == null) {
			return false;
		}
		return true;
	};

	const getDiscountAmount = (order) => {
		if (order.coupon_amount != null && parseInt(order.coupon_amount) > 0) {
			return parseInt(order.coupon_amount);
		} else if (order.discount_amount != null && parseInt(order.discount_amount) > 0) {
			return parseInt(order.discount_amount);
		}
		return 0;
	};

	const _renderAddress = () => {
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView, { paddingBottom: 0 }]}>
				<AddressItem data={order.address || {}} editable={false} textSize={16} showNotes={true} />
			</View>
		);
	};

	const renderProducts = () => {
		if (order.products == null) {
			return null;
		}
		let items = order.products.slice(0);
		let free_items = items.filter((p) => p.total_price == 0);
		for (let i = 0; i < free_items.length; i++) {
			let foundIndex = items.findIndex((p) => p.total_price != 0 && p.product_id == free_items[i].product_id);
			if (foundIndex != -1) {
				items[foundIndex].quantity = items[foundIndex].quantity + free_items[i].quantity;

				let freeItemIndex = items.findIndex(
					(p) => p.total_price == 0 && p.product_id == free_items[i].product_id
				);
				items.splice(freeItemIndex, 1);
			}
		}
		return items.map((item, index) => <OrderProductItem key={index} data={item} />);
	};

	const renderCouponDesc = () => {
		let promoData = order.discount;
		if (order.coupon) {
			promoData = order.coupon;
		}
		if (promoData == null || promoData.type == null) {
			return null;
		}

		if (promoData.type == 'item') {
			return (
				<Text style={styles.couponDescText}>
					{translate('cart.promo_free_item').replace('###', parseInt(promoData.value))}
				</Text>
			);
		} else if (promoData.type == 'free_delivery') {
			return <Text style={styles.couponDescText}>{translate('cart.promo_free_delivery')}</Text>;
		}

		return null;
	};

	const _renderOrderDetail = () => {
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView, { borderBottomWidth: 0 }]}>
				<View style={[Theme.styles.row_center, { width: '100%', marginBottom: 16 }]}>
					{order.vendor != null && (
						<View style={[Theme.styles.row_center_start, { flex: 1 }]}>
							<RoundIconBtn
								style={{ ...Theme.styles.col_center, ...styles.LogoView }}
								icon={
									<FastImage
										style={styles.Logo}
										resizeMode={FastImage.resizeMode.contain}
										source={{ uri: Config.IMG_BASE_URL + order.vendor.logo_thumbnail_path }}
									/>
								}
								onPress={() => {}}
							/>
							<Text style={styles.LogoText}>{order.vendor.title}</Text>
						</View>
					)}
					{/* {
                    (order.status == 'new' || order.status == 'processing' || order.status == 'picked_by_rider') &&
						<TouchableOpacity>
							<Text style={[styles.cancelOrdertxt]}>Cancel Order</Text>
						</TouchableOpacity>
					} */}
				</View>
				{order.order_type != OrderType_Delivery && (
					<View style={[styles.vendorAddress]}>
						<Text style={[styles.vendorPhone]}>{order.vendor?.phone_number}</Text>
						<Text style={[styles.vendorAddressTxt]}>{order.vendor?.address}</Text>
					</View>
				)}
				{order.order_for_friend != null && (
					<Text
						style={[
							styles.vendorAddressTxt,
							{ width: '100%', textAlign: 'center', fontFamily: Theme.fonts.semiBold, marginBottom: 12 },
						]}
					>
						{translate('order_summary.promotion_for')} :{' '}
						{order.order_for_friend.username || order.order_for_friend.full_name}
					</Text>
				)}
				{order.order_type == OrderType_Delivery && order.is_schedule == 1 && !isEmpty(order.schedule_time) && (
					<Text style={[styles.vendorAddressTxt, { fontFamily: Theme.fonts.semiBold, marginBottom: 12 }]}>
						{translate('order_summary.scheduled_time')} :{' '}
						{moment(order.schedule_time, 'YYYY-MM-DD HH:mm:ss')
							.locale(getLanguage())
							.format('DD MMMM YYYY, HH:mm')}
					</Text>
				)}
				{order.order_type == OrderType_Pickup && (
					<Text style={[styles.vendorAddressTxt, { fontFamily: Theme.fonts.semiBold, marginBottom: 12 }]}>
						{translate('order_summary.pickup_time')} :{' '}
						{order.pickup_datetime
							? moment(order.pickup_datetime, 'YYYY-MM-DD HH:mm:ss')
									.locale(getLanguage())
									.format('DD MMMM YYYY, HH:mm')
							: 0}
					</Text>
				)}
				{order.order_type == OrderType_Reserve && (
					<Text style={[styles.vendorAddressTxt, { fontFamily: Theme.fonts.semiBold }]}>
						{translate('order_summary.reserve_time')} :{' '}
						{order.pickup_datetime
							? moment(order.pickup_datetime, 'YYYY-MM-DD HH:mm:ss')
									.locale(getLanguage())
									.format('DD MMMM YYYY, HH:mm')
							: 0}
					</Text>
				)}
				{order.order_type == OrderType_Reserve && (
					<Text
						style={[
							styles.vendorAddressTxt,
							{ fontFamily: Theme.fonts.semiBold, marginTop: 8, marginBottom: 12 },
						]}
					>
						{translate('cart.num_guests')} : {order.num_guests ?? 0}
					</Text>
				)}
				<View style={[Theme.styles.col_center, styles.orderInfoView]}>
					{renderProducts()}
					{order.status != 'declined'
						? renderCouponDesc()
						: !isEmpty(order.declined_reason) &&
						  order.declined_reason != 'Respond timeout' &&
						  order.declined_reason != 'Decline' && (
								<Text style={styles.couponDescText}>
									{translate('reason')}: {order.declined_reason}
								</Text>
						  )}
					{order.order_note != null && order.order_note != '' && (
						<View
							style={[
								Theme.styles.row_center,
								{
									marginTop: 15,
									marginBottom: 6,
									paddingTop: 15,
									borderTopWidth: 1,
									borderTopColor: Theme.colors.gray9,
								},
							]}
						>
							<Text style={[Theme.styles.flex_1, styles.cancelOrdertxt]}>
								<Text style={[styles.item_title, { flex: 1 }]}>
									{translate('order_details.order_notes')}:{' '}
								</Text>
								{order.order_note}
							</Text>
						</View>
					)}
					{order.total_price != null && (
						<View
							style={[
								Theme.styles.row_center,
								{
									marginBottom: 6,
									paddingTop: 15,
								},
								(order.order_note == null || order.order_note == '') && {
									marginTop: 15,
									borderTopWidth: 1,
									borderTopColor: Theme.colors.gray9,
								},
							]}
						>
							<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>
								{order.order_type == OrderType_Reserve
									? translate('order_summary.reservation_total')
									: translate('cart.order_total')}
							</Text>
							<Text style={[styles.orderTotalTxt]}>{parseInt(order.total_price)} L</Text>
						</View>
					)}
					{order.splits != null && order.splits.length > 0 && (
						<View style={[Theme.styles.col_center, styles.splitsView]}>
							<Text style={[styles.cancelOrdertxt, { width: '100%' }]}>
								{translate('split.bill_split_among')} {order.splits.length} {translate('cart.people')}
							</Text>
							{order.splits.map((item, index) => (
								<View key={index} style={[Theme.styles.row_center, { marginTop: 3 }]}>
									<Text style={[Theme.styles.flex_1, styles.cancelOrdertxt]}>
										{item.person_id == props.user?.id ? translate('you') : item.person_name}
									</Text>
									<Text style={[styles.cancelOrdertxt]}>{item.amount} L</Text>
								</View>
							))}
						</View>
					)}
					{order.sub_total != null && (
						<View style={[Theme.styles.row_center, { marginTop: 3 }]}>
							<Text style={[Theme.styles.flex_1, styles.cancelOrdertxt]}>
								{translate('order_details.subtotal')}
							</Text>
							<Text style={[styles.cancelOrdertxt]}>{parseInt(order.sub_total)} L</Text>
						</View>
					)}
					{order.cashback != null && parseInt(order.cashback) >= 0 && (
						<View style={[Theme.styles.row_center, { marginTop: 3 }]}>
							<Text style={[Theme.styles.flex_1, styles.cancelOrdertxt]}>
								{translate('filter.cashback')}
							</Text>
							<Text style={[styles.cancelOrdertxt]}>
								{parseInt(order.cashback) > 0 ? `-${parseInt(order.cashback)}` : `0`} L
							</Text>
						</View>
					)}
					{order.total_price != null && getDiscountAmount(order) >= 0 && (
						<View style={[Theme.styles.row_center, { marginTop: 3 }]}>
							<Text style={[Theme.styles.flex_1, styles.cancelOrdertxt]}>
								{translate('filter.discount')}
							</Text>
							<Text style={[styles.cancelOrdertxt]}>
								{parseInt(getDiscountAmount(order)) > 0
									? `-${parseInt(getDiscountAmount(order))}`
									: `0`}{' '}
								L
							</Text>
						</View>
					)}
					{order.order_type == OrderType_Delivery &&
						order.small_order_fee != null &&
						parseInt(order.small_order_fee) > 0 && (
							<InfoRow
								keyItem={
									<View style={[Theme.styles.row_center_start, { flex: 1 }]}>
										<Text style={[styles.cancelOrdertxt, { marginRight: 8 }]}>
											{translate('cart.small_order_fee')}
										</Text>
										<Tooltip
											isVisible={showSmallOrderFeeInfoPop}
											backgroundColor={'transparent'}
											content={
												<Text
													style={{
														fontSize: 13,
														fontFamily: Theme.fonts.medium,
														color: Theme.colors.text,
													}}
												>
													{translate('cart.small_order_fee_desc')
														.replace('{0}', order.delivery_minimum_order_price)
														.replace('{1}', parseInt(order.small_order_fee))}
												</Text>
											}
											placement='top'
											tooltipStyle={{ backgroundColor: 'transparent' }}
											topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
											contentStyle={{ elevation: 7, borderRadius: 8 }}
											arrowStyle={{ elevation: 8 }}
											showChildInTooltip={false}
											disableShadow={false}
											onClose={() => setShowSmallOrderFeePop(false)}
										>
											<TouchableOpacity onPress={() => setShowSmallOrderFeePop(true)}>
												<Foundation name='info' size={20} color={Theme.colors.gray7} />
											</TouchableOpacity>
										</Tooltip>
									</View>
								}
								value={parseInt(order.small_order_fee) + ' L'}
								style={{ height: 35 }}
								valueStyle={styles.cancelOrdertxt}
							/>
						)}
					{order.order_type == OrderType_Delivery &&
						order.tip_rider != null &&
						parseInt(order.tip_rider) > 0 && (
							<View style={[Theme.styles.row_center, { marginTop: 3 }]}>
								<Text style={[Theme.styles.flex_1, styles.cancelOrdertxt]}>
									{translate('cart.leave_rider_tip')}
								</Text>
								<Text style={[styles.cancelOrdertxt]}>{order.tip_rider} L</Text>
							</View>
						)}
					{order.order_type == OrderType_Delivery &&
						order.delivery_fee != null &&
						parseInt(order.delivery_fee) >= 0 && (
							<View style={[Theme.styles.row_center, { marginTop: 3 }]}>
								<Text style={[Theme.styles.flex_1, styles.cancelOrdertxt]}>
									{translate('checkout.delivery_fee')}
								</Text>
								<Text style={[styles.cancelOrdertxt]}>{parseInt(order.delivery_fee)} L</Text>
							</View>
						)}
				</View>
			</View>
		);
	};

	const _renderGiftOrderDesc = () => {
		return (
			<View style={[Theme.styles.row_center_start, styles.gift_order_view]}>
				<AntDesign name='gift' size={28} color={Theme.colors.cyan2} />
				<View style={[{ flex: 1, marginLeft: 15 }]}>
					<Text style={[styles.gift_order_txt]}>{translate('order_summary.gift_order')}</Text>
					{order.customer_id == props.user?.id ? (
						<Text style={[styles.gift_order_desc]}>
							{translate('order_summary.gift_order_desc')} {order.gift_recip_name}
						</Text>
					) : (
						<Text style={[styles.gift_order_desc]}>
							{translate('order_summary.gift_order_received_desc')} {order.order_customer_data?.full_name}
						</Text>
					)}
				</View>
			</View>
		);
	};

	const _renderReservationPaymentBlock = () => {
		if (
			order.status != 'new' &&
			order.status != 'completed' &&
			order.status != 'declined' &&
			isEmpty(order.reservation_paid)
		) {
			return (
				<View style={[Theme.styles.col_center, styles.paymentBlock]}>
					<View style={[Theme.styles.row_center, { width: '100%' }]}>
						<View style={[Theme.styles.row_center]}>
							<Feather name='info' size={16} color={'#D89C03'} />
							<AppText style={[styles.paymentBlockStatus, { color: '#D89C03' }]}>
								{translate('order_summary.payment_not_done')}
							</AppText>
						</View>
						<View style={styles.paymentBlockline} />
					</View>
					<View style={[Theme.styles.row_center, { width: '100%', marginTop: 15 }]}>
						{order?.vendor?.online_payment == 1 ? (
							<TouchableOpacity
								style={[Theme.styles.row_center, styles.paymentBtn]}
								onPress={() => props.navigation.navigate(RouteNames.OrderSummPayCard)}
							>
								<Octicons name='credit-card' size={18} color={Theme.colors.text} />
								<AppText style={styles.paymentBtnTxt}>
									{translate('order_summary.pay_with_card')}
								</AppText>
							</TouchableOpacity>
						) : (
							<View style={{ flex: 1 }} />
						)}
						<View style={{ width: 10 }} />
						{order?.vendor?.enable_scan_pay == 1 ? (
							<TouchableOpacity
								style={[Theme.styles.row_center, styles.paymentBtn]}
								onPress={() => props.navigation.navigate(RouteNames.ScantoPay)}
							>
								<AntDesign name='scan1' size={18} color={Theme.colors.text} />
								<AppText style={styles.paymentBtnTxt}>{translate('order_summary.scan_pay')}</AppText>
							</TouchableOpacity>
						) : (
							<View style={{ flex: 1 }} />
						)}
					</View>
				</View>
			);
		} else if (order.reservation_paid == RESERVACTION_PAID.card) {
			return (
				<View style={[Theme.styles.col_center, styles.paymentBlock]}>
					<View style={[Theme.styles.row_center, { width: '100%' }]}>
						<View style={[Theme.styles.row_center]}>
							<AntDesign name='checkcircleo' size={18} color={Theme.colors.cyan2} />
							<AppText style={[styles.paymentBlockStatus, { color: Theme.colors.cyan2 }]}>
								{translate('order_summary.paid')}
							</AppText>
						</View>
						<View style={styles.paymentBlockline} />
					</View>
					<View style={[Theme.styles.col_center, styles.paymentBlockDetails]}>
						<View style={[Theme.styles.row_center, { marginVertical: 5 }]}>
							<AppText style={styles.paymentBlockDetailsLabel}>
								{translate('order_summary.status')}
							</AppText>
							<AppText style={styles.paymentBlockDetailsValue}>
								{translate('order_summary.paid_with_card')}
							</AppText>
						</View>
						{order.reservation_paid_date != null && (
							<View style={[Theme.styles.row_center, { marginVertical: 5 }]}>
								<AppText style={styles.paymentBlockDetailsLabel}>
									{translate('order_summary.date_payment')}
								</AppText>
								<AppText style={styles.paymentBlockDetailsValue}>
									{moment(order.reservation_paid_date, 'YYYY-MM-DD HH:mm:ss')
										.locale(getLanguage())
										.format('DD MMM YYYY, HH:mm')}
								</AppText>
							</View>
						)}
						{order.card_last4 != null && (
							<View style={[Theme.styles.row_center, { marginVertical: 5 }]}>
								<AppText style={styles.paymentBlockDetailsLabel}>
									{translate('order_summary.card')}
								</AppText>
								<View style={Theme.styles.row_center}>
									{order.card_brand == 'visa' ? (
										<FontAwesome name='cc-visa' size={16} color={Theme.colors.text} />
									) : (
										<FontAwesome name='cc-mastercard' size={16} color={Theme.colors.text} />
									)}
									<AppText style={styles.paymentBlockDetailsValue}>
										{order.card_brand == 'visa'
											? translate('order_summary.visa_card')
											: translate('order_summary.master_card')}
										...{order.card_last4}
									</AppText>
								</View>
							</View>
						)}
					</View>
				</View>
			);
		} else if (order.reservation_paid == RESERVACTION_PAID.scan) {
			return (
				<View style={[Theme.styles.col_center, styles.paymentBlock]}>
					<View style={[Theme.styles.row_center, { width: '100%' }]}>
						<View style={[Theme.styles.row_center]}>
							<AntDesign name='checkcircleo' size={18} color={Theme.colors.cyan2} />
							<AppText style={[styles.paymentBlockStatus, { color: Theme.colors.cyan2 }]}>
								{translate('order_summary.paid')}
							</AppText>
						</View>
						<View style={styles.paymentBlockline} />
					</View>
					<View style={[Theme.styles.col_center, styles.paymentBlockDetails]}>
						<View style={[Theme.styles.row_center, { marginVertical: 5 }]}>
							<AppText style={styles.paymentBlockDetailsLabel}>{translate('order_summary.paid')}</AppText>
							<View style={[Theme.styles.row_center]}>
								<AntDesign name='scan1' size={18} color={Theme.colors.text} />
								<AppText style={styles.paymentBlockDetailsValue}>
									{translate('order_summary.with_scan_qr_code')}
								</AppText>
							</View>
						</View>
						{order.reservation_paid_date != null && (
							<View style={[Theme.styles.row_center, { marginVertical: 5 }]}>
								<AppText style={styles.paymentBlockDetailsLabel}>
									{translate('order_summary.date_payment')}
								</AppText>
								<AppText style={styles.paymentBlockDetailsValue}>
									{moment(order.reservation_paid_date, 'YYYY-MM-DD HH:mm:ss')
										.locale(getLanguage())
										.format('DD MMM YYYY, HH:mm')}
								</AppText>
							</View>
						)}
					</View>
				</View>
			);
		} else if (order.reservation_paid == RESERVACTION_PAID.cash) {
			return (
				<View style={[Theme.styles.col_center, styles.paymentBlock]}>
					<View style={[Theme.styles.row_center, { width: '100%' }]}>
						<View style={[Theme.styles.row_center]}>
							<AntDesign name='checkcircleo' size={18} color={Theme.colors.cyan2} />
							<AppText style={[styles.paymentBlockStatus, { color: Theme.colors.cyan2 }]}>
								{translate('order_summary.paid')}
							</AppText>
						</View>
						<View style={styles.paymentBlockline} />
					</View>
					<View style={[Theme.styles.col_center, styles.paymentBlockDetails]}>
						<View style={[Theme.styles.row_center, { marginVertical: 5 }]}>
							<AppText style={styles.paymentBlockDetailsLabel}>
								{translate('order_summary.status')}
							</AppText>
							<AppText style={styles.paymentBlockDetailsValue}>
								{translate('order_summary.paid_with_cash')}
							</AppText>
						</View>
						{order.reservation_paid_date != null && (
							<View style={[Theme.styles.row_center, { marginVertical: 5 }]}>
								<AppText style={styles.paymentBlockDetailsLabel}>
									{translate('order_summary.date_payment')}
								</AppText>
								<AppText style={styles.paymentBlockDetailsValue}>
									{moment(order.reservation_paid_date, 'YYYY-MM-DD HH:mm:ss')
										.locale(getLanguage())
										.format('DD MMM YYYY, HH:mm')}
								</AppText>
							</View>
						)}
					</View>
				</View>
			);
		}
		return null;
	};

	const _renderOrderReview = (review) => {
		if (!isReady) {
			return null;
		}
		return (
			<View style={[Theme.styles.col_center, styles.review]}>
				<Text style={[styles.backTxt, { fontSize: 17 }]}>
					{order.gift_recip_id == props.user?.id || order.gift_recip_id == null
						? translate('order_review.your_reviewed')
						: order.gift_recip_name + translate('order_review.user_reviewed')}
				</Text>
				<View style={[Theme.styles.row_center, { marginTop: 25 }]}>
					<View style={[Theme.styles.col_center, { flex: 1 }]}>
						<Text style={[styles.review_title, { marginBottom: 6 }]}>
							{translate('order_review.restaurant')}
						</Text>
						<StarRating
							disabled={true}
							maxStars={5}
							rating={review.vendor_review != null ? review.vendor_review.rating : 0}
							starSize={16}
							fullStarColor={Theme.colors.red1}
							emptyStar={'star'}
							emptyStarColor={Theme.colors.gray7}
							starStyle={{ marginRight: 4 }}
						/>
					</View>
					<View style={[Theme.styles.col_center, { flex: 1 }]}>
						<Text style={[styles.review_title, { marginBottom: 6 }]}>{translate('order_review.dish')}</Text>
						<StarRating
							disabled={true}
							maxStars={5}
							rating={review.product_review != null ? review.product_review.rating : 0}
							starSize={16}
							fullStarColor={Theme.colors.red1}
							emptyStar={'star'}
							emptyStarColor={Theme.colors.gray7}
							starStyle={{ marginRight: 4 }}
						/>
					</View>
					<View style={[Theme.styles.col_center, { flex: 1 }]}>
						<Text style={[styles.review_title, { marginBottom: 6 }]}>
							{translate('order_review.rider')}
						</Text>
						<StarRating
							disabled={true}
							maxStars={5}
							rating={review.rider_review != null ? review.rider_review.rating : 0}
							starSize={16}
							fullStarColor={Theme.colors.red1}
							emptyStar={'star'}
							emptyStarColor={Theme.colors.gray7}
							starStyle={{ marginRight: 4 }}
						/>
					</View>
				</View>
			</View>
		);
	};

	const getTitle = () => {
		if (order != null && props.route.params.fromPush == true) {
			if (order.status == 'new') {
				return translate('order_delivery_status.pending');
			}
			if (order.status == 'processing') {
				return translate('order_delivery_status.prepare_order');
			}
			if (order.status == 'picked_by_rider') {
				return translate('order_delivery_status.out_for_delivery');
			}
			if (order.status == 'delivered') {
				return translate('order_delivery_status.delivered');
			}
			if (order.status == 'accepted') {
				return translate('order_delivery_status.accepted_order');
			}
			if (order.status == 'ready_to_pickup') {
				return translate('order_pickup_status.ready_for_pickup_desc');
			}
			if (order.status == 'picked_up') {
				return translate('order_pickup_status.picked_up_desc');
			}
			if (order.status == 'reserved') {
				return translate('order_reserve_status.reserved_desc');
			}
			if (order.status == 'completed') {
				return translate('order_reserve_status.completed_desc');
			}
			if (order.status == 'canceled') {
				return translate('orders.status_canceled');
			}
			if (order.status == 'declined') {
				return translate('orders.order_declined');
			}
		}
		return translate('order_summary.title');
	};

	const renderBody = () => {
		if (isLoaded == false) {
			return (
				<View style={{ marginTop: 20 }}>
					<ContentLoader
						primaryColor={Theme.colors.gray8}
						secondaryColor={Theme.colors.gray8}
						pRows={1}
						title={false}
						pHeight={[200]}
						pWidth={[width(100) - 20]}
					/>
					<ContentLoader
						primaryColor={Theme.colors.gray8}
						secondaryColor={Theme.colors.gray8}
						pRows={1}
						title={false}
						pHeight={[60]}
						pWidth={[width(100) - 20]}
					/>
					<ContentLoader
						primaryColor={Theme.colors.gray8}
						secondaryColor={Theme.colors.gray8}
						pRows={1}
						title={false}
						pHeight={[300]}
						pWidth={[width(100) - 20]}
					/>
				</View>
			);
		}
		return (
			<View style={styles.formView}>
				<ScrollView style={{ flex: 1, width: '100%', paddingHorizontal: 20 }}>
					<Text style={[Theme.styles.flex_1, styles.subjectTitle, { marginBottom: 12 }]}>
						{moment(order.ordered_date, 'DD-MM-YYYY HH:mm')
							.locale(getLanguage())
							.format('DD MMMM YYYY, HH:mm')}
					</Text>
					<View style={[Theme.styles.col_center, styles.sectionView, { paddingVertical: 10 }]}>
						{order.id != null && (
							<OrderStepper
								order={order}
								onTrackOrder={() => {
									props.navigation.navigate(RouteNames.TrackOrderScreen, { order: order });
								}}
							/>
						)}
						{order.status == 'canceled' && (
							<Text style={styles.orderCancelledTxt}>{translate('order_summary.order_cancelled')}</Text>
						)}
					</View>
					{order.order_type == OrderType_Delivery && _renderAddress()}
					{_renderOrderDetail()}
					{order.is_gift == 1 && _renderGiftOrderDesc()}
					{order.order_type == OrderType_Reserve && _renderReservationPaymentBlock()}
					{isPastOrder(order) && order.order_review && _renderOrderReview(order.order_review)}
					<View style={{ height: 40 }} />
				</ScrollView>
				{isPastOrder(order) &&
					!order.order_review &&
					(order.is_gift != 1 || (order.is_gift == 1 && order.customer_id != props.user?.id)) && (
						<View style={[{ width: '100%', paddingHorizontal: 20, paddingBottom: 10 }]}>
							<MainBtn
								// disabled={loading}
								// loading={loading}
								title={
									order.order_type == OrderType_Reserve
										? translate('order_summary.review_reservation')
										: translate('order_summary.review_order')
								}
								onPress={() => {
									props.navigation.navigate(RouteNames.OrderReviewScreen);
								}}
							/>
						</View>
					)}
				{(isPastOrder(order) || order.status == 'declined') && order?.vendor?.active == 1 && (
					<View style={[Theme.styles.col_center_start, styles.bottom]}>
						<TouchableOpacity onPress={reorder}>
							<Text style={styles.backTxt}>
								{order.order_type == OrderType_Reserve
									? translate('order_summary.repeat_reservation')
									: translate('order_summary.order_again')}
							</Text>
						</TouchableOpacity>
					</View>
				)}
				{isNew && (
					<View style={[{ width: '100%', paddingHorizontal: 20, paddingBottom: 10 }]}>
						<MainBtn
							// disabled={loading}
							// loading={loading}
							title={translate('order_summary.my_orders')}
							onPress={() => {
								if (props.hometab_navigation != null) {
									props.setDefaultOrdersTab('current');
									props.hometab_navigation.jumpTo(RouteNames.OrdersStack);
								}

								props.navigation.navigate(RouteNames.BottomTabs);
							}}
						/>
					</View>
				)}
				{isNew && (
					<View style={[Theme.styles.col_center_start, styles.bottom]}>
						<TouchableOpacity
							onPress={() => {
								if (props.hometab_navigation != null) {
									props.hometab_navigation.jumpTo(RouteNames.HomeStack);
								}
								props.navigation.navigate(RouteNames.BottomTabs);
							}}
						>
							<Text style={styles.backTxt}>{translate('order_summary.go_back_home')}</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<Header1
				style={{ marginBottom: 0, paddingHorizontal: 20 }}
				onLeft={() => {
					if (props.route.params.fromPush == true) {
						if (props.hometab_navigation != null) {
							props.hometab_navigation.jumpTo(RouteNames.HomeStack);
						}

						props.navigation.navigate(RouteNames.BottomTabs);
					} else {
						props.navigation.goBack();
					}
				}}
				left={isNew && <View />}
				title={getTitle()}
				onRight={() => {
					props.navigation.navigate(RouteNames.OrderHelp);
				}}
				right={
					order.order_type == OrderType_Delivery && order.status != 'new' ? (
						<Text style={styles.helpBtn}>{translate('help.title')}</Text>
					) : null
				}
			/>
			{renderBody()}
			<UnConfirmedOrderToast orderId={props.route.params.order_id} navigation={props.navigation} />
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
	formView: {
		marginTop: 20,
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '100%',
	},
	subjectTitle: { fontSize: 19, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9 },
	sectionView: {
		width: '100%',
		alignItems: 'flex-start',
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: Theme.colors.gray9,
	},
	couponDescText: {
		width: '100%',
		marginTop: 12,
		paddingHorizontal: 20,
		textAlign: 'center',
		fontSize: 17,
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.text,
	},
	LogoText: { color: Theme.colors.text, fontSize: 19, fontFamily: Theme.fonts.bold, marginLeft: 10 },
	LogoView: { width: 34, height: 34, borderRadius: 8, backgroundColor: Theme.colors.white },
	Logo: { width: 28, height: 28 },
	bottom: { width: '100%', height: 75, paddingHorizontal: 20, paddingTop: 20, backgroundColor: Theme.colors.white },
	backTxt: { fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	cancelOrdertxt: { fontSize: 17, lineHeight: 20, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7 },

	orderInfoView: {
		alignItems: 'flex-start',
		width: '100%',
		padding: 16,
		borderRadius: 15,
		backgroundColor: Theme.colors.gray8,
	},
	orderTotalTxt: { fontSize: 17, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	orderNoteTxt: { fontSize: 17, color: Theme.colors.text, fontFamily: Theme.fonts.medium },
	orderCancelledTxt: {
		width: '100%',
		textAlign: 'center',
		marginBottom: 10,
		fontSize: 17,
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.red1,
	},
	review: { width: '100%', paddingTop: 20, borderTopWidth: 1, borderTopColor: Theme.colors.gray9 },
	review_title: { fontSize: 17, color: Theme.colors.text, fontFamily: Theme.fonts.medium },

	vendorAddress: {
		marginBottom: 12,
		width: '100%',
		alignItems: 'flex-start',
		borderRadius: 15,
		backgroundColor: Theme.colors.gray8,
		paddingVertical: 12,
		paddingHorizontal: 15,
	},
	vendorPhone: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium },
	vendorAddressTxt: { marginTop: 4, fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium },

	helpBtn: { fontSize: 19, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },

	gift_order_view: { width: '100%' },
	gift_order_txt: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold },
	gift_order_desc: { fontSize: 15, color: Theme.colors.gray1, fontFamily: Theme.fonts.medium },

	confirm_order_view: { marginBottom: 20, width: '100%' },
	confirm_order_txt: {
		marginRight: 8,
		fontSize: 18,
		color: Theme.colors.text,
		fontFamily: Theme.fonts.semiBold,
		textDecorationLine: 'underline',
	},

	splitsView: { width: '100%', marginVertical: 10 },

	paymentBlock: { width: '100%' },
	paymentBlockStatus: { marginHorizontal: 5, fontSize: 17, lineHeight: 21, fontFamily: Theme.fonts.semiBold },
	paymentBlockline: { flex: 1, height: 1, backgroundColor: Theme.colors.gray6 },
	paymentBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: Theme.colors.gray8 },
	paymentBtnTxt: {
		marginLeft: 7,
		fontSize: 16,
		lineHeight: 20,
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.text,
	},
	paymentBlockDetails: {
		marginTop: 14,
		width: '100%',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 10,
		backgroundColor: Theme.colors.gray8,
	},
	paymentBlockDetailsLabel: {
		flex: 1,
		fontSize: 17,
		lineHeight: 21,
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.text,
	},
	paymentBlockDetailsValue: {
		marginLeft: 5,
		fontSize: 17,
		lineHeight: 21,
		fontFamily: Theme.fonts.medium,
		color: Theme.colors.text,
	},
});

const mapStateToProps = ({ app, shop }) => ({
	user: app.user,
	language: app.language,
	order: app.tmp_order,
	hometab_navigation: app.hometab_navigation,
	cartItems: shop.items,
	systemSettings: app.systemSettings || {},
	unconfirmedDeliveryOrders: app.unconfirmedDeliveryOrders || [],
});

export default connect(mapStateToProps, {
	setInitHomeTab,
	setTmpOrder,
	reOrder,
	goActiveScreenFromPush,
	setDefaultOrdersTab,
	setDeliveryInfoCart,
})(OrderSummScreen);
