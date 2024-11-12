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

import RNContacts from 'react-native-contacts';
import { withNavigation } from 'react-navigation';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import Theme from '../../../theme';
import RouteNames from '../../../routes/names';
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';
import { getFirstChar } from '../../../common/services/utility';
import { getFriends, setContacts, setAskedContactsPerm } from '../../../store/actions/app';
import { createSingleChannel, findChannel } from '../../../common/services/chat';
import { translate } from '../../../common/services/translate';
import BackButton from '../../../common/components/buttons/back_button';
import { MainBtn } from '../../../common/components';
import SearchBox from '../../../common/components/social/search/SearchBox';
import UserListItem from '../../chat/components/UserListItem';
import NoFriends from '../../chat/components/NoFriends';
import BlockSpinner from '../../../common/components/BlockSpinner';
import { AppText } from '../../../common/components';
import CharIndexer from '../../chat/components/CharIndexer';
import ContactInfoModal from '../../../common/components/modals/ContactInfoModal';
import { KEYS, setStorageKey } from '../../../common/services/storage';

const IS_CONTACTS_LOADING = 'IS_CONTACTS_LOADING';
const IS_CONTACTS_REFRESHING = 'IS_CONTACTS_REFRESHING';
const IS_CONTACTS_LOADING_NEXT = 'IS_CONTACTS_LOADING_NEXT';

const CONTACTS_PER_PAGE = 50;

class ContactsScreen extends React.Component {
	_isMounted = false;
	constructor(props) {
		super(props);
		this.state = {
			contactsPage: 0,
			contacts: [],
			rawContacts: this.props.contacts,
			searchTerms: '',
			contacts_loading: false,
			contacts_loaded: false,

			showContactInfo: false,
			contactData: null
		};
	}

	componentDidMount = () => {
		this._isMounted = true;
		this.loadContacts();
	};

	componentWillUnmount = () => {
		this._isMounted = false;
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
			await this.setState({ rawContacts: filtered });
		}

		this.showContacts('none');
	};

	loadContacts = () => {
		this.setState({ contacts_loading: true });
		RNContacts.getAll()
			.then(async (contactsList, err) => {
				let fined_contacts = contactsList.map(c => ({
					recordID: c.recordID,
					givenName: c.givenName,
					familyName: c.familyName,
					full_name: c.givenName + ' ' + c.familyName,
					phoneNumbers: c.phoneNumbers
				}))

				this.props.setContacts(fined_contacts);
				if (this._isMounted) {
					await this.setState({
						contacts_loading: false,
						rawContacts: fined_contacts
					});
					this.showContacts('none')
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
		const contact_list = this.state.rawContacts.slice(page_num * CONTACTS_PER_PAGE, (page_num + 1) * CONTACTS_PER_PAGE);
		if (contact_list.length == 0) { return; }
		await this.setState({ [propToLoad]: true });

		apiFactory
			.post(`users/check-contacts-issign`, {
				contacts: existing_contacts,
				contact_list: contact_list,
			})
			.then(
				({ data }) => {
					if (this._isMounted) {
						this.setState({
							contacts: data.data,
							contactsPage: page_num,
							[propToLoad]: false,
							contacts_loaded: true,
						});
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
	}


	loadContactsNextPage = async () => {
		const { contactsPage } = this.state;
		if (!this.state[IS_CONTACTS_LOADING_NEXT] && contactsPage < (this.state.rawContacts.length / CONTACTS_PER_PAGE)) {
			await this.setState({
				contactsPage: contactsPage + 1,
			});
			this.showContacts(IS_CONTACTS_LOADING_NEXT);
		}
	};

	renderContactsNextLoader = () => {
		if (this.state[IS_CONTACTS_LOADING_NEXT]) {
			return (
				<View style={[Theme.styles.col_center, { height: 90 }]} >
					<ActivityIndicator size={28} color={Theme.colors.primary} />
				</View >
			)
		}
		return <View style={{ height: 90 }} />;
	};

	onNext = async () => {
		try {
			await setStorageKey(KEYS.ASKED_CONTACTS_PERMISSION, true);
		} catch (e) {
			
		}
		this.props.setAskedContactsPerm(true);
	}

	render() {
		return (
			<View style={styles.container}>
				<StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
				<Spinner visible={this.state.isCreatingChannel} />
				{this.renderTitleBar()}
				{this.renderSearchBar()}
				<View style={{ flex: 1, marginTop: 8 }}>
					{this.renderContacts()}
					<View style={[styles.charScroller]}>
						<CharIndexer contacts={this.state.contacts}
							onScroll={(offset) => {
								try {
									this.contacts_scroller.scrollToOffset({ animated: true, offset: offset });
								} catch (error) {
									
								}
							}}
						/>
					</View>
				</View>
				<View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 30 }}>
					<MainBtn
						title={translate('ask_contacts.next')}
						onPress={() => this.onNext()}
						style={{ width: '100%' }}
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
				<SearchBox onChangeText={this.onChangeSearch} hint={translate('social.search.friends')} />
			</View>
		);
	}

	renderContacts() {
		const onRightBtnPress = (contact, phoneData) => {
			let bodyTxt = `Akoma nuk je bërë pjesë e komunitetit? Mua më gjen në Snapfood së bashku me shumë të tjerë. Për të shkarkuar aplikacionin, kliko: https://snapfood.al/download-app`;
			if (this.props.language == 'en') {
				bodyTxt = `You’re not part of the community yet? You can find me and so many others on Snapfood. Click to download the app: https://snapfood.al/download-app`;
			}
			const url = `sms:${phoneData.number}${Platform.OS === 'ios' ? '&' : '?'
				}body=${bodyTxt}`;
			Linking.openURL(url);
		}

		return (
			<>
				<FlatList
					ref={ref => this.contacts_scroller = ref}
					style={[styles.listContainer, { paddingRight: 30 }]}
					data={this.state.contacts}
					numColumns={1}
					keyExtractor={(item) => item.recordID.toString()}
					renderItem={item => (
						<>
							{
								(
									item.index == 0 ||
									(
										getFirstChar((item.item.username || item.item.full_name)) !=
										getFirstChar((this.state.contacts[item.index - 1].username || this.state.contacts[item.index - 1].full_name))
									)
								)
								&&
								<AppText style={styles.charGroup}>{getFirstChar((item.item.username || item.item.full_name))}</AppText>
							}
							<UserListItem
								full_name={item.item.full_name}
								photo={null}
								phoneNumber={null}
								invite_status={null}
								isSigned={null}
								isFriend={null}
								type={(item.item.phoneNumbers.length == 1) ? 'contacts' : 'contacts-multi'}
								style={{ height: 56 }}
								onPress={() => {
									if (item.item.phoneNumbers.length > 1) {
										this.setState({ showContactInfo: true, contactData: item.item })
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
						this.setState({ showContactInfo: false })
					}}
					onGoDetails={() => { }}
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
	charScroller: { position: 'absolute', top: 12, right: 8 }
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

export default connect(mapStateToProps, { getFriends, setContacts, setAskedContactsPerm })(withNavigation(ContactsScreen));
