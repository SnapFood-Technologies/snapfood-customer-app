import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, FlatList, Linking } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import Theme from '../../../theme';
import { getFriends, setInvitationPickedUser } from '../../../store/actions/app';
import RouteNames from '../../../routes/names';
import { translate } from '../../../common/services/translate';
import { getImageFullURL } from '../../../common/services/utility';
import { findZodiacSign } from '../../../common/components/ZodiacSign';
import BackButton from '../../../common/components/buttons/back_button';
import SearchBox from '../../../common/components/social/search/SearchBox';
import NoFriends from '../../chat/components/NoFriends';
import RNContacts from 'react-native-contacts';

class InvitationFriendsScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			all_friends: [],
			searchTerm: '',
			isLoading: null,
			contactsAccessPermission: true,
		};
	}

	componentDidMount() {
		this.getAllFriends();

		this.removefocusListener = this.props.navigation.addListener('focus', () => {
			this.getAllFriends();
		});

		RNContacts.checkPermission()
			.then((res, rej) => {
				if (res === 'denied') {
					this.setState({ contactsAccessPermission: true });
				} else {
					this.setState({ contactsAccessPermission: false });
				}
			})
			.catch((e) => {});
	}

	componentWillUnmount() {
		if (this.removefocusListener) {
			this.removefocusListener();
		}
		this.goBack();
	}

	getAllFriends = (searchTerm) => {
		this.setState({ isLoading: true });
		this.props
			.getFriends('accepted', searchTerm)
			.then((data) => {
				this.setState({ isLoading: false, all_friends: data });
			})
			.catch((err) => {
				this.setState({ isLoading: false });
			});
	};

	onChangeSearch = (search) => {
		this.setState({ searchTerm: search });
		this.getAllFriends(search);
	};

	goBack = () => this.props.navigation.navigate(RouteNames.EarnScreen, { forceOpenInvitationModal: true });

	onGoDetail = async (user) => {
		await this.props.navigation.goBack();
		await this.props.setInvitationPickedUser({ ...user, isFriend: true });
	};

	render() {
		return (
			<View style={styles.container}>
				<View style={{ paddingHorizontal: 20 }}>
					{this.renderTitleBar()}
					{this.renderSearchBar()}
				</View>
				{this.renderFriendList()}
			</View>
		);
	}

	renderTitleBar() {
		return (
			<View style={styles.titleContainer}>
				<BackButton
					onPress={() => {
						this.goBack();
					}}
				/>
				<Text style={styles.title}>{translate('invitation_earn.invite_friend')}</Text>
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
		return (
			<TouchableOpacity
				style={styles.chatContainer}
				onPress={() => {
					this.onGoDetail(item);
				}}
			>
				<FastImage
					style={styles.avatar}
					source={{ uri: getImageFullURL(item.photo) }}
					resizeMode={FastImage.resizeMode.cover}
				/>
				<Text style={styles.name}>{item.username || item.full_name}</Text>
				{item.birthdate != null && findZodiacSign(moment(item.birthdate).toDate())}
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
		paddingHorizontal: 20,
	},
	avatar: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: 'red',
		marginRight: 10,
	},
	name: {
		fontSize: 16,
		color: Theme.colors.text,
		marginRight: 4,
		fontFamily: Theme.fonts.semiBold,
	},
});

const mapStateToProps = ({ app, chat }) => ({
	isLoggedIn: app.isLoggedIn,
	user: app.user,
});

export default connect(mapStateToProps, { getFriends, setInvitationPickedUser })(
	withNavigation(InvitationFriendsScreen)
);
