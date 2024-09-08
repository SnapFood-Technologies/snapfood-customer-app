import React, { memo } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import { Pay_COD, Pay_Card, Pay_Apple, Pay_Paypal} from '../../../config/constants';

const methods = [Pay_COD, Pay_Paypal, Pay_Card, Pay_Apple];
const CashbackHitem = memo(({ data, onSelect, style }) => {
    return <TouchableOpacity onPress={() => onSelect()}
        style={[Theme.styles.col_center, styles.container, style]}>
        <View style={[Theme.styles.row_center_start, { width: '100%', marginBottom: 4, }]}>
            <Text style={[styles.title]}>{data.order_data != null ? data.order_data.title : ''}</Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }} />
            <Text style={styles.priceTxt}>{parseInt(data.amount)} L</Text>
        </View>
        <View style={[Theme.styles.row_center, Theme.styles.w100]}>
            <View style={[Theme.styles.col_center_start, { flex: 1, alignItems: 'flex-start' }]}>
                <Text style={[styles.descTxt]}>
                    {
                        (data.order_data != null && data.order_data.payment_methods_id > 0 && data.order_data.payment_methods_id < 5) ?
                            translate(methods[data.order_data.payment_methods_id - 1]) : ''
                    }
                </Text>
                <Text style={[styles.descTxt]}>{data.created_at}</Text>
            </View>
        </View>
    </TouchableOpacity>;
});

const styles = StyleSheet.create({
    container: { width: '100%', alignItems: 'flex-start', borderRadius: 15, backgroundColor: '#FAFAFC', padding: 15, },
    priceTxt: { fontSize: 18, color: Theme.colors.text, fontFamily: Theme.fonts.bold, },
    descTxt: { marginVertical: 4, fontSize: 16, color: Theme.colors.gray7, fontFamily: Theme.fonts.medium, },
    title: { fontSize: 18, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
})
export default CashbackHitem;
