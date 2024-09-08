import React, { useEffect, useState, useRef } from 'react';
import { FlatList, ActivityIndicator, RefreshControl, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux'
import { translate } from '../../../common/services/translate';
import apiFactory from '../../../common/services/apiFactory';
import Theme from '../../../theme';
import SwitchTab from '../../../common/components/SwitchTab';
import Header1 from '../../../common/components/Header1';
import AppText from '../../../common/components/AppText';
import MainBtn from '../../../common/components/buttons/main_button';
import RouteNames from '../../../routes/names';
import alerts from '../../../common/services/alerts';
import SplitHistItem from '../components/SplitHistItem';
import SplitRequestItem from '../components/SplitRequestItem';

const IS_LOADING = 'isLoading';
const IS_REFRESHING = 'isRefreshing';
const IS_LOADING_NEXT = 'isLoadingNext';
const PER_PAGE = 20;
const SplitsHistScreen = (props) => {
	const _isMounted = useRef(true);

	const [opType, setOpType] = useState(translate('splits_hist.pending'));
	const [currentRequests, setCurrentRequests] = useState([]);
	const [isCurrentLoaded, setCurrentLoaded] = useState(false);
	const [pastRequests, setPastRequests] = useState([]);
	const [pastLoadState, setPastLoadStatus] = useState({
		page: 1,
		totalPages: 1,
	})

	useEffect(() => {
		getCurrent();
		getPasts(1, IS_REFRESHING);
		const focusListener = props.navigation.addListener('focus', () => {
			getCurrent();
		});

		return focusListener;
	}, [])

	const getCurrent = async () => {
		apiFactory.get(`checkout/get-current-split-requests`)
			.then(({ data }) => {
				setCurrentRequests(data.data || []);
				setCurrentLoaded(true);
			},
				(error) => {
					setCurrentLoaded(true);
					console.log('get Current error', error)
					const message = error.message || translate('generic_error');
					alerts.error(translate('alerts.error'), message);
				});
	};

	const getPasts = async (page, propToLoad = IS_LOADING) => {
		setPastLoadStatus({
			...pastLoadState,
			page: page,
			[propToLoad]: false,
		})

		const params = [`page=${page}`, `per_page=${PER_PAGE}`];
		apiFactory.get(`orders/get-past-split-orders?${params.join('&')}`)
			.then(({ data }) => {
				if (page > 1) {
					const currentItemIds = pastRequests.map((x) => x.id);
					const newItems = data?.orders?.data.filter((x) => currentItemIds.indexOf(x.id) === -1);
					setPastLoadStatus({
						...pastLoadState,
						page: data?.orders['current_page'],
						totalPages: data?.orders['last_page'],
						[propToLoad]: false,
					})
					setPastRequests([...pastRequests, ...newItems]);
				} else {
					setPastLoadStatus({
						...pastLoadState,
						page: data?.orders['current_page'],
						totalPages: data?.orders['last_page'],
						[propToLoad]: false,
					})
					setPastRequests(data?.orders?.data || []);
				}
			},
				(error) => {
					console.log('get deposits error', error)
					const message = error.message || translate('generic_error');
					setPastLoadStatus({
						...pastLoadState,
						[propToLoad]: false,
					});
					alerts.error(translate('alerts.error'), message);
				});
	};

	const _renderOperationTabs = () => {
		return <View style={[Theme.styles.row_center, styles.operationTab]}>
			<SwitchTab
				items={[translate('splits_hist.pending'), translate('splits_hist.accepted')]}
				curitem={opType}
				style={{ width: '100%', paddingLeft: 0, paddingRight: 0 }}
				onSelect={(item) => {
					setOpType(item);
				}}
			/>
		</View>
	}

	const loadNextPage = () => {
		const { page, totalPages } = pastLoadState;
		if (!pastLoadState[IS_LOADING_NEXT] && page < totalPages) {
			setPastLoadStatus({
				page: page + 1,
			});
			getPasts(page + 1, IS_LOADING_NEXT);
		}
	};

	const renderNextLoader = () => {
		if (opType == translate('splits_hist.accepted') && pastLoadState[IS_LOADING_NEXT]) {
			return <ActivityIndicator size={28} color={Theme.colors.primary} />;
		}
		return null;
	};

	const renderEmpty = () => {
		return (
			<View style={[Theme.styles.col_center, { marginTop: 80 }]}>
				<AppText style={[styles.emptyTxt,]}>
					{
						opType != translate('splits_hist.accepted') ?
							translate('splits_hist.no_current_hist_desc')
							:
							translate('splits_hist.no_past_hist_desc')
					}
				</AppText>
			</View>
		);
	}

	const renderCurrentList = () => {
		return (
			<FlatList
				style={styles.listContainer}
				data={currentRequests}
				numColumns={1}
				initialNumToRender={20}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => <SplitRequestItem
					data={item}
					onPress={() => {
						props.navigation.navigate(RouteNames.CartSplitRequestScreen, { split_id: item.split_id });
					}}
				/>}
				ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
				ListEmptyComponent={() =>
					isCurrentLoaded && renderEmpty()
				}
			/>
		);
	}

	const renderPastList = () => {
		return (
			<FlatList
				style={styles.listContainer}
				data={pastRequests}
				numColumns={1}
				initialNumToRender={20}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => <SplitHistItem
					data={item}
					onPress={() => {}}
				/>}
				ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
				refreshControl={
					<RefreshControl
						refreshing={pastLoadState[IS_REFRESHING]}
						onRefresh={() => getPasts(1, IS_REFRESHING)}
					/>
				}
				ListFooterComponent={renderNextLoader()}
				ListEmptyComponent={() =>
					pastLoadState[IS_REFRESHING] == false && renderEmpty()
				}
				onEndReachedThreshold={0.3}
				onEndReached={loadNextPage}
			/>
		);
	}

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			<Header1
				style={{ marginTop: 20, marginBottom: 0, paddingHorizontal: 20 }}
				onLeft={() => { props.navigation.goBack() }}
				title={translate('splits_hist.title')}
			/>
			<View style={{ width: '100%', paddingHorizontal: 20, }}>
				{_renderOperationTabs()}
			</View>
			{
				opType == translate('splits_hist.pending') ?
					renderCurrentList() : renderPastList()
			}
		</View>
	);
}

const styles = StyleSheet.create({
	searchView: { width: '100%', paddingHorizontal: 20, marginTop: 48, },
	operationTab: { height: 62, width: '100%', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F6F6F9' },
	listContainer: {
		flex: 1,
		width: '100%',
		marginTop: 20,
		paddingHorizontal: 20
	},
	emptyTxt: {
		color: Theme.colors.text,
		lineHeight: 25,
		fontFamily: Theme.fonts.medium,
		fontSize: 18,
		textAlign: 'center',
		paddingHorizontal: 20,
	},
})


const mapStateToProps = ({ app }) => ({
	systemSettings: app.systemSettings || {}
});

export default connect(mapStateToProps, {
})(SplitsHistScreen);