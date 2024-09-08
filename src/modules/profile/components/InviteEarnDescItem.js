import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Theme from '../../../theme'

const InviteEarnDescItem = ({ item }) => {
    return (
        <View style={[styles.container]}>
            <View style={[Theme.styles.col_center, styles.number]}>
                <Text style={styles.numberTxt}> {item.num}.</Text>
            </View>
            <View style={[Theme.styles.col_center, { flex: 1, alignItems: 'flex-start', }]}>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
                <Text style={styles.desc}>{item.desc}</Text>
            </View>
        </View >
    )
};

const styles = StyleSheet.create({
    container: { width: '100%', flexDirection: 'row', marginTop: 16, },
    number: { backgroundColor: '#E4F9FB', height: 26, width: 26, borderRadius: 13, marginRight: 12 },
    numberTxt: { fontSize: 17, lineHeight: 20, fontFamily: Theme.fonts.bold, color: Theme.colors.cyan2 },
    subtitle: { width: '100%', fontSize: 19, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
    desc: { width: '100%', marginTop: 6, fontSize: 19, lineHeight: 20, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7 },
});

function arePropsEqual(prevProps, nextProps) {
    return prevProps.item.num == nextProps.item.num && prevProps.item.subtitle == nextProps.item.subtitle && prevProps.item.desc == nextProps.item.desc;
}

export default React.memo(InviteEarnDescItem, arePropsEqual);
