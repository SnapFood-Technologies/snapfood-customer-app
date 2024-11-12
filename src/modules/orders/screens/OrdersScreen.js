import React, { useEffect, useState, useRef } from 'react';
import { FlatList, TouchableOpacity, ActivityIndicator, View, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux'
import {
	setHomeOrdersFilter,
	setDefaultOrdersTab
} from '../../../store/actions/app';
import { getOrders, changeOrderStatus } from '../../../store/actions/orders';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import Theme from '../../../theme';
import AuthInput from '../../../common/components/AuthInput';
import AppBadge from '../../../common/components/AppBadge';
import RoundIconBtn from '../../../common/components/buttons/round_icon_button';
import SwitchTab from '../../../common/components/SwitchTab';
import RouteNames from '../../../routes/names';
import OrderItem from '../components/OrderItem';
import NoOrders from '../../../common/components/order/NoOrders';
import ImgSplitWhite from '../../../common/assets/images/orders/split-white.png';
import OrderNowModal from '../../../common/components/modals/OrderNowModal';
import apiFactory from '../../../common/services/apiFactory';

const PerPage = 10;

const OrdersScreen = (props) => {
	const [curLoading, setCurLoading] = useState(null)
	const [pastLoading, setPastLoading] = useState(null)
	const [opType, setOpType] = useState(translate('Current'))
	const [orders, setOrders] = useState([])
	const [past_orders, setPastOrders] = useState([])
	const [curPageTab1, setCurPageTab1] = useState(1)
	const [totalPagesTab1, setTotalPagesTab1] = useState(1)
	const [curPageTab2, setCurPageTab2] = useState(1)
	const [totalPagesTab2, setTotalPagesTab2] = useState(1)
	const [pageFocus, _setPageFocus] = useState(false)

	const [hasActivePromo, setHasActivePromo] = useState(false);

	const [curNextLoading, setCurNextLoading] = useState(false)
	const [pastNextLoading, setPastNextLoading] = useState(false)

	const pageFocusRef = useRef(pageFocus);
	const setPageFocus = newPageFocus => {
		pageFocusRef.current = newPageFocus;
		_setPageFocus(newPageFocus);
	};

	const goRootStackScreen = (name, params) => {
		if (params) {
			props.rootStackNav.navigate(name, params)
		}
		else {
			props.rootStackNav.navigate(name)
		}
	}

	const getFilers = () => {
		const { discount, cashback, promotion, split, is_gift, searchTerm } = props.home_orders_filter;
		let filters = []
		if (discount) {
			filters.push("discount=1")
		}
		if (cashback) {
			filters.push("cashback=1")
		}
		if (promotion) {
			filters.push("promotion=1")
		}
		if (split) {
			filters.push("split=1")
		}
		if (is_gift) {
			filters.push("is_gift=1")
		}
		if (searchTerm != '') {
			filters.push("searchTerm=" + searchTerm)
		}
		if (opType == translate('Current')) {
			filters.push("status=current")
		}
		if (opType == translate('Past')) {
			filters.push("status=past")
		}
		return filters;
	}


	useEffect(() => {
		getActivePromotions();
		const focusListener = props.navigation.addListener('focus', () => {
			
			setPageFocus(!pageFocusRef.current)
		});

		return focusListener; // remove focus listener when it is unmounted
	}, [props.navigation]);

	useEffect(() => {
		loadOrders(1, PerPage, true)
	},
		[
			props.home_orders_filter.discount,
			props.home_orders_filter.cashback,
			props.home_orders_filter.promotion,
			props.home_orders_filter.split,
			props.home_orders_filter.is_gift,
			props.home_orders_filter.searchTerm,
			opType
		])

	useEffect(() => {
		if (opType == translate('Current')) {
			loadOrders(curPageTab1, PerPage, true)
		}
		else {
			loadOrders(curPageTab2, PerPage, true)
		}
	},
		[
			pageFocus
		])

	useEffect(() => {
		if (props.default_orders_tab == 'current') {
			setOpType(translate('Current'));
		}
	},
		[
			props.default_orders_tab
		])



	const loadOrders = (page, perPage, forceLoading = false) => {
		if ((curLoading || pastLoading) && forceLoading == false) {
			return;
		}
		if (opType == translate('Current')) {
			setCurLoading(true);
		}
		else {
			setPastLoading(true);
		}

		let filterKeys = getFilers();

		getOrders(page, perPage, filterKeys)
			.then((orderData) => {
				if (page > 1) {
					if (opType == translate('Current')) {
						const currentOrderIds = orders.map((x) => x.id);
						const newOrders = orderData.data.filter((x) => currentOrderIds.indexOf(x.id) === -1);
						setOrders([...orders, ...newOrders])
						setCurPageTab1(orderData['current_page']);
						setTotalPagesTab1(orderData['last_page']);
					}
					else {
						const currentOrderIds = past_orders.map((x) => x.id);
						const newOrders = orderData.data.filter((x) => currentOrderIds.indexOf(x.id) === -1);
						setPastOrders([...past_orders, ...newOrders])
						setCurPageTab2(orderData['current_page']);
						setTotalPagesTab2(orderData['last_page']);
					}
				} else {
					if (opType == translate('Current')) {
						setOrders(orderData.data);
						setCurPageTab1(orderData['current_page']);
						setTotalPagesTab1(orderData['last_page']);
					}
					else {
						setPastOrders(orderData.data);
						setCurPageTab2(orderData['current_page']);
						setTotalPagesTab2(orderData['last_page']);
					}
				}
				if (opType == translate('Current')) {
					setCurLoading(false);
					setCurNextLoading(false);
				}
				else {
					setPastLoading(false);
					setPastNextLoading(false);
				}
			})
			.catch((error) => {
				
				if (opType == translate('Current')) {
					setCurLoading(false);
					setCurNextLoading(false);
				}
				else {
					setPastLoading(false);
					setPastNextLoading(false);
				}
			})
	}

	const getActivePromotions = async (type) => {
		apiFactory.get('/promotions/active').then(({ data }) => {
			if ((data?.promotions || []).length > 0) {
				setHasActivePromo(true)
			}
		})
			.catch(err => { 
			});
	};

	const _renderSearchView = () => {
		return <View style={[Theme.styles.row_center, styles.searchView]}>
			<AuthInput
				placeholder={translate('search.search_vendors_on_search')}
				underlineColorAndroid={'transparent'}
				autoCapitalize={'none'}
				returnKeyType={'done'}
				isSearch={true}
				style={{ flex: 1, height: 45, marginRight: 12, }}
				value={props.home_orders_filter.searchTerm}
				onChangeText={(text) => {
					props.setHomeOrdersFilter({
						searchTerm: text
					})
				}}
				rightComp={props.home_orders_filter.searchTerm !== '' ? (
					<TouchableOpacity onPress={() => {
						props.setHomeOrdersFilter({
							searchTerm: ''
						})
					}}>
						<Entypo name={'circle-with-cross'} color={'#878E97'} size={18} />
					</TouchableOpacity>
				) : null}
			/>
			<RoundIconBtn style={{ width: 45, height: 45, borderRadius: 10 }} icon={<MaterialIcons name='filter-list' size={26} color={Theme.colors.cyan2} />}
				onPress={() => goRootStackScreen(RouteNames.OrderFilterScreen)} />
		</View>
	}
	const _renderOperationTabs = () => {
		return <View style={[Theme.styles.row_center, styles.operationTab]}>
			<SwitchTab
				items={[translate('Current'), translate('Past')]}
				curitem={opType}
				style={{ width: '100%', paddingLeft: 0, paddingRight: 0 }}
				onSelect={(item) => {
					setOpType(item);
					props.setDefaultOrdersTab(null);
				}}
			/>
		</View>
	}

	const loadNextPage = async (isCurrent = false) => {
		if (isCurrent) {
			if (curPageTab1 < totalPagesTab1) {
				setCurNextLoading(true);
				loadOrders(curPageTab1 + 1, PerPage, true);
			}
		}
		else {
			if (curPageTab2 < totalPagesTab2) {
				setPastNextLoading(true);
				loadOrders(curPageTab2 + 1, PerPage, true);
			}
		}
	};

	const renderNextLoader = (isLoading) => {
		if (isLoading) {
			return <ActivityIndicator size={28} style={{ marginVertical: 8 }} color={Theme.colors.primary} />;
		}
		return <View style={{ height: 40 }} />;
	};

	const renderCurrentOrders = () => {
		return (
			<FlatList
				style={styles.listContainer}
				data={orders}
				numColumns={1}
				keyExtractor={item => item.id.toString()}
				renderItem={({ item }) => (
					<OrderItem
						key={item.id}
						data={item}
						order_id={item.id}
						order_status={item.status}
						onPress={() => {
							props.navigation.navigate(RouteNames.OrderSummScreen, { isnew: false, order_id: item.id });
						}} />
				)}
				ListFooterComponent={() => renderNextLoader(curNextLoading)}
				ListEmptyComponent={() => curLoading == false && <NoOrders onBtnPressed={() => {
					props.navigation.navigate(RouteNames.HomeScreen)
				}}
					onPromoBtnPressed={() => {
						goRootStackScreen(RouteNames.PromosCalendarScreen)
					}}
					hasActivePromo={hasActivePromo}
					isCurrent={true}
					style={{ marginTop: 80 }}
				/>}
				onEndReachedThreshold={0.3}
				onEndReached={() => loadNextPage(true)}
			/>
		);
	}
	const renderPastOrders = () => {
		return (
			<FlatList
				style={styles.listContainer}
				data={past_orders}
				numColumns={1}
				keyExtractor={item => item.id.toString()}
				renderItem={({ item }) => (
					<OrderItem
						key={item.id}
						data={item}
						order_id={item.id}
						order_status={item.status}
						onPress={() => {
							props.navigation.navigate(RouteNames.OrderSummScreen, { isnew: false, order_id: item.id });
						}} />
				)}
				ListFooterComponent={() => renderNextLoader(pastNextLoading)}
				ListEmptyComponent={() => pastLoading == false && <NoOrders onBtnPressed={() => {
					props.navigation.navigate(RouteNames.HomeScreen)
				}} isCurrent={false} style={{ marginTop: 80 }} />}
				onEndReachedThreshold={0.3}
				onEndReached={() => loadNextPage(false)}
			/>
		);
	}

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			{_renderSearchView()}
			<View style={{ width: '100%', paddingHorizontal: 20, }}>
				{_renderOperationTabs()}
			</View>
			{
				opType == translate('Current') ?
					renderCurrentOrders()
					: renderPastOrders()
			}
			{
				props.has_splits == true &&
				<View style={styles.floatBtnContainer}>
					<TouchableOpacity style={[Theme.styles.col_center, styles.SplitsButton]} onPress={() => {
						props.navigation.push(RouteNames.SplitsHistScreen)
					}}>
						{/* <MaterialIcons name='call-split' size={36} color={Theme.colors.white} /> */}
						<FastImage source={ImgSplitWhite} style={styles.splitBtnImg} />
					</TouchableOpacity>
				</View>
			}
			<OrderNowModal
				onGoHome={() => {
					props.navigation.navigate(RouteNames.HomeScreen)
				}}
				onGoWallet={() => {
					goRootStackScreen(RouteNames.WalletScreen)
				}}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	searchView: { width: '100%', paddingHorizontal: 20, marginTop: 48, },
	operationTab: { height: 62, width: '100%', marginTop: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F6F6F9' },
	subjectTitle: { fontSize: 17, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	divider: { width: '100%', height: 1, backgroundColor: '#F6F6F9' },
	scrollview: { flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: Theme.colors.white },
	categList: { marginTop: 16, },
	scrollviewHider: { width: '100%', marginTop: -12, height: 15, backgroundColor: Theme.colors.white },

	listContainer: {
		flex: 1,
		width: '100%',
		paddingHorizontal: 20
	},

	floatBtnContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 20,
		justifyContent: 'center',
		alignItems: 'center'
	},
	SplitsButton: {
		width: 60,
		height: 60,
		backgroundColor: Theme.colors.cyan2,
		borderRadius: 30,
		elevation: 10,
	},
	splitBtnImg: { width: 40, height: 40 }
})


const mapStateToProps = ({ app }) => ({
	home_orders_filter: app.home_orders_filter,
	default_orders_tab: app.default_orders_tab,
	has_splits: app.has_splits
});

export default connect(mapStateToProps, {
	setHomeOrdersFilter,
	setDefaultOrdersTab
})(OrdersScreen);
