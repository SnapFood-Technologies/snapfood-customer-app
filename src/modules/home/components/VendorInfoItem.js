import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StatusBar, Platform, StyleSheet } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import Foundation from 'react-native-vector-icons/Foundation'
import { translate } from '../../../common/services/translate';
import SmallOrderFeeTooltip from './SmallOrderFeeTooltip';
import Theme from '../../../theme';


const VendorInfoItem = ({ data, style }) => {

    const [showTooltip, setToolTip] = useState(false);

    console.log('vendor info item')

    return <TouchableOpacity activeOpacity={1} style={[Theme.styles.col_center, styles.container, style]}>
        <View style={[Theme.styles.row_center_start, { width: '100%', marginBottom: 12, }]}>
            <Text style={[styles.title]}>{translate('vendor_profile.offers_method')} {translate(data.order_method)}</Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
            </View>
        </View>

        <View style={[styles.infoRow, Theme.styles.w100]}>
            <Text style={[styles.descTxt]}>{translate('vendor_profile.delivery_fee')} : {data.delivery_fee ?? 0} L</Text>
        </View>
        <View style={[styles.infoRow, Theme.styles.w100, { marginTop: 5 }]}>
            <Text style={[styles.descTxt,]}>{translate('vendor_profile.delivery_time')} : {data.minimum_delivery_time ?? 0} {translate('vendor_profile.mins')}</Text>
        </View>
        <View style={[styles.infoRow, Theme.styles.w100, { marginTop: 5 }]}>
            <View style={[Theme.styles.row_center_start, { flex: 1, }]}>
                <Text style={[styles.smallOrderFeeText,]}>{translate('vendor_profile.min_order')}</Text>
                <SmallOrderFeeTooltip delivery_minimum_order_price={data.delivery_minimum_order_price}
                    small_order_fee={data.small_order_fee}
                />
                <Text style={[styles.smallOrderFeeText]}> :   {data.delivery_minimum_order_price ?? 0} L</Text>
            </View>
        </View>
        <View style={[styles.infoRow, Theme.styles.w100, { marginTop: 5 }]}>
            <View style={[Theme.styles.row_center_start, { flex: 1, }]}>
                <Text style={[styles.smallOrderFeeText]}>{translate('vendor_profile.small_order_fee')}</Text>
                <SmallOrderFeeTooltip delivery_minimum_order_price={data.delivery_minimum_order_price}
                    small_order_fee={data.small_order_fee}
                />
                <Text style={[styles.smallOrderFeeText]}> :   {data.small_order_fee ?? 0} L</Text>
            </View>
        </View>
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    container: { width: '100%', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 15, backgroundColor: '#FAFAFC', padding: 12, },
    title: { fontSize: 17, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
    descTxt: { flex: 1, fontSize: 16, color: Theme.colors.gray7, fontFamily: Theme.fonts.medium, },
    infoRow: { flexDirection: 'row', justifyContent: 'flex-start', },
    smallOrderFeeText: { marginRight: 4, fontSize: 16, color: Theme.colors.gray7, fontFamily: Theme.fonts.medium, },
})

function arePropsEqual(prevProps, nextProps) {
    if (prevProps.vendor_id != nextProps.vendor_id) {
        return false;
    }
    return true;
}

export default React.memo(VendorInfoItem, arePropsEqual);
