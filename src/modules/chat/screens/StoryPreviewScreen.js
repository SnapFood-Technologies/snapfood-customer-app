import React, { useState, useRef, useEffect } from 'react';
import {
	View,
	Image,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	ScrollView,
	TextInput,
	Text,
	KeyboardAvoidingView
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Header from '../../../common/components/Header1';
import { connect } from 'react-redux';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import alerts from '../../../common/services/alerts';
import RouteNames from '../../../routes/names';
import { setOpenStoryImgPickModal } from '../../../store/actions/chat';
import { story_collection, updateStory, uploadImage, uploadVideo, updateSeenStory, deleteStory, updateStoryViewers } from '../../../common/services/user_story';
import { AppText, MainBtn } from '../../../common/components';
import { height, width } from 'react-native-dimension';
import AppTooltip from '../../../common/components/AppTooltip';
import Config from '../../../config';
import StoryMentionModal from '../../../common/components/modals/StoryMentionModal';
import { getImageFullURL } from '../../../common/services/utility';

const StoryPreviewScreen = (props) => {
	const [imageUploading, setImageUploading] = useState(false);
	const [isMuted, setMute] = useState(false);

	const [isMentionModal, setMentionModal] = useState(false);
	const [mentions, setMentions] = useState([]);

	const imageData = props.route.params.imageData;
	const videoData = props.route.params.videoData;
	const isImage = props.route.params.isImage == true;
	const isCaptured = props.route.params.isCaptured == true;

	const onAddPhoto = async () => {
		if (isImage) {
			if (imageData != null && imageData.data != null) {
				try {
					setImageUploading(true);
					let res = await uploadImage(imageData.data);
					if (res != null && res.data != null && res.data.success == true) {
						await updateStory(props.user, res.data.url, null, isCaptured, mentions);
					}
					setImageUploading(false);
				} catch (error) {
					
					setImageUploading(false);
				}
			}
		}
		else {
			if (videoData && videoData.uri) {
				try {
					setImageUploading(true);
					let res = await uploadVideo(videoData, isMuted);
					if (res != null && res.data != null && res.data.success == true) {
						await updateStory(props.user, res.data.url, res.data.thumbnail_url, false, mentions);
					}
					setImageUploading(false);
				} catch (error) {
					
					setImageUploading(false);
				}
			}
		}

		return props.navigation.goBack();
	};

	return (
		<>
			<View style={styles.container}>
				{/* <Spinner visible={imageUploading} /> */}
				{
					isImage ?
						<Image source={{ uri: imageData.path }} style={[styles.img, (isCaptured != true || imageData.pictureOrientation == 3) && { resizeMode: 'contain' }]} />
						:
						<Video
							source={{ uri: videoData.uri }}
							paused={imageUploading}
							style={styles.video}
							resizeMode={'contain'}
							controls={Config.isAndroid ? false : true}
							muted={isMuted}
						/>
				}

				<View style={[styles.bottom, { justifyContent: (imageUploading ? 'flex-start' : 'flex-end'), paddingTop: 20 }]}>
					{
						imageUploading ?
							<View style={[Theme.styles.row_center, { paddingBottom: 10 }]}>
								<ActivityIndicator color={Theme.colors.white} size={28} />
								<AppText style={styles.uploadingTxt}>{translate('social.uploading')}...</AppText>
							</View>
							:
							<MainBtn
								style={{ width: 150, height: 42, ...Theme.styles.row_center }}
								title={translate('social.share_story')}
								onPress={onAddPhoto}
							/>
					}
				</View>
				{
					!isMentionModal &&
					<>
						<View style={[Theme.styles.col_center, styles.mentionsView]}>
							{
								mentions.map((item, index) =>
									<TouchableOpacity style={[Theme.styles.row_center, styles.mentionItem]}
										onPress={()=> {
											props.navigation.navigate(RouteNames.SnapfooderScreen, { user: item });
										}}
									>
										<AppText style={styles.mentionItemTxt}>@{item.full_name}</AppText>
									</TouchableOpacity>
								)
							}
						</View>
						<Header
							left={
								<TouchableOpacity
									style={[Theme.styles.col_center, styles.backBtn]}
									disabled={imageUploading}
									onPress={() => {
										props.navigation.goBack();
										props.setOpenStoryImgPickModal(true);
									}}
								>
									<Feather name='chevron-left' size={24} color={'#fff'} />
								</TouchableOpacity>
							}
							right={
								imageUploading == false && (
									isImage ?
										(props.all_friends.length > 0 &&
											<TouchableOpacity
												onPress={() => {
													setMentionModal(true)
												}}
												style={[Theme.styles.col_center, styles.modeBtn]}
											>
												<Octicons name={'mention'} size={20} color='#fff' />
											</TouchableOpacity>
										)
										:
										<View style={[Theme.styles.row_center]}>
											{props.all_friends.length > 0 &&
												<TouchableOpacity
													onPress={() => {
														setMentionModal(true)
													}}
													style={[Theme.styles.col_center, styles.modeBtn]}
												>
													<Octicons name={'mention'} size={20} color='#fff' />
												</TouchableOpacity>
											}
											<AppTooltip
												title={translate('social.story_max_duration_tooltip_title')}
												description={translate('social.story_max_duration_tooltip_description')}
												placement={'bottom'}
												anchor={
													<View style={[Theme.styles.col_center, styles.modeBtn]}>
														<FontAwesome name='info' size={20} color={Theme.colors.white} />
													</View>
												}
											/>
											<View style={{ width: 12 }} />
											<TouchableOpacity
												onPress={() => {
													setMute(pre => !pre)
												}}
												style={[Theme.styles.col_center, styles.modeBtn]}
											>
												<Octicons name={isMuted ? 'mute' : 'unmute'} size={20} color='#fff' />
											</TouchableOpacity>
										</View>
								)
							}
							style={styles.header}
						/>
					</>
				}
			</View>
			<StoryMentionModal
				showModal={isMentionModal}
				all_friends={props.all_friends}
				onClose={(mentioned) => {
					if (mentioned != null) {
						let cpy = mentions.slice(0);
						const index = cpy.findIndex(m => m.id == mentioned?.id);
						if (index == -1) {
							cpy.push(mentioned);
						}
						setMentions(cpy);
					}
					setMentionModal(false)
				}}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: '100%',
		backgroundColor: '#000'
	},
	img: {
		flex: 1,
		// width: '100%',
		// resizeMode: 'contain'
	},
	video: {
		flex: 1,
		width: '100%',
	},
	bottom: {
		width: '100%',
		paddingHorizontal: 20,
		paddingBottom: 20,
		paddingTop: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end'
	},
	backBtn: { backgroundColor: '#50b7ed80', width: 40, height: 40, borderRadius: 20, },
	uploadingTxt: { marginLeft: 10, fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.white },
	modeBtn: { width: 40, height: 40, borderRadius: 24, backgroundColor: Theme.colors.cyan2 },
	header: { position: 'absolute', top: 20, left: 0, paddingHorizontal: 20, width: '100%', justifyContent: 'flex-end' },
	mentionsView: {
		position: 'absolute',
		top: 100,
		left: 0,
		width: width(100),
		height: height(100) - 200,
	},
	mentionItem: {marginTop: 6, padding: 6, borderRadius: 8, backgroundColor: Theme.colors.white },
	mentionItemTxt: { fontSize: 20, lineHeight: 24, color: Theme.colors.red1, fontFamily: Theme.fonts.semiBold },
});

const mapStateToProps = ({ app, chat }) => ({
	isLoggedIn: app.isLoggedIn,
	language: app.language,
	user: app.user,
	all_friends: app.all_friends || [],
});

export default connect(
	mapStateToProps,
	{
		setOpenStoryImgPickModal
	},
)(StoryPreviewScreen);
