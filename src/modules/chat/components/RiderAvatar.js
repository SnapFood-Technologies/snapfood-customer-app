import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import Theme from "../../../theme";
import { isEmpty, getImageFullURL } from '../../../common/services/utility';
import { translate } from '../../../common/services/translate';

const RiderAvatar = ({ rider_id, data }) => { 
    return (
        <View style={[Theme.styles.col_center, styles.container]}>
            <FastImage
                source={{ uri: getImageFullURL(data.profile_img) }}
                style={styles.avatarImg}
                resizeMode={FastImage.resizeMode.cover}
            />
            <Text style={styles.name}>{data.name}</Text>
            <View style={[Theme.styles.row_center, { marginTop: 6 }]}>
                <Text style={styles.infoTxt}>{translate('rider_profile.vehicle_type')}</Text>
                <View style={styles.dot} />
                <Text style={styles.infoTxt}>{translate(data.vehicle_type)}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    avatarImg: { height: 64, width: 64, borderWidth: 1, borderColor: Theme.colors.gray9, borderRadius: 32, backgroundColor: '#E8D7D0' },
    name: { marginTop: 20, fontSize: 16, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
    infoTxt: { fontSize: 13, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7 },
    dot: { marginHorizontal: 5, width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.colors.gray7 }
});

function arePropsEqual(prevProps, nextProps) {
    return prevProps.rider_id == nextProps.rider_id;
}

export default React.memo(RiderAvatar, arePropsEqual); 
