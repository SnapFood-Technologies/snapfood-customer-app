import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import Theme from '../../../theme'; 
import { translate } from '../../services/translate';
import Svg_curloc from '../../../common/assets/svgs/msg/current_location.svg';
import Svg_map from '../../../common/assets/svgs/msg/map.svg';

const LocationMsgOptionModal = ({ showModal, addCurrentLocation, goFindLocation, onClose }) => {
	const [visible, SetVisible] = useState(showModal)

    useEffect(()=>{ 
        SetVisible(showModal)
    }, [showModal])

    console.log('LocationMsgOptionModal')

	return <Modal
        testID={'modal'}
        isVisible={visible}
        backdropOpacity={0.33}
        onSwipeComplete={onClose}
        onBackdropPress={onClose}
        swipeDirection={['down']}
        style={{ justifyContent: 'flex-end', margin: 0 }}>
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <Text style={styles.modalTitle}>{translate('chat.share_location')}</Text>
            <TouchableOpacity onPress={addCurrentLocation} style={[Theme.styles.row_center, { width: '100%', height: 50 }]}>
                <Svg_curloc />
                <Text style={styles.modalBtnTxt}>{translate('chat.current_location')}</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={goFindLocation} style={[Theme.styles.row_center, { width: '100%', height: 50 }]}>
                <Svg_map />
                <Text style={styles.modalBtnTxt}>{translate('chat.find_location')}</Text>
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

function arePropsEqual(prevProps, nextProps) {
    if (prevProps.showModal != nextProps.showModal ) {
        console.log('LocationMsgOptionModal item equal : ', false)
        return false;
    }
    return true;
}

export default React.memo(LocationMsgOptionModal, arePropsEqual);