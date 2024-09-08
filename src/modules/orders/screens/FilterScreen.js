import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { setHomeOrdersFilter } from '../../../store/actions/app';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import FilterItem from '../../../common/components/FilterItem';
import Header1 from '../../../common/components/Header1';

const FilterScreen = (props) => {
	const [discount, setDiscount] = useState(false);
	const [cashback, setCashback] = useState(false);
	const [promotion, setPromotion] = useState(false);
	const [split, setSplit] = useState(false);
	const [is_gift, setGift] = useState(false);

	useEffect(() => {
		setDiscount(props.home_orders_filter.discount);
		setCashback(props.home_orders_filter.cashback);
		setPromotion(props.home_orders_filter.promotion);
		setSplit(props.home_orders_filter.split);
		setGift(props.home_orders_filter.is_gift);
	}, [
		props.home_orders_filter.discount,
		props.home_orders_filter.cashback,
		props.home_orders_filter.promotion,
		props.home_orders_filter.split,
		props.home_orders_filter.is_gift,
	]);

	return (
		<View style={styles.container}>
			<Header1
				style={{ marginBottom: 10, marginTop: 0 }}
				onLeft={() => {
					props.navigation.goBack();
				}}
				onRight={() => {
					props.setHomeOrdersFilter({
						discount,
						cashback,
						promotion,
						split,
						is_gift
					});
					props.navigation.goBack();
				}}
				right={<Text style={styles.applyBtn}>{translate('search.apply')}</Text>}
				title={translate('search.filter')}
			/>
			<View style={styles.formView}>
				<ScrollView style={{ flex: 1, width: '100%' }}>
					{/* <FilterItem
						item={{
							name: translate('filter.discount'),
							type: 'checkbox',
						}}
						isChecked={discount}
						onSelect={(item) => {
							setDiscount(!discount);
						}}
					/> */}
					<FilterItem
						item={{
							name: translate('filter.cashback'),
							type: 'checkbox',
						}}
						isChecked={cashback}
						onSelect={(item) => {
							setCashback(!cashback);
						}}
					/>
					<FilterItem
						item={{
							name: translate('filter.promotion'),
							type: 'checkbox',
						}}
						isChecked={promotion}
						onSelect={(item) => {
							setPromotion(!promotion);
						}}
					/>
					<FilterItem
						item={{
							name: translate('splits_hist.split_bill_some_screen_filter'),
							type: 'checkbox',
						}}
						isChecked={split}
						onSelect={(item) => {
							setSplit(!split);
						}}
					/>
					<FilterItem
						item={{
							name: translate('filter.gift_order'),
							type: 'checkbox',
						}}
						isChecked={is_gift}
						onSelect={(item) => {
							setGift(!is_gift);
						}}
					/>
					<View style={{ height: 20 }}></View>
				</ScrollView>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		padding: 10,
		backgroundColor: Theme.colors.white,
	},
	header: {
		width: '100%',
		height: 70,
		elevation: 6,
		paddingBottom: 8,
		marginBottom: 24,
		alignItems: 'flex-end',
		flexDirection: 'row',
	},
	formView: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '100%',
	},
	applyBtn: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },

});

const mapStateToProps = ({ app }) => ({
	home_orders_filter: app.home_orders_filter,
});

export default connect(mapStateToProps, {
	setHomeOrdersFilter,
})(FilterScreen);
