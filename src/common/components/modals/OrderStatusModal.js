
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Keyboard,
    PixelRatio,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Modal from 'react-native-modal';
import Theme from "../../../theme";
import AppText from '../../../common/components/AppText';
import FastImage from 'react-native-fast-image';
import { translate } from '../../../common/services/translate';
import RBSheet from 'react-native-raw-bottom-sheet';
import RouteNames from '../../../routes/names';
import {
    extractErrorMessage,
    formatPrice,
    getOrderDiscountValue,
    getOrderRealDeliveryFee,
    groupBy,
    hasOrderFreeDelivery,
    prepareOrderProducts,
    sum,
} from '../../../common/services/utility';

const { width, height } = Dimensions.get('window');
const WIDTH = width - 20;

const OrderStatusModal = (props) => {
    const { showModal, onClose, onGoDetail, order } = props;
    const [visible, SetVisible] = useState(showModal)
    useEffect(() => {
        SetVisible(showModal)
    }, [showModal])

    const showOrderState = () => {
        const { status } = order;
        if (status === 'new') {
            return (
                <View style={{ marginBottom: 20 }}>
                    <View>
                        <FastImage
                            source={require('../../../common/assets/images/orders/waiting.png')}
                            style={styles.headerImage}
                        />
                        <View style={styles.headerStatusContainer}>
                            <View style={styles.headerStatusContainerItem}>
                                <AppText style={styles.headerStatusTextSelected}>
                                    {translate('orders.list_status_pending')}
                                </AppText>
                            </View>
                            <View style={styles.headerStatusContainerItem}>
                                <AppText style={styles.headerStatusText}>
                                    {translate('orders.list_status_in_the_way')}
                                </AppText>
                            </View>
                            <View style={styles.headerStatusContainerItem}>
                                <AppText style={[styles.headerStatusText, { marginLeft: 20 }]}>
                                    {translate('orders.list_status_delivered')}
                                </AppText>
                            </View>
                        </View>
                    </View>
                </View>
            );
        } else if (status === 'processing') {
            return (
                <View style={{ marginBottom: 20 }}>
                    <View>
                        <FastImage
                            source={require('../../../common/assets/images/orders/delivering.png')}
                            style={styles.headerImage}
                        />
                        <View style={styles.headerStatusContainer}>
                            <View style={styles.headerStatusContainerItem}>
                                <AppText style={styles.headerStatusText}>
                                    {translate('orders.list_status_pending')}
                                </AppText>
                            </View>
                            <View style={styles.headerStatusContainerItem}>
                                <AppText style={styles.headerStatusTextSelected}>
                                    {translate('orders.list_status_in_the_way')}
                                </AppText>
                            </View>
                            <View style={styles.headerStatusContainerItem}>
                                <AppText style={[styles.headerStatusText, { marginLeft: 20 }]}>
                                    {translate('orders.list_status_delivered')}
                                </AppText>
                            </View>
                        </View>
                    </View>
                </View>
            );
        } else if (status === 'delivered') {
            return (
                <View style={{ marginBottom: 20 }}>
                    <View>
                        <FastImage
                            source={require('../../../common/assets/images/orders/done.png')}
                            style={styles.headerImage}
                        />
                        <View style={styles.headerStatusContainer}>
                            <View style={styles.headerStatusContainerItem}>
                                <AppText style={styles.headerStatusText}>
                                    {translate('orders.list_status_pending')}
                                </AppText>
                            </View>
                            <View style={styles.headerStatusContainerItem}>
                                <AppText style={styles.headerStatusText}>
                                    {translate('orders.list_status_in_the_way')}
                                </AppText>
                            </View>
                            <View style={styles.headerStatusContainerItem}>
                                <AppText style={[styles.headerStatusTextDelivered, { marginLeft: 20 }]}>
                                    {translate('orders.list_status_delivered')}
                                </AppText>
                            </View>
                        </View>
                    </View>
                </View>
            );
        } else if (status === 'declined') {
            return (
                <View style={{ marginBottom: 20 }}>
                    <View>
                        <FastImage
                            source={require('../../../common/assets/images/orders/canceled.png')}
                            style={styles.headerImage}
                        />
                        <View style={styles.headerStatusContainer}>
                            <View style={styles.headerStatusContainerItem}>
                                <AppText style={styles.headerStatusTextRejected}>
                                    {translate('orders.list_status_rejected')}
                                </AppText>
                            </View>
                            <View style={styles.headerStatusContainerItem}>
                                <AppText style={styles.headerStatusText}>
                                    {translate('orders.list_status_in_the_way')}
                                </AppText>
                            </View>
                            <View style={styles.headerStatusContainerItem}>
                                <AppText style={[styles.headerStatusText, { marginLeft: 20 }]}>
                                    {translate('orders.list_status_delivered')}
                                </AppText>
                            </View>
                        </View>
                    </View>
                </View>
            );
        } else {
            return null;
        }
    };

    const renderOrderModalContent = () => {
        if (order == null) { return null; }
        const currency = 'L';
        return (
            <ScrollView style={styles.container}>
                <TouchableOpacity style={styles.headerCloseContainer} onPress={() => onClose()}>
                    <FastImage
                        source={require('../../../common/assets/images/orders/close.png')}
                        style={styles.headerCloseImage}
                    />
                    <AppText style={styles.headerLabel}>{translate('order_details.close')}</AppText>
                </TouchableOpacity>
                {order && showOrderState()}
                <View style={[Theme.styles.row_center, { paddingHorizontal: 20, }]}>
                    <AppText style={styles.Label}>{translate('order_details.restaurant_name')}</AppText>
                    <View style={{ paddingLeft: 30, flex: 1 }}>
                        <AppText style={styles.desc} numberOfLines={1}>{order.vendor.title}</AppText>
                        <View style={styles.line} />
                    </View>
                </View>
                <View style={[Theme.styles.row_center, { paddingHorizontal: 20, marginTop: 20 }]}>
                    <AppText style={styles.Label}>{translate('order_details.date')}</AppText>
                    <View style={{ paddingLeft: 30, flex: 1, }}>
                        <View style={{ paddingTop: 10 }}>
                            <AppText style={styles.desc} numberOfLines={1}>{order['created_at'].split(' ')[0]} {order['created_at'].split(' ')[1]}</AppText>
                        </View>
                        <View style={styles.line} />
                    </View>
                </View>
                <View style={[Theme.styles.row_center, { paddingHorizontal: 20, marginTop: 20 }]}>
                    <AppText style={styles.Label}>{translate('order_details.address')}</AppText>
                    <View style={{ paddingLeft: 30, flex: 1 }}>
                        <AppText style={styles.desc} numberOfLines={1}>{order.address && order.address.street}, {order.address && order.address.city} {order.address && order.address.country}</AppText>
                        <View style={styles.line} />
                    </View>
                </View>
                <View style={[Theme.styles.row_center, { paddingHorizontal: 20, marginTop: 20 }]}>
                    <AppText style={styles.Label}>{translate('order_details.total')}</AppText>
                    <View style={{ paddingLeft: 30, flex: 1, }}>
                        <View style={{ paddingTop: 10 }}>
                            <AppText style={styles.desc} numberOfLines={1}>{formatPrice(order['total_price'])} {currency}</AppText>
                        </View>
                        <View style={styles.line} />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', padding: 10, marginTop: 40 }}>
                    <TouchableOpacity style={styles.bottomContainerButton} onPress={() => {
                        onClose()
                        onGoDetail()
                    }}>
                        <AppText style={styles.bottomContainerButtonText}>
                            {translate('order_summary.my_orders')}
                        </AppText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    };

    return <Modal
        isVisible={visible}
        backdropOpacity={0.33}
        onSwipeComplete={() => onClose()}
        onBackdropPress={() => onClose()}
        swipeDirection={null}
        style={{ justifyContent: 'flex-end', margin: 0 }}
    >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            {renderOrderModalContent()}
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    modalContent: {
        width: '100%',
        height: height * 0.8,
        paddingBottom: 35,
        paddingTop: 10, 
        backgroundColor: Theme.colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: Theme.colors.white, 
    },
    headerCloseContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerCloseImage: {
        width: 15,
        height: 15,
        resizeMode: 'contain',
        margin: 15,
        marginRight: 5,
    },
    headerLabel: {
        color: '#7fbfd1',
        fontFamily: Theme.fonts.medium,
        fontSize: 13,
        padding: 10,
        paddingLeft: 0,
    },
    headerImage: {
        width: '100%',
        height: width / 8.65,
        resizeMode: 'contain',
        marginTop: 40,
    },
    headerStatusContainer: {
        flexDirection: 'row',
    },
    headerStatusContainerItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerStatusText: {
        color: '#646464',
        fontFamily: Theme.fonts.medium,
        fontSize: 13,
        padding: 10,
        textAlign: 'center',
    },
    headerStatusTextSelected: {
        color: '#54AAC1',
        fontFamily: Theme.fonts.bold,
        fontSize: 13,
        padding: 10,
        textAlign: 'center',
    },
    headerStatusTextDelivered: {
        color: '#23B574',
        fontFamily: Theme.fonts.bold,
        fontSize: 13,
        padding: 10,
        textAlign: 'center',
    },
    headerStatusTextRejected: {
        color: '#ed1c24',
        fontFamily: Theme.fonts.bold,
        fontSize: 13,
        padding: 10,
        textAlign: 'center',
    },
    title: {
        color: '#4D4D4D',
        fontFamily: Theme.fonts.bold,
        fontSize: 20,
        paddingTop: 30,
        padding: 10,
    },
    desc: {
        color: '#4D4D4D',
        fontFamily: Theme.fonts.medium,
        fontSize: 16,
        width: '100%',
        textAlign: 'center',
    },
    Label: {
        color: Theme.colors.cyan2,
        fontFamily: Theme.fonts.medium,
        fontSize: 15,
        paddingRight: 10,
        paddingBottom: 0,
        width: '40%',
    },
    lineView: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        alignItems: 'center',
        paddingTop: 20,
    },
    line: {
        flex: 1,
        height: 2,
        borderBottomColor: Theme.colors.cyan2,
        borderBottomWidth: 1,
    },
    Title: {
        color: Theme.colors.black,
        fontFamily: Theme.fonts.semiBold,
        fontSize: 18,
        paddingLeft: 10,
        paddingTop: 10,
        width: '100%',
        textAlign: 'center',
    },
    address: {
        color: '#4D4D4D',
        fontFamily: Theme.fonts.medium,
        fontSize: 15,
        padding: 10,
    },
    tariffContainer: {
        backgroundColor: Theme.colors.white,
    },
    tariffRow: {
        flexDirection: 'row',
        paddingVertical: 5,
    },
    leftRow: {
        flex: 3,
        flexDirection: 'row',
    },
    rightRow: {
        flex: 2,
    },
    rightRowText: {
        color: Theme.colors.black,
        fontFamily: Theme.fonts.medium,
        fontSize: 15,
        textAlign: 'right',
    },
    leftRowText: {
        color: Theme.colors.black,
        fontFamily: Theme.fonts.medium,
        fontSize: 15,
        textAlign: 'left',
    },
    orderText: {
        color: Theme.colors.black,
        fontFamily: Theme.fonts.medium,
        fontSize: 15,
        textAlign: 'left',
    },
    orderOptionsText: {
        color: Theme.colors.black,
        fontFamily: Theme.fonts.medium,
        fontSize: 12,
        textAlign: 'left',
    },
    orderRightText: {
        color: Theme.colors.black,
        fontFamily: Theme.fonts.medium,
        fontSize: 15,
        textAlign: 'right',
    },
    bottomContainerButton: {
        backgroundColor: Theme.colors.cyan2,
        flex: 1,
        margin: 10,
        marginBottom: 20,
        marginHorizontal: 5,
        padding: 10,
        paddingHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    outlineBottomContainerButton: {
        borderColor: Theme.colors.cyan2,
        borderWidth: 1,
        flex: 1,
        margin: 10,
        marginBottom: 20,
        marginHorizontal: 5,
        padding: 10,
        paddingHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    bottomContainerButtonText: {
        fontFamily: Theme.fonts.medium,
        color: Theme.colors.white,
        fontSize: 15,
        textAlign: 'center',
    },
});

export default OrderStatusModal;