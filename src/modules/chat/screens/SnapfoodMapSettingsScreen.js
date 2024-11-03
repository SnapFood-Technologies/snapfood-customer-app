import React from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import Theme from '../../../theme';
import MaleOnMap from '../../../common/assets/svgs/male_on_map.svg';
import RadioBtn from '../../../common/components/buttons/radiobtn';
import Header1 from '../../../common/components/Header1';
import { translate } from "../../../common/services/translate";
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';
import RouteNames from '../../../routes/names';

class SnapfoodMapSettingsScreen extends React.Component {
	_isMounted = true;
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			offlineMode: false,
			hideSnapfooder: false,
			whoCanSeeMyLocation: null,
			selectedFriends: []
		};
	}

	componentDidMount() {
		this.getMapSetting();

		this.removefocusListener = this.props.navigation.addListener('focus', () => {
			this.getMapSetting();
		});
	}

	componentWillUnmount() {
		this._isMounted = false;
		if (this.removefocusListener) {
			this.removefocusListener();
		}
	}

	getMapSetting = () => {
		apiFactory
			.get(`users/map-setting`)
			.then(
				({ data }) => {
					if (this._isMounted == true) {
						
						this.setState({
							offlineMode: data.map_visible == 0,
							hideSnapfooder: data.hide_as_snapfooder == 1,
							whoCanSeeMyLocation: data.map_visible_type,
							selectedFriends: data.map_visible_details || []
						})
					}
				},
				(error) => {
					const message = error.message || translate('generic_error');
					if (this._isMounted == true) {
						this.setState({
							loading: false
						});
					}
					alerts.error(translate('alerts.error'), message);
				}
			);
	}

	updateMapSetting = (visible, hide, type) => {
		this.setState({
			loading: true
		});
		apiFactory
			.post(`users/update-map-setting`, {
				visible: visible,
				hide_snapfooder : hide,
				type: type
			})
			.then(
				({ data }) => {
					if (this._isMounted == true) {
						
						if (data.user) {
							this.setState({
								loading: false,
								offlineMode: data.user.map_visible == 0,
								hideSnapfooder : data.user.hide_as_snapfooder == 1,
								whoCanSeeMyLocation: data.user.map_visible_type
							})
						}
					}
				},
				(error) => {
					const message = error.message || translate('generic_error');
					if (this._isMounted == true) {
						this.setState({
							loading: false
						});
					}
					alerts.error(translate('alerts.error'), message);
				}
			);
	}

	goExcept = () => {
		let selectedFriends = [];
		if (this.state.whoCanSeeMyLocation == 'except_friend') {
			selectedFriends = this.state.selectedFriends;
		}
		this.props.navigation.navigate(
			RouteNames.ChooseFriendsScreen,
			{ type: 'except_friend', selectedFriends }
		);
	}

	goOnly = () => {
		let selectedFriends = [];
		if (this.state.whoCanSeeMyLocation == 'only_friend') {
			selectedFriends = this.state.selectedFriends;
		}
		this.props.navigation.navigate(
			RouteNames.ChooseFriendsScreen,
			{ type: 'only_friend', selectedFriends }
		);
	}

	render() {
		return (
			<View style={styles.container}>
				<Spinner visible={this.state.loading} />
				<Header1
					style={{ marginTop: 10, marginBottom: 0 }}
					onLeft={() => this.props.navigation.goBack()}
					title={translate('chat.map_settings.title')}
				/>
				{this.renderOfflineMode()}
				{this.renderHideSnapfooderMode()}
				{this.renderWhoCanSeeMyLocation()}
			</View>
		);
	}

	renderOfflineMode() {
		return (
			<View style={styles.section}>
				<View style={styles.header}>
					<Text style={styles.headerTitle}>{translate('chat.map_settings.my_location')}</Text>
					<Text style={styles.headerSubTitle}>{translate('chat.map_settings.my_location_subtitle')}</Text>
				</View>
				<View style={styles.sectionContent}>
					<View style={{ paddingRight: 14 }}>
						<MaleOnMap />
					</View>
					<View style={styles.sectionCol}>
						<Text style={styles.sectionTitle}>{translate('chat.map_settings.offline_mode')}</Text>
						<Text style={styles.sectionSubTitle}>
							{this.state.offlineMode ? translate('chat.map_settings.offline_mode_subtitle_enabled') :
								translate('chat.map_settings.offline_mode_subtitle')}
						</Text>
					</View>
					<View style={{ right: -8 }}>
						<Switch
							style={Platform.OS == 'ios' && { transform: [{ scaleX: 0.7 }, { scaleY: 0.65 }] }}
							trackColor={{ false: Theme.colors.gray5, true: '#C0EBEC' }}
							thumbColor={this.state.offlineMode ? Theme.colors.cyan2 : Theme.colors.gray7}
							ios_backgroundColor='#C0EBEC'
							onValueChange={() => {
								this.updateMapSetting(this.state.offlineMode ? 1 : 0);
							}}
							value={this.state.offlineMode == true}
						/>
					</View>
				</View>
			</View>
		);
	}

	renderHideSnapfooderMode() {
		return (
			<View style={[styles.section, {marginTop: 0}]}>
				<View style={styles.sectionContent}>
					<View style={styles.sectionCol}>
						<Text style={styles.sectionTitle}>{translate('chat.map_settings.hide_snapfooder')}</Text>
						<Text style={styles.sectionSubTitle}>
							{this.state.hideSnapfooder ? translate('chat.map_settings.offline_mode_subtitle_enabled') :
								translate('chat.map_settings.hide_snapfooder_subtitle')}
						</Text>
					</View>
					<View style={{ right: -8 }}>
						<Switch
							style={Platform.OS == 'ios' && { transform: [{ scaleX: 0.7 }, { scaleY: 0.65 }] }}
							trackColor={{ false: Theme.colors.gray5, true: '#C0EBEC' }}
							thumbColor={this.state.hideSnapfooder ? Theme.colors.cyan2 : Theme.colors.gray7}
							ios_backgroundColor='#C0EBEC'
							onValueChange={() => {
								this.updateMapSetting(this.state.offlineMode ? 0 : 1, this.state.hideSnapfooder ? 0 : 1);
							}}
							value={this.state.hideSnapfooder == true}
						/>
					</View>
				</View>
			</View>
		);
	}

	renderWhoCanSeeMyLocation() {
		const getSelectedDesc = () => {
			if (!this.state.offlineMode) {
				if (this.state.selectedFriends.length > 2) {
					return (this.state.selectedFriends[0].username || this.state.selectedFriends[0].full_name) + ` +${this.state.selectedFriends.length - 1}`
				}
				else if (this.state.selectedFriends.length == 2) {
					return (this.state.selectedFriends[0].username || this.state.selectedFriends[0].full_name) + ', ' +
						(this.state.selectedFriends[1].username || this.state.selectedFriends[1].full_name);
				}
				else if (this.state.selectedFriends.length == 1) {
					return (this.state.selectedFriends[0].username || this.state.selectedFriends[0].full_name);
				}
			}
			return '';
		}

		return (
			<View style={styles.section}>
				<View style={styles.header}>
					<Text style={styles.headerTitle}>{translate('chat.map_settings.see_my_location')}</Text>
				</View>
				{/* <TouchableOpacity
					disabled={this.state.offlineMode}
					onPress={() => {
						if (this.state.whoCanSeeMyLocation != null) {
							this.updateMapSetting(1, null);
						}
					}}
					style={styles.sectionContent}
				>
					<View style={styles.sectionCol}>
						<Text style={styles.sectionRadioTitle}>{translate('chat.map_settings.everyone')}</Text>
					</View>
					<RadioBtn
						disabled={this.state.offlineMode}
						onPress={() => {
							if (this.state.whoCanSeeMyLocation != null) {
								this.updateMapSetting(1, null);
							}
						}}
						checked={!this.state.offlineMode && this.state.whoCanSeeMyLocation == null}
					/>
				</TouchableOpacity> */}
				<TouchableOpacity
					disabled={this.state.offlineMode}
					onPress={() => {
						if (this.state.whoCanSeeMyLocation != 'all_friend') {
							this.updateMapSetting(1, null, 'all_friend');
						}
					}}
					style={styles.sectionContent}
				>
					<View style={styles.sectionCol}>
						<Text style={styles.sectionRadioTitle}>{translate('chat.map_settings.see_my_location_friends')}</Text>
					</View>
					<RadioBtn
						disabled={this.state.offlineMode}
						onPress={() => {
							if (this.state.whoCanSeeMyLocation != 'all_friend') {
								this.updateMapSetting(1, null, 'all_friend');
							}
						}}
						checked={!this.state.offlineMode && this.state.whoCanSeeMyLocation === 'all_friend'}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					disabled={this.state.offlineMode}
					onPress={this.goExcept}
					style={styles.sectionContent}
				>
					<View style={styles.sectionCol}>
						<Text style={styles.sectionRadioTitle}>{translate('chat.map_settings.see_my_location_friends_except')}</Text>
						{
							!this.state.offlineMode && this.state.whoCanSeeMyLocation === 'except_friend' &&
							<Text style={styles.selectedFriends}>{getSelectedDesc()}</Text>
						}
					</View>
					<RadioBtn
						disabled={this.state.offlineMode}
						onPress={this.goExcept}
						checked={!this.state.offlineMode && this.state.whoCanSeeMyLocation === 'except_friend'}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					disabled={this.state.offlineMode}
					onPress={this.goOnly}
					style={styles.sectionContent}
				>
					<View style={styles.sectionCol}>
						<Text style={styles.sectionRadioTitle}>{translate('chat.map_settings.see_my_location_friends_only')}</Text>
						{
							!this.state.offlineMode && this.state.whoCanSeeMyLocation === 'only_friend' &&
							<Text style={styles.selectedFriends}>{getSelectedDesc()}</Text>
						}
					</View>

					<RadioBtn
						disabled={this.state.offlineMode}
						onPress={this.goOnly}
						checked={!this.state.offlineMode && this.state.whoCanSeeMyLocation === 'only_friend'}
					/>
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Theme.colors.white,
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		paddingHorizontal: 12,
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	titleTextContainer: {
		flex: 1,
		alignItems: 'center',
	},
	title: {
		color: Theme.colors.text,
		fontFamily: Theme.fonts.bold,
		fontSize: Theme.sizes.small,
	},
	section: {
		marginTop: 20,
		display: 'flex',
		flexDirection: 'column',
		paddingHorizontal: 8,
	},
	header: { marginBottom: 16 },
	headerTitle: {
		color: Theme.colors.text,
		fontFamily: Theme.fonts.bold,
		fontSize: Theme.sizes.normalM,
	},
	headerSubTitle: {
		color: Theme.colors.subText,
		fontFamily: Theme.fonts.semiBold,
		fontSize: Theme.sizes.small,
	},
	sectionContent: {
		backgroundColor: Theme.colors.gray8,
		borderRadius: 12,
		display: 'flex',
		flexDirection: 'row',
		marginVertical: 6,
		padding: 8,
		alignItems: 'center',
		minHeight: 56,
		paddingHorizontal: 20,
	},
	sectionCol: {
		display: 'flex',
		flexDirection: 'column',
		flex: 1,
	},
	sectionTitle: {
		color: Theme.colors.text,
		fontFamily: Theme.fonts.bold,
		fontSize: Theme.sizes.small,
	},
	sectionSubTitle: {
		color: Theme.colors.text,
		fontFamily: Theme.fonts.regular,
		fontSize: Theme.sizes.smallTiny,
	},
	sectionRadioTitle: {
		color: Theme.colors.text,
		fontFamily: Theme.fonts.semiBold,
		fontSize: Theme.sizes.small,
	},
	selectedFriends: {
		color: Theme.colors.text,
		fontFamily: Theme.fonts.medium,
		fontSize: 13,
	}
});

export default SnapfoodMapSettingsScreen;
