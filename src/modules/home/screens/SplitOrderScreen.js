import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { setPaymentInfoCart } from '../../../store/actions/shop';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import Theme from '../../../theme';
import MainBtn from '../../../common/components/buttons/main_button';
import Counter from '../../../common/components/buttons/counter';
import RadioBtn from '../../../common/components/buttons/radiobtn';
import Header1 from '../../../common/components/Header1';
import RouteNames from '../../../routes/names';
import { OrderType_Delivery } from '../../../config/constants';
import apiFactory from '../../../common/services/apiFactory';
import { AuthInput } from '../../../common/components';

const SplitOrderScreen = (props) => {
	const split_id = props.route?.params?.split_id;
	const [curMethod, setMethod] = useState('Equally');
	const [isSavedManual, setSaveManual] = useState(false);
	const [manualPrices, setManualPrices] = useState({});
	const [splitUsers, setSplitUsers] = useState(split_id == null ? props.splits : []);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (split_id) {
			loadCartSplit(split_id);
		}
	}, [split_id])

	const loadCartSplit = (split_id) => {
		apiFactory.get(`checkout/get-cart-split?id=${split_id}`).then(
			({ data }) => {
				let prices = {};
				let tmp = [];
				let users = data.data?.users || [];
				let foundIndex = users.findIndex(i => i.is_me == 1);
				if (foundIndex != -1) {
					tmp.push({
						id: users[foundIndex].person_id,
						full_name: users[foundIndex].person_name,
					});
					prices[users[foundIndex].person_id] = users[foundIndex].amount;
				}
				users.filter(u => u.is_me != 1).map(u => {
					tmp.push({
						id: u.person_id,
						full_name: u.person_name,
					});
					prices[u.person_id] = u.amount;
				})
				setSplitUsers(tmp);
				setMethod('Manually');
				setManualPrices(prices);
			},
			(error) => {
				
				setSplitUsers([]);
			}
		);
	};

	const calculateOrderTotal = () => {
		const { subtotal, discount, cashback, small_order_fee, delivery_fee } = props.cartPrice;

		let total = subtotal - cashback - discount;
		if (props.delivery_info.handover_method == OrderType_Delivery) {
			total = total + small_order_fee;
			total = total + delivery_fee;

			if (props.order_data.vendorData != null && props.order_data.vendorData.delivery_type == "Snapfood" && props.delivery_info.tip_rider > 0) {
				total = total + parseInt(props.delivery_info.tip_rider);
			}
		}
		return total;
	};

	const getManualPriceForaUser = (user) => {
		if (manualPrices[user.id] == null) {
			let price = calculateOrderTotal() / splitUsers.length;
			let remind = calculateOrderTotal() % splitUsers.length;
			if (user.id == props.user.id && remind > 0) {
				return parseInt(price) + remind;
			}
			return parseInt(price);
		} else {
			return manualPrices[user.id];
		}
	};

	const onPlusUser = (user) => {
		const step = 50;
		let cur_price = getManualPriceForaUser(user);
		if (cur_price + step <= calculateOrderTotal()) {
			let found_id = splitUsers.findIndex((i) => i.id == user.id);

			if (found_id != -1 && splitUsers.length > 1) {
				let next_user = null;
				if (found_id + 1 < splitUsers.length) {
					next_user = splitUsers[found_id + 1];
				} else {
					next_user = splitUsers[0];
				}
				if (next_user != null && next_user.id != user.id) {
					let next_cur_price = getManualPriceForaUser(next_user);
					if (next_cur_price > step) {
						setManualPrices({
							...manualPrices,
							[user.id]: cur_price + step,
							[next_user.id]: next_cur_price - step,
						});
					}
				}
			}
		}
	};

	const onMinusUser = (user) => {
		const step = 50;
		let cur_price = getManualPriceForaUser(user);
		if (cur_price > step) {
			let found_id = splitUsers.findIndex((i) => i.id == user.id);

			if (found_id != -1 && splitUsers.length > 1) {
				let next_user = null;
				if (found_id + 1 < splitUsers.length) {
					next_user = splitUsers[found_id + 1];
				} else {
					next_user = splitUsers[0];
				}
				if (next_user != null && next_user.id != user.id) {
					let next_cur_price = getManualPriceForaUser(next_user);
					if (next_cur_price <= calculateOrderTotal()) {
						setManualPrices({
							...manualPrices,
							[user.id]: cur_price - step,
							[next_user.id]: next_cur_price + step,
						});
					}
				}
			}
		}
	};

	const onChangeAmount = (value, user) => {
		setManualPrices({
			...manualPrices,
			[user.id]: value
		});
	}

	const onDeleteUser = (user) => {
		let tmp = splitUsers.filter(s => s.id != user.id);
		setSplitUsers(tmp);
		setSaveManual(false);
	}

	const getAveragePrice = () => {
		let price = calculateOrderTotal() / splitUsers.length;
		return Math.ceil(price);
	}

	const onConfirmSplit = () => {
		let splits = [];
		if (curMethod == 'Equally') {
			let price = getAveragePrice();
			splitUsers.map((item) => {
				item.amount = parseInt(price);
				splits.push(item);
			});
		} else {
			splitUsers.map((item) => {
				item.amount = getManualPriceForaUser(item);
				splits.push(item);
			});
		}

		const { items } = props.order_data;
		let cartProducts = items.filter((i) => i.vendor_id == props.vendorData?.id);
		const products = cartProducts.map((item) => {
			return {
				id: item.id,
				title: item.title,
				description: item.description,
				price: item.price,
				discount_price: item.discount_price,
				qty: item.quantity,
				options: item.options && item.options.length > 0 ? item.options.map((x) => x) : [],
			};
		});

		setLoading(true);
		apiFactory.post(`checkout/create-cart-split`,
			{
				total_amount: calculateOrderTotal(),
				vendor_id: props.vendorData?.id,
				splits: splits,
				products: products
			})
			.then(({ data }) => {
				setLoading(false);
				props.navigation.navigate(RouteNames.CartPaymentScreen);
			})
			.catch(error => {
				setLoading(false);
				const message = error.message || translate('generic_error');
				alerts.error(translate('alerts.error'), message);
			});
	};

	const onSaveManual = () => {
		let cur_total = 0;
		for(let i = 0; i < splitUsers.length; i ++) {
			let p = getManualPriceForaUser(splitUsers[i]);
			if (isNaN(parseInt(p))) {
				return alerts.error(translate('warning'), translate('split.wrong_value'));
			}
			cur_total = cur_total + parseInt(p);
		}
		if (cur_total != calculateOrderTotal()) {
			alerts.error(translate('warning'), translate('split.wrong_split'));
			return;
		}
		setSaveManual(true);
	};

	const _renderMethod = (type) => {
		const isActive = curMethod == type;

		return (
			<TouchableOpacity
				activeOpacity={0.8}
				onPress={() => {
					if (type == 'Equally') {
						setSaveManual(false);
					}
					setMethod(type);
				}}
				style={[Theme.styles.col_center, styles.splitMethodView]}
			>
				<View style={[Theme.styles.row_center, { width: '100%' }]}>
					<Text style={[styles.name, isActive && { fontFamily: Theme.fonts.semiBold }]}>
						{translate('split_title')} {translate(type)}
					</Text>
					<View style={{ flex: 1 }} />
					<RadioBtn
						checked={isActive}
						onPress={() => {
							if (type == 'Equally') {
								setSaveManual(false);
							}
							setMethod(type);
						}}
					/>
				</View>
				{isActive && (
					<View style={[Theme.styles.col_center, { width: '100%' }]}>
						<View style={styles.divider} />
						{splitUsers.map((item, index) => (
							<View key={index} style={[Theme.styles.row_center, { width: '100%', marginVertical: 6 }]}>
								<Text style={[styles.user_name, { flex: 1, paddingRight: 10 }]}>
									{item.id == props.user.id ? translate('you') : item.username || item.full_name}
								</Text>
								{type == 'Equally' ?
									<Text style={[styles.name, { fontFamily: Theme.fonts.semiBold }]}>
										{getAveragePrice()} L
									</Text>
									:
									(!isSavedManual ?
										<AuthInput
											style={{
												width: 86,
												height: 40,
												borderWidth: 1,
												borderColor: Theme.colors.gray6,
												backgroundColor: Theme.colors.white,
												paddingLeft: 4,
        										paddingRight: 4,
											}}
											placeholder={translate('cart.enter_cashback_value')}
											textAlign='right'
											keyboardType='number-pad'
											value={'' + getManualPriceForaUser(item)}
											onChangeText={(t) => {
												onChangeAmount(t, item);
											}}
										/>
										:
										<Text style={[styles.name, { fontFamily: Theme.fonts.semiBold }]}>
											{parseInt(getManualPriceForaUser(item))} L
										</Text>)
								}
								{
									split_id != null && (splitUsers.length > 1) && (
										<View style={[Theme.styles.col_center, { width: 32 }]}>
											{
												(item.id != props.user.id) &&
												<TouchableOpacity onPress={() => onDeleteUser(item)} style={{ marginLeft: 12 }}>
													<Feather name='trash-2' size={18} color={Theme.colors.text} />
												</TouchableOpacity>
											}
										</View>
									)
								}
							</View>
						))}
						<View style={styles.divider} />
						<View style={[Theme.styles.row_center, { width: '100%', marginBottom: 16 }]}>
							<Text style={[styles.name, { fontFamily: Theme.fonts.semiBold }]}>
								{translate('split.bill_total')}
							</Text>
							<View style={{ flex: 1 }} />
							<Text style={[styles.name, { fontFamily: Theme.fonts.semiBold }]}>
								{parseInt(calculateOrderTotal())} L
							</Text>
						</View>
						{type != 'Equally' && !isSavedManual && (
							<TouchableOpacity onPress={() => onSaveManual()}>
								<Text style={styles.save_btn}>{translate('save')}</Text>
							</TouchableOpacity>
						)}
					</View >
				)}
			</TouchableOpacity >
		);
	};

	return (
		<View style={styles.container}>
			<Header1
				style={{ marginBottom: 0, paddingHorizontal: 20 }}
				onLeft={() => {
					props.navigation.goBack();
				}}
				title={translate('filter.split_order')}
			/>
			{
				splitUsers.length == 0 ?
					<View style={{ flex: 1 }} />
					:
					<View style={styles.formView}>
						<KeyboardAwareScrollView extraScrollHeight={65} enableOnAndroid={true} style={[{ flex: 1, width: '100%', paddingHorizontal: 20 }]} keyboardShouldPersistTaps='handled' scrollIndicatorInsets={{ right: 1 }}>
							{_renderMethod('Equally')}
							{_renderMethod('Manually')}
						</KeyboardAwareScrollView>
						<View style={{ width: '100%', padding: 20 }}>
							{(isSavedManual || curMethod == 'Equally') && (
								<MainBtn
									disabled={loading}
									loading={loading}
									title={translate('confirm')}
									onPress={onConfirmSplit}
								/>
							)}
						</View>
					</View>
			}
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
		marginTop: 25,
	},

	splitMethodView: {
		width: '100%',
		alignItems: 'flex-start',
		marginBottom: 16,
		borderRadius: 15,
		backgroundColor: Theme.colors.gray8,
		paddingVertical: 16,
		paddingHorizontal: 15,
	},
	name: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium },
	divider: { width: '100%', marginVertical: 16, height: 1, backgroundColor: Theme.colors.gray6 },
	save_btn: { fontSize: 16, color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold },
	user_name: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium },
	counter: {
		width: 122,
		height: 40,
		padding: 6,
		paddingHorizontal: 12,
		borderWidth: 0,
		backgroundColor: Theme.colors.gray8,
	},
});

const mapStateToProps = ({ app, shop }) => ({
	user: app.user,
	order_data: shop,
	payment_info: shop.payment_info,
	delivery_info: shop.delivery_info,
	cartPrice: shop.cartPrice,
	splits: shop.payment_info.splits || [],
	vendorData: shop.vendorData || {},
});

export default connect(mapStateToProps, {
	setPaymentInfoCart,
})(SplitOrderScreen);
