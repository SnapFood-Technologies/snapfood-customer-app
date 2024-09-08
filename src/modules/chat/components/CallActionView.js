import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Theme from "../../../theme";
import Svg_acceptcall from '../../../common/assets/svgs/call/accept_call.svg';
import Svg_endcall from '../../../common/assets/svgs/call/end_call.svg';

const CallActionView = ({
    type = 'incoming',
    isCameraRear = false,
    isMuted = false,
    isVideoOff = false,
    isSpeakerOn = false,
    style,
    acceptCall = () => { },
    endCall = () => { },
    onMute = () => { },
    onSpeakerOff = () => { },
    onVideoOff = () => { },
    onChangeCamera = () => { },
}) => {
    if (type == 'incoming') {
        return (
            <View style={[Theme.styles.row_center, styles.container, style]}>
                <TouchableOpacity onPress={endCall}>
                    <Svg_endcall />
                </TouchableOpacity>
                <View style={{ width: 20 }} />
                <TouchableOpacity onPress={acceptCall}>
                    <Svg_acceptcall />
                </TouchableOpacity>
            </View>
        );
    }
    else if (type == 'outgoing') {
        return (
            <View style={[Theme.styles.row_center, styles.container, style]}>
                <TouchableOpacity style={{ width: 75, height: 75 }} onPress={endCall}>
                    <Svg_endcall />
                </TouchableOpacity>
            </View>
        );
    }
    else if (type == 'audio-joined') {
        return (
            <View style={[Theme.styles.row_center, styles.container, style]}>
                <TouchableOpacity style={[Theme.styles.col_center, styles.cameraBtn]} onPress={onMute}>
                    <MaterialCommunityIcons
                        name={isMuted ? 'microphone-off' : 'microphone'}
                        size={24}
                        color={Theme.colors.white}
                    />
                </TouchableOpacity>
                <View style={{ width: 20 }} />
                <TouchableOpacity style={[Theme.styles.col_center, styles.cameraBtn]} onPress={onSpeakerOff}>
                    <SimpleLineIcons
                        name={isSpeakerOn ? 'volume-2' : 'volume-off'}
                        size={24}
                        color={Theme.colors.white}
                    />
                </TouchableOpacity>
                <View style={{ width: 20 }} />
                <TouchableOpacity onPress={endCall}>
                    <Svg_endcall width={60} height={60} />
                </TouchableOpacity>
            </View>
        );
    }
    return (
        <View style={[Theme.styles.row_center, styles.container, style]}>
            <TouchableOpacity style={[Theme.styles.col_center, styles.cameraBtn]} onPress={onMute}>
                <MaterialCommunityIcons
                    name={isMuted ? 'microphone-off' : 'microphone'}
                    size={24}
                    color={Theme.colors.white}
                />
            </TouchableOpacity>
            <View style={{ width: 20 }} />
            <TouchableOpacity style={[Theme.styles.col_center, styles.cameraBtn]} onPress={onVideoOff}>
                <MaterialIcons
                    name={isVideoOff ? 'videocam-off' : 'videocam'}
                    size={24}
                    color={Theme.colors.white}
                />
            </TouchableOpacity>
            <View style={{ width: 20 }} />
            <TouchableOpacity style={[Theme.styles.col_center, styles.cameraBtn]} onPress={onChangeCamera}>
                <MaterialIcons
                    name={isCameraRear ? 'camera-rear' : 'camera-front'}
                    size={24}
                    color={Theme.colors.white}
                />
            </TouchableOpacity>
            <View style={{ width: 20 }} />
            <TouchableOpacity onPress={endCall}>
                <Svg_endcall width={60} height={60} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 30,
        marginBottom: 40,
    },
    cameraBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Theme.colors.cyan2
    }
});

export default CallActionView; 
