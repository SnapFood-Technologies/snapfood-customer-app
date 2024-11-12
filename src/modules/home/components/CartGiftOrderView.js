import React, { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, Switch, View, Text, StyleSheet, Platform } from 'react-native';
import { connect } from 'react-redux';
import Theme from '../../../theme';
import { translate } from '../../../common/services/translate';
import { AuthInput, RadioBtn, AppText, CheckBox } from '../../../common/components';
import CommentView from './CommentView';
import { setDeliveryInfoCart } from '../../../store/actions/shop';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RouteNames from "../../../routes/names";
import GiftOptionModal from '../../../common/components/modals/GiftOptionModal';
import AppTooltip from '../../../common/components/AppTooltip';
import apiFactory from '../../../common/services/apiFactory';
import { isEmpty } from '../../../common/services/utility';
import { OrderType_Delivery, OrderType_Reserve } from '../../../config/constants';

const CartGiftOrderView = (props) => {
    const [isGiftOptionModal, showGiftOptionModal] = useState(false);
    const [isReferralAvailable, setReferralAvailable] = useState(false);

    useEffect(() => {
        props.setDeliveryInfoCart({
            gift_from: props.user.full_name,
        });
        checkReferralAvailable();
    }, [])

    useEffect(() => {
        if (props.routeParams?.keepOpenOptionModal == true) {
            showGiftOptionModal(true);
        }
    }, [props.routeParams?.keepOpenOptionModal])

    const checkReferralAvailable = () => {
        apiFactory.post(`/invite-earn/get-refferal-info`)
            .then(({ data }) => {
                setReferralAvailable(data.user_refferal != null);
            })
            .catch(err => {
                
            });
    }

    const referralDesc = useMemo(() => {
        let desc = translate('cart.gift_nonuser_referral_desc');
        desc = desc.replace('XXX', `${props.referralsRewardsSetting.user_rewards || 100}`)
        return desc;
    }, [props.referralsRewardsSetting.user_rewards])

    const referralTooltipTitle = useMemo(() => {
        if (props.language == 'en' && !isEmpty(props.systemSettings.gift_order_referral_tooltip_title_en)) {
            return props.systemSettings.gift_order_referral_tooltip_title_en;
        }
        else if (props.language == 'it' && !isEmpty(props.systemSettings.gift_order_referral_tooltip_title_it)) {
            return props.systemSettings.gift_order_referral_tooltip_title_it;
        }
        else if (!isEmpty(props.systemSettings.gift_order_referral_tooltip_title)) {
            return props.systemSettings.gift_order_referral_tooltip_title;
        }
        return translate('tooltip.gift_order_referral_title')
    }, [props.systemSettings.gift_order_referral_tooltip_title, props.systemSettings.gift_order_referral_tooltip_title_en,
    props.systemSettings.gift_order_referral_tooltip_title_it, props.language])

    const referralTooltipDesc = useMemo(() => {
        let desc = translate('tooltip.gift_order_referral_desc');
        if (props.language == 'en' && !isEmpty(props.systemSettings.gift_order_referral_tooltip_desc_en)) {
            desc = props.systemSettings.gift_order_referral_tooltip_desc_en;
        }
        else if (props.language == 'it' && !isEmpty(props.systemSettings.gift_order_referral_tooltip_desc_it)) {
            desc = props.systemSettings.gift_order_referral_tooltip_desc_it;
        }
        else if (!isEmpty(props.systemSettings.gift_order_referral_tooltip_desc)) {
            desc = props.systemSettings.gift_order_referral_tooltip_desc;
        }

        desc = desc.replace('XXX', `${props.referralsRewardsSetting.user_rewards || 100}`)
        desc = desc.replace('YYY', `${props.referralsRewardsSetting.max_num_referral || 5}`)
        return desc;
    }, [props.systemSettings.gift_order_referral_tooltip_desc, props.systemSettings.gift_order_referral_tooltip_desc_en,
    props.systemSettings.gift_order_referral_tooltip_desc_it,
    props.referralsRewardsSetting.user_rewards, props.referralsRewardsSetting.max_num_referral, props.language])

    return (
        <View style={[Theme.styles.col_center, { width: '100%', marginBottom: 12 }]}>
            <View style={[Theme.styles.flex_between, styles.container]}>
                <AntDesign name='gift' size={28} color={Theme.colors.cyan2} />
                <View style={[{ flex: 1, marginLeft: 15 }]}>
                    <Text style={[styles.gift_order_txt]}>
                        {
                            props.delivery_info.handover_method == OrderType_Reserve ?
                                translate('cart.reseve_order_as_gift') :
                                translate('cart.send_order_as_gift')
                        }
                    </Text>
                    <Text style={[styles.gift_order_desc]}>
                        {
                            props.delivery_info.handover_method == OrderType_Reserve ?
                                translate('cart.reseve_order_as_gift_desc') :
                                translate('cart.send_order_as_gift_desc')
                        }
                    </Text>
                </View>
                <Switch
                    style={Platform.OS == 'ios' && { transform: [{ scaleX: 0.7 }, { scaleY: 0.65 }] }}
                    trackColor={{ false: Theme.colors.gray5, true: '#C0EBEC' }}
                    thumbColor={props.delivery_info.is_gift == true ? Theme.colors.cyan2 : Theme.colors.gray7}
                    ios_backgroundColor='#C0EBEC'
                    onValueChange={() => {
                        if (props.delivery_info.is_gift == false) {
                            showGiftOptionModal(true)
                        }
                        props.setDeliveryInfoCart({
                            is_gift: !props.delivery_info.is_gift,
                            gift_non_user: null,
                            gift_recip_name: '',
                            gift_recip_phone: '',
                            gift_recip_id: null,
                            gift_recip_is_friend: false,
                            gift_is_referral: false,
                            gift_recip_address: {}
                        });
                    }}
                    value={props.delivery_info.is_gift}
                />
            </View>
            {
                props.delivery_info.is_gift && (props.delivery_info.gift_non_user != null) &&
                <>
                    {
                        (
                            props.referralsRewardsSetting.show_referral_module == true &&
                            isReferralAvailable == true &&
                            props.delivery_info.gift_non_user == true
                        ) &&
                        <View style={[Theme.styles.row_center_start, styles.giftReferralView]}>
                            <CheckBox checked={props.delivery_info.gift_is_referral}
                                type={1}
                                activeColor={Theme.colors.cyan2}
                                inactiveColor={Theme.colors.cyan2}
                                onPress={() => {
                                    props.setDeliveryInfoCart({
                                        gift_is_referral: !props.delivery_info.gift_is_referral,
                                    });
                                }} />
                            <AppText style={[styles.refferalDescTxt]}>{referralDesc}</AppText>
                            <AppTooltip
                                title={referralTooltipTitle}
                                description={referralTooltipDesc}
                                placement={'bottom'}
                            />
                        </View>
                    }
                    <AuthInput
                        style={styles.input}
                        placeholder={
                            props.delivery_info.handover_method == OrderType_Reserve ?
                                translate('cart.recipient_name') :
                                translate('cart.recipient_name')
                        }
                        value={props.delivery_info.gift_recip_name}
                        onChangeText={(v) => {
                            props.setDeliveryInfoCart({
                                gift_recip_name: v,
                            });
                        }}
                    />
                    {
                        props.delivery_info.gift_recip_is_friend != true &&
                        <>
                            <AuthInput
                                style={styles.input}
                                placeholder={
                                    props.delivery_info.handover_method == OrderType_Reserve ?
                                        translate('cart.recipient_phone') :
                                        translate('cart.recipient_phone')
                                }
                                value={props.delivery_info.gift_recip_phone}
                                onChangeText={(v) => {
                                    props.setDeliveryInfoCart({
                                        gift_recip_phone: v,
                                    });
                                }}
                            />
                            {/* insert phone number */}
                            <View style={[Theme.styles.row_center_start, { width: '100%', marginLeft: 15 }]}>
                                <Text style={[styles.recipient_phone_description]}>
                                    {
                                        props.delivery_info.handover_method == OrderType_Reserve ?
                                            translate('cart.recipient_phone_description') :
                                            translate('cart.recipient_phone_description')
                                    }
                                </Text>
                            </View>
                        </>
                    }

                    <AuthInput
                        style={styles.input}
                        placeholder={
                            props.delivery_info.handover_method == OrderType_Reserve ?
                                translate('cart.gift_order_from') :
                                translate('cart.gift_order_from')
                        }
                        value={props.delivery_info.gift_from}
                        onChangeText={(v) => {
                            props.setDeliveryInfoCart({
                                gift_from: v,
                            });
                        }}
                    />
                    <CommentView
                        hide_label={true}
                        style={{ marginTop: 12 }}
                        comments={props.delivery_info.gift_message}
                        placeholder={
                            props.delivery_info.handover_method == OrderType_Reserve ?
                                translate('cart.gift_message') :
                                translate('cart.gift_message')
                        }
                        onChangeText={(v) => {
                            props.setDeliveryInfoCart({
                                gift_message: v,
                            });
                        }}
                    />
                    {
                        props.delivery_info.handover_method == OrderType_Delivery &&
                        props.delivery_info.gift_recip_is_friend != true &&
                        <TouchableOpacity disabled={props.delivery_info.gift_non_user != true} style={[Theme.styles.col_center, styles.radio_view]}
                            onPress={() => {
                                props.navigation.navigate(RouteNames.AddressesScreen, { isFromCart: true });
                            }}
                        >
                            <AppText style={styles.confirm_address}>{translate('cart.gift_confirm_recipient_address')}</AppText>
                            {
                                props.delivery_info.gift_non_user == true ?
                                    <AppText style={styles.recipient_address}>
                                        {props.delivery_info.address?.street} {props.delivery_info.address?.city}, {props.delivery_info.address?.country}
                                    </AppText>
                                    :
                                    <AppText style={styles.recipient_address}>
                                        {props.delivery_info.gift_recip_address?.street} {props.delivery_info.gift_recip_address?.city}, {props.delivery_info.gift_recip_address?.country}
                                    </AppText>
                            }
                        </TouchableOpacity>
                    }
                    <TouchableOpacity style={[Theme.styles.row_center, styles.radio_view]}
                        onPress={() => {
                            props.setDeliveryInfoCart({
                                gift_permission: !props.delivery_info.gift_permission,
                            });
                        }}
                    >
                        <RadioBtn
                            checked={props.delivery_info.gift_permission} onPress={() => {
                                props.setDeliveryInfoCart({
                                    gift_permission: !props.delivery_info.gift_permission,
                                });
                                props.onChangeGiftPermissionError();
                            }}
                            hasError={props.delivery_info.gift_permission != true && props.gift_permission_error == true}
                        />
                        <AppText style={styles.radio_txt}>{
                            props.delivery_info.handover_method == OrderType_Reserve ?
                                translate('cart.grant_reserve_gift') :
                                translate('cart.grant_gift')
                        }</AppText>
                    </TouchableOpacity>
                </>
            }
            <GiftOptionModal
                showModal={isGiftOptionModal}
                onClose={() => {
                    showGiftOptionModal(false)
                    props.setDeliveryInfoCart({
                        is_gift: false,
                        gift_non_user: null,
                        gift_recip_name: '',
                        gift_recip_phone: '',
                        gift_recip_id: null,
                        gift_recip_is_friend: false,
                        gift_is_referral: false,
                        gift_recip_address: {}
                    });
                }}
                onSelectUser={() => {
                    showGiftOptionModal(false)
                    props.navigation.setParams({ keepOpenOptionModal: false });
                    props.navigation.navigate(RouteNames.GiftUserPickScreen)
                }}
                onSelectNonUser={() => {
                    showGiftOptionModal(false)
                    props.setDeliveryInfoCart({
                        gift_non_user: true,
                        gift_recip_name: '',
                        gift_recip_phone: '',
                        gift_recip_id: null,
                        gift_recip_is_friend: false,
                        gift_is_referral: false,
                        gift_recip_address: {}
                    });
                }}
            />
        </View>

    )
};

const styles = StyleSheet.create({
    container: { width: '100%', borderBottomWidth: 1, borderBottomColor: Theme.colors.gray9, paddingBottom: 12 },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: Theme.colors.gray6,
        backgroundColor: Theme.colors.white,
        marginTop: 12
    },
    subjectTitle: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    radio_view: { width: '100%', marginVertical: 15, },
    radio_txt: { flex: 1, marginLeft: 8, fontSize: 15, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    recipient_phone_description: { marginTop: 6, fontSize: 15, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7, },
    gift_order_txt: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold },
    gift_order_desc: { fontSize: 15, color: Theme.colors.gray1, fontFamily: Theme.fonts.medium },
    giftReferralView: { width: '100%', marginTop: 16, marginBottom: 12 },
    refferalDescTxt: { paddingHorizontal: 8, flex: 1, fontSize: 15, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold },

    confirm_address: { width: '100%', textAlign: 'center', marginLeft: 8, fontSize: 15, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    recipient_address: { width: '100%', textAlign: 'center', marginTop: 4, marginLeft: 8, fontSize: 15, fontFamily: Theme.fonts.medium, color: Theme.colors.cyan2 },
})

const mapStateToProps = ({ app, shop }) => ({
    user: app.user,
    language: app.language,
    delivery_info: shop.delivery_info,
    referralsRewardsSetting: app.referralsRewardsSetting || {},
    systemSettings: app.systemSettings || {}
});

export default connect(mapStateToProps, {
    setDeliveryInfoCart
})(CartGiftOrderView);
