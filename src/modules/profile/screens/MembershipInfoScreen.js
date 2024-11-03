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
import { getLoggedInUser } from '../../../store/actions/auth';

const MembershipInfoScreen = (props) => {
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
                
                // const message = error.message || translate('generic_error');
                // alerts.error(translate('alerts.error'), message);
            }
        );
    };

    const title = useMemo(() => {
        if (props.language == 'en' && !isEmpty(props.membershipSetting.membership_title_en)) {
            return props.membershipSetting.membership_title_en;
        }
        else if (props.language == 'sq' && !isEmpty(props.membershipSetting.membership_title)) {
            return props.membershipSetting.membership_title;
        }
        else if (props.language == 'it' && !isEmpty(props.membershipSetting.membership_title_it)) {
			return props.membershipSetting.membership_title_it;
		}
        return translate('Snapfood+');
    }, [props.membershipSetting.membership_title, props.membershipSetting.membership_title_en, 
        props.membershipSetting.membership_title_it, props.language])


    const onSubscribe = () => {
        if (card?.id == null) {
            return;
        }
        setLoading(true);
        apiFactory
            .post(`subscribe-membership`, {
                plan: props.tmpPickedMembershipPlan,
                card_id: card?.id
            })
            .then(({ data }) => {
                setLoading(false);
                props.getLoggedInUser();
                props.navigation.goBack();
            })
            .catch((error) => {
                setLoading(false);
                
                const message = error.message || translate('generic_error');
                alerts.error(translate('alerts.error'), message);
            })
    }

    const onGoChangePlan = () => {
        props.navigation.navigate(RouteNames.ChangeMembershipPlan)
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
                    <View style={[styles.titleView]}>
                        <View style={[Theme.styles.flex_1]}>
                            <Text style={styles.subtitle}>{title}</Text>
                            <Text style={styles.description}>{translate('membership.cancel_any_time')}</Text>
                        </View>
                        <Text style={styles.price}>
                            {props.tmpPickedMembershipPlan == MEMBERSHIP_PLANS.monthly ? props.membershipSetting.monthly_value : props.membershipSetting.yearly_value} lekë</Text>
                    </View>
                    <View style={[styles.optionView]}>
                        <View style={[Theme.styles.row_center, Theme.styles.optionItem]}>
                            <Svg_calendar />
                            <View style={[Theme.styles.flex_1, { paddingHorizontal: 12, }]}>
                                <Text style={styles.optiontitle}>{translate('membership.your_plan')}</Text>
                                <Text style={styles.description}>{props.tmpPickedMembershipPlan == MEMBERSHIP_PLANS.monthly ? translate('membership.monthly') : translate('membership.yearly')}</Text>
                            </View>
                            <TouchableOpacity style={[Theme.styles.col_center, styles.changeBtn]} onPress={onGoChangePlan}>
                                <Text style={styles.changeBtnTxt}>{translate('membership.change')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.divider} />
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
                    <Text style={[styles.termsDesc]}>{translate('membership.term_privacy_desc')}</Text>
                    <View style={{ height: 50 }} />
                </KeyboardAwareScrollView>
                <View style={[Theme.styles.col_center, styles.bottom]}>
                    <MainBtn
                        disabled={
                            loading || card?.id == null
                        }
                        loading={loading}
                        style={{ width: '100%' }}
                        title={translate('membership.subscribe_now')}
                        onPress={onSubscribe}
                    />
                </View>
            </View >
        </View >
    );
}

const styles = StyleSheet.create({
    screen: { width: '100%', height: '100%', paddingTop: height(30), justifyContent: 'flex-end' },
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
    tmpPickedMembershipPlan: app.tmpPickedMembershipPlan || MEMBERSHIP_PLANS.monthly,
    membershipSetting: app.membershipSetting || {},
});

export default connect(
    mapStateToProps,
    {
        getLoggedInUser
    },
)(withNavigation(MembershipInfoScreen));
