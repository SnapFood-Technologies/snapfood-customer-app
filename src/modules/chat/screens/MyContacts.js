import React from 'react';
import {
	StyleSheet,
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

import RNContacts from 'react-native-contacts';
import { withNavigation } from 'react-navigation';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import Theme from '../../../theme';
import RouteNames from '../../../routes/names';
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';
import { getFirstChar } from '../../../common/services/utility';
import { setContacts } from '../../../store/actions/app';
import { createSingleChannel, findChannel } from '../../../common/services/chat';
import { translate } from '../../../common/services/translate';
import BackButton from '../../../common/components/buttons/back_button';
import SearchBox from '../../../common/components/social/search/SearchBox';
import UserListItem from '../components/UserListItem';
import NoFriends from '../components/NoFriends';
import { AppText } from '../../../common/components';
import CharIndexer from '../components/CharIndexer';
import ContactInfoModal from '../../../common/components/modals/ContactInfoModal';

const IS_CONTACTS_LOADING = 'IS_CONTACTS_LOADING';
const IS_CONTACTS_REFRESHING = 'IS_CONTACTS_REFRESHING';
const IS_CONTACTS_LOADING_NEXT = 'IS_CONTACTS_LOADING_NEXT';

const CONTACTS_PER_PAGE = 50;

class MyContacts extends React.Component {
	_selected_user_id = null;
	_selected_contact_user_id = null;
	_selected_contact_user_phone = null;
	_isMounted = false;
	constructor(props) {
		super(props);
		this.state = {
			searchTerms: '',
			contacts_loading: false,
			contacts_loaded: false,
			isCreatingChannel: false,
			contactsPage: 0,
			contacts: [],
			rawContacts: this.props.contacts,
			showContactInfo: false,
			contactData: null,
		};
	}

	componentDidMount = () => {
		this._isMounted = true;
		this.getContacts();

		if (this.props.contacts.length > 0) {
			this.showContacts(IS_CONTACTS_REFRESHING);
		}
	};

	componentWillUnmount = () => {
		this._isMounted = false;
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
		const lowerSearch = searchTerms.toLowerCase();

		if (lowerSearch == '') {
			await this.setState({ rawContacts: this.props.contacts });
		} else {
			let filtered = [];
			// search contacts
			for (let i = 0; i < this.props.contacts.length; i++) {
				const contact = this.props.contacts[i];
				let full_name = `${contact.signedUserName || contact.signedFullName || contact.givenName + contact.familyName
					}`.toLowerCase();
				if (full_name.includes(lowerSearch)) {
					filtered.push(contact);
				}
			}
			if (filtered.length == 0) {
				await this.setState({ rawContacts: filtered, contacts: [], contactsPage: 0 });
			} else {
				await this.setState({ rawContacts: filtered });
			}
		}

		this.showContacts('none');
	};

	onEnterChannel = async (partner) => {
		let found_channel = await findChannel(this.props.user.id, partner.id);
		if (found_channel != null) {
			this.props.navigation.navigate(RouteNames.MessagesScreen, { channelId: found_channel.id });
		} else {
			this.setState({ isCreatingChannel: true });
			let channelID = await createSingleChannel(this.props.user, partner);
			this.setState({ isCreatingChannel: false });
			if (channelID != null) {
				this.props.navigation.goBack();
				this.props.navigation.navigate(RouteNames.MessagesScreen, { channelId: channelID });
			} else {
				alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
			}
		}
	};

	getContacts = () => {
		if (Platform.OS == 'android') {
			PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).then((res) => {
				
				if (res == 'granted') {
					this.loadContacts();
				} else {
					Alert.alert(translate('attention'), translate('contactUnavailable'), [
						{
							text: translate('cancel'),
							onPress: () => this.props.navigation.goBack(),
							style: 'cancel',
						},
						{
							text: translate('settings'),
							onPress: () => {
								Linking.openSettings();
							},
						},
					]);
				}
			});
		} else {
			RNContacts.checkPermission().then((res) => {
				if (res === 'authorized' || res === 'undefined') {
					RNContacts.requestPermission();
					this.loadContacts();
				} else if (res === 'denied') {
					Alert.alert(translate('attention'), translate('contactUnavailable'), [
						{
							text: translate('cancel'),
							onPress: () => this.props.navigation.goBack(),
							style: 'cancel',
						},
						{
							text: translate('settings'),
							onPress: () => {
								Linking.openSettings();
							},
						},
					]);
				}
			});
		}
	};

	loadContacts = () => {
		this.setState({ contacts_loading: true });
		RNContacts.getAll()
			.then(async (contactsList, err) => {
				let fined_contacts = contactsList.map((c) => ({
					recordID: c.recordID,
					givenName: c.givenName,
					familyName: c.familyName,
					full_name: c.givenName + ' ' + c.familyName,
					phoneNumbers: c.phoneNumbers,
				}));
				this.props.setContacts(fined_contacts);
				if (this._isMounted) {
					await this.setState({
						contacts_loading: false,
						rawContacts: fined_contacts,
					});
					this.showContacts('none');
				}
			})
			.catch((err) => {
				this.setState({ contacts_loaded: true, contacts_loading: false });
				
			});
	};

	showContacts = async (propToLoad = IS_CONTACTS_LOADING) => {
		let existing_contacts = this.state.contacts;
		let page_num = this.state.contactsPage;
		if (propToLoad == IS_CONTACTS_REFRESHING || propToLoad == 'none') {
			page_num = 0;
			existing_contacts = [];
		}
		const contact_list = this.state.rawContacts.slice(
			page_num * CONTACTS_PER_PAGE,
			(page_num + 1) * CONTACTS_PER_PAGE
		);
		if (contact_list.length == 0) {
			return;
		}
		await this.setState({ [propToLoad]: true });

		apiFactory
			.post(`users/check-contacts-new`, {
				contacts: existing_contacts,
				contact_list: contact_list,
			})
			.then(
				({ data }) => {
					if (this._isMounted) {
						if (this.state.rawContacts.length > 0) {
							this.setState({
								contacts: data.data,
								contactsPage: page_num,
								[propToLoad]: false,
								contacts_loaded: true,
							});
						}
					}
				},
				(error) => {
					this.setState({
						contacts_loaded: true,
						[propToLoad]: false,
					});
					const message = error.message || translate('generic_error');
					alerts.error(translate('alerts.error'), message);
				}
			);
	};

	loadContactsNextPage = async () => {
		const { contactsPage } = this.state;
		if (!this.state[IS_CONTACTS_LOADING_NEXT] && contactsPage < this.state.rawContacts.length / CONTACTS_PER_PAGE) {
			await this.setState({
				contactsPage: contactsPage + 1,
			});
			this.showContacts(IS_CONTACTS_LOADING_NEXT);
		}
	};

	renderContactsNextLoader = () => {
		if (this.state[IS_CONTACTS_LOADING_NEXT]) {
			return (
				<View style={[Theme.styles.col_center, { height: 90 }]}>
					<ActivityIndicator size={28} color={Theme.colors.primary} />
				</View>
			);
		}
		return <View style={{ height: 90 }} />;
	};

	render() {
		return (
			<View style={styles.container}>
				<StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
				<Spinner visible={this.state.isCreatingChannel} />
				{this.renderTitleBar()}
				{this.renderSearchBar()}
				<View style={{ flex: 1 }}>
					{this.renderContacts()}
					{
						<View style={[styles.charScroller]}>
							<CharIndexer
								contacts={this.state.contacts}
								onScroll={(offset) => {
									try {
										this.contacts_scroller.scrollToOffset({ animated: true, offset: offset });
									} catch (error) {
										
									}
								}}
							/>
						</View>
					}
				</View>
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
				<Text style={styles.title}>{translate('Contacts')}</Text>
			</View>
		);
	}

	renderSearchBar() {
		return (
			<View style={styles.searchContainer}>
				<SearchBox onChangeText={this.onChangeSearch} hint={translate('social.search.contacts')} />
			</View>
		);
	}

	renderContacts() {
		const updateInviteStatus = (item, phoneData, value) => {
			let cpyContacts = this.state.contacts.slice(0);
			let tmpIndex = cpyContacts.findIndex((c) => c.recordID == item.recordID);
			if (tmpIndex != -1) {
				if (item.phoneNumbers) {
					let numbers = [];
					if (item.phoneNumbers.length == 1) {
						numbers = [
							{
								...phoneData,
								invite_status: value,
							},
						];
					} else {
						numbers = item.phoneNumbers.slice(0);
						const foundIndex = numbers.findIndex((i) => i.number == phoneData.number);
						if (foundIndex != -1) {
							numbers[foundIndex].invite_status = value;
						}
					}

					cpyContacts[tmpIndex] = {
						...cpyContacts[tmpIndex],
						phoneNumbers: numbers,
					};
					this.setState({ contacts: cpyContacts });
				}
			}
		};

		const onGoDetails = (phoneData) => {
			if (this.state.showContactInfo) {
				this.setState({ showContactInfo: false });
			}

			if (phoneData.isSigned == 1) {
				this._selected_contact_user_id = phoneData.signed_id;
				this._selected_contact_user_phone = phoneData.phone;
				this.props.navigation.navigate(RouteNames.SnapfooderScreen, {
					user: {
						id: phoneData.signed_id,
						username: phoneData.username,
						full_name: phoneData.full_name,
						photo: phoneData.photo,
						phone: phoneData.phone,
						email: phoneData.email,
					},
				});
			}
		};

		const onRightBtnPress = (contact, phoneData) => {
			if (phoneData.isFriend == 1) {
				this.onEnterChannel({
					id: phoneData.signed_id,
					username: phoneData.username,
					full_name: phoneData.full_name,
					photo: phoneData.photo,
					phone: phoneData.phone,
					email: phoneData.email,
				});
			} else if (phoneData.isSigned != 1) {
				let bodyTxt = `Akoma nuk je bërë pjesë e komunitetit? Mua më gjen në Snapfood së bashku me shumë të tjerë. Për të shkarkuar aplikacionin, kliko: https://snapfood.al/download-app`;
				if (this.props.language == 'en') {
					bodyTxt = `You’re not part of the community yet? You can find me and so many others on Snapfood. Click to download the app: https://snapfood.al/download-app`;
				}
				const url = `sms:${phoneData.number}${Platform.OS === 'ios' ? '&' : '?'}body=${bodyTxt}`;
				Linking.openURL(url);
			} else if (phoneData.isSigned == 1 && phoneData.isFriend != 1 && phoneData.invite_status == 'invited') {
				this.onCancelInvitation({ id: phoneData.signed_id }, () => {
					updateInviteStatus(contact, phoneData, null);
				});
			} else if (phoneData.isSigned == 1 && phoneData.isFriend != 1 && phoneData.invite_status != 'invited') {
				this.onSendInvitation({ id: phoneData.signed_id }, () => {
					updateInviteStatus(contact, phoneData, 'invited');
				});
			}
		};

		return (
			<>
				<FlatList
					ref={(ref) => (this.contacts_scroller = ref)}
					style={[styles.listContainer, { paddingRight: 30 }]}
					data={this.state.contacts}
					numColumns={1}
					keyExtractor={(item) => item.recordID.toString()}
					renderItem={(item) => (
						<>
							{(item.index == 0 ||
								getFirstChar(item.item.username || item.item.full_name) !=
								getFirstChar(
									this.state.contacts[item.index - 1].username ||
									this.state.contacts[item.index - 1].full_name
								)) && (
									<AppText style={styles.charGroup}>
										{getFirstChar(item.item.username || item.item.full_name)}
									</AppText>
								)}
							<UserListItem
								full_name={item.item.username || item.item.full_name}
								photo={item.item.photo}
								phoneNumber={null}
								invite_status={
									item.item.phoneNumbers.length == 1 ? item.item.phoneNumbers[0].invite_status : null
								}
								isSigned={
									item.item.phoneNumbers.length == 1 ? item.item.phoneNumbers[0].isSigned == 1 : null
								}
								isFriend={
									item.item.phoneNumbers.length == 1 ? item.item.phoneNumbers[0].isFriend == 1 : null
								}
								type={item.item.phoneNumbers.length == 1 ? 'contacts' : 'contacts-multi'}
								style={{ height: 56 }}
								onPress={() => {
									if (item.item.phoneNumbers.length == 1) {
										onGoDetails(item.item.phoneNumbers[0]);
									} else {
										this.setState({ showContactInfo: true, contactData: item.item });
									}
								}}
								contact_phone={item.item.phoneNumbers.length == 1 ? item.item.phoneNumbers[0].number : null}
								onRightBtnPress={() => {
									if (item.item.phoneNumbers.length == 1) {
										onRightBtnPress(item.item, item.item.phoneNumbers[0]);
									}
								}}
							/>
						</>
					)}
					ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
					ListEmptyComponent={() =>
						this.state.contacts_loaded == true && (
							<NoFriends title={translate('social.no_contacts_from_new_chat')} />
						)
					}
					refreshControl={
						<RefreshControl
							refreshing={this.state[IS_CONTACTS_REFRESHING]}
							onRefresh={() => this.showContacts(IS_CONTACTS_REFRESHING)}
						/>
					}
					ListFooterComponent={this.renderContactsNextLoader()}
					onEndReachedThreshold={0.3}
					onEndReached={this.loadContactsNextPage}
				/>
				<ContactInfoModal
					showModal={this.state.showContactInfo}
					data={this.state.contactData}
					onClose={() => {
						this.setState({ showContactInfo: false });
					}}
					onGoDetails={onGoDetails}
					onRightBtnPress={onRightBtnPress}
				/>
			</>
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
		paddingTop: 20,
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
	charScroller: { position: 'absolute', top: 12, right: 8 },
});

const mapStateToProps = ({ app, chat }) => ({
	isLoggedIn: app.isLoggedIn,
	user: app.user,
	language: app.language,
	contacts: app.contacts || [],
	messages: chat.messages,
	channelId: chat.channelId,
	chat_channels: chat.chat_channels || [],
});

export default connect(mapStateToProps, { setContacts })(withNavigation(MyContacts));
