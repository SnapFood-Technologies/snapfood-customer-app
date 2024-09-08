import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ImagePicker from 'react-native-image-crop-picker';
import { getImageFullURL, isEmpty } from '../../../common/services/utility';
import Theme from '../../../theme';
import ImgPickOptionModal from '../../../common/components/modals/ImgPickOptionModal';
import { AppText } from '../../../common/components';
import { translate } from '../../../common/services/translate';

const ReportImageUploader = (props) => {
	const { photo, fullUrl, setPhoto, iconName } = props;
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
			<TouchableOpacity style={Theme.styles.col_center} onPress={open}>
				<View>
					<View style={[styles.photoView]}>
						<FastImage
							source={
								isEmpty(photo.path)
									? require('../../../common/assets/images/placeholder1.png')
									: { uri: photo.path }
							}
							style={styles.avatarImg}
							resizeMode={FastImage.resizeMode.contain}
						/>
					</View>
					<AppText style={styles.uploadTxt}>{translate('report.upload_image')}</AppText>
					<TouchableOpacity onPress={open} style={[Theme.styles.col_center, styles.photoEdit]}>
						<AntDesign name={iconName || 'edit'} size={14} color={Theme.colors.white} />
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
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
		height: 100,
		width: 100,
		// borderWidth: 1,
		// borderColor: Theme.colors.gray9,
		overflow: 'hidden'
	},
	avatarImg: { width: 100, height: 100, borderRadius: 6 },
	photoEdit: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: Theme.colors.cyan2,
		position: 'absolute',
		top: -5,
		right: 0,
	},
	uploadTxt : {
		// marginTop: 5,
		marginBottom: 5,
		marginRight: 4,
		textAlign: 'center',
		fontSize: 16,
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.gray1
	}
});

const cameraOptions = { cropping: true, includeBase64: true };

export default ReportImageUploader;