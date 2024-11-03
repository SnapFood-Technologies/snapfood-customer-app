/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { TextInput, Text, Image, View, TouchableOpacity } from 'react-native';
import { InputToolbar, Actions, Composer, Send } from 'react-native-gifted-chat';
import Theme from '../../../theme';
import MessageInputToolbar from './MessageInputToolbar';
import MessageSend from './MessageSend';
// svgs
import Svg_voicenote from '../../../common/assets/svgs/msg/voicenote.svg';
import Svg_emoji from '../../../common/assets/svgs/msg/emoji.svg';
import Svg_add from '../../../common/assets/svgs/msg/add.svg';
import Svg_close from '../../../common/assets/svgs/msg/close.svg';
import Svg_location from '../../../common/assets/svgs/msg/location.svg';
import Svg_image from '../../../common/assets/svgs/msg/image.svg';
import Svg_camera from '../../../common/assets/svgs/msg/camera.svg';
import Svg_send from '../../../common/assets/svgs/msg/send.svg';
import { translate } from '../../../common/services/translate';

export const renderInputToolbar = (
	props,
	quote_msg,
	images,
	default_msgs,
	onCancelQuote,
	onRemoveImage,
	onPressDefaultMsg
) => (
	<MessageInputToolbar
		{...props}
		containerStyle={{
			backgroundColor: Theme.colors.gray8,
			width: '100%',
			paddingHorizontal: 20,
			paddingVertical: 18,
			borderTopWidth: 0,
		}}
		primaryStyle={{ alignItems: 'center' }}
		quote_msg={quote_msg}
		onCancelQuote={onCancelQuote}
		images={images}
		default_msgs={default_msgs}
		onPressDefaultMsg={onPressDefaultMsg}
		onRemoveImage={onRemoveImage}
	></MessageInputToolbar>
);

export const renderActions = (props) => (
	<Actions
		{...props}
		containerStyle={{
			width: 44,
			height: 44,
			alignItems: 'center',
			justifyContent: 'center',
			marginLeft: 4,
			marginRight: 4,
			marginBottom: 0,
		}}
		icon={() => (
			<Image
				style={{ width: 32, height: 32 }}
				source={{
					uri: 'https://placeimg.com/32/32/any',
				}}
			/>
		)}
		options={{
			'Choose From Library': () => {
				
			},
			Cancel: () => {
				
			},
		}}
		optionTintColor='#222B45'
	/>
);

const MIN_HEIGHT = 40;
const CustomComposer = ({ props, editable = true, onPressEmoji, onPressLocation, onImageUpload, onCapture }) => {
	const [textInput, setTextInput] = useState(true);
	const [minHeight, setMinHeight] = useState(MIN_HEIGHT);

	useEffect(() => {
		if (props.text == '' || props.text == null) {
			setMinHeight(MIN_HEIGHT);
		}
	}, [props.text]);

	return (
		<View
			style={[
				Theme.styles.row_center,
				{
					backgroundColor: Theme.colors.white,
					borderRadius: 60,
					paddingVertical: 8,
					paddingHorizontal: 20,
					flex: 1,
				},
			]}
		>
			{textInput && (
				<TouchableOpacity onPress={onPressEmoji} disabled={editable == false}>
					<Svg_emoji />
				</TouchableOpacity>
			)}
			{/* <TextInput
                style={{ 
                    flex:1,
                    color: Theme.colors.text,
                    fontSize: 14,
                    fontFamily: Theme.fonts.medium,
                    backgroundColor: Theme.colors.white,
                    paddingHorizontal: 12,
                    marginLeft: 0,
                    width: 10,
                }}
            /> */}
			<View style={[Theme.styles.col_center, { marginHorizontal: 4 }]}>
				<View style={{ width: 1, backgroundColor: Theme.colors.gray6 }} />
			</View>
			{textInput && (
				<Composer
					{...props}
					placeholder={translate('social.chat.type_something')}
					placeholderTextColor={Theme.colors.gray5}
					textInputStyle={{
						flex: 1,
						color: Theme.colors.text,
						fontSize: 18,
						lineHeight: 20,
						fontFamily: Theme.fonts.medium,
						backgroundColor: Theme.colors.white,
						paddingHorizontal: 8,
						marginLeft: 0,
						borderLeftWidth: 1,
						borderLeftColor: Theme.colors.gray6,
						minHeight: minHeight,
					}}
					textInputProps={{
						editable: editable,
						onContentSizeChange: (event) => {
							
							setMinHeight(event.nativeEvent.contentSize.height);
						},
					}}
				/>
			)}
			{!textInput && (
				<View style={[Theme.styles.row_center_end, { flex: 1, height: 44, marginRight: 20 }]}>
					<TouchableOpacity
						disabled={editable == false}
						style={{ marginRight: 13 }}
						onPress={() => {
							setTextInput(true);
							onPressLocation();
						}}
					>
						<Svg_location />
					</TouchableOpacity>
					<TouchableOpacity
						disabled={editable == false}
						style={{ marginRight: 13 }}
						onPress={() => {
							setTextInput(true);
							onImageUpload();
						}}
					>
						<Svg_image />
					</TouchableOpacity>
					<TouchableOpacity
						disabled={editable == false}
						onPress={() => {
							setTextInput(true);
							onCapture();
						}}
					>
						<Svg_camera />
					</TouchableOpacity>
				</View>
			)}
			<TouchableOpacity disabled={editable == false} onPress={() => setTextInput(!textInput)}>
				{textInput ? <Svg_add /> : <Svg_close />}
			</TouchableOpacity>
		</View>
	);
};
export const renderComposer = (props, editable = true, onPressEmoji, onPressLocation, onImageUpload, onCapture) => (
	<CustomComposer
		props={props}
		editable={editable}
		onPressEmoji={onPressEmoji}
		onPressLocation={onPressLocation}
		onImageUpload={onImageUpload}
		onCapture={onCapture}
	/>
);

export const renderSend = (props,  active, onRecord, onSend) =>
	active == false ? (
		<TouchableOpacity disabled={props.disabled == true} style={{ marginLeft: 15 }} onPress={() => onRecord()}>
			<Svg_voicenote width={40} height={40} />
		</TouchableOpacity>
	) : (
		<MessageSend
			{...props}
			containerStyle={{
				alignItems: 'center',
				justifyContent: 'center',
				marginLeft: 15,
			}}
		>
			<Svg_send width={40} height={40} />
		</MessageSend>
	);
