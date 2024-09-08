import React, { useState } from 'react';
import { connect } from 'react-redux';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DeliveryType from '../../../common/components/vendors/DeliveryType';
import SmallOrderFeeTooltip from './SmallOrderFeeTooltip';
import Theme from '../../../theme';
import Config from '../../../config';
import { OrderType_Delivery, OrderType_Pickup, OrderType_Reserve } from '../../../config/constants'
import Svg_euro from '../../../common/assets/svgs/ic_euro.svg'
import { translate } from '../../../common/services/translate';
import { isEmpty } from '../../../common/services/utility';

const ShopInfoView = ({ data, handover_method, style, language }) => {

    console.log('ShopInfoView',);

    const getTags = () => {
        let tags_str = language == 'en' ? data.tags_en : data.tags;
        if (tags_str == null) { return []; }
        return tags_str.split(',');
    }

    return <View style={[Theme.styles.col_center_start, styles.container, style]}>
        <View style={[Theme.styles.row_center_start, styles.infoView]}>
            {/* <View style={[Theme.styles.col_center, styles.logoView]}> */}
            <FastImage source={{ uri: Config.IMG_BASE_URL + data.logo_thumbnail_path }} style={styles.logoView} resizeMode={FastImage.resizeMode.contain} />
            {/* </View> */}
            <View style={styles.infoRightView}>
                <View style={[Theme.styles.row_center, { marginTop: 8 }]}>
                    <Text style={styles.logoTxt}>{data.title}</Text>
                    <View style={data.is_open == 1 ? styles.activeIndicator : styles.inactiveIndicator} />
                </View>
                <Text style={[styles.descTxt, { width: '100%', textAlign: 'left' }]} numberOfLines={1} >{data.custom_text}</Text>
                {
                    data.rating_interval != null ?
                        <View style={[Theme.styles.row_center]}>
                            <AntDesign name="star" size={14} color={Theme.colors.gray5} />
                            <Text style={styles.descTxt}>{(parseFloat(data.rating_interval) / 2).toFixed(1)}</Text>
                        </View>
                        : <View style={{ height: 20 }} />
                }
            </View>
        </View>
        <View style={[Theme.styles.col_center, styles.featureView]}>
            {
                getTags().length > 0 &&
                <View style={[Theme.styles.row_center, styles.tagsView]}>
                    {
                        getTags().map((tag, index) =>
                            <View key={index} style={styles.tagItem}>
                                <Text style={styles.tagTxt}>{tag}</Text>
                            </View>
                        )
                    }
                </View>
            }
            {
                handover_method == OrderType_Delivery && (data.delivery_minimum_order_price != null && data.minimum_delivery_time != null) &&
                <View style={[Theme.styles.row_center, { width: '100%', marginTop: 7, }]}>
                    <Svg_euro />
                    <Text style={[styles.text]}>  {parseInt(data.delivery_minimum_order_price)} L  </Text>
                    <SmallOrderFeeTooltip delivery_minimum_order_price={data.delivery_minimum_order_price}
                        small_order_fee={data.small_order_fee}
                    />
                    <Text style={[styles.text]}>    |    </Text>
                    <MaterialIcons name="access-time" size={18} color={Theme.colors.gray7} style={{ marginRight: 6 }} />
                    <Text style={[styles.text]}>
                        {!isEmpty(data.min_delivery_time) ? `${data.min_delivery_time} - ` : ''}{data.minimum_delivery_time} {translate('vendor_profile.mins')}
                    </Text>
                </View>
            }
            {
                handover_method == OrderType_Pickup &&
                <View style={[Theme.styles.row_center, { width: '100%', marginTop: 7, }]}>
                    {
                        data.distance != null && parseFloat(data.distance) > 0 &&
                        <React.Fragment>
                            <Entypo name="location-pin" size={18} color={Theme.colors.gray7} style={{ marginRight: 4 }} />
                            <Text style={[styles.text]}>{(parseFloat(data.distance) / 1000).toFixed(2)} Km    |    </Text>
                        </React.Fragment>
                    }
                    <MaterialIcons name="access-time" size={18} color={Theme.colors.gray7} style={{ marginRight: 6 }} />
                    <Text style={[styles.text]}>{data.max_pickup_time} {translate('vendor_profile.mins')}</Text>
                </View>
            }
            {
                handover_method == OrderType_Reserve &&
                <View style={[Theme.styles.row_center, { width: '100%', marginTop: 7, }]}>
                    {
                        data.distance != null && parseFloat(data.distance) > 0 &&
                        <React.Fragment>
                            <Entypo name="location-pin" size={18} color={Theme.colors.gray7} style={{ marginRight: 4 }} />
                            <Text style={[styles.text]}>{(parseFloat(data.distance) / 1000).toFixed(2)} Km</Text>
                        </React.Fragment>
                    }
                </View>
            }
            {
                handover_method == OrderType_Delivery && <DeliveryType type={data.delivery_type} vendor_type={data.vendor_type} />
            }
        </View>
    </View>;
};

const styles = StyleSheet.create({
    container: { width: '100%', },
    infoView: { width: '100%', height: 150, paddingHorizontal: 20, paddingBottom: 10, alignItems: 'flex-end', },
    infoRightView: { flex: 1, marginLeft: 8, justifyContent: 'center', alignItems: 'flex-start' },
    logo: { width: 68, height: 68, borderRadius: 15, backgroundColor: Theme.colors.white, },
    logoView: { width: 80, height: 80, borderWidth: 1, borderColor: Theme.colors.gray9, borderRadius: 15, backgroundColor: Theme.colors.white, },
    logoTxt: { marginRight: 8, fontSize: 20, fontFamily: Theme.fonts.bold, color: Theme.colors.white },
    descTxt: { margin: 2, textAlign: 'center', fontSize: 17, fontFamily: Theme.fonts.medium, color: Theme.colors.gray5 },
    activeIndicator: { marginTop: 4, width: 7, height: 7, borderRadius: 4, backgroundColor: '#0f0' },
    inactiveIndicator: { marginTop: 4, width: 7, height: 7, borderRadius: 4, backgroundColor: '#f00', },
    featureView: {
        width: '100%', paddingVertical: 7, paddingHorizontal: 20, backgroundColor: Theme.colors.white,
    },
    smallorder_txt: { marginTop: 14, marginBottom: 7, fontSize: 13, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7, },
    tagsView: { width: '100%', flexWrap: 'wrap', },
    tagItem: { height: 25, margin: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7, backgroundColor: '#50b7ed26' },
    tagTxt: { fontFamily: Theme.fonts.semiBold, fontSize: 15, lineHeight: 16, color: Theme.colors.cyan2, },
    text: { fontSize: 16, color: Theme.colors.gray7, fontFamily: Theme.fonts.medium, },
    divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9, },
    delivery_type_txt: { marginVertical: 8, fontSize: 16, color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold, },

})
const mapStateToProps = ({ app }) => ({
    user: app.user,
    language: app.language,
});

export default connect(mapStateToProps, {
})(ShopInfoView);
