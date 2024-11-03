import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ScrollView, TouchableOpacity, Text, Share, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux'
import Feather from 'react-native-vector-icons/Feather'
import Clipboard from '@react-native-clipboard/clipboard';
import { translate } from '../../../common/services/translate';
import apiFactory from '../../../common/services/apiFactory';
import Theme from '../../../theme';
import SwitchTab from '../../../common/components/SwitchTab';
import Header1 from '../../../common/components/Header1';
import PromotionItem from '../../../common/components/vendors/PromotionItem';
import NoPromotion from '../../../common/components/vendors/NoPromotion';
import RouteNames from '../../../routes/names';
import MoreBtn from '../../../common/components/buttons/MoreBtn';
import { isEmpty } from '../../../common/services/utility';
import { setVendorCart } from '../../../store/actions/shop';
import PromoOptionModal from '../../../common/components/modals/PromoOptionModal';
import PromoReceiversModal from '../../../common/components/modals/PromoReceiversModal';
import PromoInfoModal from '../../../common/components/modals/PromoInfoModal';

export const PROMO_LIST_TYPE = {
	all: 'all',
	snapfood: 'snapfood',
	vendor: 'vendor'
}
const PromotionsList = ({ type = PROMO_LIST_TYPE.all, navigation, language, setVendorCart, onHasCurPromo = () => { } }) => {
	const _isMounted = useRef(true);

	const [opType, setOpType] = useState('Current')
	const [currents, setCurrents] = useState([])
	const [pasts, setPasts] = useState([])

	const [isLoadingCurrents, setLoadingCurrents] = useState(null)
	const [isLoadingPasts, setLoadingPasts] = useState(null)

	const _selectedItem = useRef(null);
	const _sharedUsers = useRef([]);
	const [options, setOptions] = useState([])
	const [isOptionModal, showOptionModal] = useState(false)
	const [isReceiversModal, showReceiversModal] = useState(false);
	const [isPromoInfoModal, showPromoInfoModal] = useState(false);
	const selectedPromoItem = useRef(null)

	useEffect(() => {
		getActivePromotions(type)
		getPromotions(type)
		return () => {
			
			_isMounted.current = false;
		};
	}, [type])

	const getActivePromotions = async (type) => {
		let url = '/promotions/active';
		if (type == PROMO_LIST_TYPE.snapfood) {
			url = '/promotions/active?snapfood_promotion=1';
		}
		else if (type == PROMO_LIST_TYPE.vendor) {
			url = '/promotions/active?vendor_promotion=1';
		}

		setLoadingCurrents(true)
		apiFactory.get(url).then(({ data }) => {
			if (_isMounted.current == true) {
				setCurrents(data.promotions || [])
				setLoadingCurrents(false)
				if ((data.promotions || []).length > 0) {
					onHasCurPromo(true)
				}
			}
		})
			.catch(err => {
				if (_isMounted.current == true) {
					setLoadingCurrents(false)
					
				}
			});
	};

	const getPromotions = async (type) => {
		let url = '/promotions/used';
		if (type == PROMO_LIST_TYPE.snapfood) {
			url = '/promotions/used?snapfood_promotion=1';
		}
		else if (type == PROMO_LIST_TYPE.vendor) {
			url = '/promotions/used?vendor_promotion=1';
		}
		setLoadingPasts(true)
		apiFactory.get(url).then(({ data }) => {
			if (_isMounted.current == true) {
				const promotions = data.data;
				setPasts(promotions || [])
				setLoadingPasts(false)
			}
		})
			.catch(err => {
				if (_isMounted.current == true) {
					setLoadingPasts(false)
					
				}
			});
	};

	const getPromotionUsers = async (coupon_id) => {
		apiFactory.get(`/promotions/shared-users?coupon_id=${coupon_id}`).then(({ data }) => {
			_sharedUsers.current = data.users || [];
			if (_sharedUsers.current.length > 0) {
				showReceiversModal(true);
			}
		})
			.catch(err => {
				
			});
	};

	const _renderOperationTabs = () => {
		return <View style={[Theme.styles.row_center, styles.operationTab]}>
			<SwitchTab
				items={['Current', 'Past']}
				curitem={opType}
				style={{ width: '100%', paddingLeft: 0, paddingRight: 0 }}
				onSelect={(item) => setOpType(item)}
			/>
		</View>
	}

	const onGoVendor = (item) => {
		showPromoInfoModal(false)
		setTimeout(()=>{
			setVendorCart(item.promotion_vendor);
			navigation.navigate(RouteNames.VendorScreen);
		}, 300)
	}

	return (
		<View style={[Theme.styles.col_center_start, { width: '100%', flex: 1, backgroundColor: Theme.colors.white }]}>
			<View style={{ width: '100%', paddingHorizontal: 20, }}>
				{_renderOperationTabs()}
			</View>
			<ScrollView style={styles.scrollview}>
				<View style={{ height: 20, }} />
				{
					(opType == 'Current' ? currents : pasts).map((item, index) =>
						<PromotionItem key={index} data={item}
							isPast={opType != 'Current'}
							language={language}
							style={{ width: '100%', marginBottom: 12, }}
							onSelect={() => {
								selectedPromoItem.current = item;
								showPromoInfoModal(true);
							}}
							onLongPress={() => {
								if (item.promotion_details?.can_share == 1) {
									let tmp = [];
									if (opType == 'Current') {
										tmp = [translate('promotions.copy'), translate('promotions.share')];
									}
									if (item.shared_receivers && item.shared_receivers.length > 0) {
										tmp.push(translate('promotions.promo_retrievers'));
									}
									if (tmp.length > 0) {
										setOptions(tmp);
										_selectedItem.current = item;
										showOptionModal(true);
									}
								}
							}}
						/>
					)
				}
				<View style={{ height: 40, }} />
				{
					(opType == 'Current' && currents.length == 0 && isLoadingCurrents == false) ?
						<NoPromotion
							title={
								type == PROMO_LIST_TYPE.snapfood ? translate('promotions.no_current_snapfood_promotions') :
									type == PROMO_LIST_TYPE.vendor ? translate('promotions.no_current_vendor_promotions') :
										translate('promotions.no_promotions')
							}
							description={
								type == PROMO_LIST_TYPE.snapfood ? translate('promotions.no_current_snapfood_promotions_message') :
									type == PROMO_LIST_TYPE.vendor ? translate('promotions.no_current_vendor_promotions_message') :
										translate('promotions.no_promotions_message')
							}
						/>
						:
						(opType != 'Current' && pasts.length == 0 && isLoadingPasts == false) &&
						<NoPromotion
							title={
								type == PROMO_LIST_TYPE.snapfood ? translate('promotions.no_past_snapfood_promotions') :
									type == PROMO_LIST_TYPE.vendor ? translate('promotions.no_past_vendor_promotions') :
										translate('promotions.no_promotions')
							}
							description={
								type == PROMO_LIST_TYPE.snapfood ? translate('promotions.no_past_snapfood_promotions_message') :
									type == PROMO_LIST_TYPE.vendor ? translate('promotions.no_past_vendor_promotions_message') :
										translate('promotions.no_past_promotions_message')
							}
						/>
				}
			</ScrollView>
			{
				isOptionModal &&
				<PromoOptionModal
					options={options}
					showModal={isOptionModal}
					onSelect={async (option) => {
						if (option == translate('promotions.copy')) {
							showOptionModal(false)
							if (_selectedItem.current?.promotion_details?.code) {
								Clipboard.setString(_selectedItem.current?.promotion_details?.code);
							}
						}
						else if (option == translate('promotions.share')) {
							try {
								if (_selectedItem.current?.promotion_details?.code) {
									let message = translate('promotions.coupon_code') + ': ' + _selectedItem.current?.promotion_details?.code;
									const shareOptions = {
										message: message,
									};
									await Share.share(shareOptions);
								}
								showOptionModal(false)
							} catch (error) {
							}
						}
						else if (option == translate('promotions.promo_retrievers')) {
							showOptionModal(false)
							if (_selectedItem.current?.promotion_details?.id) {
								getPromotionUsers(_selectedItem.current?.promotion_details?.id)
							}
						}
					}}
					onClose={() => {
						showOptionModal(false)
					}}
				/>
			}
			{
				isReceiversModal &&
				<PromoReceiversModal
					showModal={isReceiversModal}
					users={_sharedUsers.current}
					onClose={() => showReceiversModal(false)}
				/>
			}
			<PromoInfoModal
				language={language}
				showModal={isPromoInfoModal}
				data={selectedPromoItem.current?.promotion_details || {}}
				showVendorBtn={selectedPromoItem.current?.is_vendor_promotion == 1 && selectedPromoItem.current?.promotion_vendor?.id != null}
				onClose={() => showPromoInfoModal(false)}
				onPressVendor={() => onGoVendor(selectedPromoItem.current)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	operationTab: { height: 62, width: '100%', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F6F6F9' },
	subjectTitle: { fontSize: 17, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	divider: { width: '100%', height: 1, backgroundColor: '#F6F6F9' },
	scrollview: { flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: Theme.colors.white },
	categList: { marginTop: 16, },
	scrollviewHider: { width: '100%', marginTop: -12, height: 15, backgroundColor: Theme.colors.white },

})


const mapStateToProps = ({ app }) => ({
	language: app.language,
});

export default connect(mapStateToProps, {
	setVendorCart
})(PromotionsList);