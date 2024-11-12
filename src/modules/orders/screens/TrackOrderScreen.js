
import React from 'react';
import { StyleSheet, Text, TextInput, Linking, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment';
import axios from 'axios'
import Feather from 'react-native-vector-icons/Feather';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import FastImage from 'react-native-fast-image';
import Config from '../../../config';
import RouteNames from '../../../routes/names';
import { createSingleChannel, findChannel, sendRiderPokeNotification } from '../../../common/services/chat';
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';
import FireStore, { FieldValue } from '../../../common/services/firebase';
import RoundIconBtn from '../../../common/components/buttons/round_icon_button';
import { height, width } from 'react-native-dimension';
import { SocialMapScreenStyles } from '../../../config/constants';
// svgs
import Svg_pin from '../../../common/assets/svgs/ic_locpin.svg';
import Svg_riderpin from '../../../common/assets/svgs/rider_pin.svg';
import Svg_vendor from '../../../common/assets/svgs/msg/snapfooder_vendor.svg'
import Svg_ping from '../../../common/assets/svgs/btn_ping.svg';
import Svg_msg from '../../../common/assets/svgs/btn_message.svg';
import Svg_call from '../../../common/assets/svgs/btn_call.svg';
import { getImageFullURL } from '../../../common/services/utility';
import { ROLE_RIDER } from '../../../config/constants';

export const tracking_collection = FireStore.collection('trackings');

class TrackOrderScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            rider: null,
            rider_lat: null,
            rider_lon: null,
            maximum_delivery_time: null,
            distance: 0,
            duration: 0,
            region_coords: null,
        };
    }

    componentDidMount() {
        this.getRiderInfo();
    }

    componentWillUnmount() {
        if (this.rider_location_listener) {
            this.rider_location_listener()
        }
    }

    getRiderLocationListner = (rider_unique_id) => {
        if (this.rider_location_listener) {
            this.rider_location_listener()
        }

        this.rider_location_listener = tracking_collection.doc(rider_unique_id).onSnapshot((doc) => {
            if (doc.data()) {
                
                this.setState({ rider_lat: parseFloat(doc.data().lat), rider_lon: parseFloat(doc.data().lng) });
                this.getEstimated(parseFloat(doc.data().lat), parseFloat(doc.data().lng));
            }
        },
            (error) => {
                
            });
    }

    componentDidUpdate = (prevProps, prevState) => {
        // if (this.state.region_coords != null && this.mapView != null) { 
        //     
        //     setTimeout(()=>{
        //         this.mapView.fitToCoordinates(this.state.region_coords, {
        //             edgePadding: {
        //               right: (width(100) / 20),
        //               bottom: (height(100) / 20),
        //               left: (width(100) / 20),
        //               top: (height(100) / 20),
        //             }
        //         }, false);
        //     }, 1000)
        // } 
    }

    getRiderInfo = () => {
        const order = this.props.route.params.order
        const { latitude, longitude } = this.props.coordinates;
        apiFactory.get(`orders/get-rider-info?order_id=${order.id}&vendor_id=${order.vendor_id}&lat=${latitude}&lng=${longitude}`)
            .then(({ data }) => {
                
                this.setState({ rider: data.order.rider_info, maximum_delivery_time: data.order.maximum_delivery_time });
                if (data.order.rider_info) {
                    this.getRiderLocationListner(data.order.rider_info.unique_id)
                }
            },
                (error) => {
                    
                    const message = error.message || translate('generic_error');
                    // alerts.error(translate('alerts.error'), message);
                });
    }

    getEstimated = async (rider_lat, rider_lon) => {
        const order = this.props.route.params.order;
        const { latitude, longitude } = this.props.coordinates;
        const vendor_lat = parseFloat(order.vendor.latitude);
        const vendor_lon = parseFloat(order.vendor.longitude);

        let res1 = await this.calculateDistanceDuration(rider_lat, rider_lon, latitude , longitude);

        let durationSeconds = 0;
        if (order.status == 'accepted') {
            let res2 = await this.calculateDistanceDuration(rider_lat, rider_lon, vendor_lat , vendor_lon);
            durationSeconds = durationSeconds + res2.duration;

            let res3 = await this.calculateDistanceDuration(vendor_lat, vendor_lon, latitude , longitude);
            durationSeconds = durationSeconds + res3.duration;
        }
        else {
            durationSeconds = durationSeconds + res1.duration;
        }
        
        this.setState({ distance: (res1.distance / 1000).toFixed(1), duration: durationSeconds });
    }

    calculateDistanceDuration = async (origin_lat, origin_lon, dest_lat, dest_lon) => {
        try {
            let res = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin_lat},${origin_lon}&destinations=${dest_lat},${dest_lon}&key=${Config.GOOGLE_MAP_API_KEY}`);
            if (res.data.rows && res.data.rows.length > 0) {
                let elements = res.data.rows[0].elements;
                if (elements && elements.length > 0) {
                    if (elements[0].status == "OK") {
                        let distance = 0;
                        if (elements[0].distance) {
                            distance = elements[0].distance.value || 0;
                        }
                        let duration = 0;
                        if (elements[0].duration) {
                            duration = elements[0].duration.value || 0;
                        }
                        return { distance, duration };
                    }
                }
            }

        } catch (error) {
            
        }

        return { distance: 0, duration: 0 };
    }

    getArrivalTime = () => {
        let duration_time = this.state.duration * 1000;
        let arrival_time = new Date().getTime() + duration_time;
        return moment(new Date(arrival_time)).format("hh:mm A");
    }

    onChat = async (user) => {
        let found_channel = await findChannel(this.props.user.id, user.unique_id)
        if (found_channel != null) {
            this.props.navigation.navigate(RouteNames.MessagesScreen, { channelId: found_channel.id })
        }
        else {
            let partner_user = {
                id: user.unique_id,
                full_name: user.name,
                photo: user.profile_img,
                phone: user.phone_number,
                email: user.email,
                role: ROLE_RIDER
            }
            let channelID = await createSingleChannel(this.props.user, partner_user, true);
            if (channelID != null) {
                this.props.navigation.navigate(RouteNames.MessagesScreen, { channelId: channelID })
            }
            else {
                alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
            }
        }
    }

    onCall = async (user) => {
        try {
            Linking.openURL(`tel:${user.phone_number}`)
        } catch (error) {
        }
    }

    onSendPoke = () => {
        const order = this.props.route.params.order;

        let title = `Ngacmim nga ${(this.props.user.username || this.props.user.full_name)}`; // translate('track_order.poke_noti_title');
        let message = `${this.state.rider.name}, sapo more një ngacmim nga ${(this.props.user.username || this.props.user.full_name)}. A mbërrite?`; // translate('track_order.poke_noti_msg');

        apiFactory.post('chats/send-poke-notification', {
            order_id: order.id,
            rider_id: this.state.rider.id,
            sender_id: this.props.user.id,
            title: title,
            message: message
        })
            .then((res) => {
                alerts.info('', translate('track_order.sent_poke_noti')).then((res) => {
                });
            })
            .catch((error) => {
                
                const message = error.message || translate('generic_error');
                alerts.error(translate('alerts.error'), message);
            });
    }

    renderMap = () => {
        const order = this.props.route.params.order
        const { latitude, longitude } = this.props.coordinates;
        if (latitude == null || longitude == null) {
            return null;
        }

        // if (Platform.OS === 'ios') {
        let marker = (
            <View style={[Theme.styles.col_center,]}>
                <View style={[Theme.styles.row_center, styles.markerInfoView]}>
                    <Text style={styles.brandName}>{translate('you')}</Text>
                </View>
                <Svg_pin />
                <View style={styles.markerAnchor} />
            </View>
        );
        let rider_marker = (
            <View style={[Theme.styles.col_center,]}>
                <Svg_riderpin />
            </View>
        );

        let vendor_marker = (
            <View style={[Theme.styles.col_center,]}>
                <Svg_vendor />
            </View>
        )
        // }

        const getRegion = () => {
            let region = {
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: 0,
                longitudeDelta: 0
            }
            if (this.state.rider != null && this.state.rider_lat != null && this.state.rider_lon != null) {
                let latitudeDelta = Math.abs(latitude - this.state.rider_lat);
                let longitudeDelta = Math.abs(longitude - this.state.rider_lon);
                let middle_lat = (this.state.rider_lat + latitude) / 2;
                let middle_lng = (this.state.rider_lon + longitude) / 2;
                region = {
                    latitude: middle_lat - latitudeDelta * 0.1,
                    longitude: middle_lng - longitudeDelta * 0.1,
                    latitudeDelta: latitudeDelta * 1.7,
                    longitudeDelta: longitudeDelta * 1.3
                }
            }
            return region;
        }

        return (
            <MapView
                customMapStyle={SocialMapScreenStyles}
                ref={c => this.mapView = c}
                style={{ height: height(100), width: width(100) }}
                region={getRegion()}
                provider={PROVIDER_GOOGLE}
            >
                <MapView.Marker
                    draggable={false}
                    coordinate={{
                        latitude: latitude,
                        longitude: longitude,
                    }}
                >
                    {!!marker && marker}
                </MapView.Marker>
                {
                    (this.state.rider != null && this.state.rider_lat != null && this.state.rider_lon != null) &&
                    <MapView.Marker
                        draggable={false}
                        coordinate={{
                            latitude: this.state.rider_lat,
                            longitude: this.state.rider_lon,
                        }}
                    >
                        {!!rider_marker && rider_marker}
                    </MapView.Marker>
                }
                {
                    (order.status == 'picked_by_rider' && this.state.rider != null && this.state.rider_lat != null && this.state.rider_lon != null) &&
                    <MapViewDirections
                        origin={{
                            latitude: this.state.rider_lat,
                            longitude: this.state.rider_lon,
                        }}
                        destination={{
                            latitude: latitude,
                            longitude: longitude,
                        }}
                        apikey={Config.GOOGLE_MAP_API_KEY}
                        strokeWidth={3}
                        strokeColor={Theme.colors.cyan2}// "hotpink"
                        onReady={result => {
                            // 
                            // 
                            // this.setState({ distance: result.distance, duration: result.duration, region_coords: result.coordinates })
                            // setTimeout(()=>{
                            //     this.mapView.fitToCoordinates(result.coordinates, {
                            //         edgePadding: {
                            //           right: (width(100) / 20),
                            //           bottom: (height(100) / 20),
                            //           left: (width(100) / 20),
                            //           top: (height(100) / 20),
                            //         }
                            //     });
                            // }, 1000)
                            // this.forceUpdate()
                        }}
                    />
                }
                {
                    (order.status == 'accepted' && order.vendor != null && order.vendor.latitude != null && order.vendor.longitude != null) &&
                    <MapView.Marker
                        draggable={false}
                        coordinate={{
                            latitude: parseFloat(order.vendor.latitude),
                            longitude: parseFloat(order.vendor.longitude),
                        }}
                    >
                        {!!vendor_marker && vendor_marker}
                    </MapView.Marker>
                }
                {
                    (order.status == 'accepted' && order.vendor != null && order.vendor.latitude != null && order.vendor.longitude != null) &&
                    (this.state.rider != null && this.state.rider_lat != null && this.state.rider_lon != null) &&
                    <MapViewDirections
                        origin={{
                            latitude: this.state.rider_lat,
                            longitude: this.state.rider_lon,
                        }}
                        destination={{
                            latitude: parseFloat(order.vendor.latitude),
                            longitude: parseFloat(order.vendor.longitude),
                        }}
                        apikey={Config.GOOGLE_MAP_API_KEY}
                        strokeWidth={3}
                        strokeColor={Theme.colors.cyan2}// "hotpink"
                        onReady={result => {
                            // 
                            // 
                            // this.setState({ distance: result.distance, duration: result.duration, region_coords: result.coordinates })
                            // setTimeout(()=>{
                            //     this.mapView.fitToCoordinates(result.coordinates, {
                            //         edgePadding: {
                            //           right: (width(100) / 20),
                            //           bottom: (height(100) / 20),
                            //           left: (width(100) / 20),
                            //           top: (height(100) / 20),
                            //         }
                            //     });
                            // }, 1000)
                            // this.forceUpdate()
                        }}
                    />
                }
            </MapView>
        );
    };

    _renderBottomView = () => {
        if (this.state.rider == null) {
            return null
        }
        return (
            <TouchableOpacity activeOpacity={0.9} style={[styles.bottomView]} onPress={() => {
                // this.props.navigation.navigate(RouteNames.CourierScreen, {rider_id : this.state.rider.unique_id})
            }}>
                <View style={[Theme.styles.col_center, styles.bottomPanel]}>
                    <View style={[Theme.styles.row_center, styles.bottomPanelTop]}>
                        <FastImage source={{ uri: getImageFullURL(this.state.rider.profile_img) }} style={styles.avatarImg} resizeMode={FastImage.resizeMode.cover} />
                        <Text style={[styles.infoTxt, { flex: 1, fontSize: 16, marginLeft: 9 }]}>{this.state.rider.name}</Text>
                        <TouchableOpacity onPress={this.onSendPoke}>
                            <Svg_ping />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginHorizontal: 15, }} onPress={() => this.onChat(this.state.rider)}>
                            <Svg_msg />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.onCall(this.state.rider)}>
                            <Svg_call />
                        </TouchableOpacity>
                    </View>
                    <View style={[Theme.styles.row_center, { marginTop: 12 }]}>
                        <Text style={[styles.infoTxt, { flex: 1, }]}>{translate('track_order.distance')}:</Text>
                        <Text style={[styles.infoTxt, { fontFamily: Theme.fonts.medium, }]}>{this.state.distance} KM</Text>
                    </View>
                    <View style={[Theme.styles.row_center, { marginTop: 12 }]}>
                        <Text style={[styles.infoTxt, { flex: 1, }]}>{translate('track_order.estimate_arrival')}:</Text>
                        <Text style={[styles.infoTxt, { fontFamily: Theme.fonts.medium, }]}>{this.getArrivalTime()}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <KeyboardAwareScrollView
                style={[{ flex: 1 }, { backgroundColor: '#ffffff' }]}
                extraScrollHeight={65}
                enableOnAndroid={true}
                keyboardShouldPersistTaps='handled'
            >
                <View style={{ flex: 1, }}>
                    {this.renderMap()}
                    <RoundIconBtn style={styles.backBtn} icon={<Feather name='chevron-left' size={22} color={Theme.colors.text} />} onPress={() => {
                        this.props.navigation.goBack()
                    }} />
                    {this._renderBottomView()}
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
    backBtn: { position: 'absolute', top: 45, left: 25, width: 33, height: 33, borderWidth: 1, borderColor: Theme.colors.gray5, borderRadius: 8, backgroundColor: Theme.colors.white, },
    markerInfoView: { backgroundColor: Theme.colors.white, marginBottom: 12, borderRadius: 12, padding: 10, },
    markerAnchor: { position: 'absolute', bottom: 42, left: '44%', width: 16, height: 16, backgroundColor: Theme.colors.white, transform: [{ rotate: '45deg' }] },
    brandImg: { width: 39, height: 39, borderRadius: 8, borderWidth: 1, borderColor: '#f6f6f9' },
    brandName: { marginHorizontal: 8, fontSize: 18, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
    activeFlag: { width: 7, height: 7, borderRadius: 4, backgroundColor: Theme.colors.red },
    distance: { marginLeft: 8, fontSize: 12, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7 },

    bottomView: {
        width: width(100), padding: 20, position: 'absolute', bottom: 40,
    },
    bottomPanel: { width: '100%', borderRadius: 15, elevation: 2, backgroundColor: Theme.colors.white, padding: 20, },
    bottomPanelTop: { paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Theme.colors.gray9, },
    avatarImg: { width: 25, height: 25, borderRadius: 5, },
    infoTxt: { fontSize: 15, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
});

function mapStateToProps({ app }) {
    return {
        user: app.user || {},
        isLoggedIn: app.isLoggedIn,
        coordinates: app.coordinates,
    };
}

export default connect(mapStateToProps, {
})(TrackOrderScreen);