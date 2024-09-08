import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StatusBar, Platform, StyleSheet } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';

const VendorItemPaymentTooltip = ({ type = 'card' }) => {
    const [showTooltip, setToolTip] = useState(false);

    return <Tooltip
        isVisible={showTooltip}
        backgroundColor={'transparent'}
        content={
            <Text style={{ fontSize: 13, fontFamily: Theme.fonts.medium, color: Theme.colors.text }}>
                {
                    type == 'card' ? translate('credit_card') : translate('cash')
                }
            </Text>
        }
        placement="top"
        tooltipStyle={{ backgroundColor: 'transparent', }}
        topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
        contentStyle={{ elevation: 7, borderRadius: 8, }}
        arrowStyle={{ elevation: 8 }}
        showChildInTooltip={false}
        disableShadow={false}
        onClose={() => setToolTip(false)}
    >
        <TouchableOpacity onPress={() => setToolTip(true)} style={[Theme.styles.row_center_start, ]}>
            {
                type == 'card' ?
                    <Entypo name="credit-card" size={18} color={Theme.colors.gray7} style={{ marginRight: 4 }} />
                    :
                    <MaterialCommunityIcons name="cash" size={25} color={Theme.colors.gray7} style={{ marginRight: 4 }} />
            }
        </TouchableOpacity>
    </Tooltip>
};

function arePropsEqual(prevProps, nextProps) {
    return prevProps.type == nextProps.type;
}

export default React.memo(VendorItemPaymentTooltip, arePropsEqual);