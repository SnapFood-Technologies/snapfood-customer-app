import React, { useEffect, useState } from 'react';
import { TextInput, View, TouchableOpacity, StyleSheet } from 'react-native';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Theme from '../../theme';

const ICON_CONTAINER_SIZE = 25;
const ICON_SIZE = 14;

const AuthInput = (props) => {
    const [visible, SetVisible] = useState(false)
    return <View style={[styles.view, props.style]}>

        {
            props.isSearch == true ? <TouchableOpacity style={{ marginRight: 4 }} onPress={() => SetVisible(!visible)}>
                <Feather name={'search'} size={18} color={Theme.colors.gray5} />
            </TouchableOpacity>
                :
                props.leftComp
        }

        <TextInput
            ref={props.setRef}
            {...props}
            style={[{
                fontSize: props.fontSize ? props.fontSize : 16,
                fontFamily: props.fontFamily ? props.fontFamily : Theme.fonts.medium,
                marginLeft: !!props.icon ? Theme.sizes.xTiny : 0,
                flex: 1,
                color: Theme.colors.text,
            }]}
            placeholderTextColor={Theme.colors.gray5}
            secureTextEntry={props.secure == true && visible == false ? true : false}
        />
        {
            props.rightComp ? props.rightComp :
                (props.hideEye != true && props.secure == true && <TouchableOpacity onPress={() => SetVisible(!visible)}>
                    <Octicons name={visible ? 'eye-closed' : 'eye'} size={20} color={visible ? Theme.colors.red : Theme.colors.gray5} />
                </TouchableOpacity>)
        }
    </View>;
};

const styles = StyleSheet.create({
    view: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#E9E9F7',
        borderRadius: 12,
        height: 50,
        paddingLeft: 12,
        paddingRight: 12,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    }
})
export default AuthInput;
