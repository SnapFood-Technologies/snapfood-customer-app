
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather'
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Theme from '../../../theme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { saveAddress } from '../../../store/actions/app';
import RoundIconBtn from '../../../common/components/buttons/round_icon_button';
import { height, width } from 'react-native-dimension';
import { SocialMapScreenStyles } from '../../../config/constants';
// svgs
import Svg_pin from '../../../common/assets/svgs/ic_locpin.svg';

class LocationMsgScreen extends React.Component {
    constructor(props) {
        super(props);

        const coords = props.route.params.coords

        this.state = {
            loadingLocation: false,
            loaded: false,
            coords,
        };
    }

    componentDidMount() {
    }

    renderMap = () => {
        const { latitude, longitude } = this.state.coords;
        if (latitude == null || longitude == null) {
            return null;
        }
        let marker;
        // if (Platform.OS === 'ios') {
        marker = (
            <View style={[Theme.styles.col_center,]}>
                <Svg_pin />
            </View>
        );
        // }
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
            >
                <MapView.Marker
                    coordinate={{
                        latitude: latitude,
                        longitude: longitude,
                    }}
                    tracksInfoWindowChanges={false}
                    tracksViewChanges={false}
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
    activeFlag: { width: 7, height: 7, borderRadius: 4, backgroundColor: Theme.colors.red },
    distance: { marginLeft: 8, fontSize: 12, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7 },

});

function mapStateToProps({ app }) {
    return {
        coordinates: app.coordinates,
    };
}

export default connect(mapStateToProps, {
    saveAddress,
})(LocationMsgScreen);