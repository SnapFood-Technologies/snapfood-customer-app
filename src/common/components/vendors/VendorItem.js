import React, { useEffect, useState, useMemo } from 'react';
import { TouchableOpacity, ImageBackground, View, Text, StyleSheet, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import { width } from 'react-native-dimension';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppText from '../AppText';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import Config from '../../../config';
import { OrderType_Delivery, OrderType_Pickup, OrderType_Reserve } from '../../../config/constants';
import { toggleFavourite } from '../../../store/actions/vendors';
// svgs
import VendorItemSmallOrderFeeTooltip from '../../../modules/home/components/VendorItemSmallOrderFeeTooltip';
import VendorItemPaymentTooltip from '../../../modules/home/components/VendorItemPaymentTooltip';
import { isEmpty, getOpenTime } from '../../services/utility';
import Svg_calendar from '../../../common/assets/svgs/home/calendar.svg';
import Img_open_en from '../../../common/assets/images/restaurant/is_open.png';
import Img_close_en from '../../../common/assets/images/restaurant/is_closed.png';
import Img_open_al from '../../../common/assets/images/restaurant/al_open.png';
import Img_close_al from '../../../common/assets/images/restaurant/al_closed.png';

const VendorItem = (props) => {
	const { data, is_open, onSelect, onFavChange, isLoggedIn, style } = props;

	const openTime = useMemo(() => getOpenTime(data), [data]);
	const canSchedule = useMemo(() => {
		return data.selected_order_method == OrderType_Delivery && data.can_schedule == 1;
	}, [data]);

	const onPressFav = (data) => {
		props
			.toggleFavourite(data.id, data.isFav == 1 ? 0 : 1)
			.then((res) => {
				data.isFav = data.isFav == 1 ? 0 : 1;
				onFavChange(data);
			})
			.catch((error) => {});
	};

	const renderInfo = () => {
		if (data.selected_order_method == OrderType_Pickup) {
			return (
				<React.Fragment>
					<View style={[Theme.styles.row_center_start, { width: '100%', marginTop: 4 }]}>
						<AntDesign name='star' size={20} color={Theme.colors.gray7} style={{ marginRight: 6 }} />
						<AppText style={[styles.text]}>{(parseFloat(data.rating_interval) / 2).toFixed(1)}</AppText>
						<AppText style={[styles.text, { paddingHorizontal: 10 }]}>|</AppText>
						{data.distance != null && parseFloat(data.distance) > 0 && (
							<React.Fragment>
								<Entypo
									name='location-pin'
									size={22}
									color={Theme.colors.gray7}
									style={{ marginLeft: -2, marginRight: 2 }}
								/>
								<AppText style={[styles.text]}>
									{(parseFloat(data.distance) / 1000).toFixed(2)} Km
								</AppText>
								<AppText style={[styles.text, { paddingHorizontal: 10 }]}>|</AppText>
							</React.Fragment>
						)}
						<VendorItemPaymentTooltip type='cash' />
						{data.online_payment == 1 && <VendorItemPaymentTooltip type='card' />}
						<AppText style={[styles.text, { lineHeight: 16, paddingHorizontal: 10 }]}>|</AppText>
						<MaterialIcons
							name='access-time'
							size={19}
							color={Theme.colors.gray7}
							style={{ marginRight: 5 }}
						/>
						<AppText style={[styles.text]}>
							{data.max_pickup_time} {translate('vendor_profile.mins')}
						</AppText>
					</View>
				</React.Fragment>
			);
		}
		if (data.selected_order_method == OrderType_Reserve) {
			return (
				<React.Fragment>
					<View style={[Theme.styles.row_center_start, { width: '100%', marginTop: 4 }]}>
						<AntDesign name='star' size={20} color={Theme.colors.gray7} style={{ marginRight: 6 }} />
						<AppText style={[styles.text]}>{(parseFloat(data.rating_interval) / 2).toFixed(1)}</AppText>
						<AppText style={[styles.text, { paddingHorizontal: 10 }]}>|</AppText>
						{data.distance != null && parseFloat(data.distance) > 0 && (
							<React.Fragment>
								<Entypo
									name='location-pin'
									size={22}
									color={Theme.colors.gray7}
									style={{ marginLeft: -2, marginRight: 2 }}
								/>
								<AppText style={[styles.text]}>
									{(parseFloat(data.distance) / 1000).toFixed(2)} Km
								</AppText>
								<AppText style={[styles.text, { paddingHorizontal: 10 }]}>|</AppText>
							</React.Fragment>
						)}
						<VendorItemPaymentTooltip type='cash' />
						{data.online_payment == 1 && <VendorItemPaymentTooltip type='card' />}
					</View>
				</React.Fragment>
			);
		}
		return (
			<React.Fragment>
				<View
					style={[
						Theme.styles.row_center_start,
						{ width: '100%', paddingLeft: 2, marginTop: !isEmpty(data.min_delivery_time) ? 4 : 8 },
					]}
				>
					<View style={[Theme.styles.row_center]}>
						<AntDesign name='star' size={19} color={Theme.colors.gray7} style={{ marginRight: 6 }} />
						<AppText style={[styles.text]}>{(parseFloat(data.rating_interval) / 2).toFixed(1)}</AppText>
						<AppText style={[styles.text, { lineHeight: 16, paddingHorizontal: 10 }]}>|</AppText>
					</View>
					<VendorItemPaymentTooltip type='cash' />
					{data.online_payment == 1 && <VendorItemPaymentTooltip type='card' />}
					<AppText style={[styles.text, { lineHeight: 16, paddingHorizontal: 10 }]}>|</AppText>
					<MaterialIcons name='access-time' size={19} color={Theme.colors.gray7} style={{ marginRight: 6 }} />
					<AppText style={[styles.text]}>
						{!isEmpty(data.min_delivery_time) ? `${data.min_delivery_time} - ` : ''}
						{data.minimum_delivery_time} {translate('vendor_profile.mins')}
					</AppText>
				</View>
			</React.Fragment>
		);
	};

	return (
		<View style={[Theme.styles.col_center, styles.container, style]}>
			<TouchableOpacity
				activeOpacity={1}
				onPress={() => {
					// if (is_open) {
					onSelect();
					// }
				}}
				style={[Theme.styles.col_center, styles.imgView]}
			>
				<FastImage
					source={{ uri: `${Config.IMG_BASE_URL}${data.profile_path}?w=600&h=600` }}
					style={styles.img}
					resizeMode={FastImage.resizeMode.cover}
				/>
				<View style={styles.photoTransWrap} />
				<View style={{ position: 'absolute', left: 10, bottom: 0, maxWidth: 240 }}>
					<VendorItemSmallOrderFeeTooltip
						onSelect={() => onSelect()}
						title={data.title}
						isOpen={is_open}
						delivery_minimum_order_price={data.delivery_minimum_order_price}
						small_order_fee={data.small_order_fee}
					/>
					{/* <AppText style={[styles.description, { color: Theme.colors.gray9 }]} numberOfLines={1}>{data.custom_text}</AppText> */}
				</View>
				<TouchableOpacity
					onPress={() => onSelect()}
					style={[Theme.styles.col_center, styles.logoView]}
					activeOpacity={1}
				>
					<FastImage
						source={{ uri: `${Config.IMG_BASE_URL}${data.logo_thumbnail_path}?w=200&h=200` }}
						style={styles.logoimg}
						resizeMode={FastImage.resizeMode.contain}
					/>
				</TouchableOpacity>
				{/* <View style={[Theme.styles.col_center, styles.statusBar, { backgroundColor: (is_open ? Theme.colors.cyan2 : Theme.colors.red1) }]}>
                <AppText style={[styles.statusLabel]}>{is_open ? 'Open Now' : 'Closed'}</AppText>
            </View> */}
				{/* <View style={[Theme.styles.col_center, styles.statusCircle]}>
                <FastImage
                    source={
                        is_open == 1 ?
                            (props.language == 'en' ? Img_open_en : Img_open_al) :
                            (props.language == 'en' ? Img_close_en : Img_close_al)
                    }
                    style={styles.isOpenImage}
                    resizeMode={FastImage.resizeMode.cover}
                />
            </View> */}
				{isLoggedIn && (
					<TouchableOpacity style={styles.favBtn} onPress={() => onPressFav(data)}>
						<AntDesign
							name='heart'
							size={22}
							color={data.isFav == 1 ? Theme.colors.cyan2 : Theme.colors.gray5}
						/>
					</TouchableOpacity>
				)}
				{is_open != 1 && (
					<View style={[Theme.styles.col_center, styles.closedBg]}>
						<TouchableOpacity
							style={[Theme.styles.row_center, styles.opencloseBtn]}
							activeOpacity={1}
							onPress={() => {
								onSelect();
							}}
						>
							{canSchedule ? <Svg_calendar width={20} height={20} /> : null}
							<AppText style={[styles.opencloseTxt, canSchedule ? { marginLeft: 5 } : null]}>
								{canSchedule
									? translate('vendor_profile_info.schedule_order_item')
									: translate('vendor_profile_info.closed_now')}
							</AppText>
						</TouchableOpacity>
						{/* {
                        openTime != null && <AppText style={styles.availableAt}>{translate('vendor_profile_info.available_at')} {openTime}</AppText>
                    } */}
					</View>
				)}
			</TouchableOpacity>
			<View
				style={[
					Theme.styles.flex_1,
					{ marginTop: 6, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'stretch' },
				]}
			>
				<View style={[Theme.styles.row_center_start, { width: '100%', alignItems: 'flex-start' }]}>
					<View
						style={{ flex: 1, paddingRight: 12, flexDirection: 'column', justifyContent: 'space-between' }}
					>
						{renderInfo()}
					</View>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: width(100) - 40,
		alignItems: 'center',
		borderRadius: 15,
		backgroundColor: Theme.colors.white,
		marginRight: 16,
	},
	imgView: { width: '100%', height: 170, backgroundColor: '#F6F6F9' },
	img: { width: '100%', height: 170, resizeMode: 'contain', borderRadius: 10, backgroundColor: '#F6F6F9' },
	photoTransWrap: {
		width: '100%',
		height: 170,
		borderRadius: 10,
		backgroundColor: '#00000033',
		position: 'absolute',
		top: 0,
		left: 0,
	},
	isOpenImage: { width: 40, height: 50, resizeMode: 'contain', backgroundColor: 'transparent' },
	logoView: {
		position: 'absolute',
		right: 8,
		bottom: 8,
		width: 108,
		height: 108,
		borderRadius: 10,
		backgroundColor: '#F6F6F9',
	},
	logoimg: { width: 108, height: 108, resizeMode: 'contain', borderRadius: 10 },
	activeIndicator: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#0f0' },
	inactiveIndicator: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#f00' },
	title: { fontSize: 21, color: Theme.colors.text, fontFamily: Theme.fonts.bold, marginLeft: 6 },
	description: {
		marginTop: 5,
		fontSize: 15,
		lineHeight: 15,
		color: Theme.colors.gray7,
		fontFamily: Theme.fonts.medium,
	},
	text: { fontSize: 15, lineHeight: 15, color: Theme.colors.gray7, fontFamily: Theme.fonts.medium },
	scheduleLabel: { borderRadius: 6, backgroundColor: Theme.colors.red1, paddingHorizontal: 6, paddingVertical: 4 },
	scheduleLabelTxt: { fontSize: 17, color: '#fff', fontFamily: Theme.fonts.medium },
	favBtn: { position: 'absolute', top: 10, right: 10 },
	statusBar: {
		position: 'absolute',
		top: 10,
		left: 0,
		paddingHorizontal: 16,
		height: 28,
		backgroundColor: Theme.colors.cyan2,
		borderTopRightRadius: 14,
		borderBottomRightRadius: 14,
	},
	statusLabel: { fontSize: 14, lineHeight: 16, color: Theme.colors.white, fontFamily: Theme.fonts.medium },
	statusCircle: { position: 'absolute', borderRadius: 15, top: 0, left: 10, padding: 3 },
	opencloseBtn: {
		paddingVertical: 12,
		paddingHorizontal: 14,
		backgroundColor: Theme.colors.white,
		borderRadius: 40,
		marginRight: 10,
		minWidth: 90,
		height: 40,
	},
	opencloseTxt: {
		fontSize: 13,
		lineHeight: 15,
		color: Theme.colors.text,
		fontFamily: Theme.fonts.semiBold,
		textTransform: 'uppercase',
	},
	availableAt: {
		marginTop: 4,
		fontSize: 15,
		lineHeight: 17,
		color: Theme.colors.white,
		fontFamily: Theme.fonts.semiBold,
	},
	closedBg: { width: '100%', height: 170, borderRadius: 10, position: 'absolute', top: 0, left: 0 },
});

function arePropsEqual(prevProps, nextProps) {
	if (
		prevProps.isFav != nextProps.isFav ||
		prevProps.vendor_id != nextProps.vendor_id ||
		prevProps.is_open != nextProps.is_open ||
		prevProps.isLoggedIn != nextProps.isLoggedIn ||
		prevProps.online_payment != nextProps.online_payment ||
		prevProps.data?.selected_order_method != nextProps.data?.selected_order_method
	) {
		return false;
	}
	return true;
}

const mapStateToProps = ({ app, shop }) => ({
	language: app.language,
	isLoggedIn: app.isLoggedIn,
});
export default connect(mapStateToProps, { toggleFavourite })(React.memo(VendorItem, arePropsEqual));
