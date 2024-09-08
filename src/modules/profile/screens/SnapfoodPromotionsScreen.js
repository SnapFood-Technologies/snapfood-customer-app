import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, TouchableOpacity, Text, Share, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux'
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import Header1 from '../../../common/components/Header1';
import PromotionsList, { PROMO_LIST_TYPE } from '../components/PromotionsList';

const SnapfoodPromotionsScreen = (props) => {
	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			<Header1
				style={{ marginTop: 10, marginBottom: 10, paddingHorizontal: 20 }}
				onLeft={() => { props.navigation.goBack() }}
				title={translate('account.snapfood_promotions_menu')}
			/>
			<PromotionsList
				type={PROMO_LIST_TYPE.snapfood}
				navigation={props.navigation}
			/>
		</View>
	);
}

const mapStateToProps = ({ app }) => ({
});

export default connect(mapStateToProps, {
})(SnapfoodPromotionsScreen);