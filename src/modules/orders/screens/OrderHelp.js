import React, { useRef, useEffect, useMemo } from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FastImage from 'react-native-fast-image';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import HelpPage from '../components/HelpPage';
import HelpOrderData from '../components/HelpOrderData';
import AppText from '../../../common/components/AppText';
import Theme from '../../../theme';
import Config from '../../../config';
import RouteNames from '../../../routes/names';
import {
	order_support_collection,
	getOrderSupportChannel,
	createOrderSupportChannel,
} from '../../../common/services/order_support';
import { isEmpty } from '../../../common/services/utility';

const OrderHelp = (props) => {
	const { order, user } = props;
	const isChannelCreating = useRef(false);
	const btns = [
		{ name: 'customer_support', link: RouteNames.OrderSupport },
		{ name: 'faqs', link: RouteNames.OrderFaqs },
	];
	if (order == null) {
		return null;
	}

	useEffect(() => {
		isChannelCreating.current = false;
		const focusListener = props.navigation.addListener('focus', () => {
			isChannelCreating.current = false;
		});

		return focusListener; // remove focus listener when it is unmounted
	}, [props.navigation]);

	const orderHelpBlockedDescription = useMemo(() => {
		try {
			let desc = props.systemSettings.order_help_block_description;
			if (props.language == 'en' && !isEmpty(props.systemSettings.order_help_block_description_en)) {
				desc = props.systemSettings.order_help_block_description_en;
			} else if (props.language == 'it' && !isEmpty(props.systemSettings.order_help_block_description_it)) {
				desc = props.systemSettings.order_help_block_description_it;
			}

			if (
				order.created_at != null &&
				props.systemSettings.order_help_block_days != null &&
				moment(new Date()).diff(moment(order.created_at), 'days') >=
					props.systemSettings.order_help_block_days &&
				!isEmpty(desc)
			) {
				return desc;
			}
		} catch (error) {}
		return null;
	}, [
		order.created_at,
		props.systemSettings.order_help_block_days,
		props.systemSettings.order_help_block_description,
		props.systemSettings.order_help_block_description_en,
		props.systemSettings.order_help_block_description_it,
		props.language,
	]);

	const onSupport = async () => {
		if (isChannelCreating.current == true) {
			return;
		}
		isChannelCreating.current = true;
		let channelData = await getOrderSupportChannel(order.id);
		if (channelData) {
			props.navigation.navigate(RouteNames.OrderSupport, { channelId: channelData.id });
		} else {
			let channelId = await createOrderSupportChannel(order, user, props.language, props.systemSettings);
			isChannelCreating.current = false;
			if (channelId) {
				props.navigation.navigate(RouteNames.OrderSupport, { channelId: channelId });
			} else {
				alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
			}
		}
	};

	return (
		<React.Fragment>
			<HelpPage bodystyle={{ marginTop: 70 }} navigation={props.navigation}>
				<FastImage
					source={{ uri: Config.IMG_BASE_URL + order.vendor.logo_thumbnail_path }}
					style={styles.logoView}
					resizeMode={FastImage.resizeMode.cover}
				/>
				<KeyboardAwareScrollView
					style={{ flex: 1, width: '100%', paddingHorizontal: 20 }}
					extraScrollHeight={65}
					enableOnAndroid={true}
					keyboardShouldPersistTaps='handled'
				>
					<AppText style={styles.title}>
						{translate('help.need_help_from').replace('###', order.vendor.title)}
					</AppText>
					<HelpOrderData order_id={order.id} order={order} />
					<View style={styles.divider} />
					{btns.map((btn, index) => (
						<TouchableOpacity
							key={index}
							delayPressIn={100}
							style={[Theme.styles.row_center, styles.itemView]}
							onPress={() => {
								if (btn.name == 'customer_support') {
									onSupport();
								} else {
									props.navigation.navigate(btn.link);
								}
							}}
						>
							<AppText style={[styles.itemTxt, Theme.styles.flex_1]}>
								{translate('help.' + btn.name)}
							</AppText>
						</TouchableOpacity>
					))}
					{orderHelpBlockedDescription != null && (
						<View
							style={[
								Theme.styles.col_center,
								{ width: '100%', borderRadius: 12, padding: 16, backgroundColor: Theme.colors.gray8 },
							]}
						>
							<Text
								style={{
									fontSize: 16,
									lineHeight: 20,
									color: Theme.colors.text,
									fontFamily: Theme.fonts.medium,
									textAlign: 'center',
								}}
							>
								{orderHelpBlockedDescription}
							</Text>
						</View>
					)}
					<View style={{ height: 100 }} />
				</KeyboardAwareScrollView>
			</HelpPage>
		</React.Fragment>
	);
};

const styles = StyleSheet.create({
	title: {
		marginVertical: 20,
		width: '100%',
		paddingHorizontal: 20,
		textAlign: 'center',
		fontSize: 19,
		lineHeight: 20,
		fontFamily: Theme.fonts.bold,
		color: Theme.colors.text,
	},
	logoView: {
		width: 90,
		height: 90,
		marginTop: -45,
		borderWidth: 1,
		borderColor: Theme.colors.gray6,
		borderRadius: 20,
		backgroundColor: Theme.colors.white,
	},
	itemView: { marginBottom: 15, width: '100%', padding: 18, backgroundColor: Theme.colors.gray8, borderRadius: 15 },
	itemTxt: { fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	divider: { marginVertical: 20, width: '100%', height: 1, backgroundColor: Theme.colors.gray8 },
});

function mapStateToProps({ app }) {
	return {
		user: app.user,
		language: app.language,
		order: app.tmp_order,
		systemSettings: app.systemSettings || {},
	};
}

export default connect(mapStateToProps, {})(OrderHelp);
