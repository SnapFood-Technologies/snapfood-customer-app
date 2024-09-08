import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import moment from 'moment';
import Feather from 'react-native-vector-icons/Feather';
import Theme from '../../../theme';
import { isEmpty } from '../../../common/services/utility';
import { translate } from '../../services/translate';
import { MainBtn } from '..';

const PromoInfoModal = ({ showModal, language, onClose, data, showVendorBtn = false, onPressVendor = () => { } }) => {
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
            <Text style={styles.title}>{promoData.code ? promoData.code : ((language == 'en' && !isEmpty(promoData.name_en)) ? promoData.name_en : promoData.name)}</Text>
            <Text style={styles.subtitle}>{getItemDesc()}</Text>
            <Text style={styles.description}>{(language == 'en' && !isEmpty(promoData.description_en)) ? promoData.description_en : promoData.description}</Text>
            <Text style={styles.description}>{(language == 'en' && !isEmpty(promoData.details_en)) ? promoData.details_en : promoData.details}</Text>
            <Text style={styles.subtitle}>{translate('promotions.expiration')}</Text>
            <Text style={styles.description}>{getExpiry()}</Text>
            {
                showVendorBtn == true &&
                <TouchableOpacity style={[Theme.styles.row_center, styles.vendorBtn]} onPress={onPressVendor}>
                    <Text style={styles.vendorBtnTxt}>{translate('promotions.check_vendor')}</Text>
                    <Feather size={18} color={Theme.colors.gray1} name={'chevron-right'} />
                </TouchableOpacity>
            }
            <MainBtn
                style={{ width: '100%' }}
                title={'OK'}
                title_style={{
                    fontFamily: Theme.fonts.semiBold,
                    color: Theme.colors.white,
                    fontSize: 17,
                }}
                onPress={onClose}
            />
        </View>
    </Modal>
};

const styles = StyleSheet.create({
    modalVendorContent: { width: '100%', minHeight: 280, paddingHorizontal: 20, paddingVertical: 20, backgroundColor: Theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    title: { width: '100%', marginBottom: 20, fontSize: 18, lineHeight: 20, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    subtitle: { width: '100%', marginBottom: 16, fontSize: 16, lineHeight: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    description: { width: '100%', marginBottom: 16, fontSize: 16, lineHeight: 18, fontFamily: Theme.fonts.medium, color: Theme.colors.text, },
    vendorBtn: { marginVertical: 10, width: '100%', borderRadius: 12, backgroundColor: Theme.colors.gray9, padding: 12, },
    vendorBtnTxt: { fontSize: 17, lineHeight: 21, color: Theme.colors.text, flex: 1 },
})


function arePropsEqual(prevProps, nextProps) {
    return prevProps.data != null && nextProps.data != null && prevProps.data.id == nextProps.data.id && prevProps.showModal == nextProps.showModal && prevProps.language == nextProps.language
}

export default React.memo(PromoInfoModal, arePropsEqual);