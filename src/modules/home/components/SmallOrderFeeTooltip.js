import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StatusBar, Platform, StyleSheet } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import Foundation from 'react-native-vector-icons/Foundation'
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';

const SmallOrderFeeTooltip = ({ delivery_minimum_order_price, small_order_fee, style }) => {

    const [showTooltip, setToolTip] = useState(false);

    return <Tooltip
        isVisible={showTooltip}
        backgroundColor={'transparent'}
        content={
            <Text style={{ fontSize: 13, fontFamily: Theme.fonts.medium, color: Theme.colors.text }}>
                {
                    translate('cart.small_order_fee_desc').replace('{0}', delivery_minimum_order_price).replace('{1}', (small_order_fee ?? 0))
                }
            </Text>
        }
        placement="top"
        tooltipStyle={{ backgroundColor: 'transparent' }}
        topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
        contentStyle={{ elevation: 7, borderRadius: 8, }}
        arrowStyle={{ elevation: 8, }}
        showChildInTooltip={false}
        disableShadow={false}
        onClose={() => setToolTip(false)}
    >
        <TouchableOpacity onPress={() => setToolTip(true)}>
            <Foundation name="info" size={20} color={Theme.colors.gray7} />
        </TouchableOpacity>
    </Tooltip>
};

const styles = StyleSheet.create({
})
 
export default SmallOrderFeeTooltip;
