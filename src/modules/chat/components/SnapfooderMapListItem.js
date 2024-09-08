import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import Theme from '../../../theme';
import { isEmpty, getImageFullURL } from '../../../common/services/utility';
import { translate } from '../../../common/services/translate';
import Svg_user_plus from '../../../common/assets/svgs/map/user_plus.svg'
import Svg_chat_round from '../../../common/assets/svgs/map/chat_round.svg'
import { findZodiacSign } from '../../../common/components/ZodiacSign';

const SnapfooderMapListItem = ({ full_name, birthdate, photo, is_friend = false, is_invited = false, style, onPress, onPressRight }) => {
	return (
		<TouchableOpacity style={[styles.container, style]} onPress={onPress ? onPress : () => { }}>
			<FastImage
				style={styles.avatar}
				source={{ uri: getImageFullURL(photo) }}
				resizeMode={FastImage.resizeMode.cover}
			/>
			<View style={{ flex: 1 }}>
				<View style={[Theme.styles.row_center, {justifyContent: 'flex-start'}]}>
					<Text style={styles.name}>{full_name}</Text>
					{
						!isEmpty(birthdate) &&
						findZodiacSign(moment(birthdate).toDate())
					}
				</View>
				<Text style={styles.desc}>{is_friend ? translate('social.you_are_friend') : translate('social.you_are_not_friend')}</Text>
			</View>
			<TouchableOpacity style={[Theme.styles.col_center, styles.rightBtn]} onPress={onPressRight ? onPressRight : () => { }}>
				{is_friend ? <Svg_chat_round /> : <Svg_user_plus />}
			</TouchableOpacity>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 10,
		flexDirection: 'row',
		borderRadius: 15,
		backgroundColor: '#FAFAFC',
		alignItems: 'center',
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 30,
		backgroundColor: '#fff',
		marginRight: 12,
	},
	name: {
		marginRight: 3,
		fontSize: 17,
		lineHeight: 19,
		color: 'black',
		fontFamily: Theme.fonts.semiBold,
	},
	desc: {
		paddingTop: 4,
		fontSize: 15,
		lineHeight: 17,
		fontFamily: Theme.fonts.medium,
		color: Theme.colors.gray7,
	},
	invite: {
		color: '#50b7ed',
		fontSize: 16,
		lineHeight: 19,
		fontFamily: Theme.fonts.semiBold,
	},
	rightBtn: {
		width: 42, height: 42, borderRadius: 30, backgroundColor: Theme.colors.white
	}
});

export default SnapfooderMapListItem;
