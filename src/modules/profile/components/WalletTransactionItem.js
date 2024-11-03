import React, { memo } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import { Pay_COD, Pay_Card, Pay_Apple, Pay_Paypal } from '../../../config/constants';
import Svg_cashback from '../../../common/assets/svgs/wallet/cashback.svg';
import Svg_earn from '../../../common/assets/svgs/wallet/earn.svg';
import Svg_deposit from '../../../common/assets/svgs/wallet/deposit.svg';
import Svg_visa from '../../../common/assets/svgs/cart/visa.svg';
import Svg_mastercard from '../../../common/assets/svgs/cart/mastercard.svg';

const WalletTransactionItem = memo(({ data, onSelect, style }) => {
    if (data.type == 'cashback') {
        return <TouchableOpacity onPress={() => onSelect()}
            style={[Theme.styles.row_center, styles.container, style]}>
            <Svg_cashback />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.title}>{translate('wallet.cashback')}</Text>
                {
                    data.category == 'cashback_level_earning' &&
                    <Text style={styles.descTxt}>{translate('wallet.order_from')} {data.order_data != null ? data.order_data.title : ''}</Text>
                }
                {
                    data.category == 'cashback_use_order' &&
                    <Text style={styles.descTxt}>{translate('wallet.used_on_order')}</Text>
                }
                {
                    data.category == 'cashback_back_from_order' &&
                    <Text style={styles.descTxt}>{translate('wallet.cashback_return')}</Text>
                }
                {
                    data.category == 'cashback_expired_revoke' &&
                    <Text style={styles.descTxt}>{translate('wallet.cashback_expired')}</Text>
                }
            </View>
            <Text style={styles.priceTxt}>{parseInt(data.amount) > 0 ? '+' : ''} {parseInt(data.amount)} L</Text>
        </TouchableOpacity>;
    }
    if (data.type == 'earn') {
        return <TouchableOpacity onPress={() => onSelect()}
            style={[Theme.styles.row_center, styles.container, style]}>
            <Svg_earn />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.title}>
                    {(data.category == 'reservation_rewards') ?
                        translate('wallet.reserve_reward')
                        :
                        translate('wallet.earned_reward')
                    }
                </Text>
                <Text style={styles.descTxt}>
                    {(data.category == 'reservation_rewards') ?
                        translate('wallet.earn_reserve_order')
                        :
                        translate('wallet.earning')
                    }
                </Text>
            </View>
            <Text style={styles.priceTxt}>{parseInt(data.amount) > 0 ? '+' : ''} {parseInt(data.amount)} L</Text>
        </TouchableOpacity>;
    }
    if (data.type == 'referral') {
        return <TouchableOpacity onPress={() => onSelect()}
            style={[Theme.styles.row_center, styles.container, style]}>
            <Svg_earn />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.title}>{translate('wallet.referral_reward')}</Text>
                <Text style={styles.descTxt}>{translate('wallet.invitation')}</Text>
            </View>
            <Text style={styles.priceTxt}>{parseInt(data.amount) > 0 ? '+' : ''} {parseInt(data.amount)} L</Text>
        </TouchableOpacity>;
    }
    if (data.type == 'deposit') {
        return <TouchableOpacity onPress={() => onSelect()}
            style={[Theme.styles.row_center, styles.container, style]}>
            <Svg_deposit />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.title}>
                    {
                        (data.category == 'transfer_deposit' || data.category == 'received_deposit') ?
                            translate('wallet.new_transfer') : translate('wallet.deposit')
                    }
                </Text>
                {
                    data.category == 'deposit_from_snapfood' &&
                    <Text style={styles.descTxt}>{translate('wallet.deposit_snapfood')}</Text>
                }
                {
                    data.category == 'deposit_revoke_snapfood' &&
                    <Text style={styles.descTxt}>{translate('wallet.deposit_revoke_snapfood')}</Text>
                }
                {
                    data.category == 'stripe_card_deposit' &&
                    <Text style={styles.descTxt}>{translate('wallet.deposit_stripe_card')}</Text>
                }
                {
                    data.category == 'transfer_deposit' &&
                    <Text style={styles.descTxt}>{translate('wallet.transfered_to')} {data.user_data?.full_name}</Text>
                }
                {
                    data.category == 'received_deposit' &&
                    <Text style={styles.descTxt}>{translate('wallet.received_from')} {data.user_data?.full_name}</Text>
                }
                {
                    data.category == 'blog_quiz_earning' &&
                    <Text style={styles.descTxt}>{translate('wallet.blog_quiz_earning')}</Text>
                }
            </View>
            <Text style={styles.priceTxt}>{parseInt(data.amount) > 0 ? '+' : ''} {parseInt(data.amount)} L</Text>
        </TouchableOpacity>;
    }
    return null;
});

const styles = StyleSheet.create({
    container: { borderRadius: 12, padding: 16, backgroundColor: Theme.colors.gray9, width: '100%', marginBottom: 12, },
    priceTxt: { fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.red1 },
    descTxt: { marginTop: 3, fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    title: { fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
})
export default WalletTransactionItem;
