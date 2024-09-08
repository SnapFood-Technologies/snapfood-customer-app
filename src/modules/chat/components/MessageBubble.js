import PropTypes from 'prop-types';
import React from 'react';
import MapView, { Callout, PROVIDER_GOOGLE, Point } from 'react-native-maps';
import {
	Text,
	StyleSheet,
	TouchableWithoutFeedback,
	View,
	ViewPropTypes,
	TouchableOpacity,
	Platform,
	StatusBar,
	LayoutAnimation
} from 'react-native';
import {
	QuickReplies,
	Bubble,
	utils,
	Time,
	Color,
	MessageVideo,
	MessageImage,
	MessageText,
} from 'react-native-gifted-chat';
import Clipboard from '@react-native-clipboard/clipboard';
import Tooltip from 'react-native-walkthrough-tooltip';
import { width, height } from 'react-native-dimension';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import Theme from '../../../theme';
import Config from '../../../config';
import AudioMsgItem from '../components/AudioMsgItem';
import FoodMsgItem from './FoodMsgItem';
import LikeBtn from '../../../common/components/buttons/like_btn';
import { SocialMapScreenStyles } from '../../../config/constants';
import { translate } from '../../../common/services/translate';
import { isEmpty } from '../../../common/services/utility';
import { ScrollView } from 'react-native-gesture-handler';

const { isSameDay, isSameUser } = utils;
const DEFAULT_OPTION_TITLES = ['Copy Text', 'Cancel'];
const MAX_CONTENT_WIDTH = width(100) - 170;
class MessageBubble extends React.Component {
	constructor() {
		super(...arguments);
		this.backCount = 0;
		this.onLongPress = () => {
			const { currentMessage } = this.props;
			// if (this.props.onLongPress) {
			// 	this.props.onLongPress(currentMessage);
			// }
			if (currentMessage.product == null) {
				this.setState({ isPopup: true });
			}
		};
		this.onPressMsg = () => {
			const { currentMessage } = this.props;
			this.backCount++;

			// console.log('this.backCount ', this.backCount)
			if (this.backCount == 2) {
				this.backCount = 0;
				clearTimeout(this.backTimer);
				// console.warn("Clicked twice")
				if (this.props.onDoublePress) {
					this.props.onDoublePress(currentMessage);
				}
			} else {
				this.backTimer = setTimeout(() => {
					this.backCount = 0;
					if (this.props.onPressMsg) {
						this.props.onPressMsg(currentMessage);
					}
				}, 400);
			}
		};
		this.onDoublePress = () => {
			const { currentMessage } = this.props;
			if (this.props.onDoublePress) {
				this.props.onDoublePress(currentMessage);
			}
		};
		this.onShowGalleryMsgs = (images) => {
			if (this.props.onShowGalleryMsgs) {
				this.props.onShowGalleryMsgs(images, this.props.currentMessage.text);
			}
		};
		this.onLikeChange = (message, flag) => {
			if (this.props.onLikeChange) {
				this.props.onLikeChange(message, flag);
			}
		};
		this.onPopupPress = (message, type) => {
			if (this.props.onPopupPress) {
				this.props.onPopupPress(message, type);
			}
		};
		this.onCopy = (message) => {
			if (message.text) {
				this.props.onCopyPress(true);
				this.setState({ isPopup: false });
				Clipboard.setString(message.text);
				setTimeout(() => {
					this.props.onCopyPress(false);
				}, 2000);
			}
		};

		this.state = {
			value: 0,
			isPlaying: false,
			isPopup: false,
		};
	}

	isToNext() {
		const { currentMessage, nextMessage, position } = this.props;
		return (
			currentMessage &&
			nextMessage &&
			position &&
			isSameUser(currentMessage, nextMessage) &&
			isSameDay(currentMessage, nextMessage)
		);
	}

	isToPrevious() {
		const { currentMessage, previousMessage, position } = this.props;
		return (
			currentMessage &&
			previousMessage &&
			position &&
			isSameUser(currentMessage, previousMessage) &&
			isSameDay(currentMessage, previousMessage)
		);
	}

	styledBubbleToNext() {
		const { position, containerToNextStyle } = this.props;
		if (!this.isToNext()) {
			return [styles[position].containerToNext, containerToNextStyle && containerToNextStyle[position]];
		}
		return null;
	}
	styledBubbleToPrevious() {
		const { position, containerToPreviousStyle } = this.props;
		if (!this.isToPrevious()) {
			return [
				styles[position].containerToPrevious,
				containerToPreviousStyle && containerToPreviousStyle[position],
			];
		}
		return null;
	}

	renderReply() {
		const { currentMessage, nextMessage } = this.props;
		if (currentMessage && currentMessage.reply && currentMessage.reply.user) {
			const { containerStyle, wrapperStyle, ...replyProps } = this.props;

			return (
				<View style={[Theme.styles.col_center, styles.content.replyMsg]}>
					<Text style={styles.content.replyUserName}>
						{currentMessage.reply.user.username || currentMessage.reply.user.full_name}
					</Text>
					<Text style={styles.content.replyText}>{currentMessage.reply.text}</Text>
				</View>
			);
		}
		return null;
	}

	renderMap(coords) {
		const { latitude, longitude } = coords;
		if (latitude == null || longitude == null) {
			return null;
		}
		return (
			<View style={{ overflow: 'hidden', width: '100%', minWidth: 120, height: 77, borderRadius: 10 }}>
				<MapView
					customMapStyle={SocialMapScreenStyles}
					provider={PROVIDER_GOOGLE}
					showsUserLocation={false}
					showsMyLocationButton={false}
					showsPointsOfInterest={false}
					showsBuildings={false}
					style={{ width: '100%', minWidth: 120, height: 77 }}
					region={{
						latitude: latitude,
						longitude: longitude,
						latitudeDelta: 0.05,
						longitudeDelta: 0.025,
					}}
					initialRegion={{
						latitude: latitude,
						longitude: longitude,
						latitudeDelta: 0.1,
						longitudeDelta: 0.05,
					}}
				>
					<MapView.Marker
						key={'marker_position'}
						anchor={{ x: 0.5, y: 0.5 }}
						coordinate={{ latitude: latitude, longitude: longitude }}
						tracksInfoWindowChanges={false}
						tracksViewChanges={false}
					>
						<View
							style={{
								width: 22,
								height: 22,
								borderRadius: 11,
								backgroundColor: '#25DEE240',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#50b7ed' }} />
						</View>
					</MapView.Marker>
				</MapView>
				<TouchableOpacity
					activeOpacity={1.0}
					style={{ position: 'absolute', left: 0, top: 0, width: '100%', minWidth: 120, height: 77 }}
					onPress={this.onPressMsg}
					onLongPress={this.onLongPress}
				/>
			</View>
		);
	}

	renderProductMessage() {
		const { currentMessage, nextMessage } = this.props;
		if (currentMessage && currentMessage.product) {
			const { containerStyle, wrapperStyle, ...replyProps } = this.props;

			return (
				<View style={[Theme.styles.col_center, { alignItems: 'flex-start', width: MAX_CONTENT_WIDTH }]}>
					<FoodMsgItem style={{ width: '100%' }} data={currentMessage.product} msg_id={currentMessage.id} />
				</View>
			);
		}
		return null;
	}

	renderMapLocation() {
		const { currentMessage, nextMessage } = this.props;
		if (currentMessage && currentMessage.map && currentMessage.map.coords) {
			const { containerStyle, wrapperStyle, ...replyProps } = this.props;

			return (
				<View style={[Theme.styles.col_center, { alignItems: 'flex-start', width: MAX_CONTENT_WIDTH }]}>
					<Text
						style={{
							fontSize: 13,
							fontFamily: Theme.fonts.medium,
							color: Theme.colors.white,
							marginBottom: 6,
						}}
					>
						{translate('social.chat.you_shared_location')}
					</Text>
					{this.renderMap(currentMessage.map.coords)}
				</View>
			);
		}
		return null;
	}

	renderMessageText() {
		const { currentMessage } = this.props;
		if (currentMessage && currentMessage.text) {
			const fontSize = 17;
			const lineHeight = 24;
			const fontFamily = Theme.fonts.medium;
			const storyReplyMargin = this.isStoryReply() ? { marginHorizontal: 0 } : {};
			const textStyles = { fontSize, lineHeight, fontFamily, ...storyReplyMargin };
			let marginTop = 0;
			if (
				(currentMessage.reply ||
					(currentMessage.images && currentMessage.images.length > 0) ||
					currentMessage.audio ||
					currentMessage.video ||
					currentMessage.map) &&
				!this.isStoryReply()
			) {
				marginTop = 10;
			}

			let isOneEmoji = false;
			if (currentMessage.emojiData && currentMessage.text == currentMessage.emojiData.code) {
				isOneEmoji = true;
			}

			const containerStyle = { marginTop, ...(this.isStoryReply() ? { width: '100%' } : {}) };
			return (
				<MessageText
					{...this.props}
					containerStyle={{ left: containerStyle, right: containerStyle }}
					textStyle={{
						left: { color: Theme.colors.text, ...textStyles },
						right: { color: Theme.colors.white, ...textStyles },
					}}
					linkStyle={{
						left: { color: Theme.colors.primary },
						right: { color: 'white', textDecorationLine: 'none' },
					}}
					customTextStyle={{
						fontSize: isOneEmoji ? 22 : textStyles.fontSize,
						lineHeight: isOneEmoji ? 28 : textStyles.lineHeight,
					}}
				/>
			);
		}
		return null;
	}

	renderImageList(imgs = []) {
		const sizeItem = 45;
		const marginWidth = 5;
		var showCnt = parseInt(MAX_CONTENT_WIDTH / (sizeItem + marginWidth));
		var plusCnt = 0;
		if (showCnt < imgs.length) {
			plusCnt = imgs.length - showCnt + 1;
			showCnt = showCnt - 1;
		}

		return (
			<View style={[Theme.styles.row_center, {}]}>
				{imgs.slice(0, showCnt).map((img, index) => (
					<TouchableOpacity
						key={index}
						style={[
							Theme.styles.col_center,
							{
								width: sizeItem,
								height: sizeItem,
								marginRight: marginWidth,
							},
						]}
						onPress={() => {
							this.onShowGalleryMsgs([img]);
						}}
					>
						<FastImage
							style={[
								{
									width: sizeItem,
									height: sizeItem,
									marginRight: marginWidth,
									borderRadius: 5,
									resizeMode: 'cover',
								},
							]}
							resizeMode={FastImage.resizeMode.cover}
							source={{
								uri: img,
								priority: FastImage.priority.high,
								cache: FastImage.cacheControl.immutable,
							}}
						/>
					</TouchableOpacity>
				))}
				{plusCnt > 0 && (
					<TouchableOpacity
						style={[
							Theme.styles.col_center,
							{
								width: sizeItem,
								height: sizeItem,
								marginRight: marginWidth,
							},
						]}
						onPress={() => {
							this.onShowGalleryMsgs(imgs.slice(showCnt, imgs.length));
						}}
					>
						<FastImage
							style={[
								{
									position: 'absolute',
									top: 0,
									left: 0,
									width: sizeItem,
									height: sizeItem,
									borderRadius: 5,
									resizeMode: 'cover',
								},
							]}
							resizeMode={FastImage.resizeMode.cover}
							source={{
								uri: showCnt < imgs.length ? imgs[showCnt] : '',
								priority: FastImage.priority.high,
								cache: FastImage.cacheControl.immutable,
							}}
						/>
						<View
							style={[
								{
									position: 'absolute',
									top: 0,
									left: 0,
									borderRadius: 5,
									width: sizeItem,
									height: sizeItem,
									backgroundColor: '#00000099',
								},
							]}
						/>
						<Text style={{ fontSize: 12, fontFamily: Theme.fonts.medium, color: Theme.colors.white }}>
							+{plusCnt}
						</Text>
					</TouchableOpacity>
				)}
			</View>
		);
	}
	renderMessageImage() {
		const isVideofile = (url) => {
			if (url.includes('.mp4') || url.includes('.mov')) {
				return true;
			}
			return false;
		}

		if (
			this.props.currentMessage &&
			this.props.currentMessage.images &&
			this.props.currentMessage.images.length > 0
		) {
			const { containerStyle, wrapperStyle, ...messageImageProps } = this.props;
			const ratio = MAX_CONTENT_WIDTH / width(100);
			const storyHeight = height(100) - 80;
			const imgHeight = this.isStoryReply() ? (7.5 * storyHeight / 10) * ratio : 100
			return (
				<View style={[{}]}>
					{this.props.currentMessage.images.length == 1 ? (
						<TouchableOpacity
							style={[Theme.styles.col_center]}
							onPress={() => {
								this.onShowGalleryMsgs(this.props.currentMessage.images);
							}}
						>
							<FastImage
								style={[
									{
										width: MAX_CONTENT_WIDTH,
										height: imgHeight,
										borderRadius: 13,
										margin: this.isStoryReply() ? 0 : 3,
										marginBottom: this.isStoryReply() ? 3 : 0,
									},
								]}
								resizeMode={FastImage.resizeMode.cover}
								source={{
									uri:
										(isVideofile(this.props.currentMessage.images[0]) &&
											!isEmpty(this.props.currentMessage.thumb_image)) ?
											this.props.currentMessage.thumb_image :
											this.props.currentMessage.images[0]
								}}
							/>
							{
								isVideofile(this.props.currentMessage.images[0]) &&
								<Feather style={{ position: 'absolute', top: '43%', left: '38%' }} name='play-circle' color={'#fff'} size={60} />
							}
						</TouchableOpacity>
					) : (
						this.renderImageList(this.props.currentMessage.images)
					)}
				</View>
			);
		}
		return null;
	}
	renderMessageVideo() {
		if (this.props.currentMessage && this.props.currentMessage.video) {
			const { containerStyle, wrapperStyle, ...messageVideoProps } = this.props;
			if (this.props.renderMessageVideo) {
				return this.props.renderMessageVideo(messageVideoProps);
			}
			return <MessageVideo {...messageVideoProps} />;
		}
		return null;
	}
	renderMessageAudio() {
		const { currentMessage, containerStyle, wrapperStyle, position } = this.props;
		if (currentMessage && currentMessage.audio) {
			return <AudioMsgItem audio={currentMessage.audio} position={position} />;
		}
		return null;
	}
	renderTicks() {
		const { currentMessage, renderTicks, user } = this.props;
		if (renderTicks && currentMessage) {
			return renderTicks(currentMessage);
		}
		if (currentMessage && user && currentMessage.user && currentMessage.user._id !== user._id) {
			return null;
		}
		if (currentMessage && (currentMessage.sent || currentMessage.received || currentMessage.pending)) {
			return (
				<View style={styles.content.tickView}>
					{!!currentMessage.sent && <Text style={[styles.content.tick, this.props.tickStyle]}>✓</Text>}
					{!!currentMessage.received && <Text style={[styles.content.tick, this.props.tickStyle]}>✓</Text>}
					{!!currentMessage.pending && <Text style={[styles.content.tick, this.props.tickStyle]}>🕓</Text>}
				</View>
			);
		}
		return null;
	}
	renderTime() {
		const { currentMessage, nextMessage, previousMessage, position, user, isGroup } = this.props;
		if (currentMessage && currentMessage.createdAt) {
			const { containerStyle, wrapperStyle, textStyle, ...timeProps } = this.props;
			if (nextMessage && nextMessage.user && currentMessage.user._id == nextMessage.user._id) {
				return null;
			}
			return (
				<View style={[styles.content.usernameView, { marginTop: 6 }]}>
					<Text style={[{ fontSize: 12, fontFamily: Theme.fonts.medium, color: Theme.colors.gray5 }]}>
						{moment(currentMessage.createdAt).format('LT')}
					</Text>
				</View>
			);
		}
		return null;
	}
	renderUsername() {
		const { currentMessage, nextMessage, previousMessage, position, user, isGroup } = this.props;
		if (this.props.renderUsernameOnMessage && currentMessage) {
			if ((user && currentMessage.user._id === user._id) || !isGroup) {
				return null;
			}
			if (previousMessage && previousMessage.user && currentMessage.user._id == previousMessage.user._id) {
				return null;
			}
			return (
				<View style={styles.content.usernameView}>
					<Text style={[styles.content.username, this.props.usernameStyle]}>
						{translate(currentMessage.user.username || currentMessage.user.full_name)}
					</Text>
				</View>
			);
		}
		return null;
	}
	renderCustomView() {
		if (this.props.renderCustomView) {
			return this.props.renderCustomView(this.props);
		}
		return null;
	}

	renderLikeBtns() {
		const { currentMessage, nextMessage, previousMessage, position, user, isGroup } = this.props;

		if (isGroup) {
			return (
				<View style={[Theme.styles.row_center]}>
					{position == 'right' &&
						currentMessage.likes &&
						currentMessage.likes.length > 0 &&
						!currentMessage.likes.includes(user._id) && (
							<LikeBtn
								style={{ zIndex: 1, marginRight: -8 }}
								onChange={(flag) => {
									this.onLikeChange(currentMessage, flag);
								}}
								checked={false}
							/>
						)}
					<LikeBtn
						style={{ zIndex: 0 }}
						onChange={(flag) => {
							if (
								currentMessage.likes == null ||
								currentMessage.likes.length == 0 ||
								currentMessage.likes.includes(user._id)
							) {
								this.onLikeChange(currentMessage, flag);
							}
						}}
						checked={currentMessage.likes && currentMessage.likes.length > 0}
						cnt={
							currentMessage.likes &&
								(currentMessage.likes.length > 1 ||
									(currentMessage.likes.length == 1 && !currentMessage.likes.includes(user._id)))
								? currentMessage.likes.length
								: null
						}
					/>
					{position == 'left' &&
						currentMessage.likes &&
						currentMessage.likes.length > 0 &&
						!currentMessage.likes.includes(user._id) && (
							<LikeBtn
								style={{ zIndex: 1, marginLeft: -8 }}
								onChange={(flag) => {
									this.onLikeChange(currentMessage, flag);
								}}
								checked={false}
							/>
						)}
				</View>
			);
		}
		return (
			<View style={[Theme.styles.row_center]}>
				<LikeBtn
					style={{
						zIndex: 1,
						marginRight:
							currentMessage.likes && currentMessage.likes.filter((i) => i != user._id).length > 0
								? -4
								: 0,
					}}
					onChange={(flag) => {
						this.onLikeChange(currentMessage, flag);
					}}
					checked={currentMessage.likes && currentMessage.likes.includes(user._id) ? true : false}
				/>
				{currentMessage.likes && currentMessage.likes.filter((i) => i != user._id).length > 0 && (
					<LikeBtn style={{ zIndex: 0 }} roundStyle={{ width: 22, height: 22 }} size={16} checked={true} />
				)}
			</View>
		);
	}

	renderBubbleContent() {
		return (
			<View style={[Theme.styles.col_center]}>
				{this.renderReply()}
				{this.renderProductMessage()}
				{this.renderMapLocation()}
				{this.renderMessageImage()}
				{this.renderMessageVideo()}
				{this.renderMessageAudio()}
				{this.renderMessageText()}
			</View>
		);
	}

	getWrapperStyle() {
		const { currentMessage, nextMessage, position, wrapperStyle } = this.props;
		if (currentMessage && currentMessage.reply && currentMessage.reply.user) {
			return {
				paddingTop: 14,
			};
		}
		if (
			currentMessage &&
			!currentMessage.reply &&
			!currentMessage.audio &&
			currentMessage.images &&
			currentMessage.images.length > 0 &&
			currentMessage.text
		) {
			return {
				paddingTop: 10,
			};
		}
		if (
			currentMessage &&
			!currentMessage.reply &&
			!currentMessage.images &&
			!currentMessage.audio &&
			currentMessage.text
		) {
			return {
				borderRadius: 60,
			};
		}
		return null;
	}

	isStoryReply = () => this.props.currentMessage?.reply_type === 'story';

	getWrapperReplyStoryStyles = () => this.isStoryReply() ? { paddingHorizontal: 7, paddingVertical: 6 } : {};

	render() {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		const { currentMessage, position, containerStyle, wrapperStyle, user, bottomContainerStyle } = this.props;
		return (
			<View style={[styles[position].container, containerStyle && containerStyle[position]]}>
				{this.renderUsername()}
				{currentMessage && currentMessage.emoji && currentMessage.emoji.length > 0 ? (
					<Text style={styles.content.emoji}>{currentMessage.emoji.map((item) => item.code).join('')}</Text>
				) : (
					<View style={[Theme.styles.row_center, styles[position].msgWrapper]}>
						{position == 'right' && this.renderLikeBtns()}
						<Tooltip
							isVisible={this.state.isPopup}
							backgroundColor={'transparent'}
							content={
								<ScrollView style={styles.popup} showsVerticalScrollIndicator={false}>
									{currentMessage && currentMessage.text && (
										<>
											<TouchableOpacity
												onPress={() => {
													this.setState({ isPopup: false });
													this.onPopupPress(currentMessage, 'reply');
												}}
												style={styles.popupBtn}
											>
												<Feather name='corner-up-left' size={14} color={'#fff'} />
												<Text style={styles.popupTxt}>{translate('social.chat.reply')}</Text>
											</TouchableOpacity>
											{(this.props.disableForward != true ||
												currentMessage.user._id == user._id) && (
													<View style={styles.popupDivider} />
												)}
										</>
									)}
									{this.props.disableForward != true && (
										<>
											<TouchableOpacity
												onPress={() => {
													this.setState({ isPopup: false });
													this.onPopupPress(currentMessage, 'forward');
												}}
												style={styles.popupBtn}
											>
												<Entypo name='forward' size={14} color={'#fff'} />
												<Text style={styles.popupTxt}>{translate('social.chat.forward')}</Text>
											</TouchableOpacity>

											<View style={styles.popupDivider} />
										</>
									)}
									{currentMessage && !isEmpty(currentMessage.text) && (
										<>
											<TouchableOpacity
												onPress={() => {
													this.onCopy(currentMessage);
												}}
												style={styles.popupBtn}
											>
												<Entypo name='documents' size={14} color={'#fff'} />
												<Text style={styles.popupTxt}>{translate('social.chat.copy_text')}</Text>
											</TouchableOpacity>

											{currentMessage.user._id == user._id && <View style={styles.popupDivider} />}
										</>
									)}
									{currentMessage.user._id == user._id && (
										<>
											<TouchableOpacity
												onPress={() => {
													this.setState({ isPopup: false });
													this.onPopupPress(currentMessage, 'unsend');
												}}
												style={styles.popupBtn}
											>
												<Feather name='trash-2' size={14} color={'#fff'} />
												<Text style={styles.popupTxt}>{translate('social.chat.unsend')}</Text>
											</TouchableOpacity>
										</>
									)}
								</ScrollView>
							}
							placement='bottom'
							tooltipStyle={{ backgroundColor: 'transparent' }}
							topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
							contentStyle={{
								backgroundColor: Theme.colors.gray2,
								borderRadius: 7,
								paddingHorizontal: 12,
							}}
							arrowStyle={{}}
							showChildInTooltip={false}
							disableShadow={false}
							onClose={() => this.setState({ isPopup: false })}
							closeOnContentInteraction={false}
						>
							<View
								style={[
									styles[position].wrapper,
									wrapperStyle && wrapperStyle[position],
									this.styledBubbleToPrevious(),
									this.styledBubbleToNext(),
									this.getWrapperStyle(),
									this.getWrapperReplyStoryStyles(),
								]}
							>
								<TouchableOpacity
									activeOpacity={1.0}
									onPress={this.onPressMsg}
									onLongPress={this.onLongPress}
									{...this.props.touchableProps}
								>
									{this.renderBubbleContent()}
								</TouchableOpacity>
							</View>
						</Tooltip>
						{position == 'left' && this.renderLikeBtns()}
					</View>
				)}
				{this.renderTime()}
				{/*
            {this.renderTicks()} */}
			</View>
		);
	}
}

export default React.memo(MessageBubble)

Bubble.contextTypes = {
	actionSheet: PropTypes.func,
};
Bubble.defaultProps = {
	touchableProps: {},
	onLongPress: null,
	onPressMsg: null,
	onShowGalleryMsgs: null,
	renderMessageImage: null,
	renderMessageVideo: null,
	renderMessageText: null,
	renderCustomView: null,
	renderUsername: null,
	renderTicks: null,
	renderTime: null,
	renderQuickReplies: null,
	onQuickReply: null,
	position: 'left',
	optionTitles: DEFAULT_OPTION_TITLES,
	currentMessage: {
		text: null,
		createdAt: null,
		image: null,
	},
	nextMessage: {},
	previousMessage: {},
	containerStyle: {},
	wrapperStyle: {},
	bottomContainerStyle: {},
	tickStyle: {},
	usernameStyle: {},
	containerToNextStyle: {},
	containerToPreviousStyle: {},
};
Bubble.propTypes = {
	user: PropTypes.object.isRequired,
	touchableProps: PropTypes.object,
	onLongPress: PropTypes.func,
	onPressMsg: PropTypes.func,
	onShowGalleryMsgs: PropTypes.func,
	renderMessageImage: PropTypes.func,
	renderMessageVideo: PropTypes.func,
	renderMessageText: PropTypes.func,
	renderCustomView: PropTypes.func,
	isCustomViewBottom: PropTypes.bool,
	renderUsernameOnMessage: PropTypes.bool,
	renderUsername: PropTypes.func,
	renderTime: PropTypes.func,
	renderTicks: PropTypes.func,
	renderQuickReplies: PropTypes.func,
	onQuickReply: PropTypes.func,
	position: PropTypes.oneOf(['left', 'right']),
	optionTitles: PropTypes.arrayOf(PropTypes.string),
	currentMessage: PropTypes.object,
	nextMessage: PropTypes.object,
	previousMessage: PropTypes.object,
	containerStyle: PropTypes.shape({
		left: ViewPropTypes.style,
		right: ViewPropTypes.style,
	}),
	wrapperStyle: PropTypes.shape({
		left: ViewPropTypes.style,
		right: ViewPropTypes.style,
	}),
	bottomContainerStyle: PropTypes.shape({
		left: ViewPropTypes.style,
		right: ViewPropTypes.style,
	}),
	tickStyle: PropTypes.any,
	usernameStyle: PropTypes.any,
	containerToNextStyle: PropTypes.shape({
		left: ViewPropTypes.style,
		right: ViewPropTypes.style,
	}),
	containerToPreviousStyle: PropTypes.shape({
		left: ViewPropTypes.style,
		right: ViewPropTypes.style,
	}),
};

const styles = {
	left: StyleSheet.create({
		container: {
			flex: 1,
			alignItems: 'flex-start',
		},
		msgWrapper: { marginRight: 60, },
		wrapper: {
			marginRight: 8,
			borderRadius: 28,
			backgroundColor: Theme.colors.gray8,
			minHeight: 20,
			justifyContent: 'flex-end',
			paddingHorizontal: 18,
			paddingVertical: 14,
		},
		containerToNext: {
			borderBottomLeftRadius: 3,
		},
		containerToPrevious: {
			borderBottomLeftRadius: 3,
		},
		bottom: {
			flexDirection: 'row',
			justifyContent: 'flex-start',
		},
	}),
	right: StyleSheet.create({
		container: {
			flex: 1,
			alignItems: 'flex-end',
		},
		msgWrapper: { marginLeft: 60, },
		wrapper: {
			marginLeft: 8,
			borderRadius: 28,
			backgroundColor: Theme.colors.cyan2,
			minHeight: 20,
			justifyContent: 'flex-end',
			paddingHorizontal: 18,
			paddingVertical: 14,
		},
		containerToNext: {
			borderBottomRightRadius: 3,
		},
		containerToPrevious: {
			borderBottomRightRadius: 3,
		},
		bottom: {
			flexDirection: 'row',
			justifyContent: 'flex-end',
		},
	}),
	content: StyleSheet.create({
		tick: {
			fontSize: 11,
			// backgroundColor: Color.backgroundTransparent,
			// color: Color.white,
		},
		tickView: {
			flexDirection: 'row',
			marginRight: 10,
		},
		username: {
			top: -3,
			left: 0,
			fontSize: 12,
			fontFamily: Theme.fonts.medium,
			backgroundColor: 'transparent',
			color: Theme.colors.cyan2,
		},
		usernameView: {
			flexDirection: 'row',
			marginHorizontal: 10,
		},
		replyMsg: {
			alignItems: 'flex-start',
			paddingHorizontal: 15,
			paddingVertical: 10,
			borderRadius: 20,
			backgroundColor: Theme.colors.white,
		},
		replyUserName: { fontSize: 14, fontFamily: Theme.fonts.bold, color: Theme.colors.red1 },
		replyText: { marginTop: 6, fontSize: 14, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
		emoji: { fontSize: 40 },
	}),
	popup: {},
	popupBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
	popupTxt: { marginLeft: 6, fontSize: 14, color: '#fff', fontFamily: Theme.fonts.semiBold },
	popupDivider: { width: '100%', height: 1, backgroundColor: Theme.colors.white },
};
