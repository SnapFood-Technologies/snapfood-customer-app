import React, { useState, useRef, useMemo, useCallback } from 'react';
import WebView from 'react-native-webview';
import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Callout, PROVIDER_GOOGLE, Point, Marker } from 'react-native-maps';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import Theme from '../../../theme';
import Config from '../../../config';
import { translate } from '../../../common/services/translate';
import { findZodiacSign } from '../../../common/components/ZodiacSign';
import { getImageFullURL } from '../../../common/services/utility';
// svgs
import Svg_user from '../../../common/assets/svgs/map/user.svg';
import Svg_chat from '../../../common/assets/svgs/msg/chat.svg';

const SnapfooderMarker = (props) => {
	const { latitude, longitude, user_id, is_friend, user, onGoUserProfile, onChat, onPress } = props;
	const { username, full_name, birthdate, photo } = user || {};
	// const textWidth = useRef(0);
	// const [namewidth, setWidth] = useState((username || full_name).length * 14);
	// const calculateWidth = useCallback(() => {
	// 	let w = 70;
	// 	if (birthdate != null) {
	// 		w = w + 30;
	// 	}
	// 	if ((username || full_name) != null) {
	// 		w = w + namewidth;
	// 	}
	// 	if (is_friend == 1) {
	// 		w = w + 60;
	// 	}
	// 	return w;
	// }, [birthdate, username, full_name, namewidth, is_friend]);
	// const width = useMemo(() => calculateWidth(), [calculateWidth]);
	// const measureText = useCallback(
	// 	(event) => {
	// 		let text_width = parseInt(event.nativeEvent.layout.width);
	// 		if (textWidth.current != text_width && textWidth.current == 0) {
	// 			textWidth.current = text_width;
	// 			setWidth(text_width);
	// 		}
	// 	},
	// 	[textWidth]
	// );

	const coordinate = useMemo(
		() => ({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) }),
		[latitude, longitude]
	);

	// const userString = user && JSON.stringify(user || {});
	// const onPress = useCallback(() => {
	// 	if (is_friend == 1) {
	// 		onChat(user);
	// 	} else {
	// 		onGoUserProfile(user);
	// 	}
	// }, [onChat, onGoUserProfile, userString]);

	const source = useMemo(() => ({ uri: getImageFullURL(photo) }), [photo]);
	// const zodiacSign = useMemo(() => findZodiacSign(moment(birthdate).toDate()), [birthdate]);

	
	return (
		<Marker
			// key={namewidth} 
			tracksInfoWindowChanges={false} tracksViewChanges={false} coordinate={coordinate} onPress={onPress}>
			<View style={[Theme.styles.col_center]}>
				<Svg_user />
				<FastImage style={styles.markerPhoto} source={source} />
			</View>
			{/* <Callout tooltip={true} onPress={onPress}>
				<View style={Theme.styles.col_center}>
					<View style={{ width, ...styles.callOutView }}>
						{Config.isAndroid ? (
							<Text style={styles.webViewText}>
								<WebView style={styles.webView} source={source} />
							</Text>
						) : (
							<FastImage style={styles.image} source={source} resizeMode={FastImage.resizeMode.cover} />
						)}
						<Text onLayout={measureText} numberOfLines={1} style={styles.nameTxt}>
							{username || full_name}
						</Text>
						{birthdate != null && zodiacSign}
						<View style={{ width: 10 }} />
						{is_friend == 1 && (
							<TouchableOpacity style={[Theme.styles.row_center, styles.chatBtn]}>
								<Svg_chat />
								<Text style={styles.chatBtnTxt}>Chat</Text>
							</TouchableOpacity>
						)}
					</View>
					<View style={styles.transformedView} />
				</View>
			</Callout> */}
		</Marker>
	);
};

const styles = StyleSheet.create({
	transformedView: {
		width: 20,
		height: 20,
		backgroundColor: '#fff',
		transform: [{ rotate: '45deg' }],
		marginTop: -8,
		zIndex: 0,
	},
	image: {
		width: 30,
		height: 30,
		justifyContent: 'center',
		marginRight: 10,
		borderRadius: 6,
	},
	markerPhoto: {
		width: 24,
		height: 24,
		borderRadius: 20,
		position: 'absolute',
		top: 2,
		left: 2,
		resizeMode: 'cover'
	},
	webView: { height: 30, width: 30 },
	webViewText: {
		width: 30,
		height: 30,
		padding: 0,
		justifyContent: 'center',
		marginRight: 10,
		borderRadius: 6,
	},
	callOutView: {
		height: 60,
		backgroundColor: 'white',
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1,
		flexDirection: 'row',
		paddingHorizontal: 20,
	},
	chatBtn: { paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: Theme.colors.gray6 },
	chatBtnTxt: { color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold, fontSize: 16, marginLeft: 5 },
	nameTxt: { color: Theme.colors.text, fontSize: 17, fontFamily: Theme.fonts.bold, paddingRight: 5 },
});

function arePropsEqual(prevProps, nextProps) {
	if (
		prevProps.latitude != nextProps.latitude ||
		prevProps.longitude != nextProps.longitude ||
		prevProps.user_id != nextProps.user_id ||
		prevProps.is_friend != nextProps.is_friend
	) {
		
		return false;
	}
	return true;
}

export default React.memo(SnapfooderMarker, arePropsEqual);