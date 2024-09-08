import React, {memo} from 'react';
import {TouchableOpacity, StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';

const IconBorderButton = memo(({onPress, icon, showAlert}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <FastImage style={styles.icon} source={icon}/>
            {showAlert && <View style={styles.alert} />}
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        width: 45,
        height: 45,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E9E9F7',
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        height: 20
    },
    alert: {
        width: 10,
        height: 10,
        backgroundColor: '#F55A00',
        position: 'absolute',
        top: -5,
        right: -5,
        borderRadius: 10
    }
});

export default IconBorderButton;
