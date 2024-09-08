import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Linking, Platform } from 'react-native';
import AndroidOpenSettings from 'react-native-android-open-settings';
import Modal from 'react-native-modal';
import { connect } from 'react-redux';
import { AppText } from '..';
import { KEYS, setStorageKey } from '../../services/storage';
import Theme from "../../../theme";
import { translate } from '../../../common/services/translate'
import { setShowContactsModal } from '../../../store/actions/app';

const ContactsSettingModal = (props) => {
    const onClose = () => {
        props.setShowContactsModal(false);
    }

    const onGoSetting = () => {
        try {
            if (Platform.OS === 'android') {
                AndroidOpenSettings.applicationSettings();
            } else {
                Linking.openURL('app-settings:');
            }
        } catch (error) {

        }
    }

    const onNotNow = async () => {
        try {
            await setStorageKey(KEYS.HIDE_CONTACTS_MODAL_SHOW, true);
        } catch (e) {
            console.log(e);
        }
        props.setShowContactsModal(false);
    }

    return <Modal
        isVisible={props.show_contacts_modal == true}
        backdropOpacity={0.33}
        onSwipeComplete={() => onClose()}
        onBackdropPress={() => onClose()}
        style={{ paddingHorizontal: 20 }}
    >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <AppText style={styles.modalTitle}>{translate('social.enable_contacts')}</AppText>
            <AppText style={styles.modalDesc}>{translate('social.enable_contacts_desc')}</AppText>
            <TouchableOpacity onPress={() => onGoSetting()} style={[Theme.styles.col_center, styles.settingBtn]}>
                <AppText style={styles.yesTxt}>{translate('social.go_setting')}</AppText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onNotNow()} style={[Theme.styles.col_center, { marginTop: 20 }]}>
                <AppText style={styles.noTxt}>{translate('social.not_now')}</AppText>
            </TouchableOpacity>
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    modalContent: { width: '100%', paddingHorizontal: 20, paddingBottom: 30, paddingTop: 30, backgroundColor: Theme.colors.white, borderRadius: 15, },
    modalTitle: { fontSize: 21, lineHeight: 23, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    modalDesc: { marginHorizontal: 15, textAlign: 'center', marginTop: 12, fontSize: 17, lineHeight: 23, fontFamily: Theme.fonts.medium, color: Theme.colors.text, },
    settingBtn: { marginTop: 20, height: 46, width: 220, borderRadius: 23, backgroundColor: Theme.colors.cyan2 },
    yesTxt: { fontSize: 17, lineHeight: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white },
    noTxt: { fontSize: 10, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7 },
});

const mapStateToProps = ({ app }) => ({
    show_contacts_modal: app.show_contacts_modal,
});

export default connect(mapStateToProps, {
    setShowContactsModal
})(ContactsSettingModal);