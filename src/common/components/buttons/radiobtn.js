import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, } from 'react-native';
// svgs
import Svg_rad_active from '../../assets/svgs/radio_selected.svg'
import Svg_rad_inactive from '../../assets/svgs/radio_unselected.svg'
import Svg_rad_err from '../../assets/svgs/radio_unselected_error.svg'
import Svg_rad1_active from '../../assets/svgs/radio1_selected.svg'
import Svg_rad1_inactive from '../../assets/svgs/radio1_unselected.svg'

const RadioBtn = ({ onPress, checked, disabled, btnType, hasError, style }) => {
    return (
        <TouchableOpacity disabled={disabled} style={style} onPress={onPress ? onPress : () => { }}>
            {
                checked == true ? (btnType == 1 ? <Svg_rad1_active /> : <Svg_rad_active />) : (btnType == 1 ? <Svg_rad1_inactive /> : (hasError == true ? <Svg_rad_err /> : <Svg_rad_inactive />))
            }
        </TouchableOpacity>
    );
};

export default RadioBtn;
