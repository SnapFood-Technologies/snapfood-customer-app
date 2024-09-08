import React, { memo, useState, useRef, useEffect } from 'react';
import WebView from 'react-native-webview';
import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Callout, PROVIDER_GOOGLE, Point, Marker } from "react-native-maps";
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import Theme from "../../../theme";

const SnapfooderGroupMarker = ({ latitude, longitude, count, onMarkerPress }) => {


    return (
        <Marker
            tracksInfoWindowChanges={false}
            tracksViewChanges={false}
            key={(latitude + longitude)}
            anchor={{ x: 0.5, y: 0.5 }}
            coordinate={{
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            }}
            onPress={() => onMarkerPress()}
        >
            <View style={styles.markerOutter}>
                <View style={Theme.styles.col_center}>
                    <Text style={styles.marketTxt}>{count}</Text>
                </View>
            </View>
        </Marker>
    );
}

const styles = StyleSheet.create({
    chatBtn: { paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: Theme.colors.gray6 },
    chatBtnTxt: { color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold, fontSize: 15, marginLeft: 5 },
    nameTxt: { color: Theme.colors.text, fontSize: 16, fontFamily: Theme.fonts.bold, paddingRight: 5 },
    markerOutter: {
        width: 20, height: 20, borderRadius: 25, borderWidth: 2, borderColor: Theme.colors.white,
        backgroundColor: Theme.colors.red1, alignItems: 'center', justifyContent: 'center',
    },
    marketTxt: { color: Theme.colors.whitePrimary, fontSize: 8, lineHeight: 10, fontFamily: Theme.fonts.bold, },
});

function arePropsEqual(prevProps, nextProps) {
    if (prevProps.latitude != nextProps.latitude ||
        prevProps.longitude != nextProps.longitude ||
        prevProps.count != nextProps.count
    ) {
        console.log('SnapfooderGroupMarker item equal : ', false)
        return false;
    }
    return true;
}

export default React.memo(SnapfooderGroupMarker, arePropsEqual);
