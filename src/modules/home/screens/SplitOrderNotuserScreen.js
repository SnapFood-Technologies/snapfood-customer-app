import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
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

const SplitOrderNotuserScreen = (props) => {
	const [users, setUsers] = useState([props.user]);

	const [curMethod, setMethod] = useState('Manually');
	const [isSavedManual, setSaveManual] = useState(false);
	const [manualPrices, setManualPrices] = useState({});

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
			let price = calculateOrderTotal() / users.length;
			
			return parseInt(price);
		} else {
			return manualPrices[user.id];
		}
	};
	const onPlusUser = (user) => {
		let cur_price = getManualPriceForaUser(user);
		if (cur_price < calculateOrderTotal()) {
			setManualPrices({
				...manualPrices,
				[user.id]: cur_price + 1,
			});
		}
	};
	const onMinusUser = (user) => {
		let cur_price = getManualPriceForaUser(user);
		if (cur_price > 0) {
			setManualPrices({
				...manualPrices,
				[user.id]: cur_price - 1,
			});
		}
	};

	const onConfirmSplit = () => {
		if (curMethod == 'Equally') {
			let price = calculateOrderTotal() / users.length;
			let tmp = [];
			users.map((item) => {
				item.price = parseInt(price);
				tmp.push(item);
			});
			props.setPaymentInfoCart({
				...props.payment_info,
				splits: tmp,
			});
		} else {
			let tmp = [];
			users.map((item) => {
				item.price = getManualPriceForaUser(item);
				tmp.push(item);
			});
			props.setPaymentInfoCart({
				...props.payment_info,
				splits: tmp,
			});
		}
		props.navigation.navigate(RouteNames.CartPaymentScreen);
	};

	const onSaveManual = () => {
		let cur_total = 0;
		users.map((item) => {
			cur_total = cur_total + getManualPriceForaUser(item);
		});
		if (cur_total != calculateOrderTotal()) {
			alerts.error(translate('warning'), translate('split.wrong_split'));
			return;
		}
		setSaveManual(true);
	};

	const _renderNumPeople = () => {
		return (
			<View
				style={[
					Theme.styles.row_center_start,
					{
						width: '100%',
						paddingVertical: 10,
						marginBottom: 20,
						alignItems: 'center',
						borderBottomWidth: 1,
						borderBottomColor: Theme.colors.gray9,
					},
				]}
			>
				<View style={[Theme.styles.col_center, { alignItems: 'flex-start', flex: 1 }]}>
					<Text
						style={{
							marginVertical: 5,
							fontSize: 14,
							fontFamily: Theme.fonts.medium,
							color: Theme.colors.text,
						}}
					>
						{translate('split.num_people')}
					</Text>
					<Text style={{ fontSize: 12, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7 }}>
						{translate('split.include_yourself')}
					</Text>
				</View>
				<Counter
					onPlus={() => {
						let user = {
							id: -users.length,
							full_name: translate('Friend') + ' #' + users.length,
						};
						let tmp = users.slice(0, users.length);
						tmp.push(user);
						setManualPrices({});
						setUsers(tmp);
					}}
					onMinus={() => {
						if (users.length == 1) {
							return;
						}
						let tmp = users.slice(0, users.length);
						tmp.splice(users.length - 1, 1);
						setManualPrices({});
						setUsers(tmp);
					}}
					value={users.length}
					style={{
						width: 122,
						height: 40,
						padding: 6,
						paddingHorizontal: 12,
						borderWidth: 1,
						borderColor: Theme.colors.gray6,
						backgroundColor: Theme.colors.white,
					}}
					btnColor={Theme.colors.cyan2}
					btnSize={20}
				/>
			</View>
		);
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
					<Text style={[styles.name, isActive && { fontFamily: Theme.fonts.semiBold }]}>Split {type}</Text>
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
						{users.map((item, index) => (
							<View key={index} style={[Theme.styles.row_center, { width: '100%', marginVertical: 6 }]}>
								<Text style={[styles.user_name]}>
									{item.id == props.user.id ? translate('you') : item.username || item.full_name}
								</Text>
								<View style={{ flex: 1 }} />
								{type != 'Equally' && !isSavedManual && (
									<Counter
										onPlus={() => onPlusUser(item)}
										onMinus={() => onMinusUser(item)}
										value={getManualPriceForaUser(item)}
										style={styles.counter}
										btnColor={Theme.colors.cyan2}
										btnSize={20}
									/>
								)}
								{type != 'Equally' && isSavedManual && (
									<Text style={[styles.name, { fontFamily: Theme.fonts.semiBold }]}>
										{parseInt(getManualPriceForaUser(item))} L
									</Text>
								)}
							</View>
						))}
						<View style={styles.divider} />
						{type == 'Equally' || isSavedManual ? (
							<View style={[Theme.styles.row_center, { width: '100%' }]}>
								<Text style={[styles.name, { fontFamily: Theme.fonts.semiBold }]}>
									{translate('split.bill_total')}
								</Text>
								<View style={{ flex: 1 }} />
								<Text style={[styles.name, { fontFamily: Theme.fonts.semiBold }]}>
									{parseInt(calculateOrderTotal())} L
								</Text>
							</View>
						) : (
							<TouchableOpacity onPress={() => onSaveManual()}>
								<Text style={styles.save_btn}>{translate('save')}</Text>
							</TouchableOpacity>
						)}
					</View>
				)}
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.container}>
			<Header1
				style={{ marginBottom: 0 }}
				onLeft={() => {
					props.navigation.goBack();
				}}
				title={translate('filter.split_order')}
			/>
			<View style={styles.formView}>
				<ScrollView style={{ flex: 1, width: '100%' }}>
					{_renderNumPeople()}
					{_renderMethod('Equally')}
					{_renderMethod('Manually')}
				</ScrollView>
				<View style={{ width: '100%', paddingVertical: 20 }}>
					{(isSavedManual || curMethod == 'Equally') && (
						<MainBtn
							// disabled={loading}
							// loading={loading}
							title={'Confirm'}
							onPress={onConfirmSplit}
						/>
					)}
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		padding: 20,
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
	user_name: { fontSize: 14, color: Theme.colors.text, fontFamily: Theme.fonts.medium },
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
});

export default connect(mapStateToProps, {
	setPaymentInfoCart,
})(SplitOrderNotuserScreen);
