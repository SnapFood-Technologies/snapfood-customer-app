import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, Platform, View, Text, Switch, Image, FlatList, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { width } from 'react-native-dimension';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import Spinner from 'react-native-loading-spinner-overlay';
import Slider from 'react-native-sliders';
import BackButton from '../../../common/components/buttons/back_button';
import RouteNames from '../../../routes/names';
import MapView, { Callout, PROVIDER_GOOGLE, Point } from 'react-native-maps';
import GetLocation from 'react-native-get-location';
import { SocialMapScreenStyles } from '../../../config/constants';
import FastImage from 'react-native-fast-image';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import { checkLocationPermission, getLatDelta } from '../../../common/services/location';
import apiFactory from '../../../common/services/apiFactory';
import { createSingleChannel, findChannel } from '../../../common/services/chat';
import Theme from '../../../theme';
import Config from '../../../config';
import AppText from '../../../common/components/AppText';
import { setVendorCart } from '../../../store/actions/shop';
import UserMarker from '../components/UserMarkers';
import VendorMarker from '../components/VendorMarker';
import SnapfooderMarker from '../components/SnapfooderMarker';
import RBSheet from 'react-native-raw-bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import FoodItem from '../../search/components/StartItem';
import SnapfooderGroupMarker from '../components/SnapfooderGroupMarker';
import SnapfooderMapListItem from '../components/SnapfooderMapListItem';
const windowHeight = Dimensions.get('window').height;
import { setStorageKey, getStorageKey, KEYS } from '../../../common/services/storage';
import { SwitchTab } from '../../../common/components';
import { OrderType_Delivery, OrderType_Pickup, OrderType_Reserve } from '../../../config/constants'
import MapVendorInfoModal from '../../../common/components/modals/MapVendorInfoModal';
import Svg_users from '../../../common/assets/svgs/map/snapfooders.svg'
import Svg_control from '../../../common/assets/svgs/map/control.svg'

const latDelta5000 = getLatDelta(3950); // 5000 tweak
class SnapfoodMapScreen extends React.Component {
	_isMounted = true;
	_myLatitude = null;
	_myLongitude = null;
	_Timer = null
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			my_latitude: null,
			my_longitude: null,
			snapfooders: [],
			vendors: [],
			total_vendors: [],
			selected_snapfooders: [],
			isCreatingChannel: false,
			groupSize: 3,
			region: {
				latitude: this.props.coordinates.latitude,
				longitude: this.props.coordinates.longitude,
				latitudeDelta: latDelta5000,
				longitudeDelta: latDelta5000,
			},
			distance_range: 5000,

			appBadgeCount: 0,

			vendorOpen: false,
			selectedVendor: null,
			order_type: OrderType_Delivery,

			isVisibleVendors: true,
			isVisibleSnapfooders: true
		};
		this.region = this.state.region;

		this._myLatitude = parseFloat(this.props.coordinates.latitude);
		this._myLongitude = parseFloat(this.props.coordinates.longitude);
	}

	componentDidMount() {
		this._isMounted = true;
		this.removefocusListener = this.props.navigation.addListener('focus', this.getBadgeCount);
		this.getBadgeCount();
		this.getMyLocation();
		this._Timer = setInterval(() => {
			console.log('================= refresh data by timer');
			this.getMapDataByDistance(this.region, this.state.distance_range);
		}, 50000)
	}

	componentWillUnmount() {
		this._isMounted = false;
		if (this.removefocusListener) this.removefocusListener();

		if (this._Timer) {
			clearInterval(this._Timer);
			this._Timer = null;
		}
	}

	saveDistance = async (distance) => {
		try {
			await setStorageKey(KEYS.SNAPMAP_DISTANCE, distance);
		} catch (e) {
			console.log(e);
		}
	};

	getBadgeCount = () => {
		if (Platform.OS == 'ios') {
			try {
				PushNotificationIOS.getApplicationIconBadgeNumber((badge) => {
					this.setState({ appBadgeCount: badge });
				});
			} catch (error) { }
		}
	};

	getMyLocation = async () => {
		let latitude = this.props.coordinates.latitude;
		let longitude = this.props.coordinates.longitude;
		try {
			let hasPermission = await checkLocationPermission();
			if (hasPermission) {
				const location = await GetLocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
				latitude = location.latitude;
				longitude = location.longitude;
			} else {
				console.log('checkLocationPermission : False');
			}
		} catch (error) {
			console.log('getCurrentPosition error : ', error);
		}

		let distance_range = this.state.distance_range;
		try {
			let distance = await getStorageKey(KEYS.SNAPMAP_DISTANCE);
			distance_range = distance || 5000;
		} catch (e) {
			console.log(e);
		}

		if (latitude && longitude) {
			this._myLatitude = parseFloat(latitude);
			this._myLongitude = parseFloat(longitude);

			try {
				await apiFactory.put('users/update_location', {
					map_latitude: this._myLatitude,
					map_longitude: this._myLongitude
				});
			} catch (error) {
				console.log('update location error : ', error);
			}

			const region = { latitude, longitude, latitudeDelta: latDelta5000, longitudeDelta: latDelta5000 };

			this.setState({ my_latitude: latitude, my_longitude: longitude, region });
			this.region = region;
			this.onLoadMapData(region, distance_range);
			this.setState({ distance_range });
		}
	};

	onGoVendor = async (restaurant) => {
		this.props.setVendorCart(restaurant);
		this.props.navigation.navigate(RouteNames.VendorScreen, { active_ordermethod: this.state.order_type });
	};

	onGoUserProfile = (user) => {
		this.props.navigation.navigate(RouteNames.SnapfooderScreen, { user });
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

	onPanDrag = (event) => {
		console.log('onPanDrag', event.nativeEvent.coordinate);
	};

	getZoom = (region) => Math.log2(360 * (width(100) / 256 / region.longitudeDelta)) + 1;

	getMapDataByDistance = (region, distance) => {
		this.state.loading = true
		const { latitude, longitude, latitudeDelta, longitudeDelta } = region || {};
		const zoom = this.getZoom(region);
		const params = {
			user_latitude: this._myLatitude,
			user_longitude: this._myLongitude,
			latitude,
			longitude,
			latitudeDelta,
			longitudeDelta,
			zoom,
			group_size: this.calculateGroupSize(zoom),
			distance,
		};
		apiFactory.post(`users/snapfood-map-data-with-distance-with-maplocation-with-lastactive-users`, params).then(
			({ data }) => {
				const snapfooders = data.snapfooders || [];
				const total_vendors = data.vendors || [];

				let vendors = total_vendors;
				if (this.state.isVisibleVendors == true && this.state.isVisibleSnapfooders == false && this.state.order_type != null) {
					vendors = total_vendors.filter(v => v.order_method != null && v.order_method.includes(this.state.order_type))
				}
				this._myLatitude = parseFloat(data.user_latitude);
				this._myLongitude = parseFloat(data.user_longitude);
				if (this._isMounted == true) this.setState({
					loading: false,
					my_latitude: parseFloat(data.user_latitude),
					my_longitude: parseFloat(data.user_longitude),
					snapfooders,
					total_vendors: total_vendors,
					vendors: vendors,
					region
				});
			},
			(error) => {
				const message = error.message || translate('generic_error');
				if (this._isMounted == true) this.setState({ loading: false, region });
				alerts.error(translate('alerts.error'), message);
			}
		);
	};

	onLoadMapData = (region, distance) => this.getMapDataByDistance(region, distance);

	onRegionChangeComplete2 = (region, isForce) => {
		let zoom = this.getZoom(region);
		let groupSize = this.calculateGroupSize(zoom);
		const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
		if (groupSize == 1) {
			if (
				Math.abs(latitude - this.state.region.latitude) <= latitudeDelta / 4 &&
				Math.abs(longitude - this.state.region.longitude) <= longitudeDelta / 4
			) {
				console.log('ignored');
				return;
			}
		} else {
			if (groupSize == this.state.groupSize) {
				console.log('ignored by same group');
				return;
			}
		}

		if (this.state.loading) {
			console.log('ignored by loaading');
			return;
		}
		this.state.groupSize = groupSize;
		console.log('zoom ', zoom);
		console.log('state zoom', this.state.zoom);
		console.log('group', groupSize);
		console.log('state group', this.state.groupSize);
		this.getMapDataByDistance(region, this.state.distance_range);
	};

	calculateGroupSize = (zoom) => {
		if (zoom >= 15) {
			return 1;
		}
		if (zoom >= 14 && zoom < 15) {
			return 2;
		}
		if (zoom >= 13 && zoom < 14) {
			return 3;
		}
		if (zoom < 13) {
			return 4;
		}
		return 2;
	};

	openGroup = (users = []) => {
		this.RBSheet.open();
		const user_ids = users.map((i) => i.id);
		apiFactory.post(`users/snapfoods-status`, { user_ids }).then(
			({ data }) => {
				if (this._isMounted == true) {
					this.setState({ selected_snapfooders: data.snapfooders || [], region: this.region });
				}
			},
			(error) => {
				this.setState({ selected_snapfooders: users, region: this.region });
				console.log('openGroup ', error);
			}
		);
	};

	render() {
		return (
			<View style={styles.container}>
				<Spinner visible={this.state.isCreatingChannel} />
				{this.renderMap()}
				{this.renderTitleBar()}
				{this.renderDistanceRange()}
				{this.renderBottomSheet()}
				{
					this.state.vendorOpen &&
					<MapVendorInfoModal
						showModal={this.state.vendorOpen}
						activeReserve={this.state.isVisibleVendors == true && this.state.isVisibleSnapfooders == false && this.state.order_type == OrderType_Reserve}
						data={this.state.selectedVendor}
						navigation={this.props.navigation}
						onClose={() => {
							this.setState({ selectedVendor: null, vendorOpen: false })
						}}
						onGoVendor={() => {
							this.setState({ selectedVendor: null, vendorOpen: false })
							this.onGoVendor(this.state.selectedVendor)
						}}
						onGoVendorMap={() => {
							this.setState({ selectedVendor: null, vendorOpen: false })
							this.props.navigation.navigate(RouteNames.VendorLocationScreen, {
								address: { lat: this.state.selectedVendor.latitude, lng: this.state.selectedVendor.longitude },
								info: {
									title: this.state.selectedVendor.title,
									is_open: this.state.selectedVendor.is_open,
									logo: this.state.selectedVendor.logo_thumbnail_path,
									distance: (parseFloat(this.state.selectedVendor.distance) / 1000).toFixed(1),
								},
							});
						}}
					/>
				}
			</View>
		);
	}

	onRegionChangeComplete = (region) => {
		console.log('region changed ', region.latitudeDelta, region.longitudeDelta);
		this.region = region;
		this.onRegionChangeComplete2(region, true);
	};

	renderMap() {
		const { my_latitude, my_longitude, snapfooders, vendors } = this.state;
		const { onGoUserProfile, onEnterChannel, openGroup } = this;
		if (my_latitude == null || my_longitude == null) return null;
		return (
			<MapView
				customMapStyle={SocialMapScreenStyles}
				provider={PROVIDER_GOOGLE}
				showsUserLocation={false}
				showsMyLocationButton={false}
				showsPointsOfInterest={false}
				showsBuildings={false}
				moveOnMarkerPress={false}
				style={styles.mapView}
				region={this.state.region}
				onRegionChangeComplete={this.onRegionChangeComplete}
			>
				{this.state.isVisibleSnapfooders && <Markers {...{ onGoUserProfile, onEnterChannel, openGroup, snapfooders }} />}
				{this.state.isVisibleVendors && vendors.map((value) => (
					<Vendor value={value}
						isActive={this.state.selectedVendor?.id == value.id}
						activeReserve={this.state.isVisibleVendors == true && this.state.isVisibleSnapfooders == false && this.state.order_type == OrderType_Reserve}
						onGoVendor={this.onGoVendor} onMarkerPress={() => {
							this.setState({ selectedVendor: value, vendorOpen: true })
						}} />
				))}
				<UserMarker key='me' photo={this.props.user?.photo} latitude={my_latitude} longitude={my_longitude} />
			</MapView>
		);
	}

	renderTitleBar = () => {
		const { goBack, push } = this.props.navigation || {};
		const { appBadgeCount } = this.state;
		const onChangeOrderType = (orderType) => {
			let tmp = this.state.total_vendors.filter(v => v.order_method != null && v.order_method.includes(orderType));
			this.setState({ order_type: orderType, vendors: tmp });
		}

		return <TitleBar {...{ goBack, push, appBadgeCount }}
			order_type={this.state.order_type}
			onChangeOrderType={onChangeOrderType}
			isVisibleVendors={this.state.isVisibleVendors}
			isVisibleSnapfooders={this.state.isVisibleSnapfooders}
			onChangeSnapfoodersVisible={() => {
				let vendors = this.state.total_vendors;
				if (this.state.isVisibleSnapfooders == true && this.state.isVisibleVendors == true && this.state.order_type != null) {
					vendors = this.state.total_vendors.filter(v => v.order_method != null && v.order_method.includes(this.state.order_type))
				}
				this.setState({ vendors: vendors, isVisibleSnapfooders: !this.state.isVisibleSnapfooders })
			}}
			onChangeVendorVisible={() => {
				let vendors = this.state.total_vendors;
				if (this.state.isVisibleSnapfooders == false && this.state.isVisibleVendors == false && this.state.order_type != null) {
					vendors = this.state.total_vendors.filter(v => v.order_method != null && v.order_method.includes(this.state.order_type))
				}
				this.setState({ vendors: vendors, isVisibleVendors: !this.state.isVisibleVendors })
			}}
		/>;
	};

	updateDistanceRange = (distance_range) => this.setState({ distance_range });
	updateRegion = (region) => this.setState({ region });
	updateGroupSize = (groupSize) => this.setState({ groupSize });

	renderDistanceRange = () => {
		const { my_latitude: latitude, my_longitude: longitude, distance_range } = this.state;
		const { updateDistanceRange, updateRegion, saveDistance, onLoadMapData, updateGroupSize, calculateGroupSize } = this;
		return (
			<DistanceRange
				{...{ latitude, longitude, onLoadMapData, distance_range, updateDistanceRange, updateRegion, saveDistance, updateGroupSize, calculateGroupSize }}
			/>
		);
	};

	keyExtractor = ({ id }) => id.toString();
	renderSnapFooder = ({ item }) => {
		const { id, username, full_name, photo, sex, birthdate, is_friend, invite_status } = item || {};

		const onGoProfile = () => {
			this.RBSheet.close();
			this.onGoUserProfile(item)
		};
		const onGoChat = () => {
			this.RBSheet.close();
			this.onEnterChannel(item)
		};

		return (
			<SnapfooderMapListItem
				key={id}
				full_name={username || full_name}
				photo={photo}
				sex={sex ?? 'male'}
				birthdate={birthdate}
				is_friend={is_friend == 1}
				is_invited={invite_status == 'invited'}
				onPress={onGoProfile}
				onPressRight={() => {
					if (is_friend == 1) {
						onGoChat()
					}
					else {
						onGoProfile()
					}
				}}
			/>
		);
	};

	renderItemSeparatorComponent = () => <View style={styles.spaceCol} />;
	renderListFooterComponent = () => <View style={{ height: 65 }} />;

	renderBottomSheet() {
		return (
			<RBSheet
				ref={(ref) => (this.RBSheet = ref)}
				closeOnDragDown={true}
				duration={300}
				closeOnPressBack={true}
				height={380}
				customStyles={rbSheetCustomStyles}
				onClose={() => {
					this.setState({ selected_snapfooders: [] })
				}}
			>
				<View style={styles.rbSheetView}>
					<Text style={styles.rbSheetText}>{translate('Snapfooders')}</Text>
					<FlatList
						style={styles.listContainer}
						data={this.state.selected_snapfooders}
						keyExtractor={this.keyExtractor}
						renderItem={this.renderSnapFooder}
						ItemSeparatorComponent={this.renderItemSeparatorComponent}
						ListFooterComponent={this.renderListFooterComponent}
						onEndReachedThreshold={0.3}
					/>
					<TouchableOpacity style={[Theme.styles.col_center, styles.closeBtn]}
						onPress={() => this.RBSheet.close()}
					>
						<MaterialCommunityIcons name='close-thick' color={Theme.colors.text1} size={14} />
					</TouchableOpacity>
				</View>
			</RBSheet>
		);
	}
}

const rbSheetCustomStyles = {
	container: {
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		alignItems: 'center',
	},
};

const Vendor = (props) => {
	const { value: restaurant, isActive, activeReserve } = props;
	const { id: restaurant_id, latitude, longitude, distance, zone } = restaurant || {};
	const onGoVendor = () => props.onGoVendor(restaurant)
	const onMarkerPress = () => props.onMarkerPress(restaurant)

	return (
		<VendorMarker
			isActive={isActive}
			key={'vendors_' + restaurant_id}
			hasZone={zone != null}
			activeReserve={activeReserve}
			{...{ latitude, longitude, restaurant, distance, onGoVendor, restaurant_id }}
			onMarkerPress={onMarkerPress}
		/>
	);
};

const Markers = (props) => {
	const { snapfooders, ...markerProps } = props;
	return snapfooders.map((value, index) => <Marker {...{ ...markerProps, value, index }} />);
};

const Marker = (props) => {
	const { value, index, openGroup } = props;
	const { users } = value;
	const user = (users && users[0]) || {};
	const { id: user_id, map_latitude, map_longitude, is_friend } = user;
	const onGoUserProfile = () => props.onGoUserProfile(user)
	const onChat = () => props.onEnterChannel(user)
	const onMarkerPress = () => openGroup(users)

	return (
		!!users.length &&
		(users.length == 1 ? (
			<SnapfooderMarker
				key={'snapfooders_' + user_id}
				{...{ is_friend, user_id, longitude: map_longitude, latitude: map_latitude, user }}
				// onGoUserProfile={onGoUserProfile}
				// onChat={onChat}
				onPress={onMarkerPress}
			/>
		) : (
			<SnapfooderGroup {...{ index, value, onMarkerPress }} />
		))
	);

};

const SnapfooderGroup = (props) => {
	const { index, value, onMarkerPress } = props;
	const { map_latitude, map_longitude, users } = value;
	return (
		<SnapfooderGroupMarker
			key={'snapfooders_group_' + index}
			{...{ latitude: map_latitude, longitude: map_longitude, count: users.length, onMarkerPress }}
		// user_id={value.id}
		// user={value}
		// is_friend={value.is_friend}
		// onGoUserProfile={() => this.onGoUserProfile(value) }}
		// onChat={() =>this.onEnterChannel(value)}}
		/>
	);
}

const TitleBar = (props) => {
	const { appBadgeCount, goBack } = props;
	const pushToSnapFoodSettings = useCallback(() => props.push(RouteNames.SnapfoodMapSettingsScreen), [props.push]);
	return (
		<View style={[Theme.styles.col_center, {
			width: '100%',
			alignItems: 'flex-end',
			position: 'absolute',
			top: 50,
			left: 0,
		}]}>
			<View style={styles.titleContainer}>
				<BackButton iconCenter={true} iconName={'arrow-left'} iconColor={Theme.colors.white} style={styles.backButton} onPress={goBack} />
				<View style={[Theme.styles.flex_1, { paddingHorizontal: 15 }]}>
					{
						props.isVisibleVendors == true && props.isVisibleSnapfooders == false &&
						<SwitchTab
							curitem={props.order_type}
							useFirstItem={false}
							items={[OrderType_Delivery, OrderType_Pickup, OrderType_Reserve]}
							onSelect={(item) => {
								props.onChangeOrderType(item)
							}}
							style={styles.orderTypeTabs}
							active_style={styles.orderTypeActiveTab}
							inactive_style={styles.orderTypeInactiveTab}
							activetxt_style={styles.orderTypeActiveTabTxt}
							inactivetxt_style={styles.orderTypeInactiveTabTxt}
						/>
					}
				</View>
				<TouchableOpacity onPress={pushToSnapFoodSettings} style={[Theme.styles.col_center, styles.backButton]}>
					<MaterialIcons name={'settings'} color={'#fff'} size={24} />
				</TouchableOpacity>
			</View>
			<UserMerchantBtn {...props} />
		</View>
	);
};

const UserMerchantBtn = (props) => {
	const { appBadgeCount, goBack, isVisibleVendors, isVisibleSnapfooders, onChangeSnapfoodersVisible, onChangeVendorVisible } = props;
	const pushToSnapFooders = useCallback(() => props.push(RouteNames.SnapfoodersScreen), [props.push]);
	const [isOpen, setOpen] = useState(false);

	return (
		<View style={[Theme.styles.row_center, styles.btnGroup]}>
			{
				isOpen &&
				<View style={[Theme.styles.col_center]}>
					<TouchableOpacity onPress={onChangeSnapfoodersVisible} style={[Theme.styles.row_center, styles.ctrlBtn]}>
						{isVisibleSnapfooders && <Entypo name='check' color={Theme.colors.text1} size={17} />}
						<AppText style={styles.ctrlBtnTxt}>{translate('social.snapfooders')}</AppText>
					</TouchableOpacity>
					<TouchableOpacity onPress={onChangeVendorVisible} style={[Theme.styles.row_center, styles.ctrlBtn, { marginTop: 4 }]}>
						{isVisibleVendors && <Entypo name='check' color={Theme.colors.text1} size={17} />}
						<AppText style={styles.ctrlBtnTxt}>{translate('social.merchants')}</AppText>
					</TouchableOpacity>
				</View>
			}
			<View style={[Theme.styles.col_center, styles.uservendorBtn]}>
				<TouchableOpacity onPress={pushToSnapFooders} style={{ marginBottom: 6 }}>
					<Svg_users />
					{appBadgeCount > 0 && <View style={styles.badgeCount} />}
				</TouchableOpacity>
				<TouchableOpacity onPress={() => setOpen(pre => !pre)} >
					<Svg_control />
				</TouchableOpacity>
			</View>
		</View>

	)
}


const DistanceRange = (props) => {
	const { distance_range, updateDistanceRange, updateRegion, onLoadMapData, latitude, longitude, saveDistance, updateGroupSize, calculateGroupSize } = props;
	const [realTimeDistance, setRealTimeDistance] = useState(distance_range);
	const updateRealTimeDistance = useCallback((realTimeValue) => setRealTimeDistance(realTimeValue), []);

	useEffect(() => {
		if (realTimeDistance !== distance_range) updateRealTimeDistance(distance_range);
	}, [distance_range]);

	const distanceRangeInUnit = useMemo(() => {
		return realTimeDistance > 999 ? `${parseFloat(realTimeDistance / 1000).toFixed(1)}km` : `${realTimeDistance}m`;
	}, [realTimeDistance]);

	const onSlidingComplete = useCallback(
		(value) => {
			const distance = value[0];
			const delta = getLatDelta(distance);
			const region = { latitude, longitude, latitudeDelta: delta, longitudeDelta: delta };
			const zoom = Math.log2(360 * (width(100) / 256 / delta)) + 1;
			const groupSize = calculateGroupSize(zoom);
			updateDistanceRange(distance);
			updateGroupSize(groupSize);
			updateRegion(region);
			onLoadMapData(region, distance);
			saveDistance(distance);
		},
		[latitude, longitude, updateDistanceRange, onLoadMapData, updateRegion, saveDistance, updateGroupSize, calculateGroupSize]
	);

	return (
		<View style={styles.distanceRange}>
			<View style={styles.distanceContainer}>
				<View style={Theme.styles.flex_between}>
					<AppText style={styles.distancePreferenceText}>
						{translate('chat.map_settings.distance_preference')}
					</AppText>
					<AppText style={styles.distanceRangeText}>{distanceRangeInUnit}</AppText>
				</View>
				<Slider
					minimumValue={20}
					maximumValue={5000}
					step={1}
					value={realTimeDistance}
					onValueChange={updateRealTimeDistance}
					onSlidingComplete={onSlidingComplete}
					trackStyle={styles.trackStyle}
					thumbStyle={styles.thumbStyle}
					style={Theme.styles.w100}
				/>
				<View style={Theme.styles.flex_between}>
					<AppText style={styles.distancePreferenceText}>
						{translate('chat.map_settings.distance_preference_desc')}
					</AppText>
					<View />
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	rbSheetView: {
		height: '100%',
		width: '100%',
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		backgroundColor: '#fff',
	},
	rbSheetText: {
		width: '100%',
		fontSize: 19,
		textAlign: 'center',
		fontFamily: Theme.fonts.bold,
		color: '#25252D',
	},
	mapView: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 },
	titleImages: { borderRadius: 8, paddingHorizontal: 2, paddingVertical: 3 },
	badgeCount: {
		width: 10,
		height: 10,
		backgroundColor: '#F55A00',
		position: 'absolute',
		top: -3,
		right: -3,
		borderRadius: 10,
	},
	usersImg: { width: 35, height: 35 },
	backButton: { width: 33, height: 33, backgroundColor: '#A7A7A759', borderRadius: 20, borderWidth: 1, borderColor: '#E1E1E1' },
	trackStyle: { backgroundColor: Theme.colors.gray5, height: 2 },
	thumbStyle: { width: 18, height: 18, borderRadius: 15, backgroundColor: Theme.colors.gray1 },
	distanceRangeText: { fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.primary },
	distancePreferenceText: { fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	distanceRange: { width: '100%', paddingHorizontal: 20, position: 'absolute', left: 0, bottom: 35 },
	container: {
		flex: 1,
		backgroundColor: Theme.colors.white,
	},
	titleContainer: {
		flexDirection: 'row',
		marginHorizontal: 20,
	},
	listContainer: {
		flex: 1,
		width: '100%',
		marginTop: 25,
		paddingLeft: 20,
		paddingRight: 20,
	},
	distanceContainer: {
		width: '100%',
		padding: 16,
		backgroundColor: '#fff',
		borderRadius: 12,
		elevation: 4,
		shadowColor: Theme.colors.blackPrimary,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.2,
		shadowRadius: 3.94,
	},
	spaceCol: {
		height: 10,
	},
	usersView: { width: '100%', paddingTop: 50, backgroundColor: '#ffffff', position: 'absolute' },
	orderTypeTabs: {
		width: '100%', borderRadius: 60, backgroundColor: '#fff',
		elevation: 2,
		shadowColor: Theme.colors.blackPrimary,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	orderTypeActiveTab: { backgroundColor: Theme.colors.cyan2, borderRadius: 60, marginLeft: 0, marginRight: 0 },
	orderTypeInactiveTab: { backgroundColor: Theme.colors.white, borderRadius: 60, marginLeft: 0, marginRight: 0 },
	orderTypeActiveTabTxt: { color: Theme.colors.white, fontSize: 16, lineHeight: 20 },
	orderTypeInactiveTabTxt: { fontSize: 16, lineHeight: 20 },
	btnGroup: { marginTop: 10, paddingHorizontal: 20 },
	ctrlBtn: {
		justifyContent: 'flex-start',
		width: 120,
		borderWidth: 1, borderColor: '#E1E1E1',
		backgroundColor: '#fff',
		padding: 7,
		borderRadius: 40,
		elevation: 2,
		shadowColor: Theme.colors.blackPrimary,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	ctrlBtnTxt: { marginLeft: 4, fontSize: 14, lineHeight: 18, color: Theme.colors.text1, fontFamily: Theme.fonts.semiBold },
	uservendorBtn: { marginLeft: 4, padding: 5, backgroundColor: '#A7A7A759', borderRadius: 40, borderWidth: 1, borderColor: '#E1E1E1' },
	closeBtn: { position: 'absolute', top: 0, right: 20, width: 24, height: 24, borderRadius: 20, backgroundColor: Theme.colors.gray9 }
});

const mapStateToProps = ({ app, chat }) => ({
	user: app.user,
	coordinates: app.coordinates,
});

export default connect(mapStateToProps, {
	setVendorCart,
})(SnapfoodMapScreen);