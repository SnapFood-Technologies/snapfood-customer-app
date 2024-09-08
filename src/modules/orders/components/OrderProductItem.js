import React, {useMemo} from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import AppTooltip from '../../../common/components/AppTooltip';
import PriceLabel from '../../../common/components/vendors/PriceLabel';

const OrderProductItem = ({ data, style }) => {
	const optionTotalPrice= useMemo(()=> {
		let price = 0;
		(data.product_options || []).forEach((option) => {
			price = price + parseInt(option.price)
		})
		return price;
	}, [data.product_options])
	return (
		<View style={[Theme.styles.row_center, styles.orderitem_container, style]}>
			<Text style={styles.item_qty}>x {data.quantity}</Text>
			<View style={styles.item_divider} />
			<View style={[Theme.styles.col_center, styles.item_infoview]}>
				<View style={[Theme.styles.row_center, { width: '100%',  }]}>
					<View style={[Theme.styles.col_center, { alignItems: 'flex-start', flex: 1, }]}>
						<Text style={[styles.item_title, (data.visible != 1 || data.available != 1) && {
							textDecorationLine: 'line-through', textDecorationColor: Theme.colors.text
						}]} >{data.title}</Text>
						{(data.visible != 1 || data.available != 1) && <Text style={[styles.unavailable]} numberOfLines={1}>{translate('vendor_profile.unavailable_item_title')}</Text>}
					</View>
					<View style={[Theme.styles.row_center]}>
						<PriceLabel
							price={parseInt(data.price) + optionTotalPrice}
							discount_price={data.discount_price}
							priceStyle={{
								fontSize: 16,
								color: Theme.colors.text,
								fontFamily: Theme.fonts.medium,
							}}
							discountStyle={{
								fontSize: 14,
								marginLeft: 4
							}}
							style={{marginRight: ((data.visible != 1 || data.available != 1) ? 4 : 0) }}
						/>
						{(data.visible != 1 || data.available != 1) &&
							<AppTooltip
								title={translate('tooltip.order_item_unavailable_title')}
								description={translate('tooltip.order_item_unavailable_desc')}
								infoIconStyle={{ marginVertical: 0, marginBottom: 3 }}
							/>
						}
					</View>
				</View>
				{
					(data.product_options || []).map((option, index) =>
						<View key={index} style={[Theme.styles.row_center, { width: '100%', }]}>
							<Text style={[styles.optionTxt]}>{option.title}</Text>
						</View>
					)
				}
				<View style={{height: 12}}/>
			</View>
		</View>
	)
};

const styles = StyleSheet.create({
	orderitem_container: { width: '100%' },
	item_divider: { width: 1, height: '100%', backgroundColor: Theme.colors.gray6 },
	item_qty: { width: 35, fontSize: 17, color: Theme.colors.red1, fontFamily: Theme.fonts.semiBold },
	item_title: { fontSize: 17, lineHeight: 22, color: Theme.colors.text, fontFamily: Theme.fonts.medium },
	unavailable: { fontSize: 15, fontFamily: Theme.fonts.semiBold, color: '#F55A00', },
	item_infoview: { flex: 1, alignItems: 'center', marginLeft: 12 },
	optionTxt: { flex: 1, fontSize: 15, color: Theme.colors.gray2, fontFamily: Theme.fonts.medium, },
	optionPrice: { fontSize: 15, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
})


export default OrderProductItem;
