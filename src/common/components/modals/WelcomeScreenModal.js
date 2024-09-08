import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import Theme from '../../../theme';
import WelcomScreen from '../../../modules/tour/screens/WelcomeScreen';

const WelcomeScreenModal = ({ showModal, props, onClose }) => {
    const [visible, SetVisible] = useState(showModal)

    useEffect(() => {
        SetVisible(showModal)
    }, [showModal])

    return <Modal
        statusBarTranslucent
        isVisible={visible}
        backdropOpacity={0.33}
        onSwipeComplete={onClose}
        onBackdropPress={onClose}
        swipeDirection={['right']}
        style={{ justifyContent: 'flex-end', margin: 0 }}>
        <WelcomScreen {...props} isModal={true} onClose={onClose} />
    </Modal>
};

const styles = StyleSheet.create({
})
export default WelcomeScreenModal;

