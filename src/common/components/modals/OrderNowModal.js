import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Linking, Platform } from 'react-native';
import Modal from 'react-native-modal';
import { connect } from 'react-redux';
import { AppText } from '..';
import Theme from "../../../theme";
import { translate } from '../../../common/services/translate'
import { setShowOrderNowModal } from '../../../store/actions/app';

const OrderNowModal = (props) => {
    const onClose = () => {
        props.setShowOrderNowModal(false);
    }

    const onGoHome = () => {
        props.setShowOrderNowModal(false);
        props.onGoHome()
    }

    const onGoWallet = async () => {
        props.setShowOrderNowModal(false);
        props.onGoWallet()
    }

    return <Modal
        isVisible={props.show_order_now_modal == true}
        backdropOpacity={0.33}
        onSwipeComplete={() => onClose()}
        onBackdropPress={() => onClose()}
        style={{ paddingHorizontal: 20 }}
    >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <AppText style={styles.modalTitle}>{translate('order_now.title')}</AppText>
            <AppText style={styles.modalDesc}>{translate('order_now.description')}</AppText>
            <TouchableOpacity onPress={() => onGoHome()} style={[Theme.styles.col_center, styles.settingBtn]}>
                <AppText style={styles.yesTxt}>{translate('order_now.go_home')}</AppText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onGoWallet()} style={[Theme.styles.col_center, { marginTop: 20 }]}>
                <AppText style={styles.noTxt}>{translate('order_now.go_wallet')}</AppText>
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
    noTxt: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7 },
});

const mapStateToProps = ({ app }) => ({
    show_order_now_modal: app.show_order_now_modal,
});

export default connect(mapStateToProps, {
    setShowOrderNowModal
})(OrderNowModal);