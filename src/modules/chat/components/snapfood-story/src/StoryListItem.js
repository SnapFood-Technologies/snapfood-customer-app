import React, { useState, useEffect, useRef, useCallback } from 'react';
import useStatusBarHeight from '../../../../../common/components/useStatusBarHeight';
import DarkStatusBar from './DarkStatusBar';
import {
	Animated,
	Image,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	TouchableWithoutFeedback,
	ActivityIndicator,
	View,
	Platform,
	SafeAreaView,
	TextInput,
	Keyboard,
	KeyboardAvoidingView,
} from 'react-native';
import convertToProxyURL from 'react-native-video-cache';
import Video from 'react-native-video';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';
import SnackBar from 'react-native-snackbar-component'
import { getViewerIds, usePrevious } from "./helpers/StateHelpers";
import { isNullOrWhitespace } from "./helpers/ValidationHelpers";
import GestureRecognizer from 'react-native-swipe-gestures';
import { getElapsedTime } from '../../../../../common/services/utility';
import Theme from '../../../../../theme';
import { translate } from '../../../../../common/services/translate';
import Config from '../../../../../config';
import alerts from '../../../../../common/services/alerts';
import { setTmpCurStoryVideo } from '../../../../../store/actions/app';

const { width, height } = Dimensions.get('window');

export const StoryListItem = (props) => {
	const stories = props.stories;
	const statusHeight = useStatusBarHeight();
	const dispatch = useDispatch();

	const [load, setLoad] = useState(true);
	const [pressed, setPressed] = useState(false);
	const [videoPaused, setVideoPaused] = useState(true);
	const [content, setContent] = useState(
		stories.map((x) => {
			return {
				story_id: x.story_id,
				image: x.story_image,
				image_thumb: x.story_image_thumb,
				is_captured: x.story_captured,
				mentions: x.story_mentions || [],
				viewers: x.viewers,
				onPress: x.onPress,
				swipeText: x.swipeText,
				finish: 0
			}
		}));

	const [current, setCurrent] = useState(0);

	const [isMessageEntering, setIsMessageEntering] = useState(false);
	const [message, setMessage] = useState('');
	const [showSnackBar, setShowSnackBar] = useState(false);

	const _isInputFocused = useRef(false);
	const _isMsgSendingNow = useRef(false);

	const progress = useRef(new Animated.Value(0)).current;

	const prevCurrentPage = usePrevious(props.currentPage);

	useEffect(() => {
		let isPrevious = prevCurrentPage > props.currentPage;
		if (isPrevious) {
			setCurrent(content.length - 1);
		} else {
			setCurrent(0);
		}

		let data = [...content];
		data.map((x, i) => {
			if (isPrevious) {
				x.finish = 1;
				if (i == content.length - 1) {
					x.finish = 0;
				}
			} else {
				x.finish = 0;
			}

		})
		setContent(data)
		// start();

		if (props.storyUniqueIndex == props.currentPage) {
			setVideoPaused(false);
		}
		else {
			setVideoPaused(true);
		}
	}, [props.currentPage]);

	useEffect(() => {
		if (current >= stories.length) {
			let new_current = current - 1;
			if (new_current < 0 || new_current >= stories.length) {
				close('next');
			}
			else {
				// close('next');
				setCurrent(new_current);
				setContent(
					stories.map((x) => {
						return {
							story_id: x.story_id,
							image: x.story_image,
							image_thumb: x.story_image_thumb,
							is_captured: x.story_captured,
							mentions: x.story_mentions || [],
							viewers: x.viewers,
							onPress: x.onPress,
							swipeText: x.swipeText,
							finish: 0
						}
					})
				);
			}
		}
		else {
			setContent(
				stories.map((x) => {
					return {
						story_id: x.story_id,
						image: x.story_image,
						image_thumb: x.story_image_thumb,
						is_captured: x.story_captured,
						mentions: x.story_mentions || [],
						viewers: x.viewers,
						onPress: x.onPress,
						swipeText: x.swipeText,
						finish: 0
					}
				})
			);
		}

	}, [stories])


	useEffect(() => {
		if (props.isViewerModalOpen == true) {
			setIsMessageEntering(true);
			progress.stopAnimation();
		}
		else {
			setIsMessageEntering(false);
			if (!load) {
				startAnimation();
			}
		}
	}, [props.isViewerModalOpen])

	const prevCurrent = usePrevious(current);

	useEffect(() => {
		if (!isNullOrWhitespace(prevCurrent)) {
			if (current > prevCurrent && (current - 1 >= 0) && content[current - 1].image == content[current].image) {
				start();
			} else if (current < prevCurrent && (current + 1 < content.length) && content[current + 1].image == content[current].image) {
				start();
			}
		}

		// on seen image
		props.seen_image(content[current].image);
	}, [current]);

	useEffect(() => {
		dispatch(setTmpCurStoryVideo(content[current].image));
	}, [content[current].image])



	function start(duration) {
		
		if (isMessageEntering) return;
		setLoad(false);
		progress.setValue(0);
		startAnimation(duration);
	}

	function startAnimation(duration) {
		let fined_duration = (duration != null && duration > 0) ? duration : props.duration;
		try {
			let current_progress = Number.parseFloat(JSON.stringify(progress));
			fined_duration = (1 - current_progress) * fined_duration;
		} catch (error) {

		}

		

		Animated.timing(progress, {
			toValue: 1,
			duration: fined_duration * 1000,
			useNativeDriver: false
		}).start(({ finished }) => {
			if (finished) {
				next();
			}
		});
	}

	function onSwipeUp() {
		if (props.onClosePress) {
			props.onClosePress();
		}
		if (content[current].onPress) {
			content[current].onPress();
		}
	}

	function onSwipeDown() {
		props?.onClosePress();
	}

	const config = {
		velocityThreshold: 0.3,
		directionalOffsetThreshold: 80
	};

	function next() {
		// check if the next content is not empty
		setLoad(true);
		if (current !== content.length - 1) {
			let data = [...content];
			data[current].finish = 1;
			setContent(data);
			setCurrent(current + 1);
			progress.setValue(0);
		} else {
			// the next content is empty
			close('next');
		}
	}

	function previous() {
		// checking if the previous content is not empty
		setLoad(true);
		if (current - 1 >= 0) {
			let data = [...content];
			data[current].finish = 0;
			setContent(data);
			setCurrent(current - 1);
			progress.setValue(0);
		} else {
			// the previous content is empty
			close('previous');
		}
	}

	function close(state) {
		let data = [...content];
		data.map(x => x.finish = 0);
		setContent(data);
		progress.setValue(0);
		if (props.currentPage == props.index) {
			if (props.onFinish) {
				props.onFinish(state);
			}
		}
	}

	const onSendMessage = () => {
		if (message == '') return;
		if (_isMsgSendingNow.current == true) {
			return;
		}
		_isMsgSendingNow.current = true;

		setIsMessageEntering(true);
		progress.stopAnimation();

		setTimeout(() => {
			props.onMessageSentCallback();
			_isMsgSendingNow.current = false;
			setMessage('');
			setIsMessageEntering(false);
			startAnimation();
			Keyboard.dismiss();
		}, 600)

		props.onSendStoryReplyMessage(props.storyData, content[current].image, content[current].image_thumb, message)
			.then((res) => {
				_isMsgSendingNow.current = false;
			})
			.catch(err => {
				_isMsgSendingNow.current = false;
			});
	}

	const swipeText = content?.[current]?.swipeText || props.swipeText || 'Swipe Up';

	const changeText = useCallback((text) => setMessage(text), []);
	const setInputFocus = useCallback((visibility) => {
		_isInputFocused.current = visibility;
		setIsMessageEntering(visibility);
	}, [])
	const onFocus = useCallback(() => {
		
		setInputFocus(true)
		progress.stopAnimation();
	}, [progress, setInputFocus])
	const onBlur = useCallback(() => {
		
		setInputFocus(false)
		startAnimation();
	}, [startAnimation, setInputFocus])


	
	return (
		<GestureRecognizer
			onSwipeUp={(state) => onSwipeUp(state)}
			onSwipeDown={(state) => onSwipeDown(state)}
			config={config}
			style={{
				flex: 1,
				backgroundColor: 'black',
			}}
		>
			<>
				<DarkStatusBar />
				<View style={{ ...styles.backgroundContainer, top: Config.isAndroid ? (statusHeight - 5) : (statusHeight) }}>
					{
						(content[current].image?.includes('.mp4') == true || content[current].image?.includes('.mov') == true) ?
							<Video
								source={{ uri: convertToProxyURL(content[current].image) }}
								style={[styles.video, { height: Config.isAndroid ? (height - 90) : (height - 80) }]}
								resizeMode={'contain'}
								controls={false}
								paused={videoPaused}
								muted={videoPaused}
								onLoad={(payload) => {
									
									if (props.storyUniqueIndex == props.currentPage) {
										setVideoPaused(false);
									}
									else {
										setVideoPaused(true);
									}
									start(payload.duration)
								}}
							/>
							:
							<FastImage
								onLoadEnd={() => start()}
								source={{ uri: content[current].image }}
								resizeMode={content[current].is_captured != true ? 'contain' : null}
								style={[styles.image, { height: Config.isAndroid ? (height - 90) : (height - 80) }]}
							/>
					}
				</View>
			</>

			<View style={{ flexDirection: 'column', flex: 1 }}>
				<LinearGradient colors={['rgba(70,75,50,0.15)', 'rgba(255,255,255,0)']}>
					<View style={styles.animationBarContainer}>
						{content.map((index, key) => {
							return (
								<View key={key} style={styles.animationBackgroundMask}>
									<View key={key} style={styles.animationBackground}>
										<Animated.View
											style={{
												flex: current == key ? progress : content[key].finish,
												height: 2,
												left: 0,
												backgroundColor: '#fff',
											}}
										/>
									</View>
								</View>
							);
						})}
					</View>
					<View style={styles.userContainer}>
						<TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}
							onPress={() => {
								if (props.onNamePress) {
									props.onNamePress();
								}
							}}>
							<Image style={styles.avatarImage} source={{ uri: props.profileImage }} />
							<Text style={styles.avatarText}>{props.profileName}</Text>
							<Text style={{ fontSize: 15, color: '#fff', fontFamily: Theme.fonts.medium }}>
								{getElapsedTime(content[current].story_id)}
							</Text>
						</TouchableOpacity>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<TouchableOpacity
								onPress={() => {
									if (props.onClosePress) {
										props.onClosePress();
									}
								}}
							>
								<View style={styles.closeIconContainer}>
									{props.customCloseComponent ? (
										props.customCloseComponent
									) : (
										<Text style={{ color: 'white' }}>X</Text>
									)}
								</View>
							</TouchableOpacity>
						</View>
					</View>
				</LinearGradient>
				<View style={[Theme.styles.col_center, styles.pressContainer]}>
					<TouchableWithoutFeedback
						onPressIn={() => progress.stopAnimation()}
						onLongPress={() => setPressed(true)}
						onPressOut={() => {
							setPressed(false);
							startAnimation();
						}}
						onPress={() => {
							if (_isInputFocused.current == true) {
								Keyboard.dismiss();
							} else {
								if (!pressed && !load) {
									setIsMessageEntering(false);
									previous();
								}
							}
						}}

					>
						<View style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: (width / 2) }} />
					</TouchableWithoutFeedback>
					<TouchableWithoutFeedback
						onPressIn={() => { progress.stopAnimation() }}
						onLongPress={() => setPressed(true)}
						onPressOut={() => {
							setPressed(false);
							startAnimation();
						}}
						onPress={() => {
							if (_isInputFocused.current == true) {
								Keyboard.dismiss();
							} else {
								if (!pressed && !load) {
									setIsMessageEntering(false);
									next();
								}
							}
						}}

					>
						<View style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: (width / 2) }} />
					</TouchableWithoutFeedback>
					<View style={[Theme.styles.col_center]}>
						{
							content[current].mentions.map((item, index) =>
								<TouchableOpacity style={[Theme.styles.row_center, styles.mentionItem]}
									onPress={() => {
										if (props.onMentionPress) {
											props.onMentionPress(item);
										}
									}}
								>
									<Text style={styles.mentionItemTxt}>@{item.full_name}</Text>
								</TouchableOpacity>
							)
						}
					</View>
				</View>
			</View>
			{content[current].onPress && (
				<TouchableOpacity activeOpacity={1} onPress={onSwipeUp} style={styles.swipeUpBtn}>
					{props.customSwipeUpComponent ? (
						props.customSwipeUpComponent
					) : (
						<>
							<Text style={{ color: 'white', marginTop: 5 }}></Text>
							<Text style={{ color: 'white', marginTop: 5 }}>{swipeText}</Text>
						</>
					)}
				</TouchableOpacity>
			)}
			{!props.is_mine ? (
				<KeyboardAvoidingView
					style={{}}
					behavior='padding'
					keyboardVerticalOffset={Config.isAndroid == false ? undefined : 30}
				>
					<View style={[styles.inputView, isMessageEntering && { marginBottom: (Platform.OS == 'ios' ? -20 : -10) }]}>
						<TextInput
							style={styles.textinput}
							value={message}
							placeholder={translate('social.send_message')}
							placeholderTextColor={Theme.colors.white}
							onChangeText={changeText}
							onFocus={onFocus}
							onBlur={onBlur}
						/>
						<TouchableOpacity onPress={onSendMessage}>
							<Feather name='send' color={'#fff'} size={26} />
						</TouchableOpacity>
					</View>
				</KeyboardAvoidingView>
			)
				:
				<View style={[styles.inputView, { justifyContent: 'flex-end', paddingRight: 30 }]}>
					<TouchableOpacity
						style={[Theme.styles.row_center]}
						onPress={() => {
							let viewerIds = getViewerIds(content[current].viewers || [], props.userId);
							if (viewerIds != null && viewerIds.length > 0 && props.onViewerPress) {
								props.onViewerPress(viewerIds);
							}
						}}
					>
						<FontAwesome name='eye' size={20} color={'#fff'} />
						<Text
							style={{
								marginLeft: 6,
								fontSize: 16,
								fontFamily: Theme.fonts.semiBold,
								color: Theme.colors.white,
							}}
						>
							{getViewerIds(content[current].viewers || [], props.userId).length}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={{ marginLeft: 25 }}
						onPress={() => {
							setIsMessageEntering(true);
							progress.stopAnimation();
							alerts
								.confirmation(
									translate('alerts.confirmation'),
									props.userGender == 'female'
										? translate('social.delete_story_female_confirm')
										: translate('social.delete_story_confirm')
								)
								.then(async () => {
									setIsMessageEntering(false);
									startAnimation();
									props.onDeletePress(content[current].image);
								})
								.catch(() => {
									setIsMessageEntering(false);
									startAnimation();
								});
						}}
					>
						<Feather name='trash-2' size={18} color={'#fff'} />
					</TouchableOpacity>
				</View>
			}
		</GestureRecognizer>
	);
}


export default StoryListItem;

StoryListItem.defaultProps = {
	duration: 10000
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
	},
	image: {
		width: width,
		//resizeMode: 'contain',
	},
	video: {
		flex: 1,
		width: width,
	},
	backgroundContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
	},
	spinnerContainer: {
		zIndex: -100,
		position: 'absolute',
		justifyContent: 'center',
		backgroundColor: 'black',
		alignSelf: 'center',
		width: width,
		height: height,
	},
	animationBarContainer: {
		flexDirection: 'row',
		paddingTop: 10,
		paddingHorizontal: 10,
	},
	animationBackgroundMask: {
		flex: 1,
		flexDirection: 'row',
		marginHorizontal: 2,
		backgroundColor: 'rgba(210,210,210,1)',
	},
	animationBackground: {
		height: 2,
		flex: 1,
		flexDirection: 'row',
		backgroundColor: 'rgba(0,0,0,0.1)',
	},
	userContainer: {
		height: 50,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 15,
		backgroundColor: 'rgba(0,0,0,0.003)',
		marginBottom: 70,
	},
	avatarImage: {
		height: 30,
		width: 30,
		borderRadius: 100,
	},
	avatarText: {
		fontFamily: Theme.fonts.bold,
		color: 'white',
		fontSize: 15,
		paddingLeft: 10,
		paddingRight: 8,
	},
	closeIconContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 50,
		paddingHorizontal: 15,
	},
	pressContainer: {
		flex: 1,
	},
	swipeUpBtn: {
		position: 'absolute',
		right: 0,
		left: 0,
		alignItems: 'center',
		bottom: Platform.OS == 'ios' ? 20 : 50,
	},
	inputView: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		height: 80,
		paddingHorizontal: 20,
		paddingBottom: 20,
		backgroundColor: '#000',
	},
	textinput: {
		flex: 1,
		height: 44,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderRadius: 22,
		borderColor: '#fff',
		marginRight: 16,
		color: '#fff',
	},
	mentionItem: { marginTop: 6, padding: 6, borderRadius: 8, backgroundColor: Theme.colors.white },
	mentionItemTxt: { fontSize: 20, lineHeight: 24, color: Theme.colors.red1, fontFamily: Theme.fonts.semiBold },
});
