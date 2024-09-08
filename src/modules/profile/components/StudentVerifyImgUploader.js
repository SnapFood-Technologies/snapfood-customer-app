import React, { useCallback, useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ImagePicker from 'react-native-image-crop-picker';
import { connect } from 'react-redux';
import { getImageFullURL, isEmpty } from '../../../common/services/utility';
import Theme from '../../../theme';
import ImgPickOptionModal from '../../../common/components/modals/ImgPickOptionModal';
import { AppText } from '../../../common/components';
import { translate } from '../../../common/services/translate';

const StudentVerifyImgUploader = (props) => {
	const { photo, fullUrl, setPhoto, canChange } = props;
	const [showPickerModal, setShowPickerModal] = useState(false);

	const open = useCallback(() => setShowPickerModal(true), []);
	const close = useCallback(() => setShowPickerModal(false), []);

	const onImage = useCallback((image) => {
		setPhoto(image);
		close();
	}, []);
	const onImageUpload = useCallback(() => ImagePicker.openPicker({ mediaType: 'photo', ...cameraOptions }).then(onImage), []);
	const onCapture = useCallback(() => ImagePicker.openCamera(cameraOptions).then(onImage), []);

	const card_title = useMemo(() => {
		if (props.language == 'sq' && !isEmpty(props.studentVerifySettings?.card_title)) {
			return props.studentVerifySettings?.card_title;
		}
		else if (props.language == 'en' && !isEmpty(props.studentVerifySettings?.card_title_en)) {
			return props.studentVerifySettings?.card_title_en;
		}
		else if (props.language == 'it' && !isEmpty(props.studentVerifySettings?.card_title_it)) {
			return props.studentVerifySettings?.card_title_it;
		}
		return translate('student_verify.student_card');
	}, [props.studentVerifySettings?.card_title, props.studentVerifySettings?.card_title_en,
	props.studentVerifySettings?.card_title_it, props.language])

	const card_desc = useMemo(() => {
		if (props.language == 'sq' && !isEmpty(props.studentVerifySettings?.card_desc)) {
			return props.studentVerifySettings?.card_desc;
		}
		else if (props.language == 'en' && !isEmpty(props.studentVerifySettings?.card_desc_en)) {
			return props.studentVerifySettings?.card_desc_en;
		}
		else if (props.language == 'it' && !isEmpty(props.studentVerifySettings?.card_desc_it)) {
			return props.studentVerifySettings?.card_desc_it;
		}
		return null;
	}, [props.studentVerifySettings?.card_desc, props.studentVerifySettings?.card_desc_en,
	props.studentVerifySettings?.card_desc_it, props.language])

	return (
		<>
			<View style={[Theme.styles.col_center, { width: '100%' }]} >
				<View style={[Theme.styles.col_center_start, styles.photoView]}>
					{
						isEmpty(photo.path) ?
							<View style={[Theme.styles.col_center, { alignItems: 'flex-start', height: '100%', padding: 20 }]}>
								<AppText style={styles.cardTitle}>
									{card_title}
								</AppText>
								{
									!isEmpty(card_desc) &&
									<AppText style={styles.cardDesc}>{card_desc}</AppText>
								}
								<View style={{ flex: 1 }} />
								{
									canChange &&
									<TouchableOpacity onPress={open} style={[Theme.styles.col_center, styles.uploadBtn]}>
										<AppText style={[styles.uploadTxt, { color: Theme.colors.white }]}>{translate('student_verify.upload_image')}</AppText>
									</TouchableOpacity>
								}
							</View>
							:
							<FastImage
								source={{ uri: photo.path }}
								style={styles.avatarImg}
								resizeMode={FastImage.resizeMode.cover}
							/>
					}
				</View>
				{
					!isEmpty(photo.path) && canChange &&
					<TouchableOpacity onPress={open} style={[Theme.styles.col_center, styles.photoEdit]}>
						<AntDesign name={'edit'} size={14} color={Theme.colors.white} />
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
	photoView: {
		height: 180,
		width: '100%',
		borderWidth: 1,
		borderColor: Theme.colors.gray6,
		borderRadius: 12,
		alignItems: 'flex-start',
		// overflow: 'hidden'
	},
	avatarImg: { width: '100%', height: '100%', borderRadius: 6 },
	uploadBtn: { paddingHorizontal: 20, paddingVertical: 4, borderRadius: 30, backgroundColor: Theme.colors.cyan2 },
	photoEdit: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: Theme.colors.cyan2,
		position: 'absolute',
		top: -5,
		right: 0,
	},
	uploadTxt: {
		// marginTop: 5,
		marginBottom: 5,
		marginRight: 4,
		textAlign: 'center',
		fontSize: 16,
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.gray1
	},
	cardTitle: {
		fontSize: 17,
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.text
	},
	cardDesc: {
		marginTop: 12,
		fontSize: 15,
		lineHeight: 20,
		fontFamily: Theme.fonts.medium,
		color: Theme.colors.text
	}
});

const cameraOptions = { cropping: true, includeBase64: true };

const mapStateToProps = ({ app }) => ({
	language: app.language,
	studentVerifySettings: app.studentVerifySettings
});

export default connect(mapStateToProps, {
})(StudentVerifyImgUploader);