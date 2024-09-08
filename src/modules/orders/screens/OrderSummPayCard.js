import React, { useEffect, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, KeyboardAvoidingView, View, Text, FlatList, Image, SafeAreaView } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import moment from 'moment';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Spinner from 'react-native-loading-spinner-overlay';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { height, width } from 'react-native-dimension';
import Theme from "../../../theme";
import RouteNames from '../../../routes/names';
import { AppText } from '../../../common/components';
import { translate } from '../../../common/services/translate';
import { MainBtn } from '../../../common/components';
import Svg_calendar from '../../../common/assets/svgs/profile/calendar.svg'
import Svg_card from '../../../common/assets/svgs/profile/credit_card.svg'
import { isEmpty } from '../../../common/services/utility';
import { useState } from 'react';
import { MEMBERSHIP_PLANS } from '../../../config/constants';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import { getOrderDetail } from '../../../store/actions/orders';
import { setTmpOrder } from '../../../store/actions/app';

const OrderSummPayCard = (props) => {
    const order = props.order;
    const [loadingCard, setLoadingCard] = useState(false);
    const [loading, setLoading] = useState(false);
    const [card, setCard] = useState(null);

    useEffect(() => {
        loadPaymentMethods();
    }, [props.user.default_card_id]);

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
                console.log('loadPaymentMethods error', error);
                // const message = error.message || translate('generic_error');
                // alerts.error(translate('alerts.error'), message);
            }
        );
    };

    const onProceed = () => {
        setLoading(true);
        apiFactory.post('checkout/pay-order', { order_id: order.id, card_id: card?.id, from_scan: 0 }).then(() => {
            getOrderDetail(order.id)
                .then((order_data) => {
                    setLoading(false);
                    props.setTmpOrder(order_data);
                    props.navigation.goBack();
                })
                .catch((error) => {
                    console.log('getOrderDetail', error);
                    setLoading(false);
                    props.navigation.goBack();
                });
        }, error => {
            setLoading(false);
            const message = error.message || translate('generic_error');
            alerts.error(translate('alerts.error'), message);
        });
    }

    const onGoChangeCard = () => {
        if (card?.id != null) {
            props.navigation.navigate(RouteNames.PaymentMethodsScreen, { goBackAfterSuccess: true })
        }
        else {
            props.navigation.navigate(RouteNames.NewCardScreen)
        }
    }

    return (
        <View style={[Theme.styles.col_center, styles.screen]}>
            <Spinner visible={loadingCard} />
            <TouchableOpacity
                style={[Theme.styles.col_center, styles.overlay]}
                activeOpacity={1}
                onPress={() => {
                    props.navigation.goBack()
                }}
            />
            <View style={[Theme.styles.col_center, styles.container]}>
                <View style={[Theme.styles.row_center, styles.header]}>
                    <Text style={styles.title}>{translate('confirm')}</Text>
                </View>
                <KeyboardAwareScrollView style={[{ flex: 1, width: '100%', paddingHorizontal: 20 }]} keyboardShouldPersistTaps='handled'>
                    <View style={[styles.optionView]}>
                        <View style={[Theme.styles.row_center, Theme.styles.optionItem]}>
                            <Svg_card />
                            <View style={[Theme.styles.flex_1, { paddingHorizontal: 12, }]}>
                                <Text style={styles.optiontitle}>{card?.id != null ? `**** **** **** ${card?.card?.last4}` : translate('membership.no_card')}</Text>
                                <Text style={styles.description}>{card?.id != null ? translate('membership.your_card') : translate('membership.add_your_card')}</Text>
                            </View>
                            <TouchableOpacity style={[Theme.styles.col_center, styles.changeBtn]} onPress={onGoChangeCard}>
                                <Text style={styles.changeBtnTxt}>{card?.id != null ? translate('membership.change') : translate('membership.add_card')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ height: 50 }} />
                </KeyboardAwareScrollView>
                <View style={[Theme.styles.col_center, styles.bottom]}>
                    <MainBtn
                        disabled={
                            loading || card?.id == null
                        }
                        loading={loading}
                        style={{ width: '100%' }}
                        title={translate('order_summary.confirm_payment')}
                        onPress={onProceed}
                    />
                </View>
            </View >
        </View >
    );
}

const styles = StyleSheet.create({
    screen: { width: '100%', height: '100%', paddingTop: height(45), justifyContent: 'flex-end' },
    overlay: { width: width(100), height: height(100), position: 'absolute', top: 0, left: 0 },
    container: {
        justifyContent: "center",
        alignItems: "center",
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        width: '100%',
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    header: {
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 15,
    },
    title: { marginBottom: 20, fontSize: 18, lineHeight: 22, fontFamily: Theme.fonts.medium, color: Theme.colors.text, },
    subtitle: { width: '100%', marginBottom: 6, fontSize: 20, lineHeight: 24, fontFamily: Theme.fonts.bold, color: Theme.colors.text, },
    description: { width: '100%', fontSize: 17, lineHeight: 21, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7, },
    price: { fontSize: 20, lineHeight: 24, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
    titleView: { flexDirection: 'row', width: '100%' },
    optionView: { width: '100%', paddingVertical: 20 },
    optionItem: { width: '100%' },
    changeBtn: { backgroundColor: '#EDEDED', paddingVertical: 5, paddingHorizontal: 18, borderRadius: 13 },
    changeBtnTxt: { fontSize: 14, lineHeight: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    optiontitle: { marginBottom: 6, fontSize: 17, lineHeight: 21, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
    divider: { height: 1, width: '100%', backgroundColor: '#E9E9E9', marginVertical: 20 },
    termsDesc: { width: '100%', fontSize: 14, lineHeight: 17, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7, },
    bottom: { width: '100%', paddingBottom: 30, paddingHorizontal: 20 }
});

const mapStateToProps = ({ app, chat }) => ({
    language: app.language,
    user: app.user || {},
    order: app.tmp_order,
});

export default connect(
    mapStateToProps,
    {
        setTmpOrder
    }
)(OrderSummPayCard);
