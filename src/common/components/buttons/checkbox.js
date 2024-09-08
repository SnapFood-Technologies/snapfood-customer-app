import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Theme from '../../../theme';
// svgs
import Svg_cb_active from '../../assets/svgs/checkbox_selected.svg'
import Svg_cb_inactive from '../../assets/svgs/checkbox_unselected.svg'

const CheckBox = memo(({ onPress, checked, type, activeColor, inactiveColor }) => {
    return (
        <TouchableOpacity onPress={onPress ? onPress : () => { }}>
            {
                type == 1 ?
                    <MaterialIcons
                        name={checked ? 'check-box' : 'check-box-outline-blank'}
                        size={22}
                        color={checked ? (activeColor || Theme.colors.gray7) : (inactiveColor || Theme.colors.gray5)}
                    />
                    :
                    (checked == true ? <Svg_cb_active /> : <Svg_cb_inactive />)
            }
        </TouchableOpacity>
    );
});

export default CheckBox;
