import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, FlatList } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import MainBtn from '../../../common/components/buttons/main_button';
import CheckBox from '../../../common/components/buttons/checkbox';
import Theme from '../../../theme';
import { getFriends } from '../../../store/actions/app';
import RouteNames from '../../../routes/names';
import { translate } from '../../../common/services/translate';
import { getImageFullURL } from '../../../common/services/utility';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import { findZodiacSign } from '../../../common/components/ZodiacSign';
import BackButton from '../../../common/components/buttons/back_button';
import SearchBox from '../../../common/components/social/search/SearchBox';
import NoFriends from '../components/NoFriends';

class ChooseFriendsScreen extends React.Component {
	_isMounted = false;
	constructor(props) {
		super(props);
		this.state = {
			all_friends: [],
			selected: this.props.route.params.selectedFriends,
			searchTerm: '',
			isLoading: null,
			isSaving: false
		};
	}

	componentDidMount() {
		this._isMounted = true;
		this.getAllFriends();

		this.removefocusListener = this.props.navigation.addListener('focus', () => {
			console.log('focus listener : getAllFriends');
			this.getAllFriends();
		});
	}

	componentWillUnmount() {
		this._isMounted = false;
		if (this.removefocusListener) {
			this.removefocusListener();
		}
	}

	getAllFriends = (searchTerm) => {
		if (this._isMounted == true) {
			this.setState({ isLoading: true });
		}
		this.props
			.getFriends('accepted', searchTerm)
			.then((data) => {
				if (this._isMounted == true) {
					this.setState({ isLoading: false, all_friends: data });
				}
			})
			.catch((err) => {
				if (this._isMounted == true) {
					this.setState({ isLoading: false });
				}
				console.log('getFriends', err);
			});
	};

	onChangeSearch = (search) => {
		this.setState({ searchTerm: search });
		this.getAllFriends(search);
	};

	onGoDetail = (user) => {
		this.props.navigation.navigate(RouteNames.SnapfooderScreen, { user: user });
	};

	updateMapSetting = () => {
		this.setState({
			isSaving: true
		});

		let friend_ids = this.state.selected.map(i => i.id);
		apiFactory
			.post(`users/update-map-setting`, {
				visible: 1,
				type: this.props.route.params.type,
				filter_ids: friend_ids
			})
			.then(
				({ data }) => {
					this.props.navigation.goBack()
				},
				(error) => {
					const message = error.message || translate('generic_error');
					if (this._isMounted == true) {
						this.setState({
							isSaving: false
						});
					}
					alerts.error(translate('alerts.error'), message);
				}
			);
	}

	render() {
		return (
			<View style={styles.container}>
				<Spinner visible={this.state.isSaving} />
				<View style={{ paddingHorizontal: 20, }}>
					{this.renderTitleBar()}
					{this.renderSearchBar()}
				</View>
				{this.renderFriendList()}
				<View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
					<MainBtn
						disabled={this.state.selected.length == 0}
						title={translate('proceed')}
						onPress={this.updateMapSetting}
					/>
				</View>
			</View>
		);
	}

	renderTitleBar() {
		return (
			<View style={styles.titleContainer}>
				<BackButton
					onPress={() => {
						console.log(this.props.navigation);
						this.props.navigation.goBack();
					}}
				/>
				<Text style={styles.title}>{translate('social.my_friends')}</Text>
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

	renderFriendList() {
		return (
			<FlatList
				style={styles.listContainer}
				data={this.state.all_friends}
				numColumns={1}
				keyExtractor={(item) => item.id.toString()}
				renderItem={this.renderFriendItem}
				ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
				ListEmptyComponent={() =>
					this.state.isLoading == false && (
						<NoFriends title={translate('social.no_friends')} desc={translate('social.no_friends_desc')} />
					)
				}
				ListFooterComponent={() => <View style={styles.spaceCol} />}
			/>
		);
	}

	renderFriendItem = ({ item }) => {
		const onPress = () => {
			let tmp = this.state.selected.slice(0, this.state.selected.length)
			let foundUser = this.state.selected.findIndex(i => i.id == item.id)
			if (foundUser >= 0) {
				tmp.splice(foundUser, 1)
			}
			else {
				tmp.push(item)
			}
			this.setState({ selected: tmp });
		}
		return (
			<TouchableOpacity
				style={styles.chatContainer}
				onPress={onPress}
			>
				<FastImage
					style={styles.avatar}
					source={{ uri: getImageFullURL(item.photo) }}
					resizeMode={FastImage.resizeMode.cover}
				/>
				<Text style={styles.name}>{item.username || item.full_name}</Text>
				{item.birthdate != null && findZodiacSign(moment(item.birthdate).toDate())}
				<View style={{ flex: 1 }} />
				<CheckBox onPress={onPress} checked={this.state.selected.findIndex(i => i.id == item.id) >= 0} />
			</TouchableOpacity>
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
		marginTop: 50,
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
		marginTop: 15,
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
		padding: 10,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabText: {
		fontSize: 14,
		fontFamily: Theme.fonts.regular,
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
		paddingHorizontal: 20
	},
	avatar: {
		width: 30,
		height: 30,
		borderRadius: 6,
		backgroundColor: 'red',
		marginRight: 10,
	},
	name: {
		fontSize: 17,
		color: Theme.colors.text,
		marginRight: 4,
		fontFamily: Theme.fonts.semiBold,
	},
});

const mapStateToProps = ({ app, chat }) => ({
	isLoggedIn: app.isLoggedIn,
	user: app.user,
	messages: chat.messages,
	safeAreaDims: app.safeAreaDims,
});

export default connect(mapStateToProps, { getFriends })(withNavigation(ChooseFriendsScreen));
