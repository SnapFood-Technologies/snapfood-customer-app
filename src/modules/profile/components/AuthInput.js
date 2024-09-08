import React from 'react';
import {TextInput, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import Theme from '../../../theme';

const ICON_CONTAINER_SIZE = 25;
const ICON_SIZE = 14;

const AuthInput = (props) => {

    return <View style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#D1D1D1',
        height: 50,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    }}>
        {
            !!props.icon &&
            <View style={{
                width: ICON_CONTAINER_SIZE,
                height: ICON_CONTAINER_SIZE,
                backgroundColor: Theme.colors.cyan2,
                borderRadius: ICON_CONTAINER_SIZE / 2,
            }}>
                <FastImage source={props.icon}
                           style={{
                               width: ICON_SIZE,
                               height: ICON_SIZE,
                               margin: (ICON_CONTAINER_SIZE - ICON_SIZE) / 2,
                           }}
                           resizeMode={FastImage.resizeMode.contain}/>
            </View>
        }

        <TextInput ref={props.setRef}
                   {...props} style={[props.style, {
            fontSize: ICON_SIZE * 1.1,
            marginLeft: !!props.icon ? Theme.sizes.xTiny : 0,
            flex: 1,
        }]}/>
    </View>;

};

export default AuthInput;
