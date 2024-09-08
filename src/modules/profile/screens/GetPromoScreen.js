import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { width } from 'react-native-dimension';
import { connect } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import MainBtn from '../../../common/components/buttons/main_button';
import AuthInput from '../../../common/components/AuthInput';
import Header1 from '../../../common/components/Header1';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import RouteNames from '../../../routes/names';
import AppTooltip from '../../../common/components/AppTooltip';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { isEmpty } from '../../../common/services/utility';
import EarnedPromoItem from '../components/EarnedPromoItem';
import PromoInfoModal from '../../../common/components/modals/PromoInfoModal';
import { goActiveScreenFromPush } from '../../../store/actions/app';

const GetPromoScreen = (props) => {
	const [loading, setLoading] = useState(false);
	const [coupon_code, setCouponCode] = useState('');
	const [promos, setPromos] = useState([]);
	const selectedOfferItem = useRef(null);
	const [isPromoInfoModal, showPromoInfoModal] = useState(false);

	useEffect(() => {
		if (!isEmpty(props.route?.params?.promo_code)) {
			console.log('props.route?.params?.promo_code ', props.route?.params?.promo_code)
			onConfirm(props.route?.params?.promo_code);
		}
	}, [props.route?.params?.promo_code])

	useEffect(() => {
		props.goActiveScreenFromPush({
			isGetPromoVisible: false
		})
		onLoadEarnedItems()
	}, [])

	const onLoadEarnedItems = () => {
		apiFactory
			.get(`promotions/shared`)
			.then(
				({ data }) => {
					setPromos(data?.shared_promotions || [])
				},
				(error) => {
					console.log('onLoadEarnedItems error', error);
				}
			);
	};

	const onConfirm = (code) => {
		setLoading(true);
		apiFactory
			.post(`promotions/get-shared-coupon`, {
				code: code
			})
			.then(
				({ data }) => {
					setLoading(false);
					setCouponCode('');
					onLoadEarnedItems();
				},
				(error) => {
					setLoading(false);
					console.log('onConfirm error', error);
					const message = error.message || translate('generic_error');
					alerts.error(translate('alerts.error'), message);
				}
			);
	};

	const onGoHome = (promo) => {
		if (promo.promotion_details?.code) {
			Clipboard.setString(promo.promotion_details?.code);
			// Toast.show({
			// 	type: 'showInfoToast',
			// 	visibilityTime: 5000,
			// 	position: 'top',
			// 	topOffset: 42,
			// 	text1: translate('code_complete')
			// });
			if (props.hometab_navigation != null) {
				props.hometab_navigation.jumpTo(RouteNames.HomeStack);
			}
			props.navigation.navigate(RouteNames.BottomTabs);
		}
	}

	return (
		<View style={styles.container}>
			<Header1
				style={{ marginTop: 20, elevation: 0, backgroundColor: '#fff', marginBottom: 0, paddingHorizontal: 20 }}
				title={translate('promotions.get_promo')}
				onLeft={() => props.navigation.goBack()}
				right={
					<AppTooltip
						title={translate('tooltip.get_promo_title')}
						description={translate('tooltip.get_promo_description')}
						placement={'bottom'}
					/>
				}
			/>
			<KeyboardAwareScrollView style={[{ flex: 1, width: '100%', paddingHorizontal: 20 }]} keyboardShouldPersistTaps='handled'>
				<View style={[Theme.styles.col_center, { width: '100%' }]}>
					<View style={{ height: 15 }} />
					<AuthInput
						placeholder={translate('promotions.enter_coupon_code')}
						leftComp={<Ionicons name='pricetag' color={Theme.colors.text} size={18} style={{ marginRight: 12 }} />}
						rightComp={
							<TouchableOpacity onPress={() => {
								props.navigation.setParams({ promo_code: null });
								props.navigation.navigate(RouteNames.ScanQRcodeScreen, { backRoute: RouteNames.GetPromoScreen });
							}}>
								<AntDesign name='scan1' size={18} color={Theme.colors.text} />
							</TouchableOpacity>
						}
						style={styles.input}
						value={coupon_code}
						onChangeText={(text) => {
							setCouponCode(text)
						}}
					/>
					{
						promos.map(p =>
							<EarnedPromoItem key={p.id} language={props.language} data={p} onUse={() => onGoHome(p)} onDetail={() => {
								selectedOfferItem.current = p.promotion_details || {};
								showPromoInfoModal(true);
							}} />
						)
					}
					<View style={{ height: 40 }} />
				</View>
			</KeyboardAwareScrollView>
			<View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 40 }}>
				<MainBtn
					loading={loading}
					disabled={isEmpty(coupon_code) || loading}
					title={translate('confirm')}
					onPress={() => onConfirm(coupon_code)}
				/>
			</View>
			<PromoInfoModal
				language={props.language}
				showModal={isPromoInfoModal}
				data={selectedOfferItem.current}
				onClose={() => showPromoInfoModal(false)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		backgroundColor: Theme.colors.white,
	},
	header: { height: 80, marginBottom: 0, backgroundColor: '#fff', justifyContent: 'flex-end', paddingHorizontal: 20 },
	input: { backgroundColor: '#F4F4F4', borderRadius: 19 },
});

const mapStateToProps = ({ app }) => ({
	user: app.user || {},
	language: app.language,
	hometab_navigation: app.hometab_navigation,
});

export default connect(mapStateToProps, {
	goActiveScreenFromPush
})(GetPromoScreen);
