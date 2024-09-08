import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import Modal from 'react-native-modal';
import Theme from "../../../theme";

const ConfirmModal = ({ showModal, title, yes, no, onYes, onClose }) => {
    const [visible, SetVisible] = useState(showModal)
    useEffect(() => {
        SetVisible(showModal)
    }, [showModal])

    return <Modal
        isVisible={visible}
        backdropOpacity={0.33}
        onSwipeComplete={() => onClose()}
        onBackdropPress={() => onClose()}  >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <Text style={styles.modalTitle}>{title}</Text>
            <View style={[Theme.styles.row_center, { marginTop: 30, }]}>
                <TouchableOpacity onPress={() => onYes()} style={[Theme.styles.row_center, { flex: 1, }]}>
                    <Text style={styles.yesTxt}>{yes}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onClose()} style={[Theme.styles.row_center, { flex: 1, }]}>
                    <Text style={styles.noTxt}>{no}</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    modalContent: { width: '100%', paddingHorizontal: 20, paddingBottom: 30, paddingTop: 30, backgroundColor: Theme.colors.white, borderRadius: 15, },
    modalTitle: { fontSize: 17, textAlign: 'center', lineHeight: 23, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    yesTxt: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },
    noTxt: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7 },
});

export default ConfirmModal;
