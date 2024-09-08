import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, FlatList, Linking } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import Theme from '../../../theme';
import { getFriends, setShowMutualFriendInviteModal } from '../../../store/actions/app';
import RouteNames from '../../../routes/names';
import { translate } from '../../../common/services/translate';
import { getImageFullURL } from '../../../common/services/utility';
import { findZodiacSign } from '../../../common/components/ZodiacSign';
import BackButton from '../../../common/components/buttons/back_button';
import SearchBox from '../../../common/components/social/search/SearchBox';
import NoFriends from '../components/NoFriends';
import RNContacts from 'react-native-contacts';
import Svg_contact_info from '../../../common/assets/svgs/friends_contact_info.svg';
import Svg_contact_user from '../../../common/assets/svgs/friends_contact_user.svg';
import MoreBtn from '../../../common/components/buttons/MoreBtn';
import InviteMutualFriendModal from '../../../common/components/modals/InviteMutualFriendModal';

class MyFriendsScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			all_friends: [],
			searchTerm: '',
			isLoading: null,
			contactsAccessPermission: true,
			options: []
		};
	}

	componentDidMount() {
		this.getAllFriends();
		this.removefocusListener = this.props.navigation.addListener('focus', () => {
			console.log('focus listener : getAllFriends');
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
			.catch((e) => console.log(e));

		let tmpOptions = [];
		if (this.props.referralsRewardsSetting.show_referral_module == true) {
			tmpOptions.push(translate('Invite'))
		}
		if (this.props.referralsRewardsSetting.show_earn_invitation_module == true) {
			tmpOptions.push(translate('Invite_Earn'))
		}
		this.setState({ options: tmpOptions });

		this.props.setShowMutualFriendInviteModal(true);
	}

	componentWillUnmount() {
		if (this.removefocusListener) {
			this.removefocusListener();
		}
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
				console.log('getFriends', err);
			});
	};

	onChangeSearch = (search) => {
		this.setState({ searchTerm: search });
		this.getAllFriends(search);
	};

	getContactAccess = () => Linking.openSettings();
	navigateToMyContacts = () => this.props.navigation.navigate(RouteNames.MyContacts);
	onGoDetail = (user) => {
		this.props.navigation.navigate(RouteNames.SnapfooderScreen, { user: user });
	};

	render() {
		return (
			<View style={styles.container}>
				<View style={{ paddingHorizontal: 20 }}>
					{this.renderTitleBar()}
					{this.state.contactsAccessPermission && this.renderContactAccess()}
					{this.renderSearchBar()}
					{this.renderInviteFriends()}
				</View>
				{this.renderFriendList()}
				<InviteMutualFriendModal onGoDetail={this.onGoDetail}/>
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
				{
					this.state.options.length > 0 ?
						<MoreBtn
							options={this.state.options}
							onSelect={(option, index) => {
								if (option == translate('Invite')) {
									this.props.navigation.navigate(RouteNames.InviteScreen, { fromPush: false });
								}
								else if (option == translate('Invite_Earn')) {
									this.props.navigation.navigate(RouteNames.EarnScreen, { fromPush: false });
								}
							}}
						/>
						:
						<View style={{ width: 30 }} />
				}

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

	renderInviteFriends() {
		return (
			<TouchableOpacity
				onPress={() => this.navigateToMyContacts()}
				style={{ ...styles.contactsWrapper, flexDirection: 'row', alignItems: 'center' }}
			>
				<Svg_contact_user width={15} height={15} style={{ marginRight: 6 }} />
				<Text style={styles.inviteFriends}>{translate('social.inviteFriends')}</Text>
			</TouchableOpacity>
		);
	}

	renderContactAccess() {
		return (
			<View style={styles.contactsWrapper}>
				<View style={styles.contactsRow}>
					<Svg_contact_info width={15} height={15} style={{ marginRight: 4, marginTop: 1 }} />
					<Text style={styles.contactTitle}>{translate('social.enable_contacts')}</Text>
				</View>
				<Text style={styles.contactsRow}>{translate('social.enable_contacts_desc')}</Text>
				<View>
					<TouchableOpacity onPress={() => this.getContactAccess()}>
						<Text style={styles.allowInSettings}>{translate('social.AllowInSettings')}</Text>
					</TouchableOpacity>
				</View>
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
		marginRight: 10,
		backgroundColor: '#FAFAFC'
	},
	name: {
		fontSize: 17,
		color: Theme.colors.text,
		marginRight: 4,
		fontFamily: Theme.fonts.semiBold,
	},
	contactsWrapper: {
		display: 'flex',
		marginTop: 16,
	},
	contactTitle: {
		fontFamily: Theme.fonts.semiBold,
		fontSize: 18,
	},
	contactsRow: {
		marginVertical: 4,
		flexDirection: 'row',
		fontFamily: Theme.fonts.light,
		fontSize: 15,
	},
	allowInSettings: {
		marginTop: 8,
		flexDirection: 'row',
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.primary,
		fontSize: 17,
	},
	inviteFriends: {
		flexDirection: 'row',
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.primary,
		fontSize: 17,
	},
});

const mapStateToProps = ({ app, chat }) => ({
	isLoggedIn: app.isLoggedIn,
	user: app.user,
	messages: chat.messages,
	safeAreaDims: app.safeAreaDims,
	referralsRewardsSetting: app.referralsRewardsSetting || {},
});

export default connect(mapStateToProps, { getFriends, setShowMutualFriendInviteModal })(withNavigation(MyFriendsScreen));
