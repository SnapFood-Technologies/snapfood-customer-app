import React, { memo, useEffect, useRef } from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import MapView, { Callout, PROVIDER_GOOGLE, Point, Marker } from "react-native-maps";
import Theme from "../../../theme";
import { translate } from '../../../common/services/translate';
import Svg_user from '../../../common/assets/svgs/map/user.svg';
import { getImageFullURL } from '../../../common/services/utility';
import FastImage from "react-native-fast-image";

const UserMarkers = ({ latitude, longitude, photo }) => {
    const isMounted = useRef(false);
    const userMarker = useRef(null);
    useEffect(() => {
        console.log("user mark called")
        if (userMarker.current && isMounted.current == false) {
            userMarker.current.showCallout();
            isMounted.current = true;
        }
    }, []);

    console.log('UserMarkers');
    return (
        <Marker
            tracksInfoWindowChanges={false}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 1 }}
            ref={userMarker}
            coordinate={{ latitude: latitude, longitude: longitude }}
            style={{ zIndex: 10001 }}
        >
            <View style={[Theme.styles.col_center]}>
                <Svg_user width={42} height={42} />
                <FastImage style={styles.markerPhoto} source={{ uri: getImageFullURL(photo) }} />
                <View style={styles.textWrap}>
                    <Text style={{ color: Theme.colors.text, fontSize: 12, fontFamily: Theme.fonts.bold }}>{translate('you')}</Text>
                </View>
            </View>
        </Marker>
    );
}

const styles = StyleSheet.create({
    markerOutter: { marginTop: 3, width: 26, height: 26, borderRadius: 18, backgroundColor: '#AFDFE0', alignItems: 'center', justifyContent: 'center' },
    markerInner: { width: 15, height: 15, borderRadius: 10, backgroundColor: '#50b7ed' },
    markerPhoto: {
        width: 29,
        height: 29,
        borderRadius: 22,
        position: 'absolute',
        top: 3,
        left: 6,
        resizeMode: 'cover'
    },
    textWrap: {
        width: 34, paddingVertical: 4, backgroundColor: '#fff', borderRadius: 7, alignItems: 'center', justifyContent: 'center', zIndex: 1, flexDirection: 'row',
    }
});

function arePropsEqual(prevProps, nextProps) {
    if (prevProps.latitude != nextProps.latitude ||
        prevProps.longitude != nextProps.longitude ||
        prevProps.photo != nextProps.photo
    ) {
        console.log('UserMarker item equal : ', false)
        return false;
    }
    return true;
}

export default React.memo(UserMarkers, arePropsEqual);
