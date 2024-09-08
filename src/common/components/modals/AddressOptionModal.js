import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Theme from '../../../theme';
import { translate } from '../../services/translate';

const AddressOptionModal = ({ showModal, goDelete, goPrimary, onClose }) => {
    const [visible, SetVisible] = useState(showModal)

    useEffect(() => {
        SetVisible(showModal)
    }, [showModal])

    return <Modal
        isVisible={visible}
        backdropOpacity={0.33}
        onSwipeComplete={onClose}
        onBackdropPress={onClose}
        swipeDirection={['down']}
        style={{ justifyContent: 'flex-end', margin: 0 }}>
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <Text style={styles.modalTitle}>{translate('address_list.select_option')}</Text>
            <TouchableOpacity onPress={goPrimary} style={[Theme.styles.row_center, { width: '100%', height: 50 }]}>
                <AntDesign name="pushpino" size={20} color={Theme.colors.text} />
                <Text style={styles.modalBtnTxt}>{translate('address_list.set_as_favourite')}</Text>
            </TouchableOpacity>
            {/* <View style={styles.divider} /> */}
            {/* <TouchableOpacity onPress={goDelete} style={[Theme.styles.row_center, { width: '100%', height: 50 }]}>
                <Feather name='trash-2' size={20} color={Theme.colors.text} />
                <Text style={styles.modalBtnTxt}>{translate('address_list.delete_address')}</Text>
            </TouchableOpacity> */}
        </View>
    </Modal>

};

const styles = StyleSheet.create({
    modalContent: { width: '100%', paddingHorizontal: 20, paddingBottom: 30, paddingTop: 20, backgroundColor: Theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    modalTitle: { width: '100%', textAlign: 'left', fontSize: 19, fontFamily: Theme.fonts.bold, color: Theme.colors.text, marginBottom: 12 },
    modalBtnTxt: { flex: 1, marginLeft: 8, fontSize: 17, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9 },
})
export default AddressOptionModal;

