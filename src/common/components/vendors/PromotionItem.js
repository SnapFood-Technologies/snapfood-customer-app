import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import moment from 'moment';
import 'moment/locale/sq';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppText from '../../../common/components/AppText';
import { translate } from '../../../common/services/translate';
import { getLanguage } from '../../../common/services/translate';
import Theme from '../../../theme';
import Config from '../../../config';
import React from 'react';
import { isEmpty } from '../../services/utility';

const PromotionItem = ({ data, language, isPast = false, onSelect, onLongPress = () => {}, style }) => {
	const getDateLimit = () => {
		return moment(data.end_time, 'YYYY-MM-DD  hh:mm:ss').diff(moment(new Date()), 'days');
	};

	return (
		<TouchableOpacity
			onPress={() => onSelect()}
			onLongPress={onLongPress}
			style={[Theme.styles.col_center, styles.container, style]}
		>
			<View style={[Theme.styles.row_center_start, { width: '100%', marginBottom: 4 }]}>
				<Text style={[styles.title, { flex: 1 }]}>
					{language == 'en' && !isEmpty(data.title_en) ? data.title_en : data.title}
				</Text>
				<View style={{ alignItems: 'flex-end' }}>
					{isPast != true &&
						data.non_expired != 1 &&
						(getDateLimit() > 0 ? (
							<Text style={styles.date_limit}>
								{getDateLimit()} {translate('restaurant_details.days_left')}
							</Text>
						) : (
							<Text style={styles.date_limit}>{translate('promotions.end_today')}</Text>
						))}
					{isPast == true && (
						<Text style={styles.date_limit}>
							{moment(data.end_time, 'YYYY-MM-DD HH:mm:ss').locale(getLanguage()).format('DD MMM, YYYY')}
						</Text>
					)}
				</View>
			</View>
			<View style={[Theme.styles.row_center, Theme.styles.w100, { marginTop: 4 }]}>
				<View style={[Theme.styles.col_center_start, { flex: 1, alignItems: 'flex-start' }]}>
					{data.is_vendor_promotion == 1 && data.promotion_vendor && (
						<Text style={[styles.sub_title]}>{data.promotion_vendor.title}</Text>
					)}
					<Text style={[styles.descTxt]}>
						{language == 'en' && !isEmpty(data.description_en) ? data.description_en : data.description}
					</Text>
				</View>
				{data.is_vendor_promotion == 1 && data.promotion_vendor?.logo_thumbnail_path != null ? (
					<View style={[Theme.styles.col_center_start, styles.imgView]}>
						<FastImage
							source={{ uri: Config.IMG_BASE_URL + data.promotion_vendor?.logo_thumbnail_path }}
							style={styles.img}
							resizeMode={FastImage.resizeMode.contain}
						/>
					</View>
				) : (
					data.promotion_details?.product_image_thumbnail_path != null && (
						<View style={[Theme.styles.col_center_start, styles.imgView]}>
							<FastImage
								source={{
									uri: Config.IMG_BASE_URL + data.promotion_details?.product_image_thumbnail_path,
								}}
								style={styles.img}
								resizeMode={FastImage.resizeMode.contain}
							/>
						</View>
					)
				)}
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
		alignItems: 'flex-start',
		borderRadius: 15,
		backgroundColor: '#FAFAFC',
		padding: 12,
		paddingVertical: 16,
		marginBottom: 16,
	},
	imgView: {
		marginLeft: 12,
		backgroundColor: Theme.colors.white,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: Theme.colors.gray9,
	},
	img: { width: 72, height: 72, borderRadius: 12, resizeMode: 'cover' },
	title: { fontSize: 20, color: Theme.colors.text, fontFamily: Theme.fonts.bold },
	sub_title: { fontSize: 18, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold },
	descTxt: {
		marginTop: 4,
		marginBottom: 8,
		fontSize: 16,
		lineHeight: 19,
		color: Theme.colors.gray7,
		fontFamily: Theme.fonts.medium,
	},
	date_limit: { fontSize: 16, fontFamily: Theme.fonts.semiBold, color: '#F55A00', marginBottom: 3 },
});
export default PromotionItem;
