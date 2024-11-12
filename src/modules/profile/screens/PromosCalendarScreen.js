import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { width } from 'react-native-dimension';
import { connect } from 'react-redux';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import MainBtn from '../../../common/components/buttons/main_button';
import Header1 from '../../../common/components/Header1';
import apiFactory from '../../../common/services/apiFactory';
import AppTooltip from '../../../common/components/AppTooltip';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { isEmpty } from '../../../common/services/utility';
import PromoInfoModal from '../../../common/components/modals/PromoInfoModal';
import { goActiveScreenFromPush } from '../../../store/actions/app';
import PromoCalendarItem from '../components/PromoCalendarItem';
import moment from 'moment';
import { AppText } from '../../../common/components';

const PromosCalendarScreen = (props) => {
	const [loading, setLoading] = useState(false);
	const [nonExpiredPromos, setNonExpiredPromos] = useState([])
	const [promos, setPromos] = useState([])
	const [isPromoInfoModal, showPromoInfoModal] = useState(false);
	const selectedOfferItem = useRef(null)

	useEffect(() => {
		getActivePromotions()
	}, [])

	const getActivePromotions = async (type) => {
		setLoading(true)
		apiFactory.get('/promotions/active?with_future=1')
			.then(({ data }) => {
				const non_expired_promos = (data.promotions || []).filter(item => item.non_expired == 1);
				let promotions = (data.promotions || []).filter(item => item.non_expired != 1);
				promotions.sort((a, b) => ((a.end_time != null && b.end_time != null) ? (moment(b.end_time, "YYYY-MM-DD hh:mm:ss").toDate() - moment(a.end_time, "YYYY-MM-DD hh:mm:ss").toDate()) : 0));

				let dates = [];
				if (promotions.length > 0) {
					let diff_days = moment(promotions[0].end_time, "YYYY-MM-DD  hh:mm:ss").diff(moment(new Date()), 'days');
					for (let i = 0; i <= diff_days; i++) {
						let tmp = moment(new Date()).add(i, 'days').toDate();
						dates.push(tmp);
					}
				}

				let available_promos = [];
				for (let i = 0; i < dates.length; i++) {
					for (let k = 0; k < promotions.length; k++) {
						if (
							(moment(promotions[k].start_time, "YYYY-MM-DD  hh:mm:ss").toDate() <= dates[i])
							&&
							(moment(promotions[k].end_time, "YYYY-MM-DD  hh:mm:ss").toDate() >= dates[i])
						) {
							available_promos.push({
								...promotions[k],
								active_date: dates[i]
							});
						}
					}
				}

				setNonExpiredPromos(non_expired_promos);
				setPromos(available_promos)
				setLoading(false)
			})
			.catch(err => {
				setLoading(false)
				
			});
	};

	return (
		<View style={styles.container}>
			<Header1
				style={{ marginTop: 20, elevation: 0, backgroundColor: '#fff', marginBottom: 0, paddingHorizontal: 20 }}
				title={translate('promotions.calendar_mode')}
				onLeft={() => props.navigation.goBack()}
				right={
					<AppTooltip
						title={translate('tooltip.calendar_promo_title')}
						description={translate('tooltip.calendar_promo_description')}
						placement={'bottom'}
					/>
				}
			/>
			<KeyboardAwareScrollView style={[{ flex: 1, width: '100%', marginTop: 10, paddingHorizontal: 20 }]} keyboardShouldPersistTaps='handled'>
				{
					nonExpiredPromos.map((item, index) =>
						<PromoCalendarItem key={index}
							data={item}
							language={props.language}
							onPress={() => {
								selectedOfferItem.current = item;
								showPromoInfoModal(true)
							}}
						/>
					)
				}
				{
					promos.map((item, index) =>
						<>
							{
								(index == 0 || (index > 0 && (moment(item.active_date).format('MMMM') != moment(promos[index - 1].active_date).format('MMMM')))) &&
								<AppText style={styles.monthTxt}>{moment(item.active_date).format('MMMM')}</AppText>
							}
							<PromoCalendarItem key={index}
								data={item}
								language={props.language}
								onPress={() => {
									selectedOfferItem.current = item.promotion_details || {};
									showPromoInfoModal(true)
								}}
							/>
						</>
					)
				}
			</KeyboardAwareScrollView>
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
	monthTxt: { marginTop: 12, marginBottom: 12, fontSize: 22, lineHeight: 26, color: Theme.colors.text1, fontFamily: Theme.fonts.semiBold }
});

const mapStateToProps = ({ app }) => ({
	user: app.user || {},
	language: app.language,
	hometab_navigation: app.hometab_navigation,
});

export default connect(mapStateToProps, {
	goActiveScreenFromPush
})(PromosCalendarScreen);
