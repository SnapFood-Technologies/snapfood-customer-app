import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import ImagePicker from 'react-native-image-crop-picker';
import { getImageFullURL, isEmpty } from '../../common/services/utility';
import Theme from '../../theme';
import ImgPickOptionModal from '../../common/components/modals/ImgPickOptionModal';

const ImageUploader = (props) => {
	const { photo, fullUrl, setPhoto, iconName, hasImageBtn, onPressImageBtn } = props;
	const [showPickerModal, setShowPickerModal] = useState(false);

	const open = useCallback(() => setShowPickerModal(true), []);
	const close = useCallback(() => setShowPickerModal(false), []);

	const onImage = useCallback((image) => {
		setPhoto(image);
		close();
	}, []);
	const onImageUpload = useCallback(() => ImagePicker.openPicker({ mediaType: 'photo', ...cameraOptions }).then(onImage), []);
	const onCapture = useCallback(() => ImagePicker.openCamera(cameraOptions).then(onImage), []);

	return (
		<>
			<View style={Theme.styles.col_center}>
				<View style={[Theme.styles.col_center, { width: 124, height: 124 }]}>
					<TouchableOpacity activeOpacity={hasImageBtn == true ? 0.7 : 1} onPress={() => {
						if (hasImageBtn == true) {
							onPressImageBtn()
						}
					}}>
						<View style={[Theme.styles.col_center, styles.photoView]}>
							<FastImage
								source={
									isEmpty(photo) || photo == 'x'
										? require('../../common/assets/images/user-default.png')
										: { uri: fullUrl ? getImageFullURL(photo) : photo.path }
								}
								style={styles.avatarImg}
								resizeMode={FastImage.resizeMode.cover}
							/>
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={open} style={[Theme.styles.col_center, styles.photoEdit]}>
						<AntDesign name={iconName || 'edit'} size={14} color={Theme.colors.white} />
					</TouchableOpacity>
					{
						hasImageBtn == true &&
						<TouchableOpacity onPress={onPressImageBtn} style={[Theme.styles.col_center, styles.imageBtn]}>
							<FontAwesome5 name={'images'} size={14} color={Theme.colors.white} />
						</TouchableOpacity>
					}
				</View>
			</View>
			<ImgPickOptionModal
				showModal={showPickerModal}
				onCapture={onCapture}
				onImageUpload={onImageUpload}
				onClose={close}
			/>
		</>
	);
};
const styles = StyleSheet.create({
	photoView: {
		height: 120,
		width: 120,
		borderWidth: 1,
		borderColor: Theme.colors.gray9,
		borderRadius: 60,
		backgroundColor: '#E8D7D0',
		overflow: 'hidden'
	},
	avatarImg: { width: 118, height: 118, borderRadius: 60 },
	photoEdit: {
		width: 26,
		height: 26,
		borderRadius: 13,
		backgroundColor: Theme.colors.cyan2,
		position: 'absolute',
		top: 9,
		right: 4,
	},
	imageBtn: {
		width: 26,
		height: 26,
		borderRadius: 13,
		backgroundColor: Theme.colors.cyan2,
		position: 'absolute',
		top: 54,
		right: -9,
	}
});

const cameraOptions = { cropping: true, includeBase64: true };

export default ImageUploader;