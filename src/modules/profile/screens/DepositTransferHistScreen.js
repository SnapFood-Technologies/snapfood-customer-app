import React, { useEffect, useState, useRef, useMemo } from 'react';
import { FlatList, ActivityIndicator, RefreshControl, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux'
import { translate } from '../../../common/services/translate';
import apiFactory from '../../../common/services/apiFactory';
import Theme from '../../../theme';
import SwitchTab from '../../../common/components/SwitchTab';
import Header1 from '../../../common/components/Header1';
import AppText from '../../../common/components/AppText';
import MainBtn from '../../../common/components/buttons/main_button';
import InvitationHistItem from '../components/InvitationHistItem';
import NoFriends from '../../chat/components/NoFriends';
import RouteNames from '../../../routes/names';
import alerts from '../../../common/services/alerts';
import DepositHistItem from '../components/DepositHistItem';
import TransferHistItem from '../components/TransferHistItem';
import DTMoreBtn from '../components/DTMoreBtn';
import { isEmpty } from '../../../common/services/utility';

const IS_LOADING = 'isLoading';
const IS_REFRESHING = 'isRefreshing';
const IS_LOADING_NEXT = 'isLoadingNext';
const PER_PAGE = 20;
const DepositTransferHistScreen = (props) => {
	const _isMounted = useRef(true);

	const [opType, setOpType] = useState('deposit_transfer_hist.deposit')
	const [deposits, setDeposits] = useState([])
	const [transfers, setTransfers] = useState([])
	const [depositState, setDepositStatus] = useState({
		page: 1,
		totalPages: 1,
	})
	const [transferState, setTransferStatus] = useState({
		page: 1,
		totalPages: 1,
	})

	useEffect(() => {
		const focusListener = props.navigation.addListener('focus', () => {
			getDeposits(1, IS_REFRESHING);
			getTransfers(1, IS_REFRESHING);
		});

		return focusListener;
	}, [])

	const canTransfer = useMemo(() => {
		return (props.user.has_membership != 1 || (props.user.has_membership == 1 && props.systemSettings.enable_membership_transfer == 1));
	}, [props.user.has_membership, props.systemSettings.enable_membership_transfer])

	const getDeposits = async (page, propToLoad = IS_LOADING) => {
		setDepositStatus({
			...depositState,
			page: page,
			[propToLoad]: true,
		})

		const params = [`page=${page}`, `per_page=${PER_PAGE}`, `transaction_type=deposit`, `transaction_category=stripe_card_deposit`];
		apiFactory.get(`wallet-transactions?${params.join('&')}`)
			.then(({ data }) => {
				if (page > 1) {
					const currentItemIds = deposits.map((x) => x.id);
					const newItems = data.data.filter((x) => currentItemIds.indexOf(x.id) === -1);
					setDepositStatus({
						...depositState,
						page: data['current_page'],
						totalPages: data['last_page'],
						[propToLoad]: false,
					})
					setDeposits([...deposits, ...newItems]);
				} else {
					setDepositStatus({
						...depositState,
						page: data['current_page'],
						totalPages: data['last_page'],
						[propToLoad]: false,
					})
					setDeposits(data.data || []);
				}
			},
				(error) => {
					
					const message = error.message || translate('generic_error');
					setDepositStatus({
						...depositState,
						[propToLoad]: false,
					});
					alerts.error(translate('alerts.error'), message);
				});
	};

	const getTransfers = async (page, propToLoad = IS_LOADING) => {
		setTransferStatus({
			...transferState,
			page: page,
			[propToLoad]: false,
		})

		const params = [`page=${page}`, `per_page=${PER_PAGE}`, `transaction_type=deposit`, `transaction_category=transfer`];
		apiFactory.get(`wallet-transactions?${params.join('&')}`)
			.then(({ data }) => {
				if (page > 1) {
					const currentItemIds = transfers.map((x) => x.id);
					const newItems = data.data.filter((x) => currentItemIds.indexOf(x.id) === -1);
					setTransferStatus({
						...transferState,
						page: data['current_page'],
						totalPages: data['last_page'],
						[propToLoad]: false,
					})
					setTransfers([...transfers, ...newItems]);
				} else {
					setTransferStatus({
						...transferState,
						page: data['current_page'],
						totalPages: data['last_page'],
						[propToLoad]: false,
					})
					setTransfers(data.data || []);
				}
			},
				(error) => {
					
					const message = error.message || translate('generic_error');
					setTransferStatus({
						...transferState,
						[propToLoad]: false,
					});
					alerts.error(translate('alerts.error'), message);
				});
	};

	const _renderOperationTabs = () => {
		return <View style={[Theme.styles.row_center, styles.operationTab]}>
			<SwitchTab
				items={['deposit_transfer_hist.deposit', 'deposit_transfer_hist.transfer']}
				curitem={opType}
				style={{ width: '100%', paddingLeft: 0, paddingRight: 0 }}
				onSelect={(item) => setOpType(item)}
			/>
		</View>
	}

	const loadNextPage = () => {
		if (opType == 'deposit_transfer_hist.deposit') {
			const { page, totalPages } = depositState;
			if (!depositState[IS_LOADING_NEXT] && page < totalPages) {
				setDepositStatus({
					...depositState,
					page: page + 1,
				});

				getDeposits(page + 1, IS_LOADING_NEXT);
			}
		}
		else {
			const { page, totalPages } = transferState;
			if (!transferState[IS_LOADING_NEXT] && page < totalPages) {
				setTransferStatus({
					page: page + 1,
				});
				getTransfers(page + 1, IS_LOADING_NEXT);
			}
		}
	};

	const renderNextLoader = () => {
		if (
			(opType == 'deposit_transfer_hist.deposit' && depositState[IS_LOADING_NEXT]) ||
			(opType == 'deposit_transfer_hist.transfer' && transferState[IS_LOADING_NEXT])
		) {
			return <ActivityIndicator size={28} color={Theme.colors.primary} />;
		}
		return null;
	};

	const renderTransferFreeMsg = () => {
		let message = null;
		if (props.language == 'en') {
			message = props.systemSettings?.transfer_free_message_en;
		} 
		else if (props.language == 'it') {
			message = props.systemSettings?.transfer_free_message_it;
		} 
		else {
			message = props.systemSettings?.transfer_free_message_sq;
		}
		if (isEmpty(message)) { return null; }
		return (
			<View style={[Theme.styles.row_center_start, styles.freeMsgBlock]}>
				<AppText style={[styles.freeMsgTxt]}>
					{message}
				</AppText>
			</View>
		)
	}

	const renderEmpty = () => {
		return (
			<View style={[Theme.styles.col_center, { width: '100%' }]}>
				<View style={[Theme.styles.col_center, { width: '100%', height: 80 }]}>
					{opType != 'deposit_transfer_hist.deposit' && renderTransferFreeMsg()}
				</View>
				<View style={[Theme.styles.col_center, { width: '100%' }]}>
					<AppText style={[styles.emptyTxt]}>
						{
							opType == 'deposit_transfer_hist.deposit' ?
								translate('deposit_transfer_hist.no_deposit_desc')
								:
								translate('deposit_transfer_hist.no_transfer_desc')
						}
					</AppText>
					<MainBtn
						title={
							opType == 'deposit_transfer_hist.deposit' ?
								translate('deposit_transfer_hist.deposit_now') :
								translate('deposit_transfer_hist.transfer_now')
						}
						style={{ width: '80%', marginTop: 30, padding: 10 }}
						onPress={() => {
							if (opType == 'deposit_transfer_hist.deposit') {
								props.navigation.navigate(RouteNames.DepositCardScreen);
							}
							else {
								props.navigation.navigate(RouteNames.TransferScreen);
							}
						}}
					/>
				</View>
			</View>
		);
	}

	const renderDepositList = () => {
		return (
			<FlatList
				style={styles.listContainer}
				data={deposits}
				numColumns={1}
				initialNumToRender={20}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => <DepositHistItem
					data={item}
					onPress={() => {
					}}
				/>}
				ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
				refreshControl={
					<RefreshControl
						refreshing={depositState[IS_REFRESHING]}
						onRefresh={() => getDeposits(1, IS_REFRESHING)}
					/>
				}
				ListFooterComponent={renderNextLoader()}
				ListEmptyComponent={() =>
					depositState[IS_REFRESHING] == false && renderEmpty()
				}
				ListHeaderComponent={
					deposits.length > 0 &&
					<View style={[Theme.styles.col_center, { width: '100%', paddingBottom: 15 }]}>
						<MainBtn
							title={translate('deposit_transfer_hist.deposit_now')}
							style={{ width: '80%', padding: 10 }}
							onPress={() => {
								props.navigation.navigate(RouteNames.DepositCardScreen);
							}}
						/>
					</View>
				}
				onEndReachedThreshold={0.3}
				onEndReached={loadNextPage}
			/>
		);
	}

	const renderTransferList = () => {
		return (
			<FlatList
				style={styles.listContainer}
				data={transfers}
				numColumns={1}
				initialNumToRender={20}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => <TransferHistItem
					data={item}
					onPress={() => {
						
						props.navigation.navigate(RouteNames.TransferDetailsScreen, { data: item })
					}}
				/>}
				ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
				refreshControl={
					<RefreshControl
						refreshing={transferState[IS_REFRESHING]}
						onRefresh={() => getTransfers(1, IS_REFRESHING)}
					/>
				}
				ListFooterComponent={renderNextLoader()}
				ListEmptyComponent={() =>
					transferState[IS_REFRESHING] == false && renderEmpty()
				}
				ListHeaderComponent={
					transfers.length > 0 &&
					<View style={[Theme.styles.col_center, { width: '100%', paddingBottom: 15 }]}>
						{renderTransferFreeMsg()}
						<MainBtn
							title={translate('deposit_transfer_hist.transfer_now')}
							style={{ width: '80%', padding: 10 }}
							onPress={() => {
								props.navigation.navigate(RouteNames.TransferScreen);
							}}
						/>
					</View>
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
				title={translate('account.transactions')}
				right={
					props.systemSettings.enable_deposit_transfer_module == 1 ?
						<DTMoreBtn
							canTransfer={canTransfer}
							onDeposit={() => {
								props.navigation.navigate(RouteNames.DepositCardScreen);
							}}
							onTransfer={() => {
								props.navigation.navigate(RouteNames.TransferScreen);
							}}
						/>
						: null
				}
			/>
			<View style={{ width: '100%', paddingHorizontal: 20, }}>
				{canTransfer && _renderOperationTabs()}
			</View>
			{
				opType == 'deposit_transfer_hist.deposit' ?
					renderDepositList() : (canTransfer ? renderTransferList() : null)
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
	freeMsgBlock: { width: '100%', padding: 15, marginBottom: 15, borderRadius: 12, backgroundColor: Theme.colors.gray9 },
	freeMsgTxt: {
		fontSize: 18,
		lineHeight: 22,
		fontFamily: Theme.fonts.medium,
		color: Theme.colors.text,
	},
})


const mapStateToProps = ({ app }) => ({
	user: app.user || {},
	language: app.language,
	systemSettings: app.systemSettings || {}
});

export default connect(mapStateToProps, {
})(DepositTransferHistScreen);