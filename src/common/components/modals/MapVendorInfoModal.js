import { TouchableOpacity, View, Text, StyleSheet, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import StarRating from 'react-native-star-rating';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Theme from '../../../theme';
import { isEmpty, getImageFullURL } from '../../../common/services/utility';
import { translate } from '../../services/translate';
import RouteNames from '../../../routes/names';
import AppText from '../AppText';
import Svg_pickup from '../../assets/svgs/vendor/pickup.svg'
import Svg_reserve from '../../assets/svgs/vendor/reserve.svg'
import Svg_delivery from '../../assets/svgs/vendor/delivery.svg'
import { OrderType_Delivery, OrderType_Pickup, OrderType_Reserve } from '../../../config/constants';
import Config from '../../../config'
import AppTooltip from '../AppTooltip';
import { convertTimeString2Hours } from '../../../common/services/utility';
import moment from 'moment';

const MapVendorInfoModal = ({ showModal, onClose, data, activeReserve = false, navigation, onGoVendor, onGoVendorMap }) => {
    const [visible, SetVisible] = useState(showModal)
    const [hours, setReserveHours] = useState([])

    useEffect(() => {
        SetVisible(showModal)
    }, [showModal])

    useEffect(() => {
        if (activeReserve == true && data.order_method != null && data.order_method.includes(OrderType_Reserve)) {
            let _times = [];
            for (let j = 0; j < data.reservation_hours.length; j++) {
                const reserveDay = data.reservation_hours[j];

                const time_now = convertTimeString2Hours(moment(new Date()).format('H:m:s'));
                const time_open = convertTimeString2Hours(reserveDay.time_open);
                const time_close = convertTimeString2Hours(reserveDay.time_close);

                for (let k = Math.max(time_now, time_open); k <= time_close; k = k + 0.5) {
                    let _time = null;
                    if (((k - Math.floor(k)) >= 0.5) && ((Math.floor(k) + 1) < time_close)) {
                        _time = `${Math.floor(k) + 1}:00`;
                    }
                    else if (((k - Math.floor(k)) < 0.5) && ((Math.floor(k) + 0.5) < time_close)) {
                        _time = `${Math.floor(k)}:30`;
                    }
                    if (_time != null && _times.findIndex(t => t == _time) == -1) {
                        _times.push(_time);
                    }
                }
            }
            setReserveHours(_times);
        }

    }, [activeReserve, data]);

    return <Modal
        testID={'modal'}
        isVisible={visible}
        onBackdropPress={onClose}
        onSwipeComplete={onClose}
        backdropOpacity={0.33}
        swipeDirection={['down']}
        style={{ justifyContent: 'flex-end', margin: 0 }}>
        <View style={[styles.modalVendorContent]}>
            <View style={[Theme.styles.row_center, { width: '100%' }]}>
                <TouchableOpacity onPress={onGoVendor} style={{ marginRight: 11 }}>
                    <FastImage
                        source={{ uri: `${Config.IMG_BASE_URL}${data.logo_thumbnail_path}?w=200&h=200` }}
                        style={styles.logoimg}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                </TouchableOpacity>

                <View style={[Theme.styles.flex_1,]}>
                    <TouchableOpacity onPress={onGoVendor}>
                        <AppText style={styles.title}>{data.title}</AppText>
                    </TouchableOpacity>
                    <View style={[Theme.styles.row_center, { width: '100%', justifyContent: 'flex-start', paddingRight: 70, }]}>
                        {
                            !isEmpty(data.custom_text) &&
                            <AppText style={{ ...styles.distance }} numberOfLines={1}>{data.custom_text}</AppText>
                        }
                        {
                            !isEmpty(data.custom_text) &&
                            <AppText style={styles.dot}> · </AppText>
                        }
                        {
                            data.distance > 0 &&
                            <AppText style={styles.distance}>{data.distance > 1000 ? (parseFloat(data.distance / 1000).toFixed(2) + ' km') : (parseInt(data.distance) + ' m')}</AppText>
                        }
                    </View>
                    <View style={[Theme.styles.row_center, { marginTop: 3, width: '100%', justifyContent: 'flex-start' }]}>
                        <StarRating
                            disabled={true}
                            maxStars={5}
                            rating={data.rating_interval > 0 ? (data.rating_interval / 2) : 0}
                            starSize={16}
                            fullStarColor={Theme.colors.cyan2}
                            emptyStar={'star'}
                            emptyStarColor={'#d9d9d9'}
                            starStyle={{ marginRight: 4 }}
                        />
                        <AppText style={styles.dot}> ·  </AppText>
                        {
                            data.order_method != null &&
                            data.order_method.includes(OrderType_Pickup) &&
                            <Svg_pickup style={{ marginRight: 10 }} />
                        }
                        {
                            data.order_method != null &&
                            data.order_method.includes(OrderType_Reserve) &&
                            <Svg_reserve style={{ marginRight: 10 }} />
                        }
                        {
                            data.order_method != null &&
                            data.order_method.includes(OrderType_Delivery) &&
                            <Svg_delivery style={{ marginRight: 10 }} />
                        }
                    </View>
                </View>
                {
                    (activeReserve == true &&
                        data.order_method != null &&
                        data.order_method.includes(OrderType_Reserve) &&
                        ((data.reservation_reward_type == 'reward' && data.reservation_rewards > 0) ||
                            (data.reservation_reward_type == 'discount' && data.reservation_discount > 0))) ?
                        <AppTooltip
                            title={data.reservation_reward_type == 'reward' ?
                                translate('social.reservation_reward_tooltip_title') : translate('social.reservation_discount_tooltip_title')}
                            description={data.reservation_reward_type == 'reward' ?
                                translate('social.reservation_reward_tooltip_description').replace('x%', `${data.reservation_rewards}%`) :
                                translate('social.reservation_discount_tooltip_description').replace('x%', `${data.reservation_discount}%`)}
                            anchor={
                                <View style={[Theme.styles.col_center, styles.rewardsView]}>
                                    <AppText style={styles.rewardsValue}>
                                        {data.reservation_reward_type == 'reward' ? data.reservation_rewards : data.reservation_discount}%
                                    </AppText>
                                    <AppText style={styles.rewardsLabel}>
                                        {
                                            data.reservation_reward_type == 'reward' ? translate('social.rewards') : translate('social.discount')
                                        }
                                    </AppText>
                                </View>
                            }
                        />
                        : <View style={{ width: 70 }} />
                }
            </View>
            <View style={[Theme.styles.col_center, styles.vendorInfo]}>
                <TouchableOpacity
                    onPress={onGoVendorMap}
                    style={[Theme.styles.row_center, {
                        width: '100%', paddingBottom: 12,
                    }]}>
                    <Octicons name={'location'} size={18} color={Theme.colors.text1} />
                    <AppText numberOfLines={2} style={styles.address}>{data.address}</AppText>
                    <Feather name={'chevron-right'} size={18} color={Theme.colors.text1} />
                </TouchableOpacity>

                <View style={[Theme.styles.row_center, styles.reservationTimes]}>
                    <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{ width: '100%' }}>
                        <View style={[Theme.styles.row_center,]}>
                            <TouchableOpacity style={[Theme.styles.col_center, styles.walkinBtn]} onPress={onGoVendorMap}>
                                <AppText style={styles.walkinBtnTxt}>{translate('social.walkin')}</AppText>
                            </TouchableOpacity>
                            {
                                activeReserve == true &&
                                data.order_method != null &&
                                data.order_method.includes(OrderType_Reserve) &&
                                hours.map(h =>
                                    <TouchableOpacity key={h} style={[Theme.styles.col_center, styles.timeBtn]}
                                        onPress={onGoVendor}
                                    >
                                        <AppText style={styles.timeBtnTxt}>{h}</AppText>
                                    </TouchableOpacity>
                                )
                            }
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    </Modal>
};

const styles = StyleSheet.create({
    modalVendorContent: { width: '100%', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 35, backgroundColor: Theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    title: { fontSize: 18, lineHeight: 24, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text1, },
    distance: { fontSize: 16, lineHeight: 22, fontFamily: Theme.fonts.semiBold, color: '#97ADB6' },
    logoimg: {
        width: 55,
        height: 55,
        borderRadius: 30,
    },
    rewardsView: { borderRadius: 6, backgroundColor: Theme.colors.cyan2, paddingVertical: 5, paddingHorizontal: 8 },
    rewardsLabel: { fontSize: 15, lineHeight: 18, color: '#fff', fontFamily: Theme.fonts.medium },
    rewardsValue: { fontSize: 18, lineHeight: 24, color: '#fff', fontFamily: Theme.fonts.semiBold },
    vendorInfo: {
        marginTop: 20,
        backgroundColor: '#fff',
        width: '100%', borderRadius: 19, padding: 12,
        elevation: 2,
        shadowColor: Theme.colors.blackPrimary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    address: { flex: 1, paddingLeft: 8, fontSize: 16, lineHeight: 20, color: Theme.colors.text1, fontFamily: Theme.fonts.medium },
    reservationTimes: { paddingTop: 12, justifyContent: 'flex-start', width: '100%', borderTopWidth: 1, borderTopColor: '#ececec' },
    timeBtn: { borderRadius: 8, backgroundColor: '#f4f4f4', paddingHorizontal: 17, paddingVertical: 5, marginRight: 10 },
    timeBtnTxt: { fontSize: 15, lineHeight: 18, color: Theme.colors.text1, fontFamily: Theme.fonts.semiBold },
    walkinBtn: { borderRadius: 8, backgroundColor: Theme.colors.cyan2, paddingHorizontal: 17, paddingVertical: 5, marginRight: 10 },
    walkinBtnTxt: { fontSize: 15, lineHeight: 18, color: Theme.colors.white, fontFamily: Theme.fonts.semiBold },
    dot: { fontSize: 22, lineHeight: 22, fontFamily: Theme.fonts.bold, color: '#97ADB6' }
})


export default MapVendorInfoModal;