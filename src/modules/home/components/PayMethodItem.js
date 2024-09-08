import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Theme from '../../../theme';
import RadioBtn from '../../../common/components/buttons/radiobtn';


const PayMethodItem = ({ data, checked, onPress, style }) => {
    return <TouchableOpacity onPress={onPress ? onPress : () => { }} style={[Theme.styles.col_center, styles.container, style]}>
        <View style={[Theme.styles.row_center, { width: '100%' }]}>
            <Text style={[styles.name, checked && { fontFamily: Theme.fonts.semiBold }]}>{data}</Text>
            <View style={{ flex: 1 }} />
            <RadioBtn checked={checked} onPress={onPress ? onPress : () => { }}/>
        </View> 
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    container: { width: '100%', alignItems: 'flex-start', marginBottom: 16, borderRadius: 15, backgroundColor: Theme.colors.gray8, paddingVertical: 16, paddingHorizontal: 15, },
    name: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
    divider: { width: '100%', marginVertical: 16, height: 1, backgroundColor: Theme.colors.gray6, },
    addcard_btn: { fontSize: 16, color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold },
    card_number: { fontSize: 16, color: Theme.colors.gray7, fontFamily: Theme.fonts.medium, },
})
export default PayMethodItem;
