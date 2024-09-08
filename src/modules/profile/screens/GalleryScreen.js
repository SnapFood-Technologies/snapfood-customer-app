import React, { useEffect, useRef, useState } from 'react';
import { Text, View, TextInput, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import Feather from 'react-native-vector-icons/Feather'
import Theme from '../../../theme';
import Dropdown from '../../home/components/Dropdown';
import AppText from '../../../common/components/AppText';
import Header1 from '../../../common/components/Header1';
import { translate } from '../../../common/services/translate';
import CommentInput from '../../orders/components/CommentInput';
const { width } = Dimensions.get('window');
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import { MainBtn } from '../../../common/components';
import RouteNames from '../../../routes/names';
import GalleryImageUploader from '../components/GalleryImageUploader';
import GalleryMoreBtn from '../components/GalleryMoreBtn';

const GalleryScreen = (props) => {
	const _gallery = useRef([]);
	const [gallery, setGallery] = useState([]);

	useEffect(() => {
		loadGallery();
	}, [])

	const updateGallery = (data) => {
		_gallery.current = data || [];
		setGallery(_gallery.current);
	}

	const loadGallery = () => {
		apiFactory.get(`users/gallery`)
			.then(({ data }) => {
				let galleries = data.gallery || [];
				let tmp = [];
				for (let i = 0; i < props.gallery_max_count; i++) {
					tmp.push({
						uid: i,
						id: (i < galleries.length) ? galleries[i].id : null,
						remoteUrl: (i < galleries.length) ? galleries[i].photo : null,
						localUrl: null
					})
				}
				updateGallery(tmp);
			})
			.catch(err => {
				console.log('loadGallery ', err);
			});
	}

	const uploadPhoto = (data, index) => {
		let cpyGallery = _gallery.current.slice(0);
		if (index >= 0 && index < _gallery.current.length) {
			cpyGallery[index].localUrl = data?.path;
			cpyGallery[index].loading = true;
			updateGallery(cpyGallery);
		}
		else {
			return;
		}
		apiFactory
			.post(`users/add-profile-gallery`, {
				gallery_id: cpyGallery[index].id,
				image: data?.data
			})
			.then(
				({ data }) => {
					let cpyGallery = _gallery.current.slice(0);
					cpyGallery[index].id = data?.data?.id;
					cpyGallery[index].remoteUrl = data?.data?.photo;
					cpyGallery[index].loading = false;
					updateGallery(cpyGallery);

				},
				(error) => {
					cpyGallery[index].loading = false;
					updateGallery(cpyGallery);
					console.log('uploadPhoto err ', error);
					const message = error.message || translate('generic_error');
					alerts.error(translate('alerts.error'), message);
				}
			);
	}

	const onDeleteGallery = (index) => {
		let gallery_id = null;
		let cpyGallery = gallery.slice(0);
		if (index >= 0 && index < gallery.length) {
			gallery_id = cpyGallery[index].id;
		}
		else {
			return;
		}
		apiFactory
			.post(`users/delete-profile-gallery`, {
				gallery_id: gallery_id
			})
			.then(
				({ data }) => {
					cpyGallery[index].localUrl = null;
					cpyGallery[index].remoteUrl = null;
					cpyGallery[index].loading = false;
					updateGallery(cpyGallery);

				},
				(error) => {
					cpyGallery[index].loading = false;
					updateGallery(cpyGallery);
					console.log('uploadPhoto err ', error);
					const message = error.message || translate('generic_error');
					alerts.error(translate('alerts.error'), message);
				}
			);

	}

	const onGoPublicView = () => {
		props.navigation.navigate(RouteNames.SnapfooderScreen, { user: props.user });
	}

	return (
		<View style={[Theme.styles.background, { padding: 0 }]}>
			<Header1
				style={{ marginTop: 20, paddingHorizontal: 20, marginBottom: 0 }}
				onLeft={() => props.navigation.goBack()}
				title={translate('gallery.title')}
				right={
					<GalleryMoreBtn
						onGallerySetting={() => {
							props.navigation.navigate(RouteNames.GallerySettingScreen)
						}}
					/>
				}
			/>
			<KeyboardAwareScrollView
				style={[{ flex: 1, width: '100%' }]}
				keyboardShouldPersistTaps='handled'
				scrollIndicatorInsets={{ right: 1 }}>
				<View style={[Theme.styles.col_center, { width: '100%', paddingHorizontal: 20, paddingTop: 10 }]}>
					<AppText style={styles.description}>{translate('gallery.your_photos')}</AppText>
					<AppText style={styles.subDescription}>{translate('gallery.description').replace('#', ('' + props.gallery_max_count))}</AppText>
					<View style={{ height: 20 }} />
					<View style={[Theme.styles.row_center, styles.galleries]}>
						{
							gallery.map((item, index) =>
								<GalleryImageUploader key={index}
									data={item}
									setPhoto={(data) => uploadPhoto(data, index)}
									onDelete={() => {
										alerts
											.confirmation(
												translate('alerts.confirmation'),
												translate('gallery.delete_confirm')
											)
											.then(async () => {
												onDeleteGallery(index)
											})
											.catch(() => {
											});
									}}
								/>
							)
						}
					</View>
					<TouchableOpacity style={[Theme.styles.row_center, styles.btn]} onPress={onGoPublicView} >
						<Feather name='eye' color={Theme.colors.text} size={22} />
						<Text style={[styles.btnTxt, { flex: 1, marginHorizontal: 9 }]}>{translate('gallery.see_public')}</Text>
						<Feather name='arrow-right' color={Theme.colors.text} size={18} />
					</TouchableOpacity>
				</View>
				<View style={{ height: 40 }} />
			</KeyboardAwareScrollView>
		</View>
	);
};
const styles = StyleSheet.create({
	description: {
		fontSize: 20,
		lineHeight: 24,
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.text,
		width: '100%'
	},
	subDescription: {
		marginTop: 12,
		fontSize: 15,
		lineHeight: 18,
		fontFamily: Theme.fonts.medium,
		color: '#616161',
		width: '100%'
	},
	galleries: {
		flexWrap: 'wrap',
		width: '100%',
		justifyContent: 'space-between'
	},
	btn: { marginTop: 20, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#B4B4CD', backgroundColor: Theme.colors.white },
	btnTxt: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium }
});

const mapStateToProps = ({ app }) => ({
	language: app.language,
	user: app.user,
	systemSettings: app.systemSettings || {},
	gallery_max_count: app.systemSettings?.profile_gallery_max_count ?? 6
});

export default connect(mapStateToProps, {
})(GalleryScreen);