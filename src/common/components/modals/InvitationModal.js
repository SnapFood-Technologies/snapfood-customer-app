import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import AppText from '../AppText';
import Theme from '../../../theme';
import { translate } from '../../services/translate';
import MainButton from '../buttons/main_button';

const InvitationModal = ({ showModal, name, onSend, onClose }) => {
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
            <View style={[Theme.styles.flex_between, {alignItems: 'center'}]}>
                <AppText style={styles.modalTitle}>{translate('invitation_earn.send_invitation_to')}</AppText>
                <TouchableOpacity onPress={onClose} >
                    <AppText style={styles.modalBtnTxt}>{translate('cancel')}</AppText>
                </TouchableOpacity>
            </View>
            <View style={styles.nameView} >
                <AppText style={styles.name}>{name}</AppText>
            </View>
            <MainButton title={translate('invitation_earn.send_invitation')}
                onPress={onSend}
                style={{ width: '100%' }}
            />
        </View>
    </Modal>
};

const styles = StyleSheet.create({
    modalContent: { width: '100%', paddingHorizontal: 20, paddingBottom: 30, paddingTop: 20, backgroundColor: Theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    modalTitle: { textAlign: 'left', fontSize: 18, fontFamily: Theme.fonts.bold, color: Theme.colors.text, },
    modalBtnTxt: { marginLeft: 8, fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7 },
    nameView: { width: '100%', marginVertical: 22, padding: 16, borderRadius: 12, backgroundColor: Theme.colors.gray9 },
    name: { marginLeft: 8, fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
})
export default InvitationModal;

