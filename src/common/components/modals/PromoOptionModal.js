import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import Feather from 'react-native-vector-icons/Feather';
import Theme from '../../../theme';

const PromoOptionModal = ({ options = [], showModal, onSelect, onClose }) => {
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
            {
                options.map((option, index) =>
                    <TouchableOpacity key={index} onPress={() => onSelect(option)} style={[Theme.styles.flex_between, { height: 50 }]}>
                        <Text style={styles.modalBtnTxt}>{option}</Text>
                        <Feather name="chevron-right" size={20} color={Theme.colors.text} />
                    </TouchableOpacity>
                )
            }
        </View>
    </Modal>
};

const styles = StyleSheet.create({
    modalContent: { width: '100%', paddingHorizontal: 20, paddingBottom: 30, paddingTop: 20, backgroundColor: Theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    modalTitle: { width: '100%', textAlign: 'left', fontSize: 18, fontFamily: Theme.fonts.bold, color: Theme.colors.text, marginBottom: 12 },
    modalBtnTxt: { marginLeft: 8, fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9 },
})
export default PromoOptionModal;

