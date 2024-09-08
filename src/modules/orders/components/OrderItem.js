import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Foundation from 'react-native-vector-icons/Foundation';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import { Pay_COD, Pay_Card, Pay_Paypal, Pay_Apple, OrderType_Pickup, OrderType_Delivery, OrderType_Reserve } from '../../../config/constants';
import Svg_delete from '../../../common/assets/svgs/ic_delete.svg';
import ImgSplit from '../../../common/assets/images/orders/split-primary.png';
import { isEmpty } from '../../../common/services/utility';
import { AppText } from '../../../common/components';

const OrderItem = ({ data, order_id, order_status, onCancel, onDelete, onPress, style }) => {
	const past_status = ['delivered', 'picked_up', 'reserved', 'declined', 'canceled']
	const inprogress_status = ['new', 'processing', 'picked_by_rider']
	const payment_methods = [Pay_COD, Pay_Paypal, Pay_Card, Pay_Apple]

	console.log('order Item')

	const isPast = () => {
		return past_status.includes(data.status)
	}
	const statusColor = (status) => {
		if (status == 'new') {
			return Theme.colors.red1
		}
		else if (status == 'processing' || status == 'notified' || status == 'accepted') {
			return Theme.colors.blue1
		}
		else if (status == 'picked_by_rider') {
			return Theme.colors.cyan2
		}
		else if (status == 'delivered' || status == 'picked_up' || status == 'completed') {
			return '#00ff00'
		}
		else if (status == 'declined') {
			return '#ff0000'
		}
		else if (status == 'canceled') {
			return Theme.colors.gray7
		}
		else {
			return Theme.colors.gray7
		}
	}
	const getPaymentMethod = () => {
		if (data.payment != null && data.payment.payment_methods_id != null && data.payment.payment_methods_id > 0 && data.payment.payment_methods_id <= payment_methods.length) {
			return translate(payment_methods[data.payment.payment_methods_id - 1]);
		}
		return ''
	}

	const getStatusText = (status) => {
		if (status == 'processing' && data.order_type == OrderType_Pickup) {
			return translate('order_pickup_status.accepted_order');
		}
		else if (status == 'notified') {
			return translate('order.processing');
		}

		if (status == 'accepted') {
			if (data.vendor.delivery_type == 'Snapfood') {
				return translate('order.accepted');
			}
			else {
				return translate('order.processing');
			}
		}
		return translate('order.' + status);
	}

	return <TouchableOpacity delayPressIn={100} onPress={onPress ? onPress : () => { }} style={[Theme.styles.col_center, styles.container, style]}>
		<View style={[Theme.styles.row_center, { width: '100%', }]}>
			<Text style={[styles.vendor]}>{data.vendor == null ? '' : data.vendor.title}</Text>
			{data.is_gift == 1 && <AntDesign name='gift' size={28} color={Theme.colors.cyan2} />}
			{data.is_split == 1 && <FastImage source={ImgSplit} style={styles.imgSplit} />}
			{
				data.order_type == OrderType_Reserve && data.status != 'new' && data.status != 'completed' && data.status != 'declined' &&
				isEmpty(data.reservation_paid) &&
				<View style={[Theme.styles.row_center, styles.reserveNotPaidBadge]}>
					<Feather name='info' size={15} color={'#D89C03'} />
					<AppText style={[styles.reserveNotPaidBadgeTxt]}>{translate('order_summary.payment_not_done')}</AppText>
				</View>
			}
			{/* {
				isPast() ? <TouchableOpacity onPress={onDelete ? () => onDelete(data.id) : () => { }}  >
					<Svg_delete />
				</TouchableOpacity>
					:
					<TouchableOpacity onPress={onCancel ? () => onCancel(data.id) : () => { }}  >
						<Text style={[styles.cancelBtn]}>{translate('cancel')}</Text>
					</TouchableOpacity>
			} */}
		</View >
		<Text style={styles.payment_method}>{getPaymentMethod()}</Text>
		<Text style={[styles.date,]}>{data.ordered_date.split(' ')[0]}</Text>
		<View style={[Theme.styles.row_center, { width: '100%', marginTop: 6, }]}>
			<Text style={styles.price}>{parseInt(data.total_price)} L</Text>
			<View style={{ flex: 1 }} />
			<Text style={[styles.status, { color: statusColor(data.status) }]}>
				{getStatusText(data.status)}
			</Text>
		</View>
	</TouchableOpacity >;
};

const styles = StyleSheet.create({
	container: { width: '100%', alignItems: 'flex-start', marginTop: 15, borderRadius: 15, backgroundColor: Theme.colors.gray8, padding: 15, },
	vendor: { flex: 1, marginRight: 4, marginBottom: 2, fontSize: 18, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
	cancelBtn: { fontSize: 16, color: Theme.colors.gray7, fontFamily: Theme.fonts.semiBold, },
	price: { marginBottom: 6, fontSize: 19, color: Theme.colors.text, fontFamily: Theme.fonts.bold, },
	payment_method: { marginTop: 9, fontSize: 16, lineHeight: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
	date: { marginTop: 10, fontSize: 16, lineHeight: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
	status: { fontSize: 16, color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold, },
	imgSplit: { width: 28, height: 28 },
	reserveNotPaidBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#FFC42E33' },
	reserveNotPaidBadgeTxt: { marginLeft: 5, fontSize: 14, lineHeight: 15, fontFamily: Theme.fonts.semiBold, color: '#D89C03' }
})

function arePropsEqual(prevProps, nextProps) {
	return prevProps.order_id == nextProps.order_id && prevProps.order_status == nextProps.order_status &&
		prevProps.data?.reservation_paid == nextProps.data?.reservation_paid;
}

export default React.memo(OrderItem, arePropsEqual);
