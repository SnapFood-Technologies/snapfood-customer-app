import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { setHomeVendorFilter, setHomeVendorSort } from '../../../store/actions/app';
import { translate } from '../../../common/services/translate';
import {
	VSort_FastDelivery,
	VSort_HighRating,
	VSort_Closest,
	VSort_Low2HighPrice,
	VSort_PopularFirst,
	VSort_Title,
} from '../../../config/constants';
import Theme from '../../../theme';
import Header1 from '../../../common/components/Header1';
import FilterItem from '../../../common/components/FilterItem';
import RangeSlider from '../components/RangeSlider';

const FilterScreen = (props) => {
	const MAX_DELIVERY_FEE = 300;
	const CategsList = [
		{
			name: translate('vendor_filter.cuisine'),
			type: 'list',
		},
	];

	const sortList = [
		{
			id: VSort_FastDelivery,
			name: translate('vendor_filter.fastest'),
			type: 'radio',
		},
		{
			id: VSort_HighRating,
			name: translate('vendor_filter.high_rating'),
			type: 'radio',
		},
		{
			id: VSort_Closest,
			name: translate('vendor_filter.closest'),
			type: 'radio',
		},
		// {
		// 	id: VSort_Low2HighPrice,
		// 	name: translate('vendor_filter.low_high_price'),
		// 	type: 'radio',
		// },
		{
			id: VSort_PopularFirst,
			name: translate('vendor_filter.most_popular_first'),
			type: 'radio',
		},
	];

	const [lowFee, setLowFee] = useState(props.home_vendor_filter.low_fee || 0);
	const [highFee, setHighFee] = useState(props.home_vendor_filter.high_fee || MAX_DELIVERY_FEE);

	const [is_meal, setMeal] = useState(props.home_vendor_filter.is_meal);
	const [is_dietary, setDietary] = useState(props.home_vendor_filter.is_dietary);
	const [ongoing_offer, setOngoingOffer] = useState(props.home_vendor_filter.ongoing_offer);
	const [open_now, setOpenNow] = useState(props.home_vendor_filter.open_now);
	const [online_payment, setOnlinePayment] = useState(props.home_vendor_filter.online_payment);
	const [delivery_by_snapfood, setDeliveryType] = useState(props.home_vendor_filter.delivery_by_snapfood);

	const [sort, setSort] = useState(props.home_vendor_sort);

	const applyFilter = () => {
		props.setHomeVendorFilter({
			is_meal: is_meal,
			is_dietary: is_dietary,
			ongoing_offer: ongoing_offer,
			open_now: open_now,
			online_payment: online_payment,
			delivery_by_snapfood : delivery_by_snapfood,
			low_fee: lowFee,
			high_fee: highFee,
		});
		props.setHomeVendorSort(sort);
		props.navigation.goBack();
	};

	return (
		<View style={styles.container}>
			<Header1
				style={{ marginBottom: 10, marginTop: 0, paddingHorizontal: 20 }}
				onLeft={() => {
					props.navigation.goBack();
				}}
				onRight={() => applyFilter()}
				right={<Text style={styles.applyBtn}>{translate('search.apply')}</Text>}
				title={translate('search.filter')}
			/>
			<View style={styles.formView}>
				<ScrollView style={{ flex: 1, width: '100%', paddingHorizontal: 20 }}>
					<FilterItem
						item={{ name: translate('vendor_filter.meal'), type: 'checkbox' }}
						isChecked={is_meal}
						onSelect={() => setMeal(!is_meal)}
					/>
					<FilterItem
						item={{ name: translate('vendor_filter.dietary'), type: 'checkbox' }}
						isChecked={is_dietary}
						onSelect={() => setDietary(!is_dietary)}
					/>
					<FilterItem
						item={{ name: translate('vendor_filter.ongoing_offer'), type: 'checkbox' }}
						isChecked={ongoing_offer}
						onSelect={() => setOngoingOffer(!ongoing_offer)}
					/>
					<FilterItem
						item={{ name: translate('vendor_filter.open_now'), type: 'checkbox' }}
						isChecked={open_now}
						onSelect={() => setOpenNow(!open_now)}
					/>
					<FilterItem
						item={{ name: translate('vendor_filter.accept_online_payment'), type: 'checkbox' }}
						isChecked={online_payment}
						onSelect={() => setOnlinePayment(!online_payment)}
					/>
					<FilterItem
						item={{ name: translate('vendor_filter.delivery_by_snapfood'), type: 'checkbox' }}
						isChecked={delivery_by_snapfood}
						onSelect={() => setDeliveryType(!delivery_by_snapfood)}
					/>
					<View style={[styles.categ_view, Theme.styles.row_center_start]}>
						<Text style={styles.item_txt}>{translate('vendor_filter.max_delivery_fee')}</Text>
					</View>
					<RangeSlider
						MAX_VAL={MAX_DELIVERY_FEE}
						lowVal={lowFee}
						highVal={highFee}
						onChangeLow={(val) => {
							setLowFee(val);
						}}
						onChangeHigh={(val) => {
							setHighFee(val);
						}}
					/>
					<View style={[styles.categ_view, Theme.styles.row_center_start]}>
						<Text style={styles.categ_txt}>{translate('search.sort')}</Text>
					</View>
					{sortList.map((item, index) => (
						<FilterItem
							key={index}
							item={item}
							isChecked={item.id == sort}
							onSelect={(item) => {
								if (item.id == sort) {
									setSort(VSort_Title)
								}
								else {
									setSort(item.id)
								}
							}}
						/>
					))}
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
		backgroundColor: Theme.colors.white,
		paddingTop: 10,
	},
	formView: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '100%',
	},
	applyBtn: { fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },
	categ_view: { height: 47, width: '100%', borderTopWidth: 1, borderTopColor: '#F6F6F9' },
	categ_txt: { fontSize: 18, fontFamily: Theme.fonts.semiBold, color: '#AAA8BF' },
	listItem: {
		height: 54,
		width: '100%',
		marginBottom: 12,
		borderRadius: 15,
		paddingLeft: 16,
		paddingRight: 16,
		backgroundColor: '#FAFAFC',
	},
	item_txt: { fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	slider: { width: '100%' },
});

const mapStateToProps = ({ app }) => ({
	home_vendor_filter: app.home_vendor_filter,
	home_vendor_sort: app.home_vendor_sort,
});

export default connect(mapStateToProps, {
	setHomeVendorFilter,
	setHomeVendorSort,
})(FilterScreen);
