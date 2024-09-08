import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Theme from '../../../theme';
import AntIcon from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AppText } from '../../../common/components';
import Header1 from '../../../common/components/Header1';
import CheckIcon from '../../../common/assets/svgs/checkIcon.svg';
import { translate } from '../../../common/services/translate';
import { connect } from 'react-redux';
import { getLoggedInUser } from '../../../store/actions/auth';
import HumanVoiceIcon from '../../../common/assets/svgs/call/humanVoice.svg';
import Microphone3 from '../../../common/assets/svgs/microphone-3.svg';
import RouteNames from '../../../routes/names';
import AudioInputView from '../../chat/components/AudioInputView';

const VendorVoiceOrderScreen = (props) => {
    const navigation = useNavigation();
    const { vendorData } = props.route.params;
    const [isRecording, setRecording] = useState(false);

    return (
        <View style={styles.container}>
            <Header1
                style={styles.header}
                left={<AntIcon name='close' size={24} color={Theme.colors.gray7} />}
                onLeft={() => {
                    if (navigation.canGoBack()) navigation.goBack();
                }}
            />
            <KeyboardAwareScrollView style={[{ flex: 1, width: '100%' }]} keyboardShouldPersistTaps='handled'>
                <View style={[{ width: '100%', paddingHorizontal: 20, paddingBottom: 20 }]}>
                    <AppText style={[styles.logoTxt, { flex: 1 }]}>{vendorData.title}</AppText>
                    <AppText style={styles.voiceOrdering}>{translate('vendor_voice_order.voice_recording')}</AppText>
                    <View style={[Theme.styles.row_center, styles.descItem]}>
                        <CheckIcon />
                        <AppText style={styles.descTxt}>{translate('vendor_voice_order.item1Text')}</AppText>
                    </View>
                    <View style={[Theme.styles.row_center, styles.descItem, styles.top_bottom_border]}>
                        <CheckIcon />
                        <AppText style={styles.descTxt}>{translate('vendor_voice_order.item2Text')}</AppText>
                    </View>
                    <View style={[Theme.styles.row_center, styles.descItem]}>
                        <CheckIcon />
                        <AppText style={styles.descTxt}>{translate('vendor_voice_order.item3Text')}</AppText>
                    </View>
                    <View style={[Theme.styles.col_center, styles.faqBlock]}>
                        <TouchableOpacity
                            style={[Theme.styles.flex_between, styles.faqBtn]}
                            onPress={() => {
                                navigation.navigate(RouteNames.VendorVoiceFaqScreen);
                            }}
                        >
                            <AppText style={styles.faqBtnTxt}>{translate('vendor_voice_order.faq')}</AppText>
                            <Feather name='chevron-right' size={20} color={Theme.colors.text} />
                        </TouchableOpacity>
                        <AppText style={styles.faqDesc}>{translate('vendor_voice_order.info')}</AppText>
                    </View>
                    <AppText style={styles.exampleTxt}>{translate('vendor_voice_order.example')}</AppText>
                    <View style={[Theme.styles.col_center, styles.exampleBlock]}>
                        <TouchableOpacity style={[styles.exampleBtn]} onPress={() => {}}>
                            <HumanVoiceIcon />
                            <AppText style={styles.exampleBtnTxt}>
                                {translate('vendor_voice_order.example_info')}
                            </AppText>
                        </TouchableOpacity>
                    </View>
                    {!isRecording && (
                        <TouchableOpacity
                            onPress={() => {
                                setRecording(true);
                            }}
                            style={styles.microphoneBtn}
                        >
                            <Microphone3 />
                        </TouchableOpacity>
                    )}
                    {isRecording && (
                        <AudioInputView
                            onRemove={() => {
                                setRecording(false);
                            }}
                            onSend={() => {
                                setRecording(false);
                            }}
                        />
                    )}
                </View>
            </KeyboardAwareScrollView>
        </View>
    );
};

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: Theme.colors.white,
    },
    header: { height: 80, justifyContent: 'flex-end', marginBottom: 0, paddingHorizontal: 20 },
    logoTxt: { fontSize: 32, lineHeight: 38, fontFamily: Theme.fonts.bold, color: Theme.colors.black },
    voiceOrdering: { marginTop: 5, fontSize: 18, lineHeight: 22, color: '#3E4958', fontFamily: Theme.fonts.bold },
    descItem: { width: '100%', marginTop: 20 },
    descTxt: {
        flex: 1,
        marginLeft: 12,
        fontSize: 17,
        lineHeight: 22,
        fontFamily: Theme.fonts.medium,
        color: Theme.colors.black,
    },
    top_bottom_border: {
        borderTopWidth: 1,
        borderTopColor: '#cccccc',
        borderBottomColor: '#cccccc',
        borderBottomWidth: 1,
        paddingVertical: 16,
    },
    faqBlock: {
        paddingVertical: 20,
        width: '100%',
        borderBottomColor: '#cccccc',
        borderBottomWidth: 1,
    },
    faqBtn: {
        width: '100%',
        backgroundColor: Theme.colors.gray8,
        borderRadius: 12,
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    faqBtnTxt: { fontSize: 17, lineHeight: 20, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
    faqDesc: { marginTop: 20, fontSize: 16, lineHeight: 19, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7 },
    exampleTxt: {
        marginTop: 20,
        fontSize: 16,
        lineHeight: 19,
        fontFamily: Theme.fonts.medium,
        color: Theme.colors.gray1,
    },
    exampleBlock: {
        paddingTop: 12,
        width: '100%',
    },
    exampleBtn: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.primary,
        borderRadius: 12,
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    exampleBtnTxt: {
        flex: 1,
        fontSize: 17,
        lineHeight: 20,
        fontFamily: Theme.fonts.semiBold,
        color: Theme.colors.white,
        marginLeft: 12,
    },
    microphoneBtn: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

const mapStateToProps = ({ app }) => ({
    user: app.user || {},
    language: app.language,
    membershipSetting: app.membershipSetting || {},
});

export default connect(mapStateToProps, {
    getLoggedInUser,
})(VendorVoiceOrderScreen);
