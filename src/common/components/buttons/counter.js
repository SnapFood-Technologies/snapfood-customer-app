import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, Image, Text, View } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Theme from '../../../theme'

const Counter = memo(({ onPlus, onMinus, value, style, value_style, btnColor, btnSize }) => {
    return (
        <View style={[Theme.styles.row_center, styles.container, style, ]}>
            <TouchableOpacity  onPress={onMinus}>
                <AntDesign name="minuscircle" size={btnSize ? btnSize : 28} color={btnColor ? btnColor : Theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.value, value_style]}>{value}</Text>
            <TouchableOpacity onPress={onPlus}>
                <AntDesign name="pluscircle" size={btnSize ? btnSize : 28} color={btnColor ? btnColor : Theme.colors.text} />
            </TouchableOpacity>
        </View>

    );
});

const styles = StyleSheet.create({
    container: {
        width: 128,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#F6F6F9',
        padding: 10,
        justifyContent: 'space-between'
    },
    value :{fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text}
});

export default Counter;
