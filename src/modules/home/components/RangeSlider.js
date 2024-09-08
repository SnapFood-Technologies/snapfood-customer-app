import { TextInput, View, Text, StyleSheet } from 'react-native';
import RangeSlider from './Slider';
import Theme from '../../../theme';
import React, { useState, useCallback } from 'react';

const CustomRangeSlider = ({MAX_VAL, lowVal, highVal, onChangeLow, onChangeHigh}) => {

    const [low, setLow] = useState(lowVal)
    const [high, setHigh] = useState(highVal)
    const renderRail = useCallback(() => <View style={styles.rail} />, []);
    const renderRailSelected = useCallback(() => <View style={styles.railSelected} />, []);
    const renderLabel = useCallback(value => <View style={[Theme.styles.col_center, styles.labelView]}>
        <Text style={styles.value}>{value}</Text>
    </View>,
        []);
    const renderNotch = useCallback(() => <View style={styles.notch} />, []);
    const handleValueChange = useCallback((low, high) => {
        setLow(low);
        setHigh(high);
        onChangeLow(low);
        onChangeHigh(high);
    }, []);

    const renderThumb = useCallback(value => (
        <View style={[styles.thumb]}>
            <View style={[Theme.styles.col_center, styles.labelView]}>
                <Text style={styles.value}>{value}</Text>
            </View>
            <View style={styles.notch} />
        </View>

    ), []);

    return <RangeSlider
        style={styles.slider}
        min={0}
        max={MAX_VAL}
        step={1}
        floatingLabel
        allowLabelOverflow={true}
        renderThumb={renderThumb}
        renderRail={renderRail}
        renderRailSelected={renderRailSelected}
        renderLabel={renderLabel}
        renderNotch={renderNotch}
        low={low}
        high={high}
        onValueChanged={handleValueChange}
    />
};

const styles = StyleSheet.create({
    slider: { width: '100%',  },
    thumb: { alignItems: 'center', marginBottom: 20, width: 30, height: 35, backgroundColor: 'transparent' },
    notch: {
        marginBottom: -30,
        width: 8,
        height: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: Theme.colors.cyan2,
        borderLeftWidth: 4,
        borderRightWidth: 4,
        borderTopWidth: 8,
    },
    rail: { width: '100%', height: 2, backgroundColor: Theme.colors.gray7 },
    railSelected: { height: 3.5, backgroundColor: Theme.colors.cyan2 },
    labelView: { marginBottom: -2, width: 22, height: 22, borderRadius: 11, backgroundColor: Theme.colors.cyan2 },
    value: { fontSize: 10, lineHeight: 10, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white },
})
export default CustomRangeSlider;
