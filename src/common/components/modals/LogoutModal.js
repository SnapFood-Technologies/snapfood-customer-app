import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import Theme from '../../../theme';
import { translate } from '../../services/translate';
import MainButton from '../../components/buttons/main_button';

const LogoutModal = ({ showModal, onLogout, onClose }) => {
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
            <View style={[Theme.styles.col_center, styles.main]}>
                <Text style={styles.modalTitle}>{translate('alerts.confirm_logout')}</Text>
                <Text style={styles.modalDesc}>{translate('alerts.confirm_logout_desc')}</Text>
                <TouchableOpacity onPress={onLogout} style={[Theme.styles.row_center, { width: '100%', height: 50 }]}>
                    <Text style={styles.logoutTxt}>{translate('alerts.confirm_logout_title').toUpperCase()}</Text>
                </TouchableOpacity>
            </View>
            <MainButton
                title={translate('cancel').toUpperCase()}
                style={{ width: '100%', backgroundColor: Theme.colors.white }}
                title_style={styles.cancelTxt}
                onPress={onClose}
            />
        </View>
    </Modal>
};

const styles = StyleSheet.create({
    modalContent: { width: '100%', paddingHorizontal: 20, paddingBottom: 30, paddingTop: 20, backgroundColor: Theme.colors.transparent, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    main: { width: '100%', padding: 15, marginBottom: 12, borderRadius: 12, backgroundColor: Theme.colors.white },
    modalTitle: { width: '100%', textAlign: 'center', fontSize: 17, lineHeight: 24, fontFamily: Theme.fonts.bold, color: Theme.colors.gray4, marginBottom: 12 },
    modalDesc: { width: '100%', textAlign: 'center', fontSize: 16, lineHeight: 22, fontFamily: Theme.fonts.medium, color: Theme.colors.gray4, marginBottom: 12 },
    logoutTxt: { fontSize: 16, fontFamily: Theme.fonts.bold, color: Theme.colors.gray2 },
    cancelTxt: { fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.red1, },
})
export default LogoutModal;

