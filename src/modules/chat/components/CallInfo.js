import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import Feather from 'react-native-vector-icons/Feather'
import moment from 'moment';
import Theme from "../../../theme";
import { isEmpty, getImageFullURL, seconds2Time } from '../../../common/services/utility';
import { translate } from '../../../common/services/translate';

const CallInfo = ({ type = 'incoming', isVideoCall = false, timer, full_name, photo }) => {
    const _Timer = useRef(null);
    const [currentTime, setTime] = useState(0);
    useEffect(() => {
        if (type == 'audio-joined') {
            _Timer.current = setInterval(() => {
                setTime(pre => pre + 1);
            }, 1000)
        }

        return () => {
            if (_Timer.current) {
                console.log('audio-duration timer off')
                clearInterval(_Timer.current);
                _Timer.current = null;
            }
        }
    }, [type])

    return (
        <View style={[Theme.styles.col_center, styles.callInfoView]}>
            {
                type == 'incoming' &&
                <View style={[Theme.styles.row_center]}>
                    {isVideoCall ?
                        <Feather name="video" size={22} color={Theme.colors.gray6} /> :
                        <Feather name="phone" size={22} color={Theme.colors.gray6} />
                    }
                    <Text style={styles.callstatus}>{isVideoCall ? translate('video_call.incoming_video_call') : translate('video_call.incoming_audio_call')}</Text>
                </View>
            }
            {
                type == 'outgoing' &&
                <View style={[Theme.styles.row_center]}>
                    {isVideoCall ?
                        <Feather name="video" size={22} color={Theme.colors.gray6} /> :
                        <Feather name="phone" size={22} color={Theme.colors.gray6} />
                    }
                    <Text style={styles.callstatus}>{isVideoCall ? translate('video_call.outgoing_video_call') : translate('video_call.outgoing_audio_call')}</Text>
                </View>
            }
            {
                type == 'audio-joined' &&
                <Text style={styles.name}>{full_name}</Text>
            }
            <FastImage source={{ uri: getImageFullURL(photo) }}
                style={styles.avatarImg}
                resizeMode={FastImage.resizeMode.cover}
            />
            {
                type == 'audio-joined' ?
                    <Text style={styles.timer}>{seconds2Time(currentTime)}</Text>
                    :
                    <Text style={styles.name}>{full_name}</Text>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    callInfoView: {
        flex: 1, paddingBottom: 80,
    },
    callstatus: { marginLeft: 8, fontSize: 20, lineHeight: 24, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray6 },
    name: { fontSize: 20, fontFamily: Theme.fonts.bold, color: Theme.colors.white },
    avatarImg: { width: 144, height: 144, borderRadius: 72, marginVertical: 20, },
    timer: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray6 },
});

function arePropsEqual(prevProps, nextProps) {
    return (prevProps.type == nextProps.type &&
        prevProps.photo == nextProps.photo &&
        prevProps.full_name == nextProps.full_name
    );
}

export default React.memo(CallInfo, arePropsEqual); 
