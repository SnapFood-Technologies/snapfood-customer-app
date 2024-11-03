import React from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import FastImage from "react-native-fast-image";
import Theme from "../../../theme";
import RouteNames from "../../../routes/names";
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';
import { setGiftOrderPickedUser, getFriends } from '../../../store/actions/app';
import { setDeliveryInfoCart } from '../../../store/actions/shop';
import BackButton from "../../../common/components/buttons/back_button";
import SearchBox from "../../../common/components/social/search/SearchBox";
import NoFriends from '../../chat/components/NoFriends';
import UserListItem from '../../chat/components/UserListItem';

const IS_LOADING = 'isLoading';
const IS_REFRESHING = 'isRefreshing';
const IS_LOADING_NEXT = 'isLoadingNext';

class GiftUserPickScreen extends React.Component {
	_selected_user_id = null;
	_isMounted = false;
	constructor(props) {
		super(props);
		this.state = {
			isFriend: true,
			searchTerms: '',
			page: 1,
			totalPages: 1,
			snapfooders: [],
			snapfooders_loaded: false,
			all_friends: [],
			friend_loaded: false,
			address_loading: false
		};
	}

	componentDidMount = () => {
		this._isMounted = true;
		this.getFriends();
		this.getSnapfooders(IS_REFRESHING);
	};

	componentWillUnmount() {
		this._isMounted = false;
		if (this.removefocusListener) {
			this.removefocusListener();
		}
	}

	onChangeSearch = async (searchTerms) => {
		await this.setState({ searchTerms });
		this.getFriends(searchTerms);
		this.getSnapfooders('none');
	};

	onGoBack = () => {
		this.props.setDeliveryInfoCart({
			gift_non_user: null,
			gift_recip_name: '',
			gift_recip_phone: '',
			gift_recip_id: null,
			gift_recip_is_friend: false,
			gift_recip_address: {}
		});
		this.props.navigation.navigate(RouteNames.CartScreen, { keepOpenOptionModal: true });
	}

	onGoDetail = async (user, is_friend) => {
		try {
			this.setState({ address_loading: true });
			let res = await apiFactory.get(`addresses/user/${user.id}`);
			this.setState({ address_loading: false });

			let addresses = res.data?.addresses || [];
			if (addresses.length > 0) {
				this.props.setDeliveryInfoCart({
					gift_non_user: false,
					gift_recip_name: (user.username || user.full_name),
					gift_recip_phone: user.phone,
					gift_recip_id: user.id,
					gift_recip_is_friend: is_friend,
					gift_recip_address: addresses[0],
				});

				this.props.navigation.goBack();
				return;
			}
		} catch (error) {
			
			this.setState({ address_loading: false });
		}

		this.props.setDeliveryInfoCart({
			gift_non_user: false,
			gift_recip_name: (user.username || user.full_name),
			gift_recip_phone: user.phone,
			gift_recip_id: user.id,
			gift_recip_is_friend: is_friend,
			gift_recip_address: {}
		});

		this.props.navigation.goBack();
	};

	getFriends = (searchTerm) => {
		this.props
			.getFriends('accepted', searchTerm)
			.then((data) => {
				if (this._isMounted == true) {
					this.setState({ all_friends: data, friend_loaded: true });
				}
			})
			.catch((err) => {
				this.setState({ friend_loaded: true });
				
			});
	};

	getSnapfooders = async (propToLoad = IS_LOADING) => {
		const { searchTerms, page } = this.state;
		let page_num = page;
		if (propToLoad == IS_REFRESHING || propToLoad == 'none') {
			page_num = 1;
		}

		const params = [
			`name=${searchTerms}`,
			`page=${page_num}`
		];
		await this.setState({ [propToLoad]: true });
		apiFactory.get(`users/snapfooders?${params.join('&')}`).then(
			({ data }) => {
				const res_snapfooders = data['snapfooders'];
				let snapfooders = this.state.snapfooders;
				if ([IS_LOADING, IS_LOADING_NEXT].indexOf(propToLoad) > -1) {
					snapfooders = [...snapfooders, ...res_snapfooders['data']];
				} else {
					snapfooders = res_snapfooders['data'];
				}
				if (this._isMounted) {
					this.setState({
						snapfooders: snapfooders,
						page: res_snapfooders['current_page'],
						totalPages: res_snapfooders['last_page'],
						[propToLoad]: false,
					});
				}
			},
			(error) => {
				const message = error.message || translate('generic_error');
				this.setState({
					[propToLoad]: false,
				});
				alerts.error(translate('alerts.error'), message);
			}
		);
	};

	loadNextPage = async () => {
		const { page, totalPages } = this.state;
		if (!this.state[IS_LOADING_NEXT] && page < totalPages) {
			await this.setState({
				page: page + 1,
			});
			this.getSnapfooders(IS_LOADING_NEXT);
		}
	};

	renderNextLoader = () => {
		if (this.state[IS_LOADING_NEXT]) {
			return <ActivityIndicator size={28} color={Theme.colors.primary} />;
		}
		return <View style={{ height: 15 }} />;
	};

	render() {
		return (
			<View style={styles.container}>
				<StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
				<Spinner visible={this.state.address_loading} />
				<View style={{ flex: 1 }}>
					{this.renderTitleBar()}
					{this.renderSearchBar()}
					<View style={{ paddingHorizontal: 20 }}>{this.renderTab()}</View>
					<View style={{ flex: 1 }}>
						{this.state.isFriend ? this.renderFriendList() : this.renderSnapfoodersList()}
					</View>
				</View>
			</View>
		);
	}

	renderTitleBar() {
		return (
			<View style={styles.titleContainer}>
				<BackButton
					onPress={this.onGoBack}
				/>
				<Text style={styles.title}>{translate('cart.gift_pickup_user_title')}</Text>
			</View>
		);
	}

	renderSearchBar() {
		return (
			<View style={styles.searchContainer}>
				<SearchBox onChangeText={this.onChangeSearch} hint={translate('social.search.snapfooders')} />
			</View>
		);
	}

	renderTab() {
		return (
			<View style={styles.tabContainer}>
				{this.renderTabButton('Friends', this.state.isFriend, () => {
					this.setState({ isFriend: true });
				})}
				<View style={styles.spaceRow} />
				{this.renderTabButton('Snapfooders', !this.state.isFriend, () => {
					this.setState({ isFriend: false });
				})}
			</View>
		);
	}

	renderTabButton(title, isSelected, onPress) {
		return (
			<TouchableOpacity
				style={[styles.tabButton, { backgroundColor: isSelected ? '#E0FBFB' : 'white' }]}
				onPress={onPress}
			>
				<Text style={[styles.tabText, { color: isSelected ? '#50b7ed' : 'black' }]}>{translate(title)}</Text>
			</TouchableOpacity>
		);
	}

	renderFriendList() {
		return (
			<FlatList
				style={styles.listContainer}
				data={this.state.all_friends}
				numColumns={1}
				initialNumToRender={20}
				keyExtractor={(item) => item.id.toString()}
				renderItem={(item) => this.renderFriendItem(item, true)}
				ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
				ListEmptyComponent={() =>
					this.state.friend_loaded == true && (
						<NoFriends title={translate('social.no_friends_from_new_chat')} />
					)
				}
			/>
		);
	}

	renderSnapfoodersList() {
		return (
			<FlatList
				style={styles.listContainer}
				data={this.state.snapfooders}
				numColumns={1}
				initialNumToRender={20}
				keyExtractor={(item) => item.id.toString()}
				renderItem={(item) => this.renderFriendItem(item, false)}
				ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
				refreshControl={
					<RefreshControl
						refreshing={this.state[IS_REFRESHING]}
						onRefresh={() => this.getSnapfooders(IS_REFRESHING)}
					/>
				}
				ListFooterComponent={this.renderNextLoader()}
				ListEmptyComponent={() =>
					this.state[IS_REFRESHING] == false && (
						<NoFriends
							title={translate('social.no_snapfooders')}
							desc={translate('social.no_snapfooders_desc')}
						/>
					)
				}
				onEndReachedThreshold={0.3}
				onEndReached={this.loadNextPage}
			/>
		);
	}

	renderFriendItem = ({ item }, is_friend) => {
		return (
			<UserListItem
				full_name={item.username || item.full_name}
				photo={item.photo}
				invite_status={item.invite_status}
				isFriend={item.is_friend}
				type='none'
				onPress={() => {
					this.onGoDetail(item, is_friend);
				}}
			/>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		marginTop: 50
	},
	title: {
		alignSelf: 'center',
		flex: 1,
		textAlign: 'center',
		marginRight: 30,
		fontSize: 19,
		fontFamily: Theme.fonts.bold
	},
	searchContainer: {
		flexDirection: 'row',
		marginTop: 15,
		paddingHorizontal: 20
	},
	spaceRow: {
		width: 15
	},
	spaceCol: {
		height: 10
	},
	tabContainer: {
		borderColor: '#F6F6F9',
		borderTopWidth: 1,
		borderBottomWidth: 1,
		paddingVertical: 10,
		flexDirection: 'row',
		marginTop: 10
	},
	tabButton: {
		flex: 1,
		padding: 10,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center'
	},
	tabText: {
		fontSize: 16,
		fontFamily: Theme.fonts.semiBold
	},
	listContainer: {
		flex: 1,
		width: '100%',
		marginTop: 20,
		paddingHorizontal: 20
	},
});

const mapStateToProps = ({ app, chat }) => ({
	isLoggedIn: app.isLoggedIn,
	user: app.user,
});

export default connect(
	mapStateToProps,
	{ setGiftOrderPickedUser, setDeliveryInfoCart, getFriends },
)(withNavigation(GiftUserPickScreen));
