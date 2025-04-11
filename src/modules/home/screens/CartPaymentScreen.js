import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Platform, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Foundation from 'react-native-vector-icons/Foundation';
// import { useApplePay } from '@stripe/stripe-react-native';
import Modal from 'react-native-modal';
import { connect } from 'react-redux';
import Tooltip from 'react-native-walkthrough-tooltip';
import { setTmpOrder, setDefaultOrdersTab } from '../../../store/actions/app';
import { setPaymentInfoCart, setDeliveryInfoCart, clearCart, sendOrder } from '../../../store/actions/shop';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import Config from '../../../config';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import { Pay_COD, Pay_Apple, Pay_Paypal, OrderType_Reserve, OrderType_Delivery, OrderType_Pickup } from '../../../config/constants';
import MainBtn from '../../../common/components/buttons/main_button';
import DotBorderButton from '../../../common/components/buttons/dot_border_button';
import InfoRow from '../../../common/components/InfoRow';
import PayMethodItem from '../components/PayMethodItem';
import AuthInput from '../../../common/components/AuthInput';
import { AppText, TransBtn } from '../../../common/components';
import CardPayMethodItem from '../components/CardPayMethodItem';
import Header1 from '../../../common/components/Header1';
import OrderFailedModal from '../../../common/components/modals/OrderFailedModal';
import VendorClosedModal from '../../../common/components/modals/VendorClosedModal';
import RouteNames from '../../../routes/names';
import { checkVendorOpen } from '../../../store/actions/vendors';
import { getClosedVendorModalTitle } from './VendorScreen';
import { setStorageKey, KEYS } from '../../../common/services/storage';
import { trimPhoneNumber } from '../../../common/services/utility';

const CartPaymentScreen = (props) => {
	// const { presentApplePay, confirmApplePayPayment, isApplePaySupported } = useApplePay();

	const _Timer = useRef(null);
	const _isVendorClosed = useRef(false);
	const _isOrderFailed = useRef(false);

	const [loading, setLoading] = useState(false);
	const [isClosedVendorModal, showClosedVendorModal] = useState(false);
	const [isOrderFailedModal, showOrderFailedModal] = useState(false);
	const [isBottomModal, showBottomModal] = useState(false);
	const [OrderFailedMessage, setOrderFailedMessage] = useState(translate('cart.order_failed'));
	const [cards, setCards] = useState([]);
	const [paypal_client_token, setPaypalClientToken] = useState(null);

	const [showSmallOrderFeeInfoPop, setShowSmallOrderFeePop] = useState(false);

	const [isCartSplitLoaded, setCartSplitLoaded] = useState(false);
	const [isAllSplitResponded, setIsAllSplitResponded] = useState(false);
	const [cartSplit, setCartSplit] = useState(null);

	useEffect(() => {
		getCartSplit();
		monitorVendorOpen();
		_Timer.current = setInterval(() => {
			monitorVendorOpen();
			getCartSplit();
		}, 3000)

		const focusListener = props.navigation.addListener('focus', () => {
			// loadPaypalClientToken();
		});

		return () => {
			if (_Timer.current) {
				
				clearInterval(_Timer.current);
				_Timer.current = null;
			}

			if (focusListener) {
				focusListener()
			}
		}
	}, [props.navigation]);

	useEffect(() => {
		
		loadPaymentMethods();
	}, [props.user.default_card_id]);

	useEffect(()=> {
		if (props.delivery_info.is_gift == true && props.systemSettings.enable_cash_on_gift_order != 1 && props.payment_info.method == 'cash')
		{
			props.setPaymentInfoCart({
				...props.payment_info,
				method: 'stripe',
			});
		}
	}, [props.payment_info.method, props.delivery_info.is_gift, props.systemSettings.enable_cash_on_gift_order ])

	const closedVendorTitle = useMemo(
		() => getClosedVendorModalTitle(props.vendorData, props.language),
		[props.vendorData, props.language]
	);

	const monitorVendorOpen = () => {
		if (_isVendorClosed.current == true || _isOrderFailed.current == true) {
			return;
		}
		checkVendorOpen(props.vendorData.id)
			.then((is_open) => {
				if (!is_open) {
					if (props.vendorData.can_schedule != 1) {
						_isVendorClosed.current = true;
						showClosedVendorModal(true);
					}
				}
			})
			.catch(err => {
				
			})
	}

	const onOrderFailed = (error = {}) => {
		_isOrderFailed.current = true;
		showClosedVendorModal(false);
		setOrderFailedMessage(error.message ? error.message : translate('cart.order_failed'));
		showOrderFailedModal(true);
	}

	const setDefaultCard = (card_list) => {
		let found_index = card_list.findIndex((card) => card.id == props.user.default_card_id);
		if (found_index == -1) {
			props.setPaymentInfoCart({
				...props.payment_info,
				selected_card: card_list.length > 0 ? card_list[0] : null,
			});
		} else {
			props.setPaymentInfoCart({
				...props.payment_info,
				selected_card: card_list[found_index],
			});
		}
	};

	const loadPaymentMethods = () => {
		apiFactory.get(`stripe/payment-methods`).then(
			({ data }) => {
				let loadedCards = data || [];
				setCards(loadedCards);
				setDefaultCard(loadedCards);
			},
			(error) => {
				
				const message = error.message || translate('generic_error');
				// alerts.error(translate('alerts.error'), message);
			}
		);
	};

	const getCartSplit = () => {
		if (props.systemSettings.enable_split_bill != 1) { return; }

		const total_amount = calculateOrderTotal();
		apiFactory.get(`checkout/get-cart-split?vendor_id=${props.vendorData?.id}&total_amount=${total_amount}`).then(
			({ data }) => {
				// 
				setCartSplit(data.data);
				if (data.data?.users) {
					let tmpIndex = data.data?.users.findIndex(u => u.status == 'pending');
					setIsAllSplitResponded(tmpIndex == -1)
				}
				setCartSplitLoaded(true);
			},
			(error) => {
				
				setCartSplit(null);
				setIsAllSplitResponded(false);
				setCartSplitLoaded(true);
			}
		);
	};

	const loadPaypalClientToken = () => {
		apiFactory.post(`checkout/get-paypal-client-token`).then(
			({ data }) => {
				// 
				setPaypalClientToken(data.client_token);
			},
			(error) => {
				
				const message = error.message || translate('generic_error');
				// alerts.error(translate('alerts.error'), message);
			}
		);
	};

	const calculateOrderTotal = () => {
		const { subtotal, discount, cashback, small_order_fee, delivery_fee } = props.cartPrice;

		let total = subtotal - cashback - discount;
		if (props.delivery_info.handover_method == OrderType_Delivery) {
			total = total + small_order_fee;
			total = total + delivery_fee;

			if (props.payment_info.method != 'cash' && props.order_data.vendorData != null && props.order_data.vendorData.delivery_type == "Snapfood" && props.delivery_info.tip_rider > 0) {
				total = total + parseInt(props.delivery_info.tip_rider);
			}
		}
		return total;
	};

	const _renderPaymentMethod = () => {
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView]}>
				<View style={[Theme.styles.row_center, { width: '100%', marginBottom: 16 }]}>
					<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>{translate('cart.payment_method')}</Text>
				</View>
				{
					(
						props.delivery_info.is_gift != true ||
						(props.delivery_info.is_gift == true && props.systemSettings.enable_cash_on_gift_order == 1)
					)
					&&
					<PayMethodItem
						data={props.delivery_info.handover_method != OrderType_Reserve ? translate(Pay_COD) : translate('pay_at_restaurant')}
						checked={props.payment_info.method == 'cash'}
						onPress={() => {
							props.setPaymentInfoCart({
								...props.payment_info,
								method: 'cash',
							});
						}}
					/>
				}
				{props.order_data.vendorData != null && props.order_data.vendorData.online_payment == 1 && (
					<React.Fragment>
						<CardPayMethodItem
							checked={props.payment_info.method == 'stripe'}
							cards={cards}
							curCard={props.payment_info.selected_card}
							onPress={() => {
								props.setPaymentInfoCart({
									...props.payment_info,
									method: 'stripe',
								});
							}}
							onPressCard={(card) => {
								props.setPaymentInfoCart({
									...props.payment_info,
									selected_card: card,
								});
							}}
							onAddCard={() => {
								props.navigation.navigate(RouteNames.NewCardScreen);
							}}
						/>
						{/* {paypal_client_token != null && paypal_client_token != '' && (
							<PayMethodItem
								data={translate(Pay_Paypal)}
								checked={props.payment_info.method == 'paypal'}
								onPress={() => {
									props.setPaymentInfoCart({
										...props.payment_info,
										method: 'paypal',
									});
								}}
							/>
						)} */}
						{/* {Config.isAndroid == false && isApplePaySupported && (
							<PayMethodItem
								data={translate(Pay_Apple)}
								checked={props.payment_info.method == 'apple'}
								onPress={() => {
									props.setPaymentInfoCart({
										...props.payment_info,
										method: 'apple',
									});
								}}
							/>
						)} */}
					</React.Fragment>
				)}
			</View>
		);
	};

	const renderLeaveTip = () => {
		return (
			<View style={[Theme.styles.col_center_start, { paddingHorizontal: 20 }]}>
				<View style={[Theme.styles.row_center, styles.sectionView]}>
					<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>{translate('cart.leave_rider_tip')}</Text>
					<AuthInput
						style={{
							width: 122,
							height: 40,
							borderWidth: 1,
							borderColor: Theme.colors.gray6,
							backgroundColor: Theme.colors.white,
						}}
						placeholder={translate('cart.enter_cashback_value')}
						textAlign='center'
						keyboardType='decimal-pad'
						value={props.delivery_info.tip_rider == 0 ? '' : '' + props.delivery_info.tip_rider}
						onChangeText={(t) => {
							let int_val = t != '' ? parseInt(t) : 0;

							if (int_val < 0) {
								return;
							}
							props.setDeliveryInfoCart({
								tip_rider: int_val,
							});
						}}
					/>
				</View>
			</View>
		);
	};

	const _renderOrderTotal = () => {
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView, { borderBottomWidth: 0 }]}>
				<View style={[Theme.styles.col_center_start, styles.sectionView]}>
					<InfoRow name={translate('cart.subtotal')} value={parseInt(props.cartPrice.subtotal) + ' L'} />
					{props.cartPrice.discount >= 0 && (
						<InfoRow
							name={translate('cart.discount_amount')}
							value={(props.cartPrice.discount > 0 ? '-' : '') + parseInt(props.cartPrice.discount) + ' L'}
						/>
					)}
					{props.cartPrice.cashback >= 0 && (
						<InfoRow
							name={translate('cart.cashback_amount')}
							value={(props.cartPrice.cashback > 0 ? '-' : '') + parseInt(props.cartPrice.cashback) + ' L'}
						/>
					)}
					{props.delivery_info.handover_method == OrderType_Delivery && props.cartPrice.small_order_fee > 0 && (
						<InfoRow
							keyItem={
								<View style={[Theme.styles.row_center_start, { flex: 1 }]}>
									<Text
										style={{
											marginRight: 8,
											fontSize: 17,
											fontFamily: Theme.fonts.medium,
											color: Theme.colors.text,
										}}
									>
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
													.replace('{0}', props.cartPrice.min_order_price)
													.replace('{1}', props.cartPrice.small_order_fee)}
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
							value={parseInt(props.cartPrice.small_order_fee) + ' L'}
							style={{ height: 40 }}
						/>
					)}
					{
						props.payment_info.method != 'cash' &&
						(props.delivery_info.handover_method == OrderType_Delivery &&
							props.order_data.vendorData != null && props.order_data.vendorData.delivery_type == "Snapfood" &&
							props.delivery_info.tip_rider >= 0) &&
						<InfoRow name={translate('cart.leave_rider_tip')} value={`${props.delivery_info.tip_rider} L`} />
					}
					{props.delivery_info.handover_method == OrderType_Delivery && props.cartPrice.delivery_fee >= 0 && (
						<InfoRow
							name={translate('order_details.delivery_fee')}
							value={parseInt(props.cartPrice.delivery_fee) + ' L'}
						/>
					)}
					<InfoRow
						name={translate('cart.order_total')}
						value={parseInt(calculateOrderTotal()) + ' L'}
						keyStyle={{ fontFamily: Theme.fonts.bold }}
						valueStyle={{ fontFamily: Theme.fonts.bold }}
					/>
				</View>
				{props.payment_info.method != 'cash' &&
					props.systemSettings.enable_split_bill == 1 &&
					isCartSplitLoaded &&
					(cartSplit?.users == null || cartSplit?.users?.length == 0)
					&& (
						<DotBorderButton
							title={translate('cart.split_bill')}
							style={{ width: '100%', marginTop: 16 }}
							onPress={() => {
								showBottomModal(true);
							}}
						/>
					)}
			</View>
		);
	};

	const _renderBillSplit = () => {
		if (props.payment_info.method == 'cash' || props.systemSettings.enable_split_bill != 1 || cartSplit?.users == null || cartSplit?.users?.length == 0) { return null; }
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView]}>
				<View
					style={[
						Theme.styles.flex_between, { marginBottom: 8 },
					]}
				>
					<View style={[Theme.styles.row_center,]} >
						<Text style={[styles.subjectTitle]}>{translate('splits_hist.split_bill_some_screen')}</Text>
						<Text style={[{ fontSize: 17, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7 }]}>
							{' '}
							({translate('cart.among')} {cartSplit?.users.length} {translate('cart.people')})
						</Text>
					</View>
					<TransBtn title={translate('edit')}
						style={{ height: 40 }}
						onPress={() => {
							props.navigation.navigate(RouteNames.SplitOrderScreen, { split_id: cartSplit?.id });
						}}
					/>
				</View>
				{
					cartSplit?.users.map((item, index) => (
						<InfoRow
							key={index}
							keyItem={
								<Text style={[styles.splituserAmount, { flex: 1, paddingRight: 10 }]}>
									{item.person_id == props.user.id ? translate('you') : item.person_name}
									{
										item.is_me != 1 &&
										<Text style={[{
											color: (item.status == 'accepted' ? Theme.colors.cyan2 :
												item.status == 'rejected' ? '#f00' : Theme.colors.red1)
										}]}> ({translate(item.status)})</Text>
									}
								</Text>
							}
							value={parseInt(item.amount) + ' L'}
							valueStyle={[styles.splituserAmount]}
						/>
					))
				}
			</View>
		);
	};

	const _renderBottomModal = () => {
		const goSplit = () => {
			showBottomModal(false);
			props.navigation.navigate(RouteNames.CartSplitScreen);
		};
		const goSplitOrderNotuser = () => {
			showBottomModal(false);
			props.navigation.navigate(RouteNames.SnapfoodersSplitScreen);
		};
		return (
			<Modal
				testID={'modal'}
				isVisible={isBottomModal}
				backdropOpacity={0.33}
				onSwipeComplete={() => showBottomModal(false)}
				onBackdropPress={() => showBottomModal(false)}
				swipeDirection={['down']}
				style={{ justifyContent: 'flex-end', margin: 0 }}
			>
				<View style={[Theme.styles.col_center, styles.modalContent]}>
					<Text style={styles.modalTitle}>{translate('cart.split_with')}</Text>
					<TouchableOpacity
						onPress={goSplit}
						style={[Theme.styles.row_center, { width: '100%', height: 50 }]}
					>
						<Text style={styles.modalBtnTxt}>{translate('Friends')}</Text>
						<Feather name='chevron-right' size={22} color={Theme.colors.text} />
					</TouchableOpacity>
					{/*<View style={styles.divider} />*/}
					{/*<TouchableOpacity onPress={goSplitOrderNotuser} style={[Theme.styles.row_center, { width: '100%', height: 50 }]}>*/}
					{/*    <Text style={styles.modalBtnTxt}>{translate('social.snapfooders')}</Text>*/}
					{/*    <Feather name="chevron-right" size={22} color={Theme.colors.text} />*/}
					{/*</TouchableOpacity>*/}
				</View>
			</Modal>
		);
	};

	const doPay = async () => {
		const { method, selected_card } = props.payment_info;
		if (method == 'paypal') {
			console.log('paypal')
		} else if (method == 'apple') {
			if (!isApplePaySupported) return;

			doApplepay();
		} else {
			finalizeCheckout();
		}
	};

	const getOrderData = (paypal_nonce) => {
		// show loading
		const { items, vendorData, cutlery, coupon, comments, order_for, confirm_legal_age } = props.order_data;
		let cartProducts = items.filter((i) => i.vendor_id == vendorData.id);
		const products = cartProducts.map((item) => {
			return {
				id: item.id,
				qty: item.quantity,
				options: item.options && item.options.length > 0 ? item.options.map((x) => x.id) : [],
				item_instructions: item.comments,
			};
		});

		const {
			address,
			handover_method,
			contactless_delivery,
			tip_rider,
			pickup_date,
			pickup_time,
			num_guests,
			reserve_for,
			is_schedule,
			schedule_time,
			is_gift,
			gift_recip_name,
			gift_recip_phone,
			gift_recip_id,
			gift_from,
			gift_message,
			gift_permission,
			gift_non_user,
			gift_is_referral,
			gift_recip_address
		} = props.delivery_info;
		const { cashback, promo_code } = props.cartPrice;
		const { method, selected_card } = props.payment_info;

		let orderData = {
			vendor_id: vendorData.id,
			products,
			order_note: comments,
			has_cutlery: (cutlery > 0 ? 1 : 0),
			cutlery: cutlery,
			source: (Config.isAndroid ? 'android' : 'ios'),
			coupon_code: coupon.code,
			repeated: 0,
			handover_method: (handover_method == 'Pickup at store' ? 'Pickup' : handover_method),
			delivery_instruction: props.delivery_info.comments,
			cashback: cashback,
			payment_method: method,
			contactless_delivery: (contactless_delivery ? 1 : 0),
			confirm_legal_age: (confirm_legal_age ? 1 : 0)
		};

		if (order_for != null) {
			orderData.order_for = order_for;
		}

		if (promo_code != null && promo_code.trim() != '') {
			orderData.promo_code = promo_code;
		}

		if (handover_method == OrderType_Reserve) {
			orderData.reserve_for = reserve_for.id;
			orderData.num_guests = parseInt(num_guests) == 0 ? 1 : parseInt(num_guests);
		}

		if (handover_method != OrderType_Delivery) {
			orderData.order_note = '';
			orderData.pickup_date = pickup_date;
			orderData.pickup_time = pickup_time;
			orderData.is_schedule = 0;
		} else {
			orderData.is_schedule = (is_schedule == 1 ? 1 : 0);
			orderData.schedule_time = (is_schedule == 1 ? schedule_time : null);
			orderData.address_id = address.id;

			if (props.payment_info.method != 'cash' && vendorData != null && vendorData.delivery_type == "Snapfood" && tip_rider > 0) {
				orderData.tip_rider = parseInt(tip_rider);
			}
			else {
				orderData.tip_rider = 0;
			}
		}

		if (handover_method != OrderType_Pickup && props.payment_info.method != 'cash' && is_gift) {
			orderData.is_gift = 1;
			orderData.gift_recip_name = gift_recip_name;
			orderData.gift_recip_phone = trimPhoneNumber(gift_recip_phone);
			orderData.gift_recip_id = gift_recip_id;
			orderData.gift_from = gift_from;
			orderData.gift_message = gift_message;
			orderData.gift_permission = (gift_permission == true ? 1 : 0);
			orderData.gift_non_user = (gift_non_user == true ? 1 : 0);
			orderData.gift_is_referral = (gift_is_referral == true ? 1 : 0);

			if (handover_method == OrderType_Delivery && gift_non_user != true && gift_recip_address && gift_recip_address.id) {
				orderData.address_id = gift_recip_address.id;
				orderData.delivery_instruction = gift_recip_address.notes || '';
			}

			if (handover_method == OrderType_Reserve && gift_recip_id != null) {
				orderData.reserve_for = gift_recip_id;
			}
		}

		if (method == 'stripe') {
			if (selected_card == null) {
				alerts.error(translate('warning'), translate('cart.select_card'));
				return null;
			} else {
				orderData.payment_method_id = selected_card.id;

				if (props.systemSettings.enable_split_bill == 1) {
					orderData.cart_split_id = cartSplit?.id;
				}
			}
		}

		if (method == 'paypal') {
			orderData.paypal_nonce = paypal_nonce;
		}

		return orderData;
	};

	const finalizeCheckout = async (paypal_nonce) => {
		const { items, vendorData, cutlery, coupon, comments } = props.order_data;

		try {
			await setStorageKey(KEYS.CART_CASHBACK_INPUT, null);
		} catch (e) {
			
		}

		try {
			await setStorageKey(KEYS.COUPON_CODE, null);
		} catch (e) {
			
		}

		let orderData = getOrderData(paypal_nonce);
		if (orderData == null) {
			return;
		}
		
		setLoading(true);
		props.sendOrder(orderData).then(
			(order) => {
				
				let cartItems = items.filter((i) => i.vendor_id != vendorData.id);
				props.setTmpOrder({});
				props.clearCart(cartItems);
				setLoading(false);
				if (props.hometab_navigation != null) {
					props.setDefaultOrdersTab('current');
					props.hometab_navigation.jumpTo(RouteNames.OrdersStack);
				}
				props.navigation.navigate(RouteNames.BottomTabs);
				props.navigation.navigate(RouteNames.OrderSummScreen, { order_id: order.id, isnew: true });
			},
			(error) => {
				
				setLoading(false);

				onOrderFailed(error);
			}
		);
	};

	// const doApplepay = async () => {
	// 	let orderData = getOrderData();
	// 	
	// 	setLoading(true);
	// 	apiFactory
	// 		.post('checkout/get-applepay-client-secret', orderData)
	// 		.then(async ({ data }) => {
	// 			
	//
	// 			const { error } = await presentApplePay({
	// 				cartItems: [{ label: translate('cart.total'), amount: '' + calculateOrderTotal() }],
	// 				country: 'AL',
	// 				currency: 'ALL',
	// 			});
	// 			if (error) {
	// 				setLoading(false);
	// 				
	// 			} else {
	// 				
	// 				const { error: confirmError } = await confirmApplePayPayment(data.client_secret);
	//
	// 				setLoading(false);
	// 				if (confirmError) {
	// 					
	// 				} else {
	// 					finalizeCheckout();
	// 				}
	// 			}
	// 		})
	// 		.catch((error) => {
	// 			
	// 			setLoading(false);
	//
	// 			onOrderFailed(error);
	// 		});
	// };

	const renderGiftOrderErrorMsg = () => {
		if (
			props.delivery_info.is_gift == true &&
			props.payment_info.method == 'cash'
		) {
			return (
				<View style={[Theme.styles.col_center, { marginTop: 20, width: '100%', paddingHorizontal: 20 }]}>
					<View style={[Theme.styles.col_center, styles.error_msg_view]}>
						<AppText style={styles.error_msg}>
							{translate('cart.gift_order_not_possible_for_cash')}
						</AppText>
					</View>
				</View>
			)
		}
		return null;
	}

	const renderSplitOrderMsg = () => {
		if (
			props.systemSettings.enable_split_bill == 1 &&
			props.payment_info.method != 'cash' &&
			isCartSplitLoaded &&
			(cartSplit?.users != null && cartSplit?.users?.length > 0) &&
			!isAllSplitResponded
		) {
			return (
				<View style={[Theme.styles.col_center, { marginTop: 20, width: '100%', paddingHorizontal: 20 }]}>
					<View style={[Theme.styles.col_center, styles.error_msg_view]}>
						<AppText style={styles.error_msg}>
							{translate('cart.split_order_not_possible_before_all_reply')}
						</AppText>
					</View>
				</View>
			)
		}
		return null;
	}

	return (
		<View style={styles.container}>
			<Header1
				style={{ marginBottom: 0, paddingHorizontal: 20 }}
				onLeft={() => {
					props.navigation.goBack();
				}}
				title={translate('checkout.header_title')}
			/>
			<View style={styles.formView}>
				<ScrollView style={{ flex: 1, width: '100%', paddingHorizontal: 20 }}>
					{_renderPaymentMethod()}
					{props.payment_info.method != 'cash' && props.delivery_info.handover_method == OrderType_Delivery && props.vendorData.delivery_type == "Snapfood" && renderLeaveTip()}
					{_renderBillSplit()}
					{_renderOrderTotal()}
					{renderGiftOrderErrorMsg()}
					{renderSplitOrderMsg()}
				</ScrollView>
				<View style={{ width: '100%', padding: 20 }}>
					<MainBtn
						disabled={
							_isVendorClosed.current == true || loading ||
							(props.payment_info.method != 'cash' && props.systemSettings.enable_split_bill == 1 && !isCartSplitLoaded) ||
							(props.payment_info.method != 'cash' && props.systemSettings.enable_split_bill == 1 && !isAllSplitResponded && (cartSplit?.users != null && cartSplit?.users?.length > 0))
						}
						loading={loading}
						title={
							(cartSplit?.users != null && cartSplit?.users?.length > 0)
								? translate('checkout_phone.proceed')
								: translate('checkout_phone.proceed')
						}
						onPress={doPay}
					/>
				</View>
			</View>
			{_renderBottomModal()}
			<OrderFailedModal
				isVisible={isOrderFailedModal}
				message={OrderFailedMessage}
				onTryAgain={() => {
					showOrderFailedModal(false);
					doPay();
				}}
				onClose={() => showOrderFailedModal(false)}
			/>
			<VendorClosedModal
				showModal={!isOrderFailedModal && isClosedVendorModal}
				isSeeMenuVisible={false}
				title={closedVendorTitle}
				goHome={() => {
					showClosedVendorModal(false);
					if (props.hometab_navigation != null) {
						props.hometab_navigation.jumpTo(RouteNames.HomeStack);
					}
					props.navigation.navigate(RouteNames.BottomTabs);
				}}
				onClose={() => showClosedVendorModal(false)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		paddingVertical: 20,
		backgroundColor: '#ffffff',
	},
	formView: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '100%',
	},
	subjectTitle: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9 },
	sectionView: {
		width: '100%',
		alignItems: 'flex-start',
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: Theme.colors.gray9,
	},
	modalContent: {
		width: '100%',
		paddingHorizontal: 20,
		paddingBottom: 30,
		padding: 20,
		backgroundColor: Theme.colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	modalTitle: {
		width: '100%',
		textAlign: 'left',
		fontSize: 19,
		fontFamily: Theme.fonts.bold,
		color: Theme.colors.text,
		marginVertical: 12,
	},
	modalBtnTxt: { flex: 1, fontSize: 17, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
	error_msg_view: {
		width: '100%',
		padding: 12,
		backgroundColor: Theme.colors.white,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Theme.colors.red1,
		borderStyle: 'dashed',
	},
	error_msg: {
		fontSize: 14,
		lineHeight: 18,
		textAlign: 'center',
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.red1
	},
	splituserAmount: { fontSize: 17, color: Theme.colors.text, fontFamily: Theme.fonts.medium },
	splituserStatus: { marginLeft: 10, fontSize: 17, color: Theme.colors.text, fontFamily: Theme.fonts.medium }
});

const mapStateToProps = ({ app, shop }) => ({
	language: app.language,
	user: app.user,
	hometab_navigation: app.hometab_navigation,
	systemSettings: app.systemSettings || {},
	order_data: shop,
	delivery_info: shop.delivery_info,
	payment_info: shop.payment_info,
	cartPrice: shop.cartPrice,
	vendorData: shop.vendorData || {},
});

export default connect(mapStateToProps, {
	setPaymentInfoCart,
	sendOrder,
	setDeliveryInfoCart,
	clearCart,
	setTmpOrder,
	setDefaultOrdersTab
})(CartPaymentScreen);
