import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import Theme from '../../../theme';
import { isEmpty, getImageFullURL } from '../../../common/services/utility';
import CheckBox from '../../../common/components/buttons/checkbox';
import { translate } from '../../../common/services/translate';
import apiFactory from '../../../common/services/apiFactory';

const UserListItem = ({ full_name, phoneNumber, contact_phone, photo, invite_status, isSigned, isFriend, isAdmin, type, rightComp, checked, style, onPress, onRightBtnPress }) => {

	const inviteContactPhone = () => {
		if (onRightBtnPress) {
			onRightBtnPress()
		}
		console.log('contact_phone ', contact_phone)
		if (isEmpty(contact_phone) != true && isSigned != true) {
			apiFactory.post(`users/invite_contact_phone`, {
				phone: ('' + contact_phone)
			}).then(({ data }) => {
				console.log('check Friend', data.success)
			},
				(error) => {
					console.log(error);
				});
		}
	}

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
				{rightComp}
				{type == 'checkbox' && (
					<CheckBox checked={checked == true} onPress={onPress ? onPress : () => { }} />
				)}
				{type == 'snapfooder' && (
					<TouchableOpacity onPress={onRightBtnPress ? onRightBtnPress : () => { }}>
						<Text
							style={[
								styles.invite,
								{
									color: invite_status == 'invited' ? Theme.colors.gray7 : Theme.colors.cyan2,
								},
							]}
						>
							{invite_status == 'invited' ? translate('chat.cancel') : translate('chat.invite')}
						</Text>
					</TouchableOpacity>
				)}
				{type == 'mutual_snapfooder' && (
					<TouchableOpacity activeOpacity={invite_status == 'invited' ? 1 : 0.7} onPress={onRightBtnPress ? onRightBtnPress : () => { }}>
						<Text
							style={[
								styles.invite,
								{
									color: invite_status == 'invited' ? Theme.colors.gray7 : Theme.colors.cyan2,
								},
							]}
						>
							{invite_status == 'invited' ? translate('chat.already_invited') : translate('chat.invite')}
						</Text>
					</TouchableOpacity>
				)}
				{type == 'contacts' && (
					<TouchableOpacity onPress={inviteContactPhone}>
						{
							isFriend == true ?
								<Text
									style={[
										styles.invite,
										{
											color: Theme.colors.cyan2,
										},
									]}
								>
									{translate('chat.contacts_chat')}
								</Text>
								:
								(
									isSigned != true ?
										<Text
											style={[
												styles.invite,
												{
													color: Theme.colors.cyan2,
												},
											]}
										>
											{translate('chat.invite_to_snapfood')}
										</Text>
										:
										<Text
											style={[
												styles.invite,
												{
													color: invite_status == 'invited' ? Theme.colors.gray7 : Theme.colors.cyan2,
												},
											]}
										>
											{invite_status == 'invited' ? translate('chat.cancel_friend') : translate('chat.add_friend')}
										</Text>
								)
						}
					</TouchableOpacity>
				)}
				{type == 'invite_status' && (
					<View>
						{
							isFriend == true ?
								<Text
									style={[
										styles.invite,
										{
											color: Theme.colors.gray7,
										},
									]}
								>
									{translate('chat.already_friend')}
								</Text>
								:
								<TouchableOpacity onPress={onRightBtnPress ? onRightBtnPress : () => { }}>
									<Text
										style={[
											styles.invite,
											{
												color: invite_status == 'invited' ? Theme.colors.gray7 : Theme.colors.cyan2,
											},
										]}
									>
										{invite_status == 'invited' ? translate('chat.cancel') : translate('chat.invite')}
									</Text>
								</TouchableOpacity>
						}
					</View>
				)}
				{
					type == 'role' && isAdmin == true &&
					<Text
						style={[
							styles.invite,
							Theme.colors.cyan2
						]}
					>
						Admin
					</Text>
				}
				{
					type == 'contacts-multi' &&
					<Text
						style={[
							styles.invite,
							{
								color: Theme.colors.cyan2,
							},
						]}
					>
						{translate('chat.invite_to_snapfood')}
					</Text>
				}
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
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: 'red',
		marginRight: 12,
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

export default UserListItem;
