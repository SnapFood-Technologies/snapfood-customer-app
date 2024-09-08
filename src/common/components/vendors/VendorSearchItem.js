import React, { useEffect, useState, useMemo } from 'react';
import { TouchableOpacity, ImageBackground, View, Text, StyleSheet, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import { width } from 'react-native-dimension';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppText from '../AppText';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import Config from '../../../config';
import { toggleFavourite } from '../../../store/actions/vendors';
// svgs
import VendorItemPaymentTooltip from '../../../modules/home/components/VendorItemPaymentTooltip';
import { isEmpty, getOpenTime } from '../../services/utility';

const VendorSearchItem = (props) => {
    const { data, onSelect, style } = props

    return <TouchableOpacity
        style={[Theme.styles.col_center, styles.container, style]}
        onPress={() => { onSelect() }}
    >
        <View
            style={[Theme.styles.row_center_start, { width: '100%', }]}>
            <View style={[Theme.styles.col_center, styles.logoView]}>
                <FastImage
                    source={{ uri: `${Config.IMG_BASE_URL}${data.logo_thumbnail_path}?w=200&h=200` }}
                    style={styles.logoimg}
                    resizeMode={FastImage.resizeMode.contain}
                />
            </View>
            <AppText style={[styles.title]} numberOfLines={1}>{data.title}</AppText>
        </View>
        <View style={[Theme.styles.row_center_start, { width: '100%', paddingLeft: 2, marginTop: 6 }]}>
            <View style={[Theme.styles.row_center,]}>
                <AntDesign name="star" size={19} color={Theme.colors.gray7} style={{ marginRight: 6 }} />
                <AppText style={[styles.text]}>{(parseFloat(data.rating_interval) / 2).toFixed(1)}</AppText>
                <AppText style={[styles.text, { lineHeight: 16, paddingHorizontal: 10 }]}>|</AppText>
            </View>
            <VendorItemPaymentTooltip type='cash' />
            {
                data.online_payment == 1 &&
                <VendorItemPaymentTooltip type='card' />
            }
            <AppText style={[styles.text, { lineHeight: 16, paddingHorizontal: 10 }]}>|</AppText>
            <MaterialIcons name="access-time" size={19} color={Theme.colors.gray7} style={{ marginRight: 6 }} />
            <AppText style={[styles.text,]}>
                {!isEmpty(data.min_delivery_time) ? `${data.min_delivery_time} - ` : ''}{data.minimum_delivery_time} {translate('vendor_profile.mins')}
            </AppText>
        </View>
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    container: { width: '100%', alignItems: 'center', backgroundColor: Theme.colors.white, },
    logoView: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#F6F6F9' },
    logoimg: { width: 45, height: 45, resizeMode: 'contain', borderRadius: 8, },
    activeIndicator: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#0f0' },
    inactiveIndicator: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#f00', },
    title: { flex: 1, fontSize: 21, color: Theme.colors.text, fontFamily: Theme.fonts.bold, marginLeft: 6 },
    text: { fontSize: 15, lineHeight: 15, color: Theme.colors.gray7, fontFamily: Theme.fonts.medium, },
})

function arePropsEqual(prevProps, nextProps) {
    if (prevProps.isFav != nextProps.isFav ||
        prevProps.vendor_id != nextProps.vendor_id ||
        prevProps.is_open != nextProps.is_open ||
        prevProps.online_payment != nextProps.online_payment ||
        (prevProps.data?.selected_order_method != nextProps.data?.selected_order_method)
    ) {
        console.log('vendor item equal : ', prevProps.data.title, false)
        return false;
    }
    return true;
}

const mapStateToProps = ({ app, shop }) => ({
    language: app.language,
    isLoggedIn: app.isLoggedIn,
});
export default connect(mapStateToProps, { toggleFavourite })(React.memo(VendorSearchItem, arePropsEqual));
