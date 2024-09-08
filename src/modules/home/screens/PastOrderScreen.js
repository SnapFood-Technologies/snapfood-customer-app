import React, { useEffect, useState } from 'react';
import { Image, InteractionManager, ScrollView, TouchableOpacity, TextInput, Text, View, StyleSheet, ImageBackground } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux'
import alerts from '../../../common/services/alerts';
import { translate } from '../../../common/services/translate';
import { getPastOrders, changeOrderStatus } from '../../../store/actions/orders';
import Theme from '../../../theme';
import Config from '../../../config';
import RouteNames from '../../../routes/names';
import OrderItem from '../../../common/components/order/OrderItem';

const PastOrderScreen = (props) => {

    const [vendorInfo, SetVendor] = useState({
        vendor_id: props.route.params.vendor_id,
        logo: props.route.params.logo,
        title: props.route.params.title
    })

    const [Orders, setOrders] = useState([])

    useEffect(() => {
        loadPastOrders(vendorInfo.vendor_id);

        return () => {
            console.log("PastOrderScreen unmount")
        };
    }, [])

    const loadPastOrders = (vendor_id) => {
        getPastOrders(vendor_id).then(data => {
            setOrders(data)
        })
            .catch(error => {
                console.log('getPastOrders', error)
            })
    }

    const onDeleteOrder = (order_id) => {
        alerts
            .confirmation(translate('order.confirm_delete'), '')
            .then(() => {
                changeOrderStatus(order_id, 'deleted').then(res => {
                    loadPastOrders(vendorInfo.vendor_id)
                })
                    .catch(err => {
                        console.log('onDeleteOrder', err)
                    })
            });
    }
    const onCancelOrder = (order_id) => {
        alerts
            .confirmation(translate('order.confirm_cancel'), '')
            .then(() => {
                changeOrderStatus(order_id, 'canceled').then(res => {
                    loadPastOrders(vendorInfo.vendor_id)
                })
                    .catch(err => {
                        console.log('onCancelOrder', err)
                    })
            });
    }


    const _renderHeader = () => {
        return <View style={[Theme.styles.row_center, styles.header]}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
                <Feather name='chevron-left' size={22} color={Theme.colors.text} />
            </TouchableOpacity>
            <View style={[Theme.styles.row_center, { marginLeft: 12, }]}>
                <View style={[Theme.styles.col_center, styles.logo]}>
                    <FastImage source={{ uri: Config.IMG_BASE_URL + vendorInfo.logo }} style={styles.logImg} />
                </View>
                <Text style={styles.brand_name}>{vendorInfo.title}</Text>
            </View>
            <View style={[Theme.styles.row_center_end, { flex: 1, alignItems: 'flex-end' }]}>
                {/* <RoundIconBtn style={styles.headerBtn} icon={<Fontisto name='search' size={22} color={Theme.colors.cyan2} />} onPress={() => { }} />
                <RoundIconBtn style={styles.headerBtn} icon={<MaterialIcons name='filter-list' size={26} color={Theme.colors.cyan2} />} onPress={() => { }} /> */}
            </View>
        </View>
    }

    return (
        <View style={[Theme.styles.col_center, styles.container]}>
            {_renderHeader()}
            <View style={styles.listView}>
                <ScrollView style={{ flex: 1, width: '100%', paddingHorizontal: 20 }}>
                    {Orders.map((item, index) =>
                        <OrderItem
                            key={item.id}
                            data={item}
                            order_id={item.id}
                            order_status={item.status}
                            onDelete={onDeleteOrder}
                            onSelect={(order_id) => {
                                props.navigation.navigate(RouteNames.OrderSummScreen, { isnew: false, order_id: order_id });
                            }} />
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 40, backgroundColor: Theme.colors.white },
    header: { height: 60, width: '100%', paddingHorizontal: 20 },
    logImg: { width: 28, height: 28, resizeMode: 'contain' },
    logo: { width: 30, height: 30, borderWidth: 1, borderColor: '#F6F6F9', borderRadius: 8, },
    brand_name: { marginLeft: 8, fontSize: 19, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
    headerBtn: { width: 45, height: 45, borderRadius: 8, backgroundColor: Theme.colors.white, marginLeft: 6 },
    listView: { flex: 1, width: '100%', backgroundColor: Theme.colors.white,   },
})


const mapStateToProps = ({ app }) => ({
});

export default connect(mapStateToProps, {
})(PastOrderScreen);