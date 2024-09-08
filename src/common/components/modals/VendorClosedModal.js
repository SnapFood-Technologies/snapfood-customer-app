import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import Theme from '../../../theme'; 
import { translate } from '../../services/translate';

const VendorClosedModal = ({ showModal, title, seeMenuTitle, goHome, onClose, isSeeMenuVisible }) => {
	const [visible, SetVisible] = useState(showModal)

    useEffect(()=>{ 
        SetVisible(showModal)
    }, [showModal])

    console.log('VendorClosedModal')

    return <Modal
        testID={'modal'}
        isVisible={visible}
        onBackdropPress={onClose}
        onSwipeComplete={onClose}
        backdropOpacity={0.33}
        swipeDirection={['down']}
        style={{ justifyContent: 'flex-end', margin: 0 }}>
        <View style={[Theme.styles.col_center, styles.modalVendorContent]}>
            <Text style={styles.modalTitle}>{title}</Text>
            {isSeeMenuVisible && 
            <TouchableOpacity onPress={onClose} style={[{ marginTop: 15, height: 35 }]}>
                <Text style={styles.modalSeeBtnTxt}>{seeMenuTitle ?? translate('vendor_profile.see_menu')}</Text>
            </TouchableOpacity>
            }
            <TouchableOpacity onPress={goHome} style={[{ marginTop: 8, height: 35 }]}>
                <Text style={styles.modalGoHomeBtnTxt}>{translate('vendor_profile.gobackhome')}</Text>
            </TouchableOpacity>
        </View>
    </Modal>
};

const styles = StyleSheet.create({
    modalVendorContent: { width: '100%', paddingHorizontal: 15, paddingVertical: 20, backgroundColor: Theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    modalTitle: { width: '100%', marginVertical: 20, textAlign: 'center', fontSize: 17, lineHeight: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    modalSeeBtnTxt: { fontSize: 16, fontFamily: Theme.fonts.bold, color: Theme.colors.cyan2 },
    modalGoHomeBtnTxt: { fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7 },
})

function arePropsEqual(prevProps, nextProps) {
    if (prevProps.showModal != nextProps.showModal || prevProps.title != nextProps.title) {
        console.log('VendorClosedModal item equal : ', false)
        return false;
    }
    return true;
}

export default React.memo(VendorClosedModal, arePropsEqual);