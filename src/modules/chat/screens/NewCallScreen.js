import React from 'react';
import {
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	View,
	Text,
	FlatList,
	ActivityIndicator,
	RefreshControl,
	PermissionsAndroid,
	Linking,
	Alert,
	Platform,
} from 'react-native';

import { withNavigation } from 'react-navigation';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import Theme from '../../../theme';
import RouteNames from '../../../routes/names';
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';
import { getFriends, } from '../../../store/actions/app';
import { translate } from '../../../common/services/translate';
import BackButton from '../../../common/components/buttons/back_button';
import SearchBox from '../../../common/components/social/search/SearchBox';
import UserListItem from '../components/UserListItem';
import NewCallOptionModal from '../../../common/components/modals/NewCallOptionModal';
import NoFriends from '../components/NoFriends';
import { AppText } from '../../../common/components';
import { ROLE_CUSTOMER } from '../../../config/constants';

const IS_LOADING = 'isLoading';
const IS_REFRESHING = 'isRefreshing';
const IS_LOADING_NEXT = 'isLoadingNext';

const Friends = Symbol('FRIENDS');
const Snapfooders = Symbol('SNAPFOODERS');

class NewCallScreen extends React.Component {
	_selected_user_id = null;
	_isMounted = false;
	_curPartner = null;
	constructor(props) {
		super(props);
		this.state = {
			tab: Friends,
			all_friends: [],
			snapfooders: [],
			page: 1,
			totalPages: 1,
			searchTerms: '',
			showNewCall: false,
			friend_loaded: false,
			snapfooders_loaded: false,
			isCreatingChannel: false,
		};
	}

	componentDidUpdate = (prevProps, prevState) => {
	};

	componentDidMount = () => {
		this._isMounted = true;
		this.getFriends();
		this.getSnapfooders(IS_REFRESHING);

		this.removefocusListener = this.props.navigation.addListener('focus', () => {
			if (this._selected_user_id != null) {
				this.updateSnapfoodDetail(this._selected_user_id, 'snapfooder');
			}
		});
	};

	componentWillUnmount = () => {
		this._isMounted = false;
		if (this.removefocusListener) {
			this.removefocusListener();
		}
	};

	updateSnapfoodDetail = async (user_id, type) => {
		apiFactory.get(`users/snapfooders/${user_id}`).then(
			({ data }) => {
				const res_snapfooder = data['snapfooder'];
				if (this._isMounted == true) {
					if (type == 'snapfooder') {
						let tmp = this.state.snapfooders.slice(0, this.state.snapfooders.length);
						let found_index = tmp.findIndex((i) => i.id == user_id);
						if (found_index >= 0) {
							tmp[found_index].invite_status = res_snapfooder.invite_status;
							this.setState({ snapfooders: tmp });
						}

						this._selected_user_id = null;
					}
				}
			},
			(error) => {
				const message = error.message || translate('generic_error');
				
			}
		);
	};

	onSendInvitation = async (item, callback) => {
		apiFactory
			.post(`users/friends/update`, {
				user_id: this.props.user.id,
				friend_id: item.id,
				status: 'invited',
			})
			.then(
				(res) => {
					
					if (callback) {
						callback(true);
					} else {
						this.getSnapfooders('none');
					}
				},
				(error) => {
					const message = error.message || translate('generic_error');
					alerts.error(translate('alerts.error'), message);
				}
			);
	};

	onCancelInvitation = async (item, callback) => {
		apiFactory
			.post(`users/friends/remove`, {
				user_id: this.props.user.id,
				friend_id: item.id,
			})
			.then(
				(res) => {
					if (callback) {
						callback(true);
					} else {
						this.getSnapfooders('none');
					}
				},
				(error) => {
					const message = error.message || translate('generic_error');
					alerts.error(translate('alerts.error'), message);
				}
			);
	};

	onChangeSearch = async (searchTerms) => {
		await this.setState({ searchTerms });
		this.getFriends(searchTerms);
		this.getSnapfooders('none');

	};

	onEnterCall = async (isVideoCall = false) => {
		if (this._curPartner == null) { return; }
		this.setState({ showNewCall: false })
		this.props.navigation.goBack();
		this.props.navigation.navigate(
			RouteNames.VideoCallScreen,
			{
				type: 'outgoing',
				isVideoCall : isVideoCall,
				OutgoingCallReceiver: {
					id: this._curPartner.id,
					username: this._curPartner.username || null,
					full_name: this._curPartner.full_name || null,
					photo: this._curPartner.photo || null,
					phone: this._curPartner.phone || null,
					email: this._curPartner.email || null,
					role: ROLE_CUSTOMER
				}
			});
	};

	getSnapfooders = async (propToLoad = IS_LOADING) => {
		const { searchTerms, page } = this.state;
		let page_num = page;
		if (propToLoad == IS_REFRESHING || propToLoad == 'none') {
			page_num = 1;
		}
		const params = [`name=${searchTerms}`, `page=${page_num}`];
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
						snapfooders_loaded: true,
					});
				}
			},
			(error) => {
				const message = error.message || translate('generic_error');
				this.setState({
					[propToLoad]: false,
					snapfooders_loaded: true,
				});
				alerts.error(translate('alerts.error'), message);
			}
		);
	};

	getFriends = (searchTerm) => {
		if (this.state.isCreatingChannel) {
			return;
		}
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
			return (
				<View style={[Theme.styles.col_center, { height: 90 }]} >
					<ActivityIndicator size={28} color={Theme.colors.primary} />
				</View >
			)
		}
		return <View style={{ height: 90 }} />;
	};

	render() {
		const { tab } = this.state;
		return (
			<View style={styles.container}>
				<StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
				<Spinner visible={this.state.isCreatingChannel} />
				{this.renderTitleBar()}
				{this.renderSearchBar()}
				<View style={{ paddingHorizontal: 20 }}>{this.renderTab()}</View>
				<View style={{ flex: 1 }}>
					{tab === Friends && this.renderFriendList()}
					{tab === Snapfooders && this.renderSnapfooders()}
				</View>
				<NewCallOptionModal
					showModal={this.state.showNewCall}
					onAudioCall={() => this.onEnterCall(false)}
					onVideoCall={() => this.onEnterCall(true)}
					onClose={() => this.setState({ showNewCall: false })}
				/>
			</View>
		);
	}

	renderTitleBar() {
		return (
			<View style={styles.titleContainer}>
				<BackButton
					onPress={() => {
						this.props.navigation.goBack();
					}}
				/>
				<Text style={styles.title}>{translate('social.new_call')}</Text>
			</View>
		);
	}

	renderSearchBar() {
		return (
			<View style={styles.searchContainer}>
				<SearchBox onChangeText={this.onChangeSearch} hint={translate('social.search.friends')} />
			</View>
		);
	}

	renderTab() {
		const { tab } = this.state;
		return (
			<View style={styles.tabContainer}>
				{this.renderTabButton('Friends', tab === Friends, () => {
					this.setState({ tab: Friends });
				})}
				<View style={styles.spaceRow} />
				{this.renderTabButton('Snapfooders', tab === Snapfooders, () => {
					this.setState({ tab: Snapfooders });
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
				keyExtractor={(item) => item.id.toString()}
				renderItem={(item, index) => (
					<UserListItem
						key={item.item.id}
						full_name={item.item.username || item.item.full_name}
						photo={item.item.photo}
						invite_status={item.item.invite_status}
						type='none'
						onPress={() => {
							this._curPartner = item.item;
							this.setState({ showNewCall: true })
						}}
					/>
				)}
				ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
				ListEmptyComponent={() =>
					this.state.friend_loaded == true && (
						<NoFriends title={translate('social.no_friends_from_new_chat')} />
					)
				}
			/>
		);
	}

	renderSnapfooders() {
		return (
			<FlatList
				style={styles.listContainer}
				data={this.state.snapfooders}
				numColumns={1}
				keyExtractor={(item) => item.id.toString()}
				renderItem={(item, index) => (
					<UserListItem
						key={item.item.id}
						full_name={item.item.username || item.item.full_name}
						photo={item.item.photo}
						invite_status={item.item.invite_status}
						type='snapfooder'
						onPress={() => {
							this._selected_user_id = item.item.id;
							this.props.navigation.navigate(RouteNames.SnapfooderScreen, { user: item.item });
						}}
						onRightBtnPress={
							item.item.invite_status == 'invited'
								? () => this.onCancelInvitation(item.item)
								: () => this.onSendInvitation(item.item)
						}
					/>
				)}
				ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
				refreshControl={
					<RefreshControl
						refreshing={this.state[IS_REFRESHING]}
						onRefresh={() => this.getSnapfooders(IS_REFRESHING)}
					/>
				}
				ListFooterComponent={this.renderNextLoader()}
				ListEmptyComponent={() =>
					this.state.snapfooders_loaded == true && (
						<NoFriends title={translate('social.no_snapfooders_from_new_chat')} />
					)
				}
				onEndReachedThreshold={0.3}
				onEndReached={this.loadNextPage}
			/>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 20,
		marginTop: 40,
	},
	title: {
		alignSelf: 'center',
		flex: 1,
		textAlign: 'center',
		marginRight: 30,
		fontSize: 19,
		fontFamily: Theme.fonts.bold,
	},
	searchContainer: {
		flexDirection: 'row',
		paddingHorizontal: 20,
		marginTop: 5,
	},
	spaceRow: {
		width: 15,
	},
	spaceCol: {
		height: 10,
	},
	tabContainer: {
		borderColor: '#F6F6F9',
		borderTopWidth: 1,
		borderBottomWidth: 1,
		paddingVertical: 10,
		flexDirection: 'row',
		marginTop: 10,
	},
	tabButton: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 4,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabText: {
		fontSize: 16,
		fontFamily: Theme.fonts.semiBold,
	},
	chatContainer: {
		padding: 10,
		flexDirection: 'row',
		borderRadius: 15,
		backgroundColor: '#FAFAFC',
		alignItems: 'center',
	},
	listContainer: {
		flex: 1,
		width: '100%',
		marginTop: 20,
		marginBottom: 20,
		paddingLeft: 20,
		paddingRight: 20,
	},
	avatar: {
		width: 30,
		height: 30,
		borderRadius: 6,
		backgroundColor: 'red',
		marginRight: 20,
	},
	name: {
		flex: 1,
		fontSize: 14,
		color: 'black',
		fontFamily: Theme.fonts.semiBold,
	},
	time: {
		fontSize: 12,
		color: '#AAA8BF',
		fontFamily: Theme.fonts.regular,
	},
	message: {
		flex: 1,
		fontSize: 12,
		color: 'black',
		fontFamily: Theme.fonts.regular,
	},
	invite: {
		color: '#50b7ed',
		fontSize: 14,
		fontFamily: Theme.fonts.semiBold,
	},
	charGroup: { marginBottom: 12, fontSize: 14, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	charScroller: { position: 'absolute', top: 12, right: 8 }
});

const mapStateToProps = ({ app, chat }) => ({
	isLoggedIn: app.isLoggedIn,
	user: app.user,
	messages: chat.messages,
	channelId: chat.channelId,
	chat_channels: chat.chat_channels || [],
});

export default connect(mapStateToProps, { getFriends, })(withNavigation(NewCallScreen));
