import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Platform, TextInput } from 'react-native';
import { height, width } from 'react-native-dimension';
import { connect } from 'react-redux';
import Header from '../../../common/components/Header1';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RoundIconBtn from '../../../common/components/buttons/round_icon_button'
import Modal from 'react-native-modal';
import { RNCamera } from 'react-native-camera';
import Theme from '../../../theme';
import RouteNames from '../../../routes/names';
import { setOpenStoryImgPickModal } from '../../../store/actions/chat';
import { AppText } from '../../../common/components';
import { translate } from '../../../common/services/translate';

const MAX_DURATION = 15; // 15 seconds
const CameraScreen = (props) => {
    const _timer = useRef(null);
    const _camera = useRef(null);
    const _video = useRef(null);
    const _codec = useRef(null);
    const _sendResult = useRef(true);

    const _btnReleased = useRef(true);
    const _isRecording = useRef(false);

    const [selfiemode, setSelfiemode] = useState(false);
    const [recording, setRecording] = useState(false);
    const [time, setTime] = useState(0);

    const startTimeTick = () => {
        setTime(0);
        setRecording(true);
        _timer.current = setInterval(() => {
            if (time > MAX_DURATION) {
                stopRecording();
            } else {
                setTime(t => t + 1)
            }
        }, 1000);
    }

    const startRecording = async () => {
        try {
            if (_camera.current) {
                _isRecording.current = true;
                setTimeout(() => {
                    startTimeTick();
                }, 600)
                // default to mp4 for android as codec is not set
                const { uri, codec = "mp4" } = await _camera.current.recordAsync({
                    maxDuration: MAX_DURATION,
                    orientation: 'portrait',
                    // maxFileSize: 10 * 1024 * 1024 // 10MB,
                    quality: RNCamera.Constants.VideoQuality['720p']
                });
                _video.current = uri;
                _codec.current = codec;

                if (_video.current && _sendResult.current) {
                    let fileName = _video.current.substring(_video.current.lastIndexOf('/') + 1);
                    let file = {
                        fileName: fileName,
                        uri: _video.current,
                        type: "video/*",
                    };
                    props.navigation.goBack();
                    props.navigation.navigate(RouteNames.StoryPreviewScreen, { videoData: file, isImage: false });
                }
            }
        } catch (error) {

        }
    }

    const stopRecording = () => {
        try {
            if (_timer.current) clearInterval(_timer.current);
            _isRecording.current = false;
            setRecording(false);
            if (_camera.current) _camera.current.stopRecording();
        } catch (error) {
        }
    }

    const onTakePhoto = async () => {
        if (_camera.current) {
            const options = { quality: 1, base64: true, skipProcessing: true };
            let data = await _camera.current.takePictureAsync(options);
            data = {
                ...data,
                data: data.base64,
                path: data.uri
            }
            props.navigation.goBack();
            props.navigation.navigate(RouteNames.StoryPreviewScreen, { imageData: data, isImage: true, isCaptured: true });
        }
    }

    const onClose = () => {
        _sendResult.current = false;
        stopRecording();
        props.navigation.goBack();
        props.setOpenStoryImgPickModal(true);
    }

    return (
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <View style={[Theme.styles.col_center, { flex: 1, width: '100%' }]}>
                <RNCamera
                    ref={_camera}
                    style={styles.camera}
                    type={selfiemode ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back}
                    ratio={'16:9'}
                    androidCameraPermissionOptions={{
                        title: 'Permission to use camera',
                        message: 'We need your permission to use your camera',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                    androidRecordAudioPermissionOptions={{
                        title: 'Permission to use audio recording',
                        message: 'We need your permission to use your audio',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                />

                <View
                    style={[Theme.styles.col_center, styles.bottom]}
                >
                    {
                        recording && <AppText style={styles.elapsedTm}>{time}s</AppText>
                    }
                    <TouchableOpacity
                        style={[Theme.styles.col_center]}
                        onPressIn={() => {
                            _btnReleased.current = false;
                            setTimeout(() => {
                                if (_btnReleased.current == false) {
                                    startRecording();
                                }
                            }, 800);
                        }}
                        onPressOut={() => {
                            _btnReleased.current = true;
                            if (_isRecording.current) {
                                stopRecording();
                            }
                            else {
                                onTakePhoto();
                            }
                        }}
                    >
                        <View style={styles.startBtn} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={[Theme.styles.col_center, styles.bottomView]}>
                <Text style={{fontSize: 20, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white}}>{translate('STORY')}</Text>
            </View>
            <Header
                left={
                    <RoundIconBtn style={{ width: 40, height: 40, backgroundColor: '#fff', borderRadius: 10 }}
                        icon={
                            <AntDesign
                                name="arrowleft"
                                color={Theme.colors.gray1}
                                size={16}
                            />
                        }
                        onPress={onClose}
                    />
                }
                right={
                    recording == false ? (
                        <TouchableOpacity
                            onPress={() => {
                                setSelfiemode(pre => !pre)
                            }}
                            style={[Theme.styles.col_center, styles.modeBtn]}
                        >
                            <MaterialIcons name={selfiemode ? 'camera-rear' : 'camera-front'} size={24} color='#fff' />
                        </TouchableOpacity>
                    )
                        : null}
                style={styles.header}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    modalContent: { width: '100%', height: '100%', backgroundColor: Theme.colors.white, borderRadius: 8, },
    header: { position: 'absolute', top: 20, left: 0, paddingHorizontal: 20, width: '100%', justifyContent: 'flex-end' },
    camera: { flex: 1, height: '100%', width: '100%' },
    modeBtn: { width: 46, height: 46, borderRadius: 24, backgroundColor: Theme.colors.cyan2 },
    bottom: { position: 'absolute', bottom: 40, left: 0, width: width(100), paddingHorizontal: 40 },
    startBtn: { width: 64, height: 64, borderRadius: 32, borderWidth: 6, borderColor: Theme.colors.gray9, backgroundColor: Theme.colors.cyan2 },
    elapsedTm: { marginBottom: 20, fontSize: 15, fontFamily: Theme.fonts.medium, color: Theme.colors.white },
    bottomView: { width: '100%', height: 80, backgroundColor: '#000' }
});


const mapStateToProps = ({ app, chat }) => ({
    isLoggedIn: app.isLoggedIn,
    language: app.language,
    user: app.user,
});

export default connect(
    mapStateToProps,
    {
        setOpenStoryImgPickModal
    },
)(CameraScreen);
