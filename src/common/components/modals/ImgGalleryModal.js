import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign'
import FastImage from 'react-native-fast-image';
import { width, height } from 'react-native-dimension';
import Gallery from 'react-native-image-gallery';
import GestureRecognizer from 'react-native-swipe-gestures';
import Video from 'react-native-video';
import convertToProxyURL from 'react-native-video-cache';
import Theme from "../../../theme";

const ImgGalleryModal = ({ showModal, images, index, onClose, description }) => {
	const [visible, SetVisible] = useState(showModal);

	useEffect(() => {
		SetVisible(showModal);
	}, [showModal]);

	const onSwipeStart = (s) => {
		
		if (s.vy > 4 && s.dy > 90) {
			onClose();
		}
	};

	const getImageComponent = useCallback((image, dim) => <SingleImage image={image?.source} />, []);

	return (
		!!images[0] && (
			<Modal
				statusBarTranslucent
				isVisible={visible}
				onSwipeComplete={() => onClose()}
				backdropOpacity={0.33}
				propagateSwipe={false}
				swipeDirection={['down', 'up']}
				onSwipeStart={onSwipeStart}
				useNativeDriver={false}
				onBackdropPress={() => onClose()}
				style={styles.modal}
			>
				<View style={[Theme.styles.col_center, styles.modalContent]}>
					{images?.length === 1 ? (

						<SingleImage image={images[0].source} description={description} />
					) : (
						<Gallery
							style={styles.gallery}
							imageComponent={getImageComponent}
							images={images}
							initialPage={index}
							onPageSelected={(id) => { }}
						/>
					)}
					<TouchableOpacity onPress={() => onClose()} style={styles.closeBtn}>
						<AntDesign name='close' size={16} color={'#FFFFFF'} />
					</TouchableOpacity>
				</View>
			</Modal>
		)
	);
};
const SingleImage = (props) => {
	const { image, description } = props;
	const [descVis, setDescVis] = useState(true);
	const [truncatedDescription, setTruncatedDescription] = useState('');
	const [readMore, setReadMore] = useState(false);
	const [caReadMore, setCanReadMore] = useState(true);
	const onDescriptionClick = useCallback(() => truncatedDescription && setReadMore(!readMore), [truncatedDescription, readMore]);

	useEffect(() => {
		if (!!description) setTruncatedDescription('');
	}, [description]);

	const onDescriptionLength = useCallback(
		({ nativeEvent: { lines } }) => {
			if (!description) return;
			let textLines = lines.map(({ text }) => text || '');
			let lineCharLength = 0;
			let shouldUpdate = true;

			if (textLines.length === 3 && !truncatedDescription) {
				const truncatedDesc = textLines
					.map((text, index) => {
						if (index === 0) lineCharLength = text.length;
						if (index === 2) {
							if (text.length < lineCharLength) shouldUpdate = false;
							return (text || '').substring(0, lineCharLength - 35);
						}
						return text || '';
					})
					.join('');
				if (shouldUpdate) setTruncatedDescription(truncatedDesc);
			} else {
				setTruncatedDescription(description);
				setCanReadMore(false);
			}
		},
		[truncatedDescription, description]
	);
	const toggleDescVis = useCallback(() => description && setDescVis(!descVis), [descVis, description]);
	const overflowTextStyle = useMemo(
		() =>
			description && ({
				numberOfLines: Math.min(Math.ceil((description || '').length / 51), 3),
				ellipsizeMode: 'tail',
				onTextLayout: onDescriptionLength,
			}),
		[description, onDescriptionLength]
	);
	return (
		<TouchableOpacity style={styles.img} activeOpacity={1} onPress={toggleDescVis}>
			{
				(image.uri?.includes('.mp4') || image.uri?.includes('.mov')) ?
					<Video
						source={{uri: convertToProxyURL(image.uri)}}
						style={styles.video}
						resizeMode={'contain'}
					/>
					:
					<FastImage style={styles.img} source={image} resizeMode={FastImage.resizeMode.contain} />
			}
			{!!descVis && !!description && (
				<TouchableOpacity activeOpacity={1} style={styles.description} onPress={onDescriptionClick}>
					<Text style={styles.descriptionText} {...{ ...(truncatedDescription ? {} : overflowTextStyle) }}>
						{!readMore && caReadMore ? truncatedDescription || description : description}
						{!!truncatedDescription &&
							!readMore &&
							caReadMore && (<Text style={[[styles.descriptionText, styles.readMore]]}>{` Read More`}</Text>)}
					</Text>
				</TouchableOpacity>
			)}
		</TouchableOpacity>
	);
};


const styles = StyleSheet.create({
	modal: { margin: 0 },
	modalContent: { width: '100%', height: '100%', backgroundColor: '#767676ee' },
	readMore: {
		fontWeight: '500',
		fontSize: 16,
	},
	closeBtn: {
		position: 'absolute',
		top: 40,
		right: 20,
		width: 30,
		height: 30,
		borderRadius: 6,
		backgroundColor: '#AAA8BF',
		alignItems: 'center',
		justifyContent: 'center',
	},
	img: { width: '100%', height: '100%' },
	video: {
		height: '100%',
		width: '100%',
	},
	gallery: { width: '100%', height: '100%' },
	description: {
		zIndex: 999999999999999,
		position: 'absolute',
		paddingVertical: 15,
		paddingHorizontal: 20,
		bottom: 0,
		width: '100%',
		backgroundColor: Theme.colors.blackTransparent6,
	},
	descriptionText: {
		fontSize: 15,
		lineHeight: 23,
		color: '#fff',
	},

});

function arePropsEqual(prevProps, nextProps) {
	if (prevProps.showModal != nextProps.showModal) {
		
		return false;
	}
	if (prevProps.images.length != nextProps.images.length || nextProps.images.filter((x) => prevProps.images.indexOf(x) === -1).length > 0) {
		
		return false;
	}
	return true;
}

export default React.memo(ImgGalleryModal, arePropsEqual);