import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StatusBar, Platform, StyleSheet } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import Foundation from 'react-native-vector-icons/Foundation'
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import { AppText } from '../../../common/components';

const VendorItemSmallOrderFeeTooltip = ({ delivery_minimum_order_price, small_order_fee, isOpen, title, style, onSelect }) => {

    const [showTooltip, setToolTip] = useState(false);

    return <Tooltip
        isVisible={showTooltip}
        backgroundColor={'transparent'}
        content={
            <Text style={{ fontSize: 12, fontFamily: Theme.fonts.medium, color: Theme.colors.text }}>
                {
                    (isOpen ? translate('open') : translate('closed'))
                    //   (isOpen ? translate('open') : translate('closed') ) + ' - ' + translate('cart.small_order_fee_desc').replace('{0}', delivery_minimum_order_price).replace('{1}', (small_order_fee ?? 0))
                }
            </Text>
        }
        placement="top"
        tooltipStyle={{ backgroundColor: 'transparent', left: 10, }}
        topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
        contentStyle={{ elevation: 7, borderRadius: 8, }}
        arrowStyle={{ elevation: 8 }}
        showChildInTooltip={false}
        disableShadow={false}
        onClose={() => setToolTip(false)}
    >
        <View  style={[Theme.styles.row_center_start, { width: '100%' }]}>
            <TouchableOpacity onPress={() => onSelect()}>
                <AppText style={[styles.title]} numberOfLines={1} ellipsizeMode={'tail'}>{title}</AppText>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => setToolTip(true)} style={isOpen == 1 ? styles.activeIndicator : styles.inactiveIndicator} /> */}
            <View style={{ flex: 1 }} />
        </View>
    </Tooltip>
};

const styles = StyleSheet.create({
    activeIndicator: { width: 10, height: 10, borderRadius: 6, backgroundColor: '#0f0', marginTop: 2, marginRight: 3 },
    inactiveIndicator: { width: 10, height: 10, borderRadius: 6, backgroundColor: '#f00', marginTop: 2, marginRight: 3 },
    title: { position: 'absolute', left: 6, top: -37, fontSize: 21, color: Theme.colors.white, fontFamily: Theme.fonts.bold},
})

export default VendorItemSmallOrderFeeTooltip;
