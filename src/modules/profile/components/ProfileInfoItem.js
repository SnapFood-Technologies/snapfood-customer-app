import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Theme from '../../../theme';

const ProfileInfoItem = ({ email, phone }) => {
    

    return <View style={[Theme.styles.col_center, styles.container]}>
        <View style={[Theme.styles.col_center, styles.itemView, ]}>
            <View style={[Theme.styles.row_center,]} >
                <MaterialIcons name='email' color={Theme.colors.text} size={26} />
                <Text style={[styles.itemTxt, { marginLeft: 4 }]}>{email}</Text>
            </View>
            <View style={[Theme.styles.row_center, { marginLeft: 6, marginTop: 13, }]} >
                <Fontisto name='mobile' color={Theme.colors.text} size={24} />
                <Text style={[styles.itemTxt, { marginLeft: 7 }]}>{phone}</Text>
            </View>
        </View>
    </View>
};

const styles = StyleSheet.create({
    container : {width: '100%', marginTop: 20},
    itemView: { width: '100%', padding: 15, marginBottom: 20, backgroundColor: Theme.colors.gray8, borderRadius: 15, },
    itemTxt: { flex: 1, fontSize: 17, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    divider: { height: 1, width: '100%', backgroundColor: Theme.colors.gray9, marginBottom: 20, }
})

function arePropsEqual(prevProps, nextProps) {
    if (prevProps.email != nextProps.email || prevProps.phone != nextProps.phone) {
        return false;
    }
    return true;
}

export default React.memo(ProfileInfoItem, arePropsEqual);
