import React, { memo, useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Theme from "../../../theme";

const InterestTag = ({ selected, data, language, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={[Theme.styles.row_center, styles.container, { backgroundColor: (selected ? Theme.colors.cyan2 : Theme.colors.white) }]}>
            <MaterialCommunityIcons name={selected ? 'check-circle' : 'circle-outline'} size={24} color={selected ? Theme.colors.text : Theme.colors.gray5} />
            <Text style={[styles.text]}>{language == 'en' ? data?.title_en : data?.title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E9E9F7',
        paddingHorizontal: 10,
        marginRight: 10,
        marginTop: 10
    },
    text: {
        marginLeft: 8,
        color: Theme.colors.text,
        fontSize: 16,
        lineHeight: 18,
        fontFamily: Theme.fonts.medium,
    }
});

export default InterestTag;
