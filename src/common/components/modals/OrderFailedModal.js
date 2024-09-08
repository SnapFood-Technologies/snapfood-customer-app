import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import Theme from '../../../theme';
import Svg_orderfailed from '../../assets/svgs/order_status/order_failed.svg'
import { translate } from '../../services/translate';

const OrderFailedModal = ({ isVisible, message, onTryAgain,  onClose }) => {
	const [showModal, setShowModal] = useState(isVisible)
	const [msg, setMsg] = useState(message)
	useEffect(() => {
		setShowModal(isVisible) 
	}, [isVisible])

	useEffect(()=>{
		setMsg(message)
	}, [message])

	return <Modal
		testID={'modal'}
		isVisible={showModal}
		backdropOpacity={0.33}
		onSwipeComplete={onClose}
		onBackdropPress={onClose}
		swipeDirection={['down']}
		style={{ justifyContent: 'flex-end', margin: 0 }}>
		<View style={[Theme.styles.col_center, styles.modalContent]}>
			<Svg_orderfailed />
			<Text style={[styles.modalTitle, { marginTop: 25 }]}>
				{msg}
			</Text>
			<TouchableOpacity onPress={onTryAgain} style={{marginTop: 38}}>
				<Text style={styles.tryagain}>{translate('cart.try_again')}</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={onClose} style={{marginTop: 24}}>
				<Text style={styles.dismiss}>{translate('cart.dismiss')}</Text>
			</TouchableOpacity>
		</View>
	</Modal>
};

const styles = StyleSheet.create({
	modalContent: { width: '100%', paddingBottom: 35, paddingTop: 20, paddingHorizontal: 24, backgroundColor: Theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
	modalTitle: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold },
	status: { textAlign: 'right', flex: 1, fontSize: 12, fontFamily: Theme.fonts.semiBold },
	tryagain: { fontSize: 14, color: Theme.colors.cyan2, fontFamily: Theme.fonts.bold },
	dismiss: { fontSize: 14, color: Theme.colors.gray7, fontFamily: Theme.fonts.semiBold, },
})
export default OrderFailedModal;
