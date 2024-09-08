import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Theme from '../../../theme';

const SupportMsgItem = ({ msg, onPress, style }) => {
	return (
		<TouchableOpacity onPress={() => onPress(msg)} style={[Theme.styles.col_center, styles.container, style]} >
			<Text style={[styles.txt]}>{msg.title}</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		height: 32,
		paddingHorizontal: 12,
		borderRadius: 7,
		backgroundColor: '#C0EBEC',
		marginRight: 12
	},
	txt: { fontSize: 15, lineHeight: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },
});

function arePropsEqual(prevProps, nextProps) {
	if (prevProps.msg != nextProps.msg) {
		return false;
	}
	return true;
}

export default React.memo(SupportMsgItem, arePropsEqual);
