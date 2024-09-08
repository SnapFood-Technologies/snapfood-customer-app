import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ScrollView, TouchableOpacity, Text, Share, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux'
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import Header1 from '../../../common/components/Header1';
import RouteNames from '../../../routes/names';
import MoreBtn from '../../../common/components/buttons/MoreBtn';
import { isEmpty } from '../../../common/services/utility';
import { setVendorCart } from '../../../store/actions/shop';
import PromotionsList, { PROMO_LIST_TYPE } from '../components/PromotionsList';

const PromotionsScreen = (props) => {
	const _isMounted = useRef(true);
	const [hasCurPromo, setHasCurPromo] = useState(false);

	const student_verify_menu = useMemo(() => {
		if (props.language == 'sq' && !isEmpty(props.studentVerifySettings?.main_title)) {
			return props.studentVerifySettings?.main_title;
		}
		else if (props.language == 'en' && !isEmpty(props.studentVerifySettings?.main_title_en)) {
			return props.studentVerifySettings?.main_title_en;
		}
		else if (props.language == 'it' && !isEmpty(props.studentVerifySettings?.main_title_it)) {
			return props.studentVerifySettings?.main_title_it;
		}
		return translate('account.student_verify_menu');
	}, [props.studentVerifySettings?.main_title, props.studentVerifySettings?.main_title_en,
	props.studentVerifySettings?.main_title_it, props.language])

	const optionsBtns = useMemo(() => {
		let options = [translate('account.snapfood_promotions_menu'), translate('account.vendor_promotions_menu')];
		if (props.studentVerifySettings?.enable_student_verify == 1) {
			options.push(student_verify_menu);
		}
		if (props.systemSettings?.enable_coupon_share == 1) {
			options.push(translate('promotions.get_promo'));
		}
		if (hasCurPromo) {
			options.push(translate('promotions.calendar_mode'));
		}
		return options;
	}, [props.systemSettings?.enable_coupon_share, props.studentVerifySettings?.enable_student_verify, student_verify_menu, hasCurPromo])

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			<Header1
				style={{ marginTop: 20, marginBottom: 0, paddingHorizontal: 20 }}
				onLeft={() => { props.navigation.goBack() }}
				title={translate('account.promotions_menu')}
				right={
					<MoreBtn
						options={optionsBtns}
						onSelect={(option, index) => {
							if (option == translate('account.snapfood_promotions_menu')) {
								props.navigation.navigate(RouteNames.SnapfoodPromotionsScreen)
							}
							else if (option == translate('account.vendor_promotions_menu')) {
								props.navigation.navigate(RouteNames.VendorPromotionsScreen)
							}
							else if (option == student_verify_menu) {
								props.navigation.navigate(RouteNames.StudentVerifyScreen)
							}
							else if (option == translate('promotions.get_promo')) {
								props.navigation.navigate(RouteNames.GetPromoScreen)
							}
							else if (option == translate('promotions.calendar_mode')) {
								props.navigation.navigate(RouteNames.PromosCalendarScreen)
							}
						}}
					/>
				}
			/>
			<PromotionsList
				type={PROMO_LIST_TYPE.all}
				navigation={props.navigation}
				onHasCurPromo={(flag) => setHasCurPromo(flag)}
			/>
		</View>
	);
}


const mapStateToProps = ({ app }) => ({
	language: app.language,
	studentVerifySettings: app.studentVerifySettings,
	systemSettings: app.systemSettings || {}
});

export default connect(mapStateToProps, {
	setVendorCart
})(PromotionsScreen);