import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Theme from '../../theme';
import React from 'react';

const InfoRow = ({ name, value, keyItem, valueItem, style, keyStyle, valueStyle}) => {
    
    return <View style={[Theme.styles.row_center, styles.container, style]}>
        {
            keyItem ? keyItem : <Text style={[styles.keyTxt, keyStyle]}>{name}</Text>
        }
        {
            valueItem ? valueItem : <Text style={[styles.valueTxt, valueStyle]}>{value}</Text>
        }
    </View>;
};

const styles = StyleSheet.create({
    container: { width: '100%', paddingVertical: 8,},
    keyTxt: { flex:1, fontSize: 17, color: Theme.colors.text, fontFamily: Theme.fonts.medium  },
    valueTxt: { fontSize: 17, color: Theme.colors.text, fontFamily: Theme.fonts.medium  },
})
export default InfoRow;
