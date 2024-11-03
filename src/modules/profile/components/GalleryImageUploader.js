import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ImagePicker from 'react-native-image-crop-picker';
import { getImageFullURL, isEmpty } from '../../../common/services/utility';
import Theme from '../../../theme';
import ImgPickOptionModal from '../../../common/components/modals/ImgPickOptionModal';
import { AppText } from '../../../common/components';
import { translate } from '../../../common/services/translate';
import { width } from 'react-native-dimension';
import Svg_plus from '../../../common/assets/svgs/profile/gallery_plus.svg'

const GalleryImageUploader = ({ data, setPhoto, onDelete }) => {
	const [showPickerModal, setShowPickerModal] = useState(false);

	const open = useCallback(() => setShowPickerModal(true), []);
	const close = useCallback(() => setShowPickerModal(false), []);

	const onImage = useCallback((image) => {
		setPhoto(image);
		close();
	}, []);
	const onImageUpload = useCallback(() => ImagePicker.openPicker({ mediaType: 'photo', ...cameraOptions }).then(onImage), []);
	const onCapture = useCallback(() => ImagePicker.openCamera(cameraOptions).then(onImage), []);

	useEffect(()=>{
		
	}, [data])
	
	return (
		<>
			<View style={[Theme.styles.col_center, styles.container]} >
				{
					!isEmpty(data?.remoteUrl) ?
						<View style={[styles.photoView]}>
							<FastImage
								source={{ uri: data?.remoteUrl }}
								style={styles.image}
								resizeMode={FastImage.resizeMode.cover}
							/>
							<TouchableOpacity onPress={onDelete} style={[Theme.styles.col_center, styles.closeBtn]}>
								<AntDesign name={'close'} size={14} color={Theme.colors.text} />
							</TouchableOpacity>
						</View>
						:
						!isEmpty(data?.localUrl) ?
							<View style={[styles.photoView]}>
								<FastImage
									source={{ uri: data?.localUrl }}
									style={styles.image}
									resizeMode={FastImage.resizeMode.cover}
								/>
								{
									data?.loading == true &&
									<View style={[Theme.styles.col_center, styles.loadingView]}>
										<ActivityIndicator color={Theme.colors.cyan2} />
									</View>
								}

							</View>
							:
							<TouchableOpacity style={[Theme.styles.col_center, styles.plusBtn]} onPress={open}>
								<Svg_plus />
							</TouchableOpacity>
				}
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
	container: {
		width: width(50) - 30,
		height: width(50) - 30,
		marginBottom: 20,
	},
	plusBtn: { width: '100%', height: '100%', borderRadius: 14, borderWidth: 1, borderColor: '#B6B6B6', borderStyle: 'dashed', },
	photoView: {
		width: '100%', height: '100%',
		// overflow: 'hidden'
	},
	image: { width: '100%', height: '100%', borderRadius: 14, },
	closeBtn: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: Theme.colors.red1,
		position: 'absolute',
		top: -5,
		right: 0,
	},
	loadingView: { width: '100%', height: '100%', backgroundColor: '#ffffff50', position: 'absolute', left: 0, top: 0 }
});

const cameraOptions = { includeBase64: true };

export default GalleryImageUploader;