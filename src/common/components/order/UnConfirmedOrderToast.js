import React, { useEffect, useState, useRef, useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { width } from 'react-native-dimension';
import Theme from '../../../theme';
import { isEmpty } from '../../../common/services/utility';
import RouteNames from '../../../routes/names';
import { confirmOrderDelivery } from '../../../store/actions/orders';
import alerts from '../../services/alerts';
import { translate } from '../../services/translate';

const UnConfirmedOrderToast = (props) => {
    const toastText = useMemo(() => {
        if (props.orderId == null) { // home toast
            if (props.language == 'en') {
                return props.systemSettings.order_delivery_confirm_home_toast_en;
            }
            else if (props.language == 'it') {
                return props.systemSettings.order_delivery_confirm_home_toast_it;
            }
            return props.systemSettings.order_delivery_confirm_home_toast;
        }
        else if (props.orderId != null) {
            if (props.language == 'en') {
                return props.systemSettings.order_delivery_confirm_order_toast_en;
            }
            else if (props.language == 'it') {
                return props.systemSettings.order_delivery_confirm_order_toast_it;
            }
            return props.systemSettings.order_delivery_confirm_order_toast;
        }
        return '';
    }, [props.orderId,
    props.systemSettings.order_delivery_confirm_home_toast,
    props.systemSettings.order_delivery_confirm_home_toast_en,
    props.systemSettings.order_delivery_confirm_home_toast_it,
    props.systemSettings.order_delivery_confirm_order_toast,
    props.systemSettings.order_delivery_confirm_order_toast_en,
    props.systemSettings.order_delivery_confirm_order_toast_it,
    props.language
    ])

    const onConfirmDelivery = (order_id, redirect = false) => {
        props.confirmOrderDelivery(order_id)
            .then((res) => {
                let message = translate('order_summary.confirm_order_delivery_success');
                if (props.language == 'en' && !isEmpty(props.systemSettings.order_delivery_confirm_order_success_msg_en)) {
                    message = props.systemSettings.order_delivery_confirm_order_success_msg_en;
                }
                else if (props.language == 'it' && !isEmpty(props.systemSettings.order_delivery_confirm_order_success_msg_it)) {
                    message = props.systemSettings.order_delivery_confirm_order_success_msg_it;
                }
                else if (!isEmpty(props.systemSettings.order_delivery_confirm_order_success_msg)) {
                    message = props.systemSettings.order_delivery_confirm_order_success_msg;
                }
                alerts.info('', message).then((res) => {
                    if (redirect == true) {
                        props.navigation.navigate(RouteNames.OrderSummScreen, { isnew: false, order_id: order_id });
                    }
                });
            })
            .catch((err) => {
                alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(err));
            })
    }

    const onPress = () => {
        if (props.orderId == null && props.unconfirmedDeliveryOrders.length > 0) {
            onConfirmDelivery(props.unconfirmedDeliveryOrders[0].id, true);
        }
        else {
            onConfirmDelivery(props.orderId, false);
        }
    }

    if (props.unconfirmedDeliveryOrders.length == 0 ||
        (props.orderId != null && props.unconfirmedDeliveryOrders.findIndex(o => o.id == props.orderId) == -1) ||
        isEmpty(toastText)) {
        return null;
    }

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={1}
            style={[Theme.styles.row_center, styles.container]}>
            <Text style={styles.text}>{toastText}</Text>
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    container: { position: 'absolute', top: 42, left: 20, elevation: 12, padding: 15, borderRadius: 12, width: (width(100) - 40), backgroundColor: Theme.colors.cyan2 },
    text: { marginLeft: 10, flex: 1, fontSize: 17, lineHeight: 21, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white }
})

const mapStateToProps = ({ app, shop }) => ({
    systemSettings: app.systemSettings || {},
    language: app.language,
    unconfirmedDeliveryOrders: app.unconfirmedDeliveryOrders || []
});

export default connect(mapStateToProps, {
    confirmOrderDelivery
})(UnConfirmedOrderToast);
