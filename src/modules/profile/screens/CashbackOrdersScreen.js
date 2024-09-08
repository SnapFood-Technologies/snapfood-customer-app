import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet, StatusBar } from 'react-native';
import FastImage from 'react-native-fast-image';
import Feather from 'react-native-vector-icons/Feather';
import Tooltip from 'react-native-walkthrough-tooltip';
import Foundation from 'react-native-vector-icons/Foundation';
import LinearGradient from 'react-native-linear-gradient';
import * as Progress from 'react-native-progress';
import { connect } from 'react-redux';
import { width } from 'react-native-dimension';
import { isEmpty, getImageFullURL } from '../../../common/services/utility';
import Theme from '../../../theme';
import apiFactory from '../../../common/services/apiFactory';
import { translate } from '../../../common/services/translate';
import { getLoggedInUser } from '../../../store/actions/auth';
import {
	goActiveScreenFromPush
} from '../../../store/actions/app';
import Header1 from '../../../common/components/Header1';
import CashbackHitem from '../../../common/components/vendors/CashbackHitem';
import NoCashback from '../components/NoCashback';
import RouteNames from '../../../routes/names';
import AppTooltip from '../../../common/components/AppTooltip';
// svgs
import Svg_balance from '../../../common/assets/svgs/balance.svg';


const PerPage = 10;

const CashbackOrdersScreen = (props) => {
	const _isMounted = useRef(true);

	const [loading, setLoading] = useState(null)
	const [cashbacks, setCashbacks] = useState([])
	const [page, setCurPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)

	useEffect(() => {
		loadCashback(1, PerPage, true);

		return () => {
			console.log("Cashback orders screen unmount")
			_isMounted.current = false;
		};
	}, [])

	const loadCashback = (page, perPage, forceLoading = false) => {
		if (loading && forceLoading == false) {
			return;
		}
		setLoading(true);
		const params = [`page=${page}`, `per_page=${perPage}`, `transaction_type=cashback`];
		apiFactory.get(`wallet-transactions?${params.join('&')}`)
			.then(({ data }) => {
				if (_isMounted.current != true) { return; }
				if (page > 1) {
					const currentOrderIds = cashbacks.map((x) => x.id);
					const newItems = data.data.filter((x) => currentOrderIds.indexOf(x.id) === -1);
					setCurPage(data['current_page']);
					setTotalPages(data['last_page']);
					setCashbacks([...cashbacks, ...newItems])
				} else {
					setCurPage(data['current_page']);
					setTotalPages(data['last_page']);
					setCashbacks(data.data || []);
				}
				setLoading(false);
			},
				(error) => {
					if (_isMounted.current == true) {
						setLoading(false);
						console.log('loadCashback error', error)
						const message = error.message || translate('generic_error');
						alerts.error(translate('alerts.error'), message);
					}
				});
	}

	const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
		return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
	}

	const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
		return contentOffset.y == 0;
	}

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			<Header1
				style={{ marginTop: 10, marginBottom: 0, paddingHorizontal: 20 }}
				onLeft={() => { props.navigation.goBack() }}
				title={translate('wallet.cashback')}
			/>
			<ScrollView style={styles.scrollview}
				onScroll={({ nativeEvent }) => {
					if (isCloseToTop(nativeEvent)) {
						loadCashback(1, PerPage)
					}
					if (isCloseToBottom(nativeEvent)) {
						if (page < totalPages) {
							loadCashback(page + 1, PerPage)
						}
					}
				}}
			>
				<View style={{ height: 16, }} />
				{
					(loading == false && cashbacks.length == 0) ?
						<NoCashback onBtnPressed={() => {
							props.navigation.navigate(RouteNames.HomeScreen)
						}} />
						:
						cashbacks.map((item, index) =>
							<CashbackHitem key={index} data={item} style={{ width: '100%', marginBottom: 12, }} onSelect={() => {
								props.navigation.navigate(RouteNames.OrderSummScreen, { isnew: false, order_id: item.source_id });
							}} />
						)
				}
				<View style={{ height: 40, }} />
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	subjectTitle: { marginTop: 20, marginBottom: 12, fontSize: 19, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	divider: { width: '100%', height: 1, backgroundColor: '#F6F6F9' },
	scrollview: { flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: Theme.colors.white },
	avatarView: { marginTop: 30, },
	photoView: { height: 100, width: 100, borderWidth: 1, borderColor: Theme.colors.gray9, borderRadius: 15, backgroundColor: '#E8D7D0' },
	avatarImg: { width: 100, height: 100, borderRadius: 6, },
	name: { marginTop: 10, marginBottom: 6, fontSize: 19, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	goldtxt: { lineHeight: 17, fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white },
	balanceView: { marginTop: 24, marginBottom: 20, backgroundColor: Theme.colors.white, elevation: 2, borderRadius: 15, paddingLeft: 11, paddingRight: 18, paddingVertical: 23, },
	balanceTxt: { marginBottom: 6, marginRight: 8, fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white },
	balanceDesc: { lineHeight: 17, fontSize: 15, fontFamily: Theme.fonts.medium, color: '#FAFAFCCC' },
	balancePrice: { fontSize: 41, fontFamily: Theme.fonts.bold, color: Theme.colors.white },
	unit: { paddingBottom: 5, fontSize: 21, fontFamily: Theme.fonts.bold, color: Theme.colors.white },
	category_silver: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#C0C0C0' },
	category_gold: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffda0f' },
	category_platinium: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E5E4E2' },
	title: { fontSize: 17, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	description: { fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text, marginTop: 8, marginBottom: 6 },
	dismiss: { fontSize: 15, fontFamily: Theme.fonts.medium, color: Theme.colors.red1, marginTop: 16, textAlign: 'center' },
	tooltip: { backgroundColor: '#fff', borderRadius: 20, padding: 16, },
	block: { width: '100%', alignItems: 'flex-start', padding: 16, borderRadius: 12, borderColor: Theme.colors.gray5, borderWidth: 1, marginTop: 12 },
	blockheader: { width: '100%', justifyContent: 'space-between', },
	blockcontent: { width: '100%', alignItems: 'flex-start', paddingTop: 12 },

	blockTxt: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
	blockValueTxt: { marginVertical: 6, fontSize: 19, fontFamily: Theme.fonts.bold, color: Theme.colors.gray7 },
	blockDescTxt: { marginTop: 6, fontSize: 15, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7, },
})


const mapStateToProps = ({ app }) => ({
	user: app.user || {},
});

export default connect(mapStateToProps, {
	getLoggedInUser, goActiveScreenFromPush
})(CashbackOrdersScreen);
