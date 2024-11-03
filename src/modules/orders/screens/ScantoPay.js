import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment';
import { RNCamera } from 'react-native-camera';
import Spinner from 'react-native-loading-spinner-overlay';
import Octicons from 'react-native-vector-icons/Octicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { setTmpOrder } from '../../../store/actions/app';
import { translate, getLanguage } from '../../../common/services/translate';
import Theme from '../../../theme';
import Header1 from '../../../common/components/Header1';
import { AppText } from '../../../common/components';
import FastImage from 'react-native-fast-image';
import Config from '../../../config'
import { width } from 'react-native-dimension';
import apiFactory from '../../../common/services/apiFactory';
import RouteNames from '../../../routes/names';
import alerts from '../../../common/services/alerts';
import { isEmpty } from 'lodash';
import { getOrderDetail } from '../../../store/actions/orders';
import AppTooltip from '../../../common/components/AppTooltip';
import Svg_scan from '../../../common/assets/svgs/scan.svg';

const ScantoPay = (props) => {
    const order = props.order;
    const _camera = useRef(null);
    const [loadingCard, setLoadingCard] = useState(false);

    const _loading = useRef(false);
    const [loading, setLoading] = useState(false);
    const [card, setCard] = useState(null);
    const [rewardsRate, setRewardRate] = useState(null);

    useEffect(() => {
        loadPaymentMethods();
    }, [props.user.default_card_id]);

    useEffect(() => {
        getReservationRewards();
    }, [])

    const updateQrLoading = (v) => {
        _loading.current = v;
        setLoading(v);
    }

    const getReservationRewards = () => {
        apiFactory.get(`checkout/get-vendor-reservation-rewards?order_id=${order?.id}`).then(
            ({ data }) => {
                setRewardRate(data.rate);
            },
            (error) => {
                
            }
        );
    }

    const loadPaymentMethods = () => {
        setLoadingCard(true);
        apiFactory.get(`stripe/payment-methods`).then(
            ({ data }) => {
                setLoadingCard(false);
                let loadedCards = data || [];

                let found_index = loadedCards.findIndex((card) => card.id == props.user.default_card_id);
                if (found_index == -1) {
                    setCard(loadedCards.length > 0 ? loadedCards[0] : null);
                } else {
                    setCard(loadedCards[found_index]);
                }
            },
            (error) => {
                setLoadingCard(false);
                
                // const message = error.message || translate('generic_error');
                // alerts.error(translate('alerts.error'), message);
            }
        );
    };

    const onGoChangeCard = () => {
        if (card?.id != null) {
            props.navigation.navigate(RouteNames.PaymentMethodsScreen, { goBackAfterSuccess: true })
        }
        else {
            props.navigation.navigate(RouteNames.NewCardScreen)
        }
    }

    const onValidateQrcode = (qr_string) => {
        if (_loading.current == true || isEmpty(card?.id)) { return; }

        if (qr_string === 'ios_purpose') {
            updateQrLoading(true);
            apiFactory.post('checkout/pay-order', { order_id: order.id, card_id: card.id, from_scan: 1 }).then(() => {
                getOrderDetail(order.id)
                    .then((order_data) => {
                        setLoading(false)
                        props.setTmpOrder(order_data);

                        alerts.info('', translate('scan_to_pay.scan_pay_success')).then((res) => {
                            props.navigation.goBack();
                        });
                    })
                    .catch((error) => {
                        updateQrLoading(false);
                        props.navigation.goBack();
                    });
            }, error => {
                updateQrLoading(false);
                const message = error.message || translate('generic_error');
                alerts.error(translate('alerts.error'), message);
            });
        }
        else {
            alerts.error(null, translate('scan_to_pay.invalid_qr_code'))
        }
    }

    return (
        <View style={styles.container}>
            <Spinner visible={loading} />
            <Header1
                style={{ marginTop: 20, marginBottom: 0, paddingHorizontal: 20, }}
                onLeft={() => {
                    props.navigation.goBack();
                }}
                title={translate('scan_to_pay.pay_merchant')}
                right={
                    <AppTooltip
                        placement='bottom'
                        title={translate('tooltip.scan_pay_tooltip_title')}
                        description={translate('tooltip.scan_pay_tooltip_desc')}
                    />
                }
            />
            <KeyboardAwareScrollView
                style={[{ flex: 1 }, { width: '100%', marginTop: 15, paddingHorizontal: 20, }]}
                extraScrollHeight={65}
                enableOnAndroid={true}
                keyboardShouldPersistTaps='handled'
            >
                <View style={[Theme.styles.col_center_start, { width: '100%', }]}>
                    {
                        order?.vendor != null &&
                        <View style={[Theme.styles.row_center, { width: '100%' }]}>
                            <View style={{ flex: 1 }}>
                                <AppText style={styles.totalPriceText}>
                                    {(order?.vendor?.reservation_reward_type == 'discount' && rewardsRate > 0) ?
                                        (parseInt(order.total_price) - parseInt(order.total_price * rewardsRate / 100)) : parseInt(order.total_price)
                                    } Lekë
                                </AppText>
                                <AppText style={styles.LogoText}>{order.vendor.title}</AppText>
                            </View>
                            <FastImage
                                style={styles.Logo}
                                resizeMode={FastImage.resizeMode.contain}
                                source={{ uri: Config.IMG_BASE_URL + order.vendor.logo_thumbnail_path }}
                            />
                        </View>
                    }
                    {
                        (order?.vendor != null && (order?.vendor?.reservation_reward_type == 'discount' ||
                            order?.vendor?.reservation_reward_type == 'reward') && rewardsRate > 0) &&
                        <View style={[Theme.styles.col_center, styles.paymentBlockDetails]}>
                            <View style={[Theme.styles.row_center, { marginVertical: 5 }]}>
                                <AppText style={styles.paymentBlockDetailsLabel}>
                                    {
                                        order?.vendor?.reservation_reward_type == 'reward' ?
                                            (translate('scan_to_pay.reward') + ' (%)') : translate('scan_to_pay.subtotal')
                                    }
                                </AppText>
                                <AppText style={styles.paymentBlockDetailsValue}>
                                    {order?.vendor?.reservation_reward_type == 'reward' ? (parseInt(rewardsRate) + '%') : (parseInt(order.total_price) + ' Lekë')}
                                </AppText>
                            </View>
                            <View style={[Theme.styles.row_center, { marginVertical: 5 }]}>
                                <AppText style={styles.paymentBlockDetailsLabel}>
                                    {
                                        order?.vendor?.reservation_reward_type == 'reward' ?
                                            (translate('scan_to_pay.reward') + ' (Lekë)') : (translate('scan_to_pay.discount') + ` (${parseInt(rewardsRate)}%)`)
                                    }
                                </AppText>
                                <AppText style={styles.paymentBlockDetailsValue}>
                                    {order?.vendor?.reservation_reward_type == 'reward' ? (parseInt(order.total_price * rewardsRate / 100) + ' Lekë') :
                                        ('-' + parseInt(order.total_price * rewardsRate / 100) + ' Lekë')}
                                </AppText>
                            </View>
                        </View>
                    }
                    <View style={[Theme.styles.col_center, styles.paymentBlockDetails]}>
                        <View style={[Theme.styles.row_center, { marginVertical: 5 }]}>
                            <AppText style={styles.paymentBlockDetailsLabel}>{translate('scan_to_pay.address')}</AppText>
                            <AppText style={styles.paymentBlockDetailsValue}>{order?.vendor?.address}</AppText>
                        </View>
                        {
                            order.pickup_datetime &&
                            <View style={[Theme.styles.row_center, { marginVertical: 5 }]}>
                                <AppText style={styles.paymentBlockDetailsLabel}>{translate('scan_to_pay.reservation_date')}</AppText>
                                <AppText style={styles.paymentBlockDetailsValue}>{moment(order.pickup_datetime, "YYYY-MM-DD HH:mm:ss").locale(getLanguage()).format('DD MMM YYYY, HH:mm')}</AppText>
                            </View>
                        }
                        <View style={[Theme.styles.row_center, { marginVertical: 5 }]}>
                            <AppText style={styles.paymentBlockDetailsLabel}>{translate('scan_to_pay.card')}</AppText>
                            {
                                card?.id != null ?
                                    <TouchableOpacity style={[Theme.styles.row_center]} onPress={onGoChangeCard}>
                                        {
                                            card?.card?.brand == 'visa' ? <FontAwesome name='cc-visa' size={16} color={Theme.colors.text} />
                                                :
                                                <FontAwesome name='cc-mastercard' size={16} color={Theme.colors.text} />
                                        }
                                        <AppText style={styles.paymentBlockDetailsValue}>{card?.card?.brand == 'visa' ? translate('order_summary.visa_card') : translate('order_summary.master_card')} ...{card?.card?.last4}</AppText>
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity style={[Theme.styles.row_center, styles.changeBtn]} onPress={onGoChangeCard}>
                                        <Octicons name='credit-card' size={18} color={Theme.colors.text} />
                                        <AppText style={styles.changeBtnTxt}>{card?.id != null ? translate('membership.change') : translate('membership.add_card')}</AppText>
                                    </TouchableOpacity>
                            }
                        </View>
                    </View>
                    <View style={[Theme.styles.col_center, { marginTop: 40, width: '100%', overflow: 'hidden', }]}>
                        <RNCamera
                            ref={_camera}
                            style={styles.camera}
                            type={RNCamera.Constants.Type.back}
                            onBarCodeRead={({ barcode }) => {
                                if (barcode != null) {
                                    onValidateQrcode('ios_purpose');
                                }
                                else {
                                    onValidateQrcode('ios_purpose');
                                }
                            }}
                        />
                    </View>
                    <AppText style={styles.scanDesc}>{translate('scan_to_pay.hold_camera_on_qr')}</AppText>
                    <View style={[Theme.styles.col_center, { width: '100%', marginTop: 25, marginBottom: 25 }]}>
                        <Svg_scan />
                        <View style={{ height: 10 }}></View>
                        <AppText style={styles.scanQRTxt}>{translate('scan_to_pay.scan_qr')}</AppText>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    totalPriceText: { fontSize: 30, lineHeight: 36, fontFamily: Theme.fonts.bold, color: '#000' },
    LogoText: { marginTop: 4, fontSize: 19, lineHeight: 23, color: Theme.colors.text, fontFamily: Theme.fonts.medium },
    Logo: { width: 64, height: 64, borderRadius: 35, },
    paymentBlockDetails: { marginTop: 12, width: '100%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, backgroundColor: Theme.colors.gray9 },
    paymentBlockDetailsLabel: { flex: 1, fontSize: 17, lineHeight: 21, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
    paymentBlockDetailsValue: { marginLeft: 5, fontSize: 17, lineHeight: 21, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    camera: { width: width(56), height: width(56) },
    scanDesc: { marginTop: 15, fontSize: 17, lineHeight: 21, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    changeBtn: { backgroundColor: '#EDEDED', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 13 },
    changeBtnTxt: { marginLeft: 4, fontSize: 15, lineHeight: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    scanQRTxt: { fontSize: 19, lineHeight: 23, fontFamily: Theme.fonts.medium, color: Theme.colors.cyan2 }
});

const mapStateToProps = ({ app }) => ({
    order: app.tmp_order,
    user: app.user,
});

export default connect(mapStateToProps, {
    setTmpOrder,
})(ScantoPay);
