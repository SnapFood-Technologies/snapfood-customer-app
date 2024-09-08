import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import Feather from 'react-native-vector-icons/Feather';
import Theme from '../../../theme';
import { translate } from '../../services/translate';

const NewCallOptionModal = ({ showModal, onAudioCall, onVideoCall, onClose }) => {
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
            <Text style={styles.modalTitle}>{translate('social.v_start_new')}</Text>
            <TouchableOpacity onPress={onAudioCall} style={[Theme.styles.row_center, { width: '100%', height: 50 }]}>
                <Feather name="phone" size={20} color={Theme.colors.text} />
                <Text style={styles.modalBtnTxt}>{translate('social.audio_call')}</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={onVideoCall} style={[Theme.styles.row_center, { width: '100%', height: 50 }]}>
                <Feather name="video" size={20} color={Theme.colors.text} />
                <Text style={styles.modalBtnTxt}>{translate('social.video_call')}</Text>
            </TouchableOpacity>
        </View>
    </Modal>

};

const styles = StyleSheet.create({
    modalContent: { width: '100%', paddingHorizontal: 20, paddingBottom: 30, paddingTop: 20, backgroundColor: Theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    modalTitle: { width: '100%', textAlign: 'left', fontSize: 18, fontFamily: Theme.fonts.bold, color: Theme.colors.text, marginBottom: 12 },
    modalBtnTxt: { flex: 1, marginLeft: 8, fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9 },
})
export default NewCallOptionModal;

