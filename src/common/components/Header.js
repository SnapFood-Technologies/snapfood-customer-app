import { View, Text, Image, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { TouchableOpacity } from "react-native-gesture-handler";
import Theme from '../../theme';
import React from 'react';

const RNGH_Header = ({ left, right, title, style, titleStyle, onLeft, onRight }) => {

    return <View style={[styles.header, style]}>
        <View style={[{ width: '100%', }, Theme.styles.row_center]}>
            <View style={[Theme.styles.flex_1, { flexDirection: 'row', }]}>
                <TouchableOpacity onPress={onLeft ? onLeft : () => { }}>
                    {
                        left ? left : <Feather name="chevron-left" size={24} color={Theme.colors.text} />
                    }
                </TouchableOpacity>
            </View>
            <Text style={[Theme.styles.headerTitle, titleStyle]}>{title}</Text>
            <View style={[Theme.styles.flex_1, Theme.styles.row_center, { justifyContent: 'flex-end', paddingRight: 8 }]}>
                <TouchableOpacity onPress={onRight ? onRight : () => { }}>
                    {right}
                </TouchableOpacity>
            </View>
        </View>
    </View>;
};

const styles = StyleSheet.create({
    header: {
        width: '100%', height: 70, elevation: 6, paddingBottom: 8, marginBottom: 24, alignItems: 'flex-end', flexDirection: 'row',
    },
})
export default RNGH_Header;
