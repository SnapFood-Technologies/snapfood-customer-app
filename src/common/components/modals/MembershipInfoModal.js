import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import moment from 'moment';
import Theme from '../../../theme';
import { isEmpty } from '../../../common/services/utility';
import { translate } from '../../services/translate';
import { MainBtn } from '..';
import Svg_calendar from '../../assets/svgs/profile/calendar.svg'
import Svg_card from '../../assets/svgs/profile/credit_card.svg'

const MembershipInfoModal = ({ showModal, onClose, data }) => {
    const [visible, SetVisible] = useState(showModal)
    const [promoData, setData] = useState(data || {})

    useEffect(() => {
        SetVisible(showModal)
    }, [showModal])

    useEffect(() => {
        setData(data || {})
    }, [data])

    const getItemDesc = () => {
        if (promoData.type == 'free_delivery') {
            return translate('search.free_delivery')
        }
        else if (promoData.type == 'percentage') {
            return (promoData.value != null && parseInt(promoData.value) >= 0) ? parseInt(promoData.value) + '%' : '0%'
        }
        else if (promoData.type == 'fixed') {
            return (promoData.value != null && parseInt(promoData.value) >= 0) ? parseInt(promoData.value) + ' L' : '0 L'
        }
        else if (promoData.type == 'item') {
            return (promoData.product ? promoData.product.title : '')
        }
        return ''
    }

    const getExpiry = () => {
        let expire_time = promoData.end_time;
        if (promoData.vendor_type == 'random') {
            expire_time = promoData.expire_time;
        }
        if (isEmpty(expire_time) || promoData.non_expired == 1) {
            return translate('promotions.no_expiration');
        }

        return moment(expire_time).format("YYYY-MM-DD  hh:mm");
    }

    return <Modal
        testID={'modal'}
        isVisible={visible}
        onBackdropPress={onClose}
        onSwipeComplete={onClose}
        backdropOpacity={0.33}
        swipeDirection={['down']}
        style={{ justifyContent: 'flex-end', margin: 0 }}>
        <View style={[styles.modalVendorContent]}>
            <Text style={styles.title}>{translate('confirm')}</Text>
            <View style={[styles.titleView]}>
                <View style={[Theme.styles.flex_1]}>
                    <Text style={styles.subtitle}>{getItemDesc()}</Text>
                    <Text style={styles.description}>{promoData.description}</Text>
                </View>
                <Text style={styles.price}>1000 Leke</Text>
            </View>
            <View style={[styles.optionView]}>
                <View style={[Theme.styles.optionItem]}>
                    <Svg_calendar />
                    <View style={[Theme.styles.flex_1]}>
                        <Text style={styles.optiontitle}>{translate('membership.your_plan')}</Text>
                        <Text style={styles.description}>{translate('membership.monthly')}</Text>
                    </View>
                    <TouchableOpacity style={[Theme.styles.col_center, styles.changeBtn]}>
                        <Text style={styles.changeBtnTxt}>{translate('membership.change')}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.divider} />
                <View style={[Theme.styles.optionItem]}>
                    <Svg_card />
                    <View style={[Theme.styles.flex_1]}>
                        <Text style={styles.optiontitle}>Visa 1234</Text>
                        <Text style={styles.description}>{translate('membership.your_card')}</Text>
                    </View>
                    <TouchableOpacity style={[Theme.styles.col_center, styles.changeBtn]}>
                        <Text style={styles.changeBtnTxt}>{translate('membership.change')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={[styles.termsDesc]}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nisl leo, condimentum et tellus laoreet, lobortis sodales sem.
                <Text style={{ color: Theme.colors.text }}>Terma dhe privacy</Text></Text>
            <MainBtn
                style={{ width: '100%' }}
                title={translate('membership.subscribe_now')}
                onPress={onClose}
            />
        </View>
    </Modal>
};

const styles = StyleSheet.create({
    modalVendorContent: { width: '100%', minHeight: 280, paddingHorizontal: 20, paddingVertical: 20, backgroundColor: Theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    title: { width: '100%', marginBottom: 20, fontSize: 18, lineHeight: 22, fontFamily: Theme.fonts.medium, color: Theme.colors.text, },
    subtitle: { width: '100%', marginBottom: 12, fontSize: 18, lineHeight: 22, fontFamily: Theme.fonts.bold, color: Theme.colors.text, },
    description: { width: '100%', fontSize: 13, lineHeight: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7, },
    price: { fontSize: 18, lineHeight: 22, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
    titleView: { flexDirection: 'row', width: '100%' },
    optionView: { width: '100%' },
    changeBtn: { backgroundColor: '#EDEDED', paddingVertical: 5, paddingHorizontal: 18, borderRadius: 13 },
    changeBtnTxt: { fontSize: 13, lineHeight: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    optiontitle: { fontSize: 16, lineHeight: 19, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
    divider: { height: 1, width: '100%', backgroundColor: '#E9E9E9', marginVertical: 20 },
    termsDesc: { width: '100%', fontSize: 13, lineHeight: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7, },
})


function arePropsEqual(prevProps, nextProps) {
    return prevProps.data != null && nextProps.data != null && prevProps.data.id == nextProps.data.id && prevProps.showModal == nextProps.showModal
}

export default React.memo(MembershipInfoModal, arePropsEqual);