import styles from '../screens/styles/cart';
import { View } from 'react-native';
import AppText from '../../../common/components/AppText';
import { translate } from '../../../common/services/translate';
import { formatPrice } from '../../../common/services/utility';
import Theme from '../../../theme';
import React from 'react';

const totalDiscountTypes = ['discount', 'percentage', 'fixed'];
const freeDeliveryTypes = ['free_delivery'];

const CartSubTotals = ({ total, discountInfo, deliveryFee, calculateTotal, currency = 'L' }) => {
	const hasTotalDiscount = discountInfo && discountInfo.value && totalDiscountTypes.indexOf(discountInfo.type) > -1;
	const hasFreeDelivery = discountInfo && freeDeliveryTypes.indexOf(discountInfo.type) > -1;
	const discountValue = discountInfo && discountInfo.value ? discountInfo.value : 0;

	return (
		<View style={[styles.tariffContainer, { marginTop: 15 }]}>
			<View style={styles.tariffRow}>
				<View style={styles.leftRow}>
					<AppText style={styles.leftRowText}>{translate('cart.products')}</AppText>
				</View>
				<View style={styles.rightRow}>
					<AppText style={styles.rightRowText}>
						{formatPrice(total)}
						{' ' + currency}
					</AppText>
				</View>
			</View>
			<View style={styles.tariffRow}>
				<View style={styles.leftRow}>
					<AppText style={styles.leftRowText}>{translate('cart.transport')}</AppText>
				</View>
				<View style={styles.rightRow}>
					<AppText style={styles.rightRowText}>
						{!!hasFreeDelivery ? (
							<AppText>
								<AppText
									style={{
										textDecorationLine: 'line-through',
										color: Theme.colors.danger,
									}}
								>
									{formatPrice(deliveryFee)}
									{' ' + currency}
								</AppText>
								{' 0 ' + currency}
							</AppText>
						) : (
							<AppText>
								{formatPrice(deliveryFee)}
								{' ' + currency}
							</AppText>
						)}
					</AppText>
				</View>
			</View>
			{!!hasTotalDiscount && (
				<View style={styles.tariffRow}>
					<View style={styles.leftRow}>
						<AppText style={[styles.leftRowText, { fontFamily: 'SanFranciscoDisplay-Bold' }]}>
							{discountInfo.name ? discountInfo.name : discountInfo.code}
						</AppText>
					</View>
					<View style={styles.rightRow}>
						<AppText style={[styles.rightRowText, { color: Theme.colors.danger }]}>
							-{formatPrice(discountValue)} {' ' + currency}
						</AppText>
					</View>
				</View>
			)}
			<View style={styles.tariffRow}>
				<View style={styles.leftRow}>
					<AppText style={[styles.leftRowText, { fontSize: 20, fontFamily: 'SanFranciscoDisplay-Bold' }]}>
						{translate('cart.total')}
					</AppText>
				</View>
				<View style={styles.rightRow}>
					<AppText
						style={[
							styles.rightRowText,
							{
								fontSize: 20,
								fontFamily: 'SanFranciscoDisplay-Bold',
								color: Theme.colors.cyan3,
							},
						]}
					>
						{calculateTotal(hasFreeDelivery)}
						{' ' + currency}
					</AppText>
				</View>
			</View>
		</View>
	);
};

export default CartSubTotals;
