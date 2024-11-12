import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
	Image,
	Text,
	TouchableOpacity,
	PermissionsAndroid,
	Linking,
	Keyboard,
	ActivityIndicator,
	View,
	StyleSheet,
	Platform,
} from 'react-native';
import { connect } from 'react-redux';
import { GiftedChat } from 'react-native-gifted-chat';
import FastImage from 'react-native-fast-image';
import Spinner from 'react-native-loading-spinner-overlay';
import moment from 'moment';
import { translate } from '../../../common/services/translate';
import HelpPage from '../components/HelpPage';
import AppText from '../../../common/components/AppText';
import Theme from '../../../theme';
import Config from '../../../config';
import RouteNames from '../../../routes/names';
import AndroidOpenSettings from 'react-native-android-open-settings';
import { useSafeArea } from 'react-native-safe-area-context';
import ImagePicker from 'react-native-image-crop-picker';
import GetLocation from 'react-native-get-location';
import { convertTimestamp2Date, getImageFullURL } from '../../../common/services/utility';
import {
	order_support_collection,
	getChannelData,
	sendMessage,
	deleteMessage,
	uploadImage,
	seenUnreadCntChannel,
	setLike,
	getMessageID,
} from '../../../common/services/order_support';
import { goActiveScreenFromPush, setTmpFood } from '../../../store/actions/app';
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';
import EmojiBoard from '../../../common/components/react-native-emoji-board';
import ConfirmModal from '../../../common/components/modals/ConfirmModal';
import ImgGalleryModal from '../../../common/components/modals/ImgGalleryModal';
import LocationMsgOptionModal from '../../../common/components/modals/LocationMsgOptionModal';
import MsgInfoModal from '../../../common/components/modals/MsgInfoModal';
import AudioInputView from '../../chat/components/AudioInputView';
import MessagesHeader from '../../chat/components/MessagesHeader';
import { renderInputToolbar, renderComposer, renderSend } from '../../chat/components/InputToolbar';
import { renderBubble, renderMessage, renderAvatar, renderSystemMessage } from '../../chat/components/MessageContainer';
import { checkLocationPermission, requestLocationPermission } from '../../../common/services/location';
import { ROLE_ADMIN, ROLE_RESTAURANT, ROLE_RIDER, ROLE_CUSTOMER } from '../../../config/constants';
import SnackBar from 'react-native-snackbar-component';
import { confirmOrderDelivery } from '../../../store/actions/orders';
import { isEmpty } from '../../../common/services/utility';

const PerPage = 12;
const OrderSupport = (props) => {
	const order = props.order;
	if (order == null) {
		return null;
	}
	const [imageUploading, setImageUploading] = useState(false);

	const [prevLoading, setPrevLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);

	const [isMuted, SetMuteGroup] = useState(false);
	const [isLeftGroup, SetLeftGroup] = useState(false);
	const [isDeleteGroupModal, ShowDeleteGroupModal] = useState(false);
	const [isExitGroupModal, ShowExitGroupModal] = useState(false);
	const [showShareLocModal, ShowShareModal] = useState(false);
	const [showEmoji, setShowEMoji] = useState(false);

	const [channelData, setChannelData] = useState(null);

	const [showMsgInfo, setShowMsgInfo] = useState(false);
	const [msgInfo, setMsgInfo] = useState(null);

	const [text, setText] = useState('');
	const [isGalleryModal, ShowGalleryModal] = useState(false);
	const [messages, setMessages] = useState([]);
	const [quote_msg, setQuoteMsg] = useState(null);
	const [images, setImages] = useState(null);
	const [isRecording, setRecording] = useState(false);
	const [showSnackBar, setShowSnackBar] = useState(false);
	const [modal_imgs, setModalImages] = useState([]);
	const [msg_tags, setMsgTags] = useState([]);

	const emojiData = useRef(null);
	const textChanged = useRef(false);

	const isFromPush = props.route.params.fromPush ?? false;
	const msgs_unlistener = useRef(null);
	const systemMsg = {
		_id: 1,
		text: '',
		createdAt: new Date(),
		system: true,
	};

	const confirmOrderMessage = useMemo(() => {
		try {
			let chat_btn = props.systemSettings.order_delivery_confirm_chat_btn;
			if (props.language == 'en') {
				chat_btn = props.systemSettings.order_delivery_confirm_chat_btn_en;
			} else if (props.language == 'it') {
				chat_btn = props.systemSettings.order_delivery_confirm_chat_btn_it;
			}

			let chat_message = props.systemSettings.order_delivery_confirm_chat_message;
			if (props.language == 'en') {
				chat_message = props.systemSettings.order_delivery_confirm_chat_message_en;
			} else if (props.language == 'it') {
				chat_message = props.systemSettings.order_delivery_confirm_chat_message_it;
			}

			if (
				order.id != null &&
				props.unconfirmedDeliveryOrders.findIndex((o) => o.id == order.id) != -1 &&
				!isEmpty(chat_btn) &&
				!isEmpty(chat_message)
			) {
				let msg = {
					_id: getMessageID(props.route.params.channelId),
					message: chat_message,
					button: chat_btn,
					createdAt: new Date(),
					confirm_order_msg: true,
					system: true,
				};
				return msg;
			}
		} catch (error) {}
		return null;
	}, [
		order.id,
		props.unconfirmedDeliveryOrders,
		props.route.params.channelId,
		props.systemSettings.order_delivery_confirm_chat_btn,
		props.systemSettings.order_delivery_confirm_chat_btn_en,
		props.systemSettings.order_delivery_confirm_chat_btn_it,
		props.systemSettings.order_delivery_confirm_chat_message,
		props.systemSettings.order_delivery_confirm_chat_message_en,
		props.systemSettings.order_delivery_confirm_chat_message_it,
		props.language,
	]);

	const orderHelpBlockedMessage = useMemo(() => {
		try {
			let chat_message = props.systemSettings.order_help_block_chat_message;
			if (props.language == 'en') {
				chat_message = props.systemSettings.order_help_block_chat_message_en;
			} else if (props.language == 'it') {
				chat_message = props.systemSettings.order_help_block_chat_message_it;
			}

			if (
				order.created_at != null &&
				props.systemSettings.order_help_block_days != null &&
				moment(new Date()).diff(moment(order.created_at), 'days') >=
					props.systemSettings.order_help_block_days &&
				!isEmpty(chat_message)
			) {
				let msg = {
					_id: getMessageID(props.route.params.channelId),
					message: chat_message,
					createdAt: new Date(),
					order_help_blocked_msg: true,
					system: true,
				};
				return msg;
			}
		} catch (error) {}
		return null;
	}, [
		order.created_at,
		props.route.params.channelId,
		props.systemSettings.order_help_block_days,
		props.systemSettings.order_help_block_chat_message,
		props.systemSettings.order_help_block_chat_message_en,
		props.systemSettings.order_help_block_chat_message_it,
		props.language,
	]);

	React.useEffect(() => {
		if (msgs_unlistener.current != null) {
			msgs_unlistener.current();
		}
		loadSupportTags();
		loadChannelData();
		const messages_coll = order_support_collection
			.doc(props.route.params.channelId)
			.collection('messages')
			.limit(PerPage)
			.orderBy('created_time', 'desc');
		msgs_unlistener.current = messages_coll.onSnapshot((querySnapshot) => {
			let msgs = [];
			querySnapshot.docs.forEach((doc) => {
				if (doc.exists) {
					msgs.push({
						...doc.data(),
						createdAt: convertTimestamp2Date(doc.data().createdAt),
						fbDate: doc.data().createdAt,
					});
				}
			});
			setMessages(msgs);
			if (msgs.length >= PerPage) {
				setHasMore(true);
			} else {
				setHasMore(false);
			}
		});

		return () => {
			if (msgs_unlistener.current != null) {
				msgs_unlistener.current();
			}
			props.goActiveScreenFromPush({
				isChatVisible: false,
			});
		};
	}, [props.route.params.channelId, isFromPush]);

	const loadSupportTags = () => {
		apiFactory.get(`orders/get-support-tags`).then(
			({ data }) => {
				let tags = data.tags || [];
				if (props.language == 'en') {
					tags = tags.map((t) => ({ id: t.id, title: t.title_en }));
				} else if (props.language == 'it') {
					tags = tags.map((t) => ({ id: t.id, title: t.title_it }));
				} else {
					tags = tags.map((t) => ({ id: t.id, title: t.title_sq }));
				}
				setMsgTags(tags);
			},
			(error) => {
				const message = error.message || translate('generic_error');
				// alerts.error(translate('alerts.error'), message);
			}
		);
	};

	const increaseTagCount = (tag_id) => {
		apiFactory
			.post(`orders/increase-clicks-tags`, {
				tag_id: tag_id,
			})
			.then(
				(res) => {},
				(error) => {}
			);
	};

	const loadChannelData = async () => {
		let channel = await getChannelData(props.route.params.channelId);
		setChannelData(channel);
		await seenUnreadCntChannel(channel, props.user.id);
	};

	const loadPrevMessage = () => {
		if (prevLoading || hasMore == false || messages.length == 0) {
			return;
		}
		let start = messages[messages.length - 1].created_time;
		if (start == null) {
			return;
		}

		const messages_coll = order_support_collection
			.doc(props.route.params.channelId)
			.collection('messages')
			.orderBy('created_time', 'desc')
			.limit(PerPage)
			.startAfter(start);

		setPrevLoading(true);
		messages_coll
			.get()
			.then((snaps) => {
				let msgs = [];
				snaps.docs.forEach((doc) => {
					if (doc.exists) {
						msgs.push({
							...doc.data(),
							createdAt: convertTimestamp2Date(doc.data().createdAt),
							fbDate: doc.data().createdAt,
						});
					}
				});
				if (msgs.length > 0) {
					let tmpMsgs = messages.slice(0, messages.length);
					msgs.map((msg) => {
						tmpMsgs.push(msg);
					});
					setMessages(tmpMsgs);
				}
				setPrevLoading(false);
				if (msgs.length > 0) {
					setHasMore(true);
				} else {
					setHasMore(false);
				}
			})
			.catch((error) => {
				setPrevLoading(false);
				setHasMore(false);
			});
	};

	const onSend = async (newMessages = []) => {
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

			let imageUrls = [];
			for (var i = 0; i < images.length; i++) {
				if (images[i] != null && images[i].data != null) {
					try {
						let res = await uploadImage(images[i].data);
						if (res != null && res.data != null && res.data.success == true) {
							imageUrls.push(res.data.url);
						}
					} catch (error) {}
				}
			}
			setImages(null);

			if (imageUrls.length == 0) {
				return;
			} else {
				newMessages.map((msg, index) => {
					newMessages[index].images = imageUrls;
				});
			}

			isImage = true;
		}

		if (emojiData.current != null) {
			newMessages.map((msg, index) => {
				newMessages[index].emojiData = emojiData.current;
			});
			emojiData.current = null;
		}

		for (var i = 0; i < newMessages.length; i++) {
			await sendMessage(channelData.id, props.user.id, newMessages[i]);
		}

		setImageUploading(false);
	};

	const addCurrentLocation = async () => {
		ShowShareModal(false);
		try {
			let hasPermission = await checkLocationPermission();
			if (hasPermission) {
				sendCurrentPosition();
			} else {
				requestLocationPermission().catch(() => {
					alerts.error(translate('attention'), translate('locationUnavailable'));
				});
			}
		} catch (error) {
			alerts.error(translate('attention'), translate('locationUnavailable'));
		}
	};

	const sendCurrentPosition = async () => {
		try {
			const location = await GetLocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
			if (location) {
				let newMsg = {
					user: {
						_id: props.user.id,
						username: props.user.username,
						full_name: props.user.full_name,
						photo: props.user.photo,
						avatar: getImageFullURL(props.user.photo),
						phone: props.user.phone,
						email: props.user.email,
						role: ROLE_CUSTOMER,
					},
					map: {
						coords: {
							latitude: location.latitude,
							longitude: location.longitude,
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
	};

	const goFindLocation = () => {
		ShowShareModal(false);
		props.navigation.navigate(RouteNames.LocationPickupScreen, { channelId: channelData.id, isOrderSupport: true });
	};
	const onPressLocation = () => {
		ShowShareModal(true);
	};

	const onSelectEmoji = (emoji) => {
		setShowEMoji(false);
		setText((text) => text.concat(emoji.code));
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
		})
			.then((images) => {
				setImages(images);
			})
			.catch((error) => {});
	};
	const onCapture = () => {
		ImagePicker.openCamera({
			cropping: false,
			includeBase64: true,
		})
			.then((image) => {
				setImages([image]);
			})
			.catch((error) => {});
	};

	const goApplicationSetting = () => {
		alerts
			.confirmation(translate('attention'), translate('audioUnavailable'), 'Settings', translate('cancel'))
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
	};
	const onRecord = () => {
		if (Platform.OS === 'android') {
			PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
				.then((res) => {
					if (res != true) {
						PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]).then(
							(result) => {
								if (result['android.permission.RECORD_AUDIO'] == 'granted') {
									setRecording(true);
								} else {
									goApplicationSetting();
								}
							}
						);
					} else {
						setRecording(true);
					}
				})
				.catch((error) => {
					goApplicationSetting();
				});
		} else {
			setRecording(true);
		}
	};

	const onSendAudio = async (currentTime, fileSize, base64) => {
		try {
			let res = await uploadImage(base64);
			if (res != null && res.data != null && res.data.success == true) {
				let newMsg = {
					user: {
						_id: props.user.id,
						username: props.user.username,
						full_name: props.user.full_name,
						photo: props.user.photo,
						avatar: getImageFullURL(props.user.photo),
						phone: props.user.phone,
						email: props.user.email,
						role: ROLE_CUSTOMER,
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
		} catch (error) {}
		setRecording(false);
	};

	const onSendData = () => {};

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
		setImages(tmp_imgs.length == 0 ? null : tmp_imgs);
	};

	const onLongPressMessage = (currentMessage) => {
		if (currentMessage && currentMessage.text) {
			// const options = ['Copy Text', 'Quote Message', 'Cancel'];;
			setQuoteMsg(currentMessage);
		}
	};

	const onPressMsg = (currentMessage) => {
		Keyboard.dismiss();
		if (
			currentMessage &&
			currentMessage.map &&
			currentMessage.map.coords &&
			currentMessage.map.coords.latitude &&
			currentMessage.map.coords.longitude
		) {
			props.navigation.navigate(RouteNames.LocationMsgScreen, { coords: currentMessage.map.coords });
			return;
		}

		if (currentMessage && currentMessage.product) {
			props.setTmpFood(currentMessage.product);
			props.navigation.navigate(RouteNames.FoodScreen);
			return;
		}

		if (currentMessage && currentMessage.text && currentMessage.likes && currentMessage.likes.length > 0) {
			setMsgInfo(currentMessage);
			setShowMsgInfo(true);
		}
	};

	const onDoublePress = (currentMessage) => {
		let likes = currentMessage.likes || [];
		const foundIndex = likes.findIndex((i) => i == props.user.id);
		if (foundIndex == -1) {
			setLike(channelData, props.user.id, currentMessage, onLikeSuccess);
		}
	};

	const onPopupPress = (message, type) => {
		if (message && message.text && type == 'reply') {
			// const options = ['Copy Text', 'Quote Message', 'Cancel'];;
			setQuoteMsg(message);
		}
		// else if (type == 'forward') {
		// 	props.navigation.navigate(RouteNames.ForwardScreen, { channelData: channelData, message: message });
		// }
		else if (type == 'unsend') {
			deleteMessage(channelData.id, message._id);
		}
	};

	const onCopyPress = (onCopyChanged) => {
		setShowSnackBar(onCopyChanged);
	};

	const onShowGalleryMsgs = (images) => {
		if (images.length > 0) {
			let tmp = [];
			images.map((image) => {
				tmp.push({
					source: { uri: image },
				});
			});
			setModalImages(tmp);
			ShowGalleryModal(true);
		}
	};

	const onLikeChange = (message, flag) => {
		setLike(channelData, props.user.id, message, onLikeSuccess);
	};

	const onLikeSuccess = (msgId, likes) => {
		let msgs = messages.slice(0);
		const index = msgs.findIndex((i) => i._id == msgId);
		if (index != -1) {
			msgs[index] = {
				...msgs[index],
				createdAt: convertTimestamp2Date(msgs[index].fbDate),
				likes: likes,
			};
			setMessages(msgs);
		}
	};

	const onConfirmDelivery = () => {
		props
			.confirmOrderDelivery(order.id)
			.then((res) => {
				let message = translate('order_summary.confirm_order_delivery_success');
				if (
					props.language == 'en' &&
					!isEmpty(props.systemSettings.order_delivery_confirm_order_success_msg_en)
				) {
					message = props.systemSettings.order_delivery_confirm_order_success_msg_en;
				} else if (
					props.language == 'it' &&
					!isEmpty(props.systemSettings.order_delivery_confirm_order_success_msg_it)
				) {
					message = props.systemSettings.order_delivery_confirm_order_success_msg_it;
				} else if (!isEmpty(props.systemSettings.order_delivery_confirm_order_success_msg)) {
					message = props.systemSettings.order_delivery_confirm_order_success_msg;
				}
				alerts.info('', message).then((res) => {});
			})
			.catch((err) => {
				alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(err));
			});
	};

	const onGoBack = async () => {
		if (channelData != null) {
			seenUnreadCntChannel(channelData, props.user.id);
		}
		props.navigation.goBack();
	};

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

	const renderBottomInputbar = (giftchat_props) => {
		if (channelData != null && channelData.users.findIndex((i) => i == props.user.id) == -1) {
			return renderEmptyInputToolbar();
		} else if (isRecording) {
			return recordingInputToolbar();
		}

		return renderInputToolbar(
			giftchat_props,
			quote_msg,
			images,
			orderHelpBlockedMessage != null ? [] : msg_tags,
			onCancelQuote,
			onRemoveImage,
			(msg) => {
				let newMsg = {
					user: {
						_id: props.user.id,
						username: props.user.username,
						full_name: props.user.full_name,
						photo: props.user.photo,
						avatar: getImageFullURL(props.user.photo),
						phone: props.user.phone,
						email: props.user.email,
						role: ROLE_CUSTOMER,
					},
					text: msg.title,
				};
				onSend([newMsg]);
				increaseTagCount(msg.id);
			}
		);
	};

	const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
		return contentOffset.y == 0;
	};
	const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
		return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
	};

	const getMessages = () => {
		if (messages.length == 0) {
			return [systemMsg];
		}

		let tmpMsgs = [];
		if (orderHelpBlockedMessage != null) {
			tmpMsgs.push(orderHelpBlockedMessage);
		}
		if (confirmOrderMessage != null) {
			tmpMsgs.push(confirmOrderMessage);
		}
		tmpMsgs = [...tmpMsgs, ...messages];
		return tmpMsgs;
	};

	return (
		<View style={styles.container}>
			<Spinner visible={imageUploading} />
			<GiftedChat
				messages={getMessages()}
				text={text}
				onInputTextChanged={(_text) => {
					setText(_text);
				}}
				onSend={onSend}
				user={{
					_id: props.user.id,
					username: props.user.username,
					full_name: props.user.full_name,
					photo: props.user.photo,
					avatar: getImageFullURL(props.user.photo),
					phone: props.user.phone,
					email: props.user.email,
					role: ROLE_CUSTOMER,
				}}
				minInputToolbarHeight={100}
				alwaysShowSend={true}
				showUserAvatar={false}
				renderUsernameOnMessage={true}
				textInputAutoFocus={false}
				disabled={orderHelpBlockedMessage != null}
				renderLoading={() => (
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
						<ActivityIndicator size='large' color={Theme.colors.cyan2} style={{ paddingVertical: 12 }} />
					</View>
				)}
				listViewProps={{
					ListFooterComponent: (
						<View style={[Theme.styles.col_center]}>
							<View style={{ height: Platform.OS == 'ios' ? 60 : 100, backgroundColor: '#fff' }} />
							{prevLoading && (
								<View style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
									<ActivityIndicator
										size='small'
										color={Theme.colors.cyan2}
										style={{ paddingVertical: 12 }}
									/>
								</View>
							)}
						</View>
					),
					onScroll: ({ nativeEvent }) => {
						if (isCloseToTop(nativeEvent)) {
						}
						if (isCloseToBottom(nativeEvent)) {
							loadPrevMessage();
						}
					},
					keyboardShouldPersistTaps: 'handled',
				}}
				renderInputToolbar={renderBottomInputbar}
				renderSend={(props) =>
					renderSend(
						props,
						(text != null && text.length > 0) || (images != null && images.length > 0),
						onRecord,
						onSendData
					)
				}
				renderComposer={(props) =>
					renderComposer(
						props,
						orderHelpBlockedMessage == null,
						onPressEmoji,
						onPressLocation,
						onImageUpload,
						onCapture
					)
				}
				renderMessage={renderMessage}
				renderBubble={(props) =>
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
					)
				}
				// renderAvatar={renderAvatar}
				isGroup={true}
				disableForward={true}
				alignTop={true}
				// scrollToBottom={260}
				bottomOffset={useSafeArea().bottom}
				renderSystemMessage={(props) => renderSystemMessage(props, onConfirmDelivery)}
				// renderAvatarOnTop
				// renderActions={renderActions}
				// renderMessageImage
				// renderCustomView={renderCustomView}
				// isCustomViewBottom
				messagesContainerStyle={{
					paddingBottom: orderHelpBlockedMessage == null && msg_tags.length > 0 ? 40 : 0,
				}}
				renderFooter={() => (
					<View>
						<Text></Text>
					</View>
				)}
				parsePatterns={(linkStyle) => [
					{
						pattern: /#(\w+)/,
						style: linkStyle,
						onPress: (tag) => {},
					},
				]}
			/>
			<SnackBar
				visible={showSnackBar}
				textMessage={translate('social.chat.copied_successfully')}
				backgroundColor={Theme.colors.btnPrimary}
				messageColor={Theme.colors.white}
			/>
			<MessagesHeader
				style={{ position: 'absolute', top: 0, left: 0 }}
				isMuted={false}
				channel_id={channelData == null ? null : channelData.id}
				data={channelData}
				user_id={props.user.id}
				isOrderSupport={true}
				onBack={() => {
					onGoBack();
				}}
				onCall={() => {}}
				onDelete={() => {}}
				onExit={() => {}}
				onGroupDetails={() => {}}
				onGallery={() => {}}
				onPressName={() => {}}
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
			<ImgGalleryModal
				index={0}
				images={modal_imgs}
				showModal={isGalleryModal}
				onClose={() => ShowGalleryModal(false)}
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: '100%',
		backgroundColor: '#ffffff',
	},
	title: {
		marginVertical: 20,
		width: '100%',
		paddingHorizontal: 20,
		textAlign: 'center',
		fontSize: 16,
		lineHeight: 20,
		fontFamily: Theme.fonts.bold,
		color: Theme.colors.text,
	},
	itemView: { marginBottom: 15, width: '100%', padding: 18, backgroundColor: Theme.colors.gray8, borderRadius: 15 },
	itemTxt: { fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	divider: { marginVertical: 20, width: '100%', height: 1, backgroundColor: Theme.colors.gray8 },
	subtitle: {
		marginBottom: 15,
		fontSize: 18,
		lineHeight: 22,
		fontFamily: Theme.fonts.bold,
		color: Theme.colors.text,
	},
	badge: { marginLeft: 4, width: 7, height: 7, borderRadius: 4, backgroundColor: Theme.colors.red1 },
	avatarView: { marginTop: -60, justifyContent: 'flex-start', width: '100%', paddingHorizontal: 20 },
	avatar: {
		width: 48,
		height: 48,
		marginRight: 5,
		borderWidth: 1,
		borderColor: Theme.colors.gray6,
		borderRadius: 12,
		backgroundColor: Theme.colors.white,
	},
	name_desc: { fontSize: 11, lineHeight: 14, fontFamily: Theme.fonts.medium, color: Theme.colors.white },
	name: { fontSize: 18, lineHeight: 22, fontFamily: Theme.fonts.bold, color: Theme.colors.white },
});

function mapStateToProps({ app }) {
	return {
		user: app.user,
		language: app.language,
		order: app.tmp_order,
		coordinates: app.coordinates,
		systemSettings: app.systemSettings || {},
		unconfirmedDeliveryOrders: app.unconfirmedDeliveryOrders || [],
	};
}

export default connect(mapStateToProps, {
	goActiveScreenFromPush,
	setTmpFood,
	confirmOrderDelivery,
})(OrderSupport);
