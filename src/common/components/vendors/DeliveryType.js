import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StatusBar, View, Text, StyleSheet, Platform } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import AppText from '../AppText';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
// svgs 
import Svg_bike from '../../../common/assets/svgs/vendor/bike.svg'
import Svg_snapfood from '../../../common/assets/svgs/vendor/snapfood.svg'

const DeliveryType = ({ type, vendor_type }) => {
    const [showTooltip, setToolTip] = useState(false);

    if (type == 'Snapfood') {
        return (
            <Tooltip
                isVisible={showTooltip}
                backgroundColor={'transparent'}
                content={
                    <View style={styles.tooltip}>
                        <AppText style={styles.title}>{translate('tooltip.what_means')}</AppText>
                        <AppText style={styles.description}> {translate('tooltip.snapfood_delivery_desc')} </AppText>
                        <View style={{ height: 10 }}></View>
                        <TouchableOpacity onPress={() => setToolTip(false)}><AppText style={styles.dismiss}>{translate('tooltip.dismiss')}</AppText></TouchableOpacity>
                    </View>
                }
                placement="top"
                tooltipStyle={{ backgroundColor: 'transparent' }}
                topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
                contentStyle={{ elevation: 7, borderRadius: 20, }}
                arrowStyle={{ elevation: 8, }}
                showChildInTooltip={false}
                disableShadow={false}
                onClose={() => setToolTip(false)}
            >
                <TouchableOpacity style={[Theme.styles.row_center, { marginVertical: 8 }]} onPress={() => setToolTip(!showTooltip)}>
                    <Svg_snapfood />
                    <AppText style={styles.anchor}>{translate('vendor_profile.snapfood_delivery')}</AppText>
                </TouchableOpacity>
            </Tooltip>
        )
    }
    return (
        <Tooltip
            isVisible={showTooltip}
            backgroundColor={'transparent'}
            content={
                <View style={styles.tooltip}>
                    <AppText style={styles.title}>{translate('tooltip.what_means_' + vendor_type)}</AppText>
                    <AppText style={styles.description}> {translate('tooltip.own_delivery_desc_' + vendor_type)} </AppText>
                    <TouchableOpacity onPress={() => setToolTip(false)}><AppText style={styles.dismiss}>{translate('tooltip.dismiss')}</AppText></TouchableOpacity>
                </View>
            }
            placement="top"
            tooltipStyle={{ backgroundColor: 'transparent' }}
            topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
            contentStyle={{ elevation: 7, borderRadius: 20, }}
            arrowStyle={{ elevation: 8, }}
            showChildInTooltip={false}
            disableShadow={false}
            onClose={() => setToolTip(false)}
        >
            <TouchableOpacity style={[Theme.styles.row_center, { marginVertical: 8 }]} onPress={() => setToolTip(!showTooltip)}>
                <Svg_bike />
                <AppText style={styles.anchor}>{translate('vendor_profile.store_delivery_' + vendor_type)}</AppText>
            </TouchableOpacity>
        </Tooltip>
    )
};

const styles = StyleSheet.create({
    title: { fontSize: 16, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
    description: { fontSize: 15, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    dismiss: { fontSize: 14, fontFamily: Theme.fonts.medium, color: Theme.colors.red1, textAlign: 'center' },
    tooltip: { backgroundColor: '#fff', borderRadius: 20, padding: 16, },
    anchor: {
        paddingLeft: 4, fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text,
        textDecorationLine: 'underline', textDecorationColor: Theme.colors.text
    }
})

function arePropsEqual(prevProps, nextProps) {
    return prevProps.type == nextProps.type && prevProps.vendor_type == nextProps.vendor_type;
}

export default React.memo(DeliveryType, arePropsEqual);
