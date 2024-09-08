import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	PermissionsAndroid,
	SafeAreaView,
	Platform,
	Keyboard,
	Linking,
	ActivityIndicator,
} from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import AndroidOpenSettings from 'react-native-android-open-settings';
import { useSafeArea } from 'react-native-safe-area-context';
import { GiftedChat } from 'react-native-gifted-chat';
import ImagePicker from 'react-native-image-crop-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import GetLocation from 'react-native-get-location'
import { connect } from 'react-redux';
import RNFS from "react-native-fs";
import { convertTimestamp2Date } from '../../../common/services/utility';
import {
	channel_collection,
	sendMessage,
	getChannelData,
	deleteMessage,
	updateLastMessageOnChannel,
	uploadImage,
	seenUnreadCntChannel,
	deleteChannel,
	exitGroupChannel,
	setLike
} from '../../../common/services/chat';
import { goActiveScreenFromPush, removeSharingContent } from '../../../store/actions/app';
import { setMessagesByChannel } from '../../../store/actions/chat';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import alerts from '../../../common/services/alerts';
import RouteNames from '../../../routes/names';
import EmojiBoard from '../../../common/components/react-native-emoji-board';
import ConfirmModal from '../../../common/components/modals/ConfirmModal';
import ImgGalleryModal from '../../../common/components/modals/ImgGalleryModal';
import LocationMsgOptionModal from '../../../common/components/modals/LocationMsgOptionModal';
import MsgInfoModal from '../../../common/components/modals/MsgInfoModal';
import MessagesHeader from '../components/MessagesHeader';
import AudioInputView from '../components/AudioInputView';
import { renderInputToolbar, renderComposer, renderSend } from '../components/InputToolbar';
import { renderBubble, renderMessage } from '../components/MessageContainer';
import {
	checkLocationPermission,
	requestLocationPermission,
} from '../../../common/services/location';
import { ROLE_CUSTOMER, ROLE_RIDER } from '../../../config/constants';
import { setStorageKey, KEYS } from '../../../common/services/storage';
import SnackBar from 'react-native-snackbar-component'
import Toast from 'react-native-toast-message';
import apiFactory from '../../../common/services/apiFactory';
import _ from "lodash"
	const systemMsg = {
		_id: 1,
		text: '',
		createdAt: new Date(),
		system: true,
	};

const PerPage = 12;
const MessagesScreen = (props) => {
	const { setMessagesByChannel, route, user,messages, chat_channels } = props;
	const channel = useMemo(() => {
		return (chat_channels || []).find(({ id }) => id === route.params.channelId);
	}, [route.params.channelId || '']);
	const [channelData, setChannelData] = useState(channel || null);

	const [imageUploading, setImageUploading] = useState(false);

	const [prevLoading, setPrevLoading] = useState(false);
	const [hasMore, setHasMore] = useState(!!(messages.length > 0));

	const [isMuted, SetMuteGroup] = useState(false);
	const [isLeftGroup, SetLeftGroup] = useState(false);
	const [isDeleteGroupModal, ShowDeleteGroupModal] = useState(false);
	const [isExitGroupModal, ShowExitGroupModal] = useState(false);
	const [showShareLocModal, ShowShareModal] = useState(false);
	const [showEmoji, setShowEMoji] = useState(false);

	const [showMsgInfo, setShowMsgInfo] = useState(false);
	const [msgInfo, setMsgInfo] = useState(null);

	const [text, setText] = useState(props.route.params.defaultMsg || '');
	const invitation_code_ref = useRef(props.route.params.invitation_code);

	const [isGalleryModal, ShowGalleryModal] = useState(false);
	const [quote_msg, setQuoteMsg] = useState(null);
	const [images, setImages] = useState([]);
	const [isRecording, setRecording] = useState(false);
	const [showSnackBar, setShowSnackBar] = useState(false);
	const [modal_imgs, setModalImages] = useState([]);
	const [replyText, setReplyText] = useState('');
	const emojiData = useRef(null);
	const textChanged = useRef(false);
	const channelDataRef = useRef();
	const userId = useRef();
	const isFromPush = props.route.params.fromPush ?? false;
	const fromSharing = props.route.params.fromSharing ?? false;
	const pushChatMsgTime = props.route.params.pushChatMsgTime;
	const msgs_unlistener = useRef(null);
	const messagesKey = `${props.route.params?.channelId}${props.user?.id}`;
	const setMessages = (newMessages) => {
		setMessagesByChannel({ key: messagesKey, messages: newMessages });
	};

	const listenForMessages = () => {
		msgs_unlistener.current = getMessageCollection().onSnapshot((snaps) => {
			let msgs = messagesBySnapShots(snaps);
			if (JSON.stringify(messages || {}) !== JSON.stringify(msgs || {})) {
				setMessages(msgs);
			}
			if (hasMore !== !!(msgs.length > 0)) setHasMore(!!(msgs.length > 0));
		});
	};

	const clear = () => {
		if (msgs_unlistener.current != null) msgs_unlistener.current();
	};
	const onMount = async (callback) => {
		clear();
		if (!channel || (props.route.params.channelId !== channelData?.id)) {
			let newChannel = await getChannelData(props.route.params.channelId);
			setChannelData(newChannel);
		}
		loadChannelData();
		listenForMessages();
		callback && callback();
		return clear;
	};

	const isFromPushUpdated = () => {
		if(isFromPush) return onMount(() => props.goActiveScreenFromPush({isChatVisible: false }))
	}

// useEffect(onMount, []);
	useEffect(onMount, [route.params.channelId]);
	useEffect(isFromPushUpdated, [isFromPush]);

	useEffect(() => {
		channelDataRef.current = channelData;
	}, [channelData]);
	useEffect(() => {
		userId.current = props.user.id;
	}, [props.user.id]);

	useEffect(() => {
		return () => {
			if (channelDataRef?.current != null) {
				seenUnreadCntChannel(channelDataRef?.current, userId?.current);
			}
		};
	}, [])

	const clearUnreadMessages = async (channel) => {
		const haveMessagesToClear = (channel?.unread_cnt || {})[props.user.id] >= 1;
		return await haveMessagesToClear && seenUnreadCntChannel(channel, props.user.id);
	};

	const loadChannelData = async () => {
		await clearUnreadMessages(channelData);
		await fromSharing && checkForShared(channelData);
	};

	const checkForShared = async (channel) => {
		var sharedContent = props.sharedContent;
		var sharedMimeType = props.sharedMimeType;
		if (fromSharing == true) {
			sharedContent.forEach(content => {
				if (sharedMimeType.startsWith("image")) {
					onSendNewImagesForShare(content, channel)
				} else {
					onSendNewSharedMessage(content, channel)
				}
			});
			await props.removeSharingContent()
		}
	}

	const onSendNewSharedMessage = async (content, channel) => {
		let newMsg = {
			text: content,
			user: {
				_id: props.user.id,
				username: props.user.username,
				full_name: props.user.full_name,
				photo: props.user.photo,
				phone: props.user.phone,
				email: props.user.email,
			},
		};
		await sendMessage(channel.id, props.user.id, newMsg);
	}

	const onSendNewImagesForShare = async (content, channel) => {
		setImageUploading(true);
		var base64Image = await RNFS.readFile(content, 'base64');
		let res = await uploadImage(base64Image);
		let newMsg = {
			user: {
				_id: props.user.id,
				username: props.user.username,
				full_name: props.user.full_name,
				photo: props.user.photo,
				phone: props.user.phone,
				email: props.user.email,
			},
			images: [res.data.url]
		};
		await sendMessage(channel.id, props.user.id, newMsg);
		setImageUploading(false);
	}

	const getMessageCollection = () => {
		return channel_collection
			.doc(props.route.params.channelId)
			.collection('messages')
			.orderBy('created_time', 'desc')
			.limit(PerPage);
	}

	const messagesBySnapShots = (snapShots) => {
		let msgs = [];
		snapShots.docs.forEach(doc => {
			const { createdAt: fbDate } = doc.data() || {};
			console.log(fbDate);
			if (doc.exists) msgs.push({ ...doc.data(), createdAt: convertTimestamp2Date(fbDate), fbDate });
		});
		return msgs;
	}

	let start = (messages || [])[messages?.length - 1]?.created_time;
	const msgsString = JSON.stringify(messages || {});
	const loadPrevMessage = useCallback(() => {
		if (prevLoading || hasMore == false || messages.length == 0) return;
		if (start == null) return;

		setPrevLoading(true);
		getMessageCollection()
			.startAfter(start)
			.get()
			.then((snaps) => {
				let msgs = messagesBySnapShots(snaps);
				if (msgs.length > 0) {
					let tmpMsgs = messages.slice(0, messages.length);
					msgs.map((msg) => tmpMsgs.push(msg));
					setMessages(tmpMsgs);
				}
				setPrevLoading(false);
				setHasMore(!!(msgs.length > 0));
			})
			.catch((error) => {
				setPrevLoading(false);
				setHasMore(false);
			});
	}, [prevLoading, hasMore, messages.length || 0, start, msgsString]);
	
	const imagesString = JSON.stringify(images || {})
	const onSend = useCallback(
		async (newMessages = []) => {
			let isQuoted = false;
			let isImage = false;
			if (quote_msg != null) {
				newMessages.map((msg, index) => {
					newMessages[index].reply = quote_msg;
				});
				setQuoteMsg(null);
				isQuoted = true;
			}

			if (images != null && images.length > 0) {
				setImageUploading(true);
				console.log('upload started ', images.length);
				let imageUrls = [];
				for (var i = 0; i < images.length; i++) {
					if (images[i] != null && images[i].data != null) {
						try {
							let res = await uploadImage(images[i].data);
							if (res != null && res.data != null && res.data.success == true) {
								imageUrls.push(res.data.url);
							}
						} catch (error) {
							console.log('uploadImage ', error);
						}
					}
				}
				setImages([]);
				if (imageUrls.length == 0) {
					return;
				} else {
					newMessages.map((msg, index) => {
						newMessages[index].images = imageUrls;
					});
				}

				console.log('upload done ', newMessages.length);
				isImage = true;
			}

			if (emojiData.current != null) {
				newMessages.map((msg, index) => {
					newMessages[index].emojiData = emojiData.current;
				});
				emojiData.current = null;
			}

			//////////////
			if (invitation_code_ref.current != null) {
				newMessages.map((msg, index) => {
					newMessages[index].invitation_code = invitation_code_ref.current;
				});
				invitation_code_ref.current = null;
			}
			/////////////

			console.log('sendMessage start ', newMessages.length);
			for (var i = 0; i < newMessages.length; i++) {
				await sendMessage(channelData.id, props.user.id, newMessages[i]);
			}
			console.log('sendMessage done ', newMessages.length);
			setImageUploading(false);
		},
		[imagesString, quote_msg, channelData, props.user.id]
	);

	const addCurrentLocation = async () => {
		ShowShareModal(false);
		try {
			let hasPermission = await checkLocationPermission();
			if (hasPermission) {
				sendCurrentPosition()
			}
			else {
				requestLocationPermission()
					.catch(() => {
						alerts.error(translate('attention'), translate('locationUnavailable'));
					});
			}
		}
		catch (error) {
			console.log('checkLocationPermission : ', error)
			alerts.error(translate('attention'), translate('locationUnavailable'));
		}

	};

	const sendCurrentPosition = async () => {
		try {
			const location = await GetLocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000, });
			if (location) {
				let newMsg = {
					user: {
						_id: props.user.id,
						username: props.user.username,
						full_name: props.user.full_name,
						photo: props.user.photo,
						phone: props.user.phone,
						email: props.user.email,
						role: ROLE_CUSTOMER
					},
					map: {
						coords: {
							latitude: location.latitude,
							longitude: location.longitude
						},
						type: 0, // 0 : my location, 1 : a location
					},
				};
				onSend([newMsg]);
			}
		} catch (error) {
			const { code, message } = error;
			console.warn('onLater', code, message);
			alerts.error(translate('attention'), translate('locationUnavailable'));
		}
	}


	const goFindLocation = () => {
		ShowShareModal(false);
		props.navigation.navigate(RouteNames.LocationPickupScreen, { channelId: channelData.id });
	};
	const onPressLocation = () => {
		ShowShareModal(true);
	};

	const onSelectEmoji = (emoji) => {
		setShowEMoji(false);
		setText(text => text.concat(emoji.code));
		emojiData.current = emoji;
	};

	const onPressEmoji = () => {
		Keyboard.dismiss();
		setTimeout(() => {
			setShowEMoji(true);
		}, 100);
	};

	const onImageUpload = () => {
		ImagePicker.openPicker({
			mediaType: 'photo',
			multiple: true,
			cropping: false,
			includeBase64: true,
		}).then((images) => {
			setImages(prevData => ([...prevData, ...images]));
		})
			.catch(error => {
				console.log('image picker ', error);
			});
	};
	const onCapture = () => {
		ImagePicker.openCamera({
			cropping: false,
			includeBase64: true,
		}).then((image) => {
			setImages([image]);
		})
			.catch(error => {
				console.log('image picker ', error);
			});
	};

	const goApplicationSetting = useCallback(() => {
		alerts.confirmation(translate('attention'), translate('audioUnavailable'), 'Settings', translate('cancel'))
			.then(
				() => {
					if (Platform.OS === 'android') {
						AndroidOpenSettings.applicationSettings();
					} else {
						Linking.openURL('app-settings:');
					}
				},
				(error) => {
					alerts.error(translate('attention'), translate('audioUnavailable'));
				}
			);
	},[])
	const onChatRecord = useCallback(() => onRecord(setRecording,goApplicationSetting),[isRecording])

	const onSendAudio = async (currentTime, fileSize, base64) => {
		try {
			let res = await uploadImage(base64);
			if (res != null && res.data != null && res.data.success == true) {
				console.log('audio url ', res.data.url);
				let newMsg = {
					user: {
						_id: props.user.id,
						username: props.user.username,
						full_name: props.user.full_name,
						photo: props.user.photo,
						phone: props.user.phone,
						email: props.user.email,
						role: ROLE_CUSTOMER
					},
					audio: {
						url: res.data.url,
						duration: currentTime,
						fileSize: fileSize,
						playing: false,
						position: 0,
					},
				};
				onSend([newMsg]);
			}
		} catch (error) {
			console.log('onSendAudio error', error);
		}
		setRecording(false);
	};


	const onDeleteGroup = async () => {
		let ret = await deleteChannel(channelData.id);
		ShowDeleteGroupModal(false);
		if (ret == true) {
			props.navigation.goBack();
		} else {
			alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
		}
	};

	const onExitGroup = async () => {
		if (channelData.users.length > 1) {
			let ret = await exitGroupChannel(channelData, props.user.id);
			ShowExitGroupModal(false);
			if (ret == true) {
				props.navigation.goBack();
			} else {
				alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
			}
		} else {
			ShowExitGroupModal(false);
			onDeleteGroup();
		}
	};

	const onCancelQuote = () => {
		setQuoteMsg(null);
	};

	const onRemoveImage = (image) => {
		if (images == null) {
			return;
		}
		let tmp_imgs = images.slice(0, images.length);
		let found_index = tmp_imgs.findIndex((i) => i.path == image.path);
		tmp_imgs.splice(found_index, 1);
		setImages(tmp_imgs.length == 0 ? [] : tmp_imgs);
	};

	const onLongPressMessage = (currentMessage) => {
	};

	const onPressMsg =  async (currentMessage) => {
			Keyboard.dismiss();
			if (
				currentMessage &&
				currentMessage.text &&
				currentMessage.user?._id != props.user.id &&
				currentMessage.invitation_code != null
			) {
				try {
					let res = await apiFactory.post('/invite-earn/earninvitation', {
						invitation_code: currentMessage.invitation_code,
					});

					if (res.data && res.data.invition) {
						let invition_data = res.data.invition;
						if (invition_data.is_used == 0 && invition_data.is_expired != 1) {
							Clipboard.setString(currentMessage.invitation_code);
							await setStorageKey(KEYS.INVITE_CODE, currentMessage.invitation_code);
							if (props.hometab_navigation != null) {
								props.hometab_navigation.jumpTo(RouteNames.HomeStack);
							}
							Toast.show({
								type: 'showInfoToast',
								visibilityTime: 5000,
								position: 'top',
								topOffset: 42,
								text1: translate('code_complete'),
							});
							props.navigation.navigate(RouteNames.BottomTabs);
						} else if (invition_data.is_used == 0 && invition_data.is_expired == 1) {
							Toast.show({
								type: 'showInfoToast',
								visibilityTime: 5000,
								position: 'top',
								topOffset: 42,
								text1: translate('invitation_earn.invitation_expired'),
							});
						} else if (invition_data.is_used == 1) {
							Toast.show({
								type: 'showInfoToast',
								visibilityTime: 5000,
								position: 'top',
								topOffset: 42,
								text1: translate('invitation_earn.invitation_used'),
							});
						} else if (invition_data.is_used == 2) {
							Toast.show({
								type: 'showInfoToast',
								visibilityTime: 5000,
								position: 'top',
								topOffset: 42,
								text1: translate('invitation_earn.invitation_using'),
							});
						}
					}
					return;
				} catch (error) {
					console.log(error);
				}
			}

			if (
				currentMessage &&
				currentMessage.map &&
				currentMessage.map.coords &&
				currentMessage.map.coords.latitude &&
				currentMessage.map.coords.longitude
			) {
				props.navigation.navigate(RouteNames.LocationMsgScreen, { coords: currentMessage.map.coords });
			}

			if (
				channelData != null &&
				channelData.channel_type != 'single' &&
				currentMessage &&
				currentMessage.text &&
				currentMessage.likes &&
				currentMessage.likes.length > 0
			) {
				setMsgInfo(currentMessage);
				setShowMsgInfo(true);
			}
		}

	const onDoublePress = useCallback(
		(currentMessage) => {
			let likes = currentMessage.likes || [];
			const foundIndex = likes.findIndex((i) => i == props.user.id);
			if (foundIndex == -1) {
				setLike(channelData, props.user.id, currentMessage, onLikeSuccess);
			}
		},
		[props.user.id, channelData, onLikeSuccess]
	);

	const onShowGalleryMsgs = (images,replyMessage) => {
		if (images.length > 0) {
			let tmp = [];
			images.map((image) => {
				tmp.push({
					source: { uri: image },
				});
			});
			setModalImages(tmp);
			setReplyText(replyMessage);
			ShowGalleryModal(true);
		}
	};

	const onLikeChange = useCallback(
		(message, flag) => {
			setLike(channelData, props.user.id, message, onLikeSuccess);
		},
		[channelData, props.user.id, onLikeSuccess]
	);

	const onLikeSuccess = useCallback(
		(msgId, likes) => {
			let msgs = messages.slice(0);
			const index = msgs.findIndex((i) => i._id == msgId);
			if (index != -1) {
				msgs[index] = { ...msgs[index], createdAt: convertTimestamp2Date(msgs[index].fbDate), likes };
				setMessages(msgs);
			}
		},
		[JSON.stringify(messages || {})]
	);

	const onPopupPress = useCallback(
		(message, type) => {
			if (message && message.text && type == 'reply') {
				// const options = ['Copy Text', 'Quote Message', 'Cancel'];;
				setQuoteMsg(message);
			} else if (type == 'forward') {
				props.navigation.navigate(RouteNames.ForwardScreen, { channelData: channelData, message: message });
			} else if (type == 'unsend') {
				try {
					if (messages.length >= 1) {
						if (messages[0]._id == message._id) {
							let newLastMsg = null;
							if (messages.length >= 2) {
								newLastMsg = messages[1];
							}
							updateLastMessageOnChannel(channelData.id, newLastMsg);
						}
					}

					deleteMessage(channelData.id, message._id);
				} catch (error) {}
			}
		},
		[JSON.stringify(messages || {}), channelData]
	);

	const onCopyPress = (onCopyChanged) => {
		console.log("on Copy changed", onCopyChanged);
		setShowSnackBar(onCopyChanged);
	}

	const onGoBack = async () => {
		if (fromSharing == true) {
			props.navigation.navigate(RouteNames.HomeScreen);
		} else {
			props.navigation.goBack();
		}
	}

	const renderEmptyInputToolbar = () => (
		<Text style={styles.noMemberTxt}>{translate('social.chat.no_longer_member')}</Text>
	);

	const recordingInputToolbar = () => (
		<AudioInputView
			onRemove={() => {
				setRecording(false);
			}}
			onSend={onSendAudio}
		/>
	);

	const renderBottomInputbar = useCallback(
		(giftchat_props) => {
			if (channelData != null && channelData.users.findIndex((i) => i == props.user.id) == -1) {
				return renderEmptyInputToolbar();
			} else if (isRecording) {
				return recordingInputToolbar();
			}

			return renderInputToolbar(giftchat_props, quote_msg, images, null, onCancelQuote, onRemoveImage, () => {});
		},
		[channelData, JSON.stringify(props.user), quote_msg,imagesString,onSend, isRecording]
	);

	const msgs = messages.length == 0 ? [systemMsg] : messages;
	// 'reply_type':"story"
	// console.log(msgs.filter((msg)=>msg.text == 'Ckemi'));
	const closeImageGalleryModal = () => {
		ShowGalleryModal(false);
		setModalImages([]);
		setReplyText('');
	};
	const renderChatMessage = useCallback(renderMessage,[])
	const renderChatComposer = useCallback((props) =>
						renderComposer(props, true, onPressEmoji, onPressLocation, onImageUpload, onCapture)
					,[])

	const renderChatBubble = useCallback(
		(props) =>
			renderBubble(
				props,
				channelData != null && channelData.channel_type != 'single',
				onLongPressMessage,
				onPressMsg,
				onDoublePress,
				onShowGalleryMsgs,
				onLikeChange,
				onPopupPress,
				onCopyPress
			),
		[channelData, onDoublePress, onLikeChange, onPopupPress]
	);			

	return (
		<View style={styles.container}>
			<Spinner visible={imageUploading} />
			<CustomGiftedChat
				messages={messages}
				textChanged={textChanged}
				setText={setText}
				text={text}
				user={props.user}
				prevLoading={prevLoading}
				loadPrevMessage={loadPrevMessage}
				onSend={onSend}
				renderBottomInputbar={renderBottomInputbar}
				onRecord={onChatRecord}
				imagesLength={images?.length || 0}
				renderComposer={renderChatComposer}
				renderMessage={renderChatMessage}
				renderBubble={renderChatBubble}
			/>
			<SnackBar
				visible={showSnackBar}
				textMessage={translate('social.chat.copied_successfully')}
				backgroundColor={Theme.colors.btnPrimary}
				messageColor={Theme.colors.white}
			/>
			<MessagesHeader
				style={{ position: 'absolute', top: 0, left: 0 }}
				isMuted={isMuted}
				channel_id={channelData == null ? null : channelData.id}
				data={channelData}
				user_id={props.user.id}
				onBack={onGoBack}
				onCall={(isVideo = false) => {
					if (channelData) {
						let partnerData = null;
						if (props.user.id == channelData.creator?.id) {
							partnerData = channelData.partner;
						} else if (props.user.id == channelData.partner?.id) {
							partnerData = channelData.creator;
						}
						if (partnerData == null) {
							return;
						}
						props.navigation.navigate(RouteNames.VideoCallScreen, {
							type: 'outgoing',
							isVideoCall: isVideo,
							OutgoingCallReceiver: {
								id: partnerData.id,
								username: partnerData.username || null,
								full_name: partnerData.full_name || null,
								photo: partnerData.photo || null,
								phone: partnerData.phone || null,
								email: partnerData.email || null,
								role: partnerData.role || ROLE_CUSTOMER,
							},
						});
					}
				}}
				onDelete={() => {
					ShowDeleteGroupModal(true);
				}}
				onExit={() => {
					ShowExitGroupModal(true);
				}}
				onGroupDetails={() => {
					let members = channelData.members.filter((i) => i.id != props.user.id);
					props.navigation.navigate(RouteNames.CreateGroupScreen, {
						users: members,
						groupId: channelData.id,
						full_name: channelData.full_name,
						photo: channelData.photo,
						permitted: channelData.permitted,
						admin: channelData.admin,
					});
				}}
				onGallery={() => {
					props.navigation.goBack();
				}}
				onPressName={() => {
					if (channelData == null) {
						return;
					}
					let user_id = props.user.id;
					if (channelData.channel_type == 'single') {
						if (user_id == channelData.creator.id) {
							if (channelData.partner.role == ROLE_RIDER) {
								// props.navigation.navigate(RouteNames.CourierScreen, {
								// 	rider_id: channelData.partner.id,
								// });
							} else {
								props.navigation.navigate(RouteNames.SnapfooderScreen, {
									user: channelData.partner,
								});
							}
						} else if (user_id == channelData.partner.id) {
							if (channelData.creator.role == ROLE_RIDER) {
								// props.navigation.navigate(RouteNames.CourierScreen, {
								// 	rider_id: channelData.creator.id,
								// });
							} else {
								props.navigation.navigate(RouteNames.SnapfooderScreen, {
									user: channelData.creator,
								});
							}
						}
					} else if (channelData.channel_type == 'admin_support') {
					} else {
						// group
						let members = channelData.members.filter((i) => i.id != props.user.id);
						props.navigation.navigate(RouteNames.CreateGroupScreen, {
							users: members,
							groupId: channelData.id,
							full_name: channelData.full_name,
							photo: channelData.photo,
							permitted: channelData.permitted,
							admin: channelData.admin,
						});
					}
				}}
			/>
			<EmojiBoard
				showBoard={showEmoji}
				tabBarPosition='top'
				tabBarStyle={{ height: 50, paddingTop: 12 }}
				onRemove={() => setShowEMoji(false)}
				onClick={onSelectEmoji}
			/>
			<LocationMsgOptionModal
				showModal={showShareLocModal}
				addCurrentLocation={addCurrentLocation}
				goFindLocation={goFindLocation}
				onClose={() => ShowShareModal(false)}
			/>
			{channelData && (
				<ConfirmModal
					showModal={isDeleteGroupModal}
					title={
						channelData.channel_type != 'group'
							? translate('social.delete_conv_confirm')
							: translate('group_related.confirm_del_group')
					}
					yes={translate('group_related.confirm_del_group_yes')}
					no={translate('group_related.confirm_del_group_no')}
					onYes={onDeleteGroup}
					onClose={() => ShowDeleteGroupModal(false)}
				/>
			)}
			<ConfirmModal
				showModal={isExitGroupModal}
				title={translate('group_related.confirm_exit_group')}
				yes={translate('group_related.confirm_exit_group_yes')}
				no={translate('group_related.confirm_exit_group_no')}
				onYes={onExitGroup}
				onClose={() => ShowExitGroupModal(false)}
			/>
			<ImgGalleryModal
				index={0}
				images={modal_imgs}
				showModal={isGalleryModal}
				description={replyText}
				onClose={closeImageGalleryModal}
			/>
			<MsgInfoModal
				showModal={showMsgInfo}
				onClose={() => setShowMsgInfo(false)}
				channelData={channelData}
				message={msgInfo}
				user_id={props.user.id}
				navigation={props.navigation}
			/>
		</View>
	);
};

const onRecord = (setRecording, goApplicationSetting) => {
	console.log('onRecord');
	if (Platform.OS === 'android') {
		PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
			.then((res) => {
				console.log('check ', res);
				if (res != true) {
					PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]).then((result) => {
						console.log('requestMultiple ', result);
						if (result['android.permission.RECORD_AUDIO'] == 'granted') {
							setRecording(true);
						} else {
							goApplicationSetting();
						}
					});
				} else {
					setRecording(true);
				}
			})
			.catch((error) => {
				console.log('RECORD_AUDIO PERMISSION CHECK ', error);
				goApplicationSetting();
			});
	} else {
		setRecording(true);
	}
};

const CustomGiftedChat = (props) => {
	const {
		messages,
		textChanged,
		setText,
		text,
		prevLoading,
		loadPrevMessage,
		onSend,
		renderBottomInputbar,
		onRecord,
		renderBubble,
		renderComposer,
		renderMessage,
		imagesLength,
	} = props;
	const textLength = text?.length || 0;
	const { id, username, full_name, phone, photo, email } = props.user || {};
	const role = ROLE_CUSTOMER;

	const onSendData = useCallback(() => {}, []);

	const onInputTextChanged = useCallback((_text) => {
		if (textChanged.current == false) {
			textChanged.current = true;
			return;
		}
		setText(_text);
	}, []);
	const user = useMemo(
		() => ({ _id: id, username, full_name, phone, photo, email, role }),
		[username, full_name, phone, photo, email, id]
	);
	const renderLoading = useCallback(() => null, []);
	const listViewProps = useMemo(() => getListViewProps(prevLoading, loadPrevMessage), [prevLoading, loadPrevMessage]);
	const chatRenderSend = useCallback(
		(props) => renderSend(props, textLength > 0 || imagesLength > 0, onRecord, onSendData),
		[textLength, imagesLength, onRecord, onSendData]
	);
	const renderSystemMessage = useCallback(() => null, []);
	const messageContainerStyle = useMemo(() => ({ paddingBottom: imagesLength > 0 ? 60 : 0 }), [imagesLength]);
	const renderFooter = useCallback(
		() => (
			<View>
				<Text></Text>
			</View>
		),
		[]
	);
	const parsePatterns = useCallback(
		(linkStyle) => [
			{
				pattern: /#(\w+)/,
				style: linkStyle,
				onPress: (tag) => console.log(`Pressed on hashtag: ${tag}`),
			},
			{
				pattern: /kod: \w+/g,
				style: linkStyle,
			},
			{
				pattern: /kod \w+/g,
				style: linkStyle,
			},
		],
		[]
	);

	return (
		<GiftedChat
			messages={messages.length == 0 ? [systemMsg] : messages}
			text={text}
			onInputTextChanged={onInputTextChanged}
			onSend={onSend}
			user={user}
			minInputToolbarHeight={100}
			alwaysShowSend={true}
			showUserAvatar={false}
			renderUsernameOnMessage={true}
			textInputAutoFocus={false}
			renderLoading={renderLoading}
			listViewProps={listViewProps}
			renderInputToolbar={renderBottomInputbar}
			renderSend={chatRenderSend}
			renderComposer={renderComposer}
			renderMessage={renderMessage}
			renderBubble={renderBubble}
			renderAvatar={null}
			// alignTop
			// scrollToBottom={260}
			bottomOffset={useSafeArea().bottom}
			renderSystemMessage={renderSystemMessage}
			// renderAvatarOnTop
			// renderActions={renderActions}
			// renderMessageImage
			// renderCustomView={renderCustomView}
			// isCustomViewBottom
			messagesContainerStyle={messageContainerStyle}
			renderFooter={renderFooter}
			parsePatterns={parsePatterns}
		/>
	);
};

const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => contentOffset.y == 0;
const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
	return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
};

const getListViewProps = (prevLoading, loadPrevMessage) => ({
	ListFooterComponent: (
		<View style={[Theme.styles.col_center]}>
			<View style={{ height: 100, backgroundColor: '#fff' }} />
			{prevLoading && (
				<View style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
					<ActivityIndicator size='small' color={Theme.colors.cyan2} style={{ paddingVertical: 12 }} />
				</View>
			)}
		</View>
	),
	onScroll: ({ nativeEvent }) => {
		if (isCloseToTop(nativeEvent)) console.log('is close to top');
		if (isCloseToBottom(nativeEvent)) loadPrevMessage();
	},
	keyboardShouldPersistTaps: 'handled',
});

const ChatLoading = () => (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size='large' color={Theme.colors.cyan2} style={{ paddingVertical: 12 }} />
		</View>
	);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: '100%',
		backgroundColor: '#ffffff',
	},
	formView: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '100%',
	},
	sectionView: {
		width: '100%',
		alignItems: 'flex-start',
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: Theme.colors.gray9,
	},
	modalContent: {
		width: '100%',
		paddingHorizontal: 20,
		paddingBottom: 30,
		paddingTop: 20,
		backgroundColor: Theme.colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	modalTitle: {
		width: '100%',
		textAlign: 'left',
		fontSize: 18,
		fontFamily: Theme.fonts.bold,
		color: Theme.colors.text,
		marginBottom: 12,
	},
	modalBtnTxt: { flex: 1, marginLeft: 8, fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
	divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9 },
	NoMemberView: {},
	noMemberTxt: {
		marginHorizontal: 30,
		marginTop: 30,
		textAlign: 'center',
		fontSize: 18,
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.gray7,
	},
});

const mapStateToProps = ({ app, chat },props) => {
	const messagesKey = `${props.route.params?.channelId}${app.user?.id}`;
	console.log('messagesKey', messagesKey);
	return {
		coordinates: app.coordinates,
		user: app.user,
		isSharingVisible: app.isSharingVisible,
		sharedContent: app.shared_content,
		sharedMimeType: app.shared_mime_type,
		hometab_navigation: app.hometab_navigation,
		messages: chat.messagesByChannel[messagesKey] || [],
		chat_channels: chat.chat_channels,
	};
};


export default connect(mapStateToProps, {
	goActiveScreenFromPush,
	removeSharingContent,
	setMessagesByChannel,
})(MessagesScreen);
