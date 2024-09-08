import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Platform, TextInput } from 'react-native';
import { height, width } from 'react-native-dimension';
import { connect } from 'react-redux';
import Header from '../../../common/components/Header1';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RoundIconBtn from '../../../common/components/buttons/round_icon_button'
import { RNCamera } from 'react-native-camera';
import Theme from '../../../theme';
import RouteNames from '../../../routes/names';
import { setOpenStoryImgPickModal } from '../../../store/actions/chat';
import { AppText } from '../../../common/components';
import { translate } from '../../../common/services/translate';
import { getSearchParamFromURL, isEmpty } from '../../../common/services/utility';

const ScanQRcodeScreen = (props) => {
    const _camera = useRef(null);
    return (
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <View style={[Theme.styles.col_center, { flex: 1, width: '100%' }]}>
                <RNCamera
                    ref={_camera}
                    style={styles.camera}
                    type={RNCamera.Constants.Type.back}
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
                    onBarCodeRead={({ data }) => {
                        console.log('onBarCodeRead ', data)
                        if (data != null) {
                            const couponCode = getSearchParamFromURL(data, 'couponCode');
                            if (!isEmpty(couponCode)) {
                                props.navigation.navigate(props.route.params.backRoute, { promo_code: couponCode });
                            }
                        }
                    }}
                />
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
                        onPress={() => {
                            props.navigation.goBack();
                        }}
                    />
                }
                style={styles.header}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    modalContent: { width: '100%', height: '100%', backgroundColor: Theme.colors.white, },
    header: { position: 'absolute', top: 20, left: 0, paddingHorizontal: 20, width: '100%', justifyContent: 'flex-end' },
    camera: { flex: 1, height: '100%', width: '100%' },
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
)(ScanQRcodeScreen);
