
import React from 'react';
import { StyleSheet, Text, View, InteractionManager } from 'react-native';
import { connect } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather'
import Entypo from 'react-native-vector-icons/Entypo'
import Theme from '../../../theme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import FastImage from 'react-native-fast-image';
import {
    getAddressByCoordinates,
} from '../../../common/services/location';
import Config from '../../../config';
import { saveAddress } from '../../../store/actions/app';
import RoundIconBtn from '../../../common/components/buttons/round_icon_button';
import { height, width } from 'react-native-dimension';
import { SocialMapScreenStyles } from '../../../config/constants';
// svgs
import Svg_pin from '../../../common/assets/svgs/ic_locpin.svg';

class VendorLocationScreen extends React.Component {
    constructor(props) {
        super(props);

        const address = props.route.params.address

        
        if (address.lat) {
            address.lat = parseFloat(address.lat);
        }
        if (address.lng) {
            address.lng = parseFloat(address.lng);
        }

        this.state = {
            address,
            info: props.route.params.info,
        };
    }

    componentDidMount() {
    }

    renderMap = () => {
        const { lat, lng } = this.state.address;
        if (lat == null || lng == null) {
            return null;
        }
        
        let marker = (
            <View style={[Theme.styles.col_center,]}>
                <View style={[Theme.styles.row_center, styles.markerInfoView]}>
                    <View style={[Theme.styles.col_center, styles.brandImg]}>
                        <FastImage
                            source={{ uri: Config.IMG_BASE_URL + this.state.info.logo }}
                            style={{ width: 34, height: 34, }}
                            resizeMode={FastImage.resizeMode.contain}
                        />
                    </View>
                    <View style={[Theme.styles.col_center, { marginLeft: 10, }]}>
                        <View style={[Theme.styles.row_center,]}>
                            <Text style={styles.brandName}>{this.state.info.title}</Text>
                            <View style={this.state.info.is_open == 1 ? styles.activeIndicator : styles.inactiveIndicator} />
                        </View>
                        <View style={[Theme.styles.row_center,]}>
                            <Entypo name="location-pin" size={16} color={Theme.colors.gray7} />
                            <Text style={styles.distance}>{this.state.info.distance} Km</Text>
                        </View>
                    </View>
                </View>
                <Svg_pin />
                <View style={styles.markerAnchor} />
            </View>
        );

        return (
            <MapView
                customMapStyle={SocialMapScreenStyles}
                provider={PROVIDER_GOOGLE}
                style={{ height: height(100), width: width(100) }}
                region={{
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.004,
                    longitudeDelta: 0.004,
                }}
            >
                <MapView.Marker
                    draggable
                    coordinate={{
                        latitude: lat,
                        longitude: lng,
                    }}
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
                <View style={{ flex: 1, }}>
                    {this.renderMap()}
                    <RoundIconBtn style={styles.backBtn} icon={<Feather name='chevron-left' size={22} color={Theme.colors.text} />} onPress={() => {
                        this.props.navigation.goBack()
                    }} />
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
    backBtn: { position: 'absolute', top: 45, left: 25, width: 33, height: 33, borderRadius: 8, backgroundColor: Theme.colors.white, },
    markerInfoView: { backgroundColor: Theme.colors.white, marginBottom: 12, borderRadius: 12, padding: 14, },
    markerAnchor: { position: 'absolute', bottom: 42, left: '44%', width: 16, height: 16, backgroundColor: Theme.colors.white, transform: [{ rotate: '45deg' }] },
    brandImg: { width: 39, height: 39, borderRadius: 8, borderWidth: 1, borderColor: '#f6f6f9' },
    brandName: { marginRight: 8, fontSize: 18, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
    activeIndicator: { marginTop: 4, width: 7, height: 7, borderRadius: 4, backgroundColor: '#0f0' },
    inactiveIndicator: { marginTop: 4, width: 7, height: 7, borderRadius: 4, backgroundColor: '#f00', },
    distance: { marginLeft: 8, fontSize: 12, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7 },

});

function mapStateToProps({ app }) {
    return {
        coordinates: app.coordinates,
    };
}

export default connect(mapStateToProps, {
    saveAddress,
})(VendorLocationScreen);