import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import Theme from '../../../theme';
import { isEmpty, getImageFullURL } from '../../../common/services/utility';
import { translate } from '../../../common/services/translate';
import Svg_female from '../../../common/assets/svgs/msg/snapfooder_female.svg'
import Svg_male from '../../../common/assets/svgs/msg/snapfooder_male.svg'

const SnapfooderListItem = ({ full_name, phoneNumber, photo, is_friend = false, is_invited = false, style, onPress, sex }) => {
	return (
		<TouchableOpacity style={[styles.container, style]} onPress={onPress ? onPress : () => { }}>
			<FastImage
				style={styles.avatar}
				source={{ uri: getImageFullURL(photo) }}
				resizeMode={FastImage.resizeMode.cover}
			/>
			<View style={{ flex: 1, display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
				<View style={{ flex: 1 }}>
					{!isEmpty(full_name) && <Text style={styles.name}>{full_name}</Text>}
					{!isEmpty(phoneNumber) && <Text style={styles.phoneNumber}>{phoneNumber}</Text>}
				</View>
				<View>
					<Text
						style={[
							styles.invite,
							{
								color: !is_friend && is_invited ? Theme.colors.gray7 : Theme.colors.cyan2,
							},
						]}
					>
						{is_friend ? translate('chat.contacts_chat') : (is_invited ? translate('chat.already_invited') : translate('chat.invite'))}
					</Text>
				</View>

			</View>
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
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: 'red',
		marginRight: 12,
	},
	sexAvatar: {
		width: 30,
		height: 30,
		borderRadius: 6,
		marginRight: 12,
		paddingTop: 3,
	},
	name: {
		fontSize: 17,
		lineHeight: 19,
		color: 'black',
		fontFamily: Theme.fonts.semiBold,
	},
	phoneNumber: {
		paddingTop: 4,
		fontSize: 15,
		lineHeight: 17,
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.gray7,
	},
	invite: {
		color: '#50b7ed',
		fontSize: 16,
		lineHeight: 19,
		fontFamily: Theme.fonts.semiBold,
	},
});

export default SnapfooderListItem;
