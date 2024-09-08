import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import moment from 'moment';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import { Pay_COD, Pay_Paypal, Pay_Card, Pay_Apple } from '../../../config/constants';

const HelpOrderData = ({ order_id, order, style }) => {
	const payment_methods = [Pay_COD, Pay_Paypal, Pay_Card, Pay_Apple]

	let [products_desc, setItems] = useState('');
	let [date, setDate] = useState('');
	let [payMethod, setPayMethod] = useState('');
	useEffect(() => {
		let titles = (order.products || []).map(p => p.title);
		setItems(titles.join(', '));
		setDate(moment(order.ordered_date, "DD-MM-YYYY HH:mm").format("DD-MM-YYYY H:mm A"));
		if (order.payment != null && order.payment.payment_methods_id != null && order.payment.payment_methods_id > 0 && order.payment.payment_methods_id <= payment_methods.length) {
			setPayMethod(translate(payment_methods[order.payment.payment_methods_id - 1]));
		}
	}, [order])


	return <View delayPressIn={100} style={[Theme.styles.col_center, styles.container, style]}>
		<View style={[styles.row]}>
			<Text style={[styles.text, { fontFamily: Theme.fonts.medium }]}>{translate('help.order_date')}</Text>
			<Text style={[styles.text]}>{date}</Text>
		</View>
		<View style={[styles.row]}>
			<Text style={[styles.text, { fontFamily: Theme.fonts.medium }]}>{translate('cart.order_total')}</Text>
			<Text style={[styles.text]}>{parseInt(order.total_price)} L</Text>
		</View>
		<View style={[styles.row]}>
			<Text style={[styles.text, { fontFamily: Theme.fonts.medium }]}>{translate('cart.payment_method')}</Text>
			<Text style={[styles.text, { paddingLeft: 10, textAlign: 'right', flex: 1 }]}>{payMethod}</Text>
		</View>
	</View >;
};

const styles = StyleSheet.create({
	container: { width: '100%', borderRadius: 15, backgroundColor: Theme.colors.gray8, padding: 16, },
	row: { width: '100%', marginTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	title: { marginBottom: 15, fontSize: 15, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
	text: { fontSize: 17, color: Theme.colors.gray7, fontFamily: Theme.fonts.semiBold, },
})

function arePropsEqual(prevProps, nextProps) {
	return prevProps.order_id == nextProps.order_id;
}

export default React.memo(HelpOrderData, arePropsEqual);
