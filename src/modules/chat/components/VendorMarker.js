import React, { memo, useState } from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import WebView from 'react-native-webview';
import MapView, { Callout, PROVIDER_GOOGLE, Point, Marker } from "react-native-maps";
import FastImage from 'react-native-fast-image';
import Theme from "../../../theme";
import Config from '../../../config';
import { translate } from '../../../common/services/translate';
import Svg_vendor from '../../../common/assets/svgs/map/active_marker_restaurant.svg'
import Svg_inactive_vendor from '../../../common/assets/svgs/map/inactive_marker_restaurant.svg'
import Svg_pharmacy from '../../../common/assets/svgs/map/active_pharmacy.svg'
import Svg_inactive_pharmacy from '../../../common/assets/svgs/map/inactive_pharmacy.svg'
import Svg_grocery from '../../../common/assets/svgs/map/active_grocery.svg'
import Svg_inactive_grocery from '../../../common/assets/svgs/map/inactive_grocery.svg'
import { AppText } from '../../../common/components';
import { OrderType_Reserve } from '../../../config/constants';

const VendorMarker = ({ latitude, longitude, isActive = false, activeReserve = false, restaurant_id, restaurant, onGoVendor, onMarkerPress = () => { } }) => {

    return (
        <Marker
            tracksInfoWindowChanges={false}
            tracksViewChanges={false}
            coordinate={{
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
            }}
            onPress={onMarkerPress}
        >
            <View style={[Theme.styles.col_center,
            activeReserve == true &&
            restaurant.order_method != null &&
            restaurant.order_method.includes(OrderType_Reserve) && { paddingTop: 4, paddingRight: 4 }]}>
                {isActive ?
                    (restaurant.vendor_type == 'Pharmacy' ?
                        <Svg_pharmacy /> :
                        restaurant.vendor_type == 'Grocery' ?
                            <Svg_grocery /> :
                            <Svg_vendor />
                    )
                    :
                    (restaurant.vendor_type == 'Pharmacy' ?
                        <Svg_inactive_pharmacy /> :
                        restaurant.vendor_type == 'Grocery' ?
                            <Svg_inactive_grocery /> :
                            <Svg_inactive_vendor />
                    )
                }
                {
                    activeReserve == true &&
                    restaurant.order_method != null &&
                    restaurant.order_method.includes(OrderType_Reserve) &&
                    ((restaurant.reservation_reward_type == 'reward' && restaurant.reservation_rewards > 0) ||
                        (restaurant.reservation_reward_type == 'discount' && restaurant.reservation_discount > 0)) &&
                    <View style={[Theme.styles.col_center, styles.rateCircle]}>
                        <AppText style={styles.rateTxt}>
                            {restaurant.reservation_reward_type == 'reward' ? restaurant.reservation_rewards :
                                restaurant.reservation_discount}%
                        </AppText>
                    </View>
                }
            </View>

            {/* <Callout tooltip={true} onPress={event => { onGoVendor(restaurant) }}>
                <View>
                    <View style={{ width: 200, height: 80, backgroundColor: 'white', borderRadius: 12, alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                        <View style={{ width: '100%', paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            {
                                Config.isAndroid ? <Text style={{
                                    width: 30,
                                    height: 30,
                                    padding: 0,
                                    // resizeMode: 'contain',
                                    justifyContent: 'center',
                                    marginRight: 10,
                                    borderRadius: 6,
                                }}>
                                    <WebView style={{ height: 30, width: 30, }} source={{ uri: `${Config.WEB_PAGE_URL}${restaurant.logo_thumbnail_path}` }} />
                                </Text>
                                    :
                                    <FastImage
                                        style={{
                                            width: 30,
                                            height: 30,
                                            // resizeMode: 'contain',
                                            justifyContent: 'center',
                                            // backgroundColor: 'red',
                                            marginRight: 10,
                                            borderRadius: 6
                                        }}
                                        source={{ uri: `${Config.IMG_BASE_URL}${restaurant.logo_thumbnail_path}?w=200&h=200` }}
                                        resizeMode={FastImage.resizeMode.cover} />
                            }
                            <Text numberOfLines={1} style={{ flex: 1, color: Theme.colors.text, fontSize: 19, fontFamily: Theme.fonts.bold }}>{restaurant.title}</Text>
                        </View>
                        {
                            restaurant.distance != null && (
                                <Text style={{ color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, fontSize: 13, marginTop: 5 }}>
                                    {(parseFloat(restaurant.distance) / 1000).toFixed(2)} Km
                                </Text>
                            )}
                        {
                            restaurant.distance != null && (
                                (parseFloat(restaurant.distance) < 45) ?
                                    ((parseFloat(restaurant.distance) > 0 && parseFloat(restaurant.distance) <= 45)) &&
                                    <Text style={{ color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold, fontSize: 13, marginBottom: 5 }}>
                                        {translate('social.inside_restaurant')}
                                    </Text>
                                    :
                                    null
                            )}
                        {
                            (restaurant.distance != null &&
                                (parseFloat(restaurant.distance) > 45)) &&
                            (restaurant.zone != null ?
                                <Text style={{ color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold, fontSize: 13, marginBottom: 5 }}>{translate('social.in_delivery_range')}</Text>
                                :
                                <Text style={{ color: Theme.colors.gray7, fontFamily: Theme.fonts.semiBold, fontSize: 13, marginBottom: 5 }}>{translate('social.out_delivery_range')}</Text>
                            )
                        }

                    </View>
                    <View style={{ width: 20, height: 20, backgroundColor: 'white', transform: [{ rotate: '45deg' }], marginTop: -8, marginLeft: 90, zIndex: 0 }} />
                </View>  
            </Callout> */}
        </Marker>
    );
}

const styles = StyleSheet.create({
    rateCircle: { position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: 10, backgroundColor: Theme.colors.cyan2 },
    rateTxt: { fontSize: 7, lineHeight: 10, color: Theme.colors.white, fontFamily: Theme.fonts.semiBold }
});

function arePropsEqual(prevProps, nextProps) {
    return (prevProps.latitude == nextProps.latitude) && (prevProps.longitude == nextProps.longitude) &&
        (prevProps.restaurant_id == nextProps.restaurant_id) && (prevProps.distance == nextProps.distance) &&
        (prevProps.activeReserve == nextProps.activeReserve) &&
        (prevProps.hasZone == nextProps.hasZone) && (prevProps.isActive == nextProps.isActive);
}

export default React.memo(VendorMarker, arePropsEqual);
