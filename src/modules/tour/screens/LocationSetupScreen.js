import React from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { height, width } from 'react-native-dimension';
import { getAddressByCoordinates } from '../../../common/services/location';
import { setAddress, addDefaultAddress, getAddresses } from '../../../store/actions/app';
import { updateProfileDetails } from '../../../store/actions/auth';
import AppText from '../../../common/components/AppText';
import Theme from '../../../theme';
import { translate } from '../../../common/services/translate';
import MainRNGHButton from '../../../common/components/buttons/mainRNGHbtn';
import AutoLocInput from '../../../common/components/AutoLocInput';
import { SocialMapScreenStyles } from '../../../config/constants';
// svgs
import Svg_pin from '../../../common/assets/svgs/ic_locpin1.svg';
import { getDefaultCity } from '../../../common/services/user';

class LocationSetupScreen extends React.Component {

	constructor(props) {
		super(props);

		const coords = props.route.params.coords;
		if (coords.latitude) {
			coords.latitude = parseFloat(coords.latitude);
		}
		if (coords.longitude) {
			coords.longitude = parseFloat(coords.longitude);
		}
		this.state = {
			loading: false,
			coords,
			address: {},
			fromHomeScreen: props.route.params.from_home,
		};

		this._isLocationUpdated = false;
	}

	async componentDidMount() {
		const { coords } = this.state;
		await this.setAddressByCoordinates(coords);
	}

	setAddressByCoordinates = async (locationObj) => {
		try {
			const address = await getAddressByCoordinates(locationObj);
			await this.setState({ coords: locationObj, address });
		} catch (error) {
			
		}
	};

	onSetupLocation = async () => {
		try {
			this.setState({ loading: true });
			if (this.props.isLoggedIn && this.state.coords) {
				await this.props.updateProfileDetails({
					latitude: this.state.coords.latitude,
					longitude: this.state.coords.longitude,
				});

				if (this.state.address != null) {
					const DEFAULT_CITY = getDefaultCity();
					let address_data = {
						lat: this.state.coords.latitude,
						lng: this.state.coords.longitude,
						country: this.state.address.country || DEFAULT_CITY.country,
						city: this.state.address.city || DEFAULT_CITY.city,
						street: this.state.address.street || DEFAULT_CITY.street,
					};
					await this.props.addDefaultAddress(address_data);
					await this.props.getAddresses();
				}
			}

			this.setState({ loading: false });
			await this.props.setAddress({
				coordinates: this.state.coords,
				address: this.state.address,
			});

			if (this.state.fromHomeScreen == true) {
				this.props.navigation.goBack();
			}
		} catch (error) {
			this.setState({ loading: false });
			console.warn('on setup location', error);
			if (this.state.fromHomeScreen == true) {
				this.props.navigation.goBack();
			} else {
				this.setDefaultAddress();
			}
		}
	};

	setDefaultAddress = async () => {
		try {
			const DEFAULT_CITY = getDefaultCity();
			if (this.props.isLoggedIn) {
				await this.props.updateProfileDetails({
					latitude: DEFAULT_CITY.latitude,
					longitude: DEFAULT_CITY.longitude,
				});

				let address_data = {
					lat: DEFAULT_CITY.latitude,
					lng: DEFAULT_CITY.longitude,
					country: DEFAULT_CITY.country,
					city: DEFAULT_CITY.city,
					street: DEFAULT_CITY.street,
				};
				await this.props.addDefaultAddress(address_data);
				await this.props.getAddresses();
			}

			await this.props.setAddress({
				coordinates: {
					latitude: DEFAULT_CITY.latitude,
					longitude: DEFAULT_CITY.longitude,
				},
				address: {
					country: DEFAULT_CITY.country,
					city: DEFAULT_CITY.city,
					street: DEFAULT_CITY.street,
				},
			});
		} catch (error) {
			console.warn('setDefaultAddress', error);
		}
	};

	onMarkerDragEnd = async (evt) => {
		this._isLocationUpdated = true;
		this.setAddressByCoordinates({
			latitude: evt.nativeEvent.coordinate.latitude,
			longitude: evt.nativeEvent.coordinate.longitude,
		});
	};

	getCurLocation = () => {
		const { street, city, country } = this.state.address;
		let str = '';
		if (street) {
			str = street + ', ';
		}
		if (city) {
			str = str + city + ', ';
		}
		if (country) {
			str = str + country;
		}
		return str;
	};
	renderAddressInput = () => {
		return (
			<View style={[Theme.styles.col_center, styles.bottomView]}>
				<View style={[Theme.styles.col_center, styles.locationSearchView]}>
					<TouchableOpacity activeOpacity={1}>
						<AutoLocInput
							address_text={this._isLocationUpdated ? this.getCurLocation() : ''}
							onChange={(location, address) => {
								this._isLocationUpdated = true;
								this.setState({
									coords: {
										latitude: location.latitude,
										longitude: location.longitude,
									},
									address: address,
								});
							}}
						/>
					</TouchableOpacity>
					<View style={{ flex: 1, justifyContent: 'flex-end', marginTop: 4 }}>
						<AppText style={styles.locationDescTxt}>
							{translate('search_location.selected_location')}
						</AppText>
						<AppText style={styles.locationTxt}>{this.getCurLocation()}</AppText>
					</View>
				</View>
				<MainRNGHButton
					disabled={this.state.loading}
					loading={this.state.loading}
					title={translate('search_location.save_location')}
					style={styles.mainBtn}
					onPress={() => {
						this.onSetupLocation();
					}}
				/>
			</View>
		);
	};

	renderMap = () => {
		const { latitude, longitude } = this.state.coords;
		if (latitude == null || longitude == null) {
			return null;
		}

		let marker = <Svg_pin />;
		return (
			<MapView
				customMapStyle={SocialMapScreenStyles}
				provider={PROVIDER_GOOGLE}
				style={{ height: height(100), width: width(100) }}
				region={{
					latitude: latitude,
					longitude: longitude,
					latitudeDelta: 0.012,
					longitudeDelta: 0.019,
				}}
				onPress={() => Keyboard.dismiss()}
			>
				<MapView.Marker
					draggable
					coordinate={{
						latitude: latitude,
						longitude: longitude,
					}}
					onDragEnd={(e) => this.onMarkerDragEnd(e)}
				>
					{!!marker && marker}
				</MapView.Marker>
			</MapView>
		);
	};

	render() {
		return (
			<KeyboardAwareScrollView
				style={[{ flex: 1 }, { backgroundColor: '#ffffff' }]}
				extraScrollHeight={65}
				enableOnAndroid={true}
				keyboardShouldPersistTaps='handled'
			>
				<View style={{ flex: 1, height: height(100), width: width(100) }}>
					{this.renderMap()}
					{this.renderAddressInput()}
					{
						this.state.fromHomeScreen == true &&

							<View
								style={styles.skipBtn}>
								<TouchableOpacity
									onPress={() => {
										this.props.navigation.goBack();
									}}
								>
								<Text style={styles.skipBtnTxt}>{translate('skip')}</Text>

								</TouchableOpacity>
							</View>

					}
				</View>
			</KeyboardAwareScrollView>
		);
	}
}

const styles = StyleSheet.create({
	textInput: {
		height: 40,
		paddingHorizontal: Theme.sizes.tiny,
		borderBottomWidth: 1,
		borderBottomColor: Theme.colors.darkerBackground,
	},
	bottomView: {
		width: width(100),
		paddingHorizontal: 20,
		position: 'absolute',
		bottom: 40,
	},
	locationSearchView: {
		// height: 132,
		width: '100%',
		borderRadius: 15,
		backgroundColor: Theme.colors.white,
		padding: 16,
		alignItems: 'stretch',
	},
	locationSearch: {
		alignItems: 'flex-start',
		borderWidth: 1,
		borderColor: Theme.colors.gray5,
		borderRadius: 12,
		// height: 48,
		width: '100%',
		paddingLeft: 7,
		marginBottom: 14,
	},
	locationDescTxt: { fontSize: 12, color: Theme.colors.gray5, marginBottom: 6, fontFamily: Theme.fonts.semiBold },
	locationTxt: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold },
	mainBtn: { width: width(100) - 40, marginTop: 16 },
	skipBtn: { position: 'absolute', top: 65, right: 25 },
	skipBtnTxt: { fontSize: 18, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold },
});

function mapStateToProps({ app }) {
	return {
		hasLocation: app.hasLocation,
		coordinates: app.coordinates,
		isLoggedIn: app.isLoggedIn,
	};
}

export default connect(mapStateToProps, {
	setAddress,
	addDefaultAddress,
	getAddresses,
	updateProfileDetails,
})(LocationSetupScreen);
