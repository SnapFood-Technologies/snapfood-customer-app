import React from 'react';
import { ActivityIndicator, Dimensions, Keyboard, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AuthInput from '../../../common/components/AuthInput';
import Authpage from '../../../common/components/Authpage';
import MainBtn from "../../../common/components/buttons/main_button";
import { translate } from '../../../common/services/translate';
import RouteNames from '../../../routes/names';
import Theme from '../../../theme';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import { extractErrorMessage, isEmpty } from '../../../common/services/utility';
import { setHasVerifiedPhone } from '../../../store/actions/auth';
import styles from './styles';


class PhoneVerificationScreen extends React.Component {

    constructor(props) {
        super(props);

        this.props = props;
        this.state = {
            isKeyboadVisible: false,
            loadingResend: false,
            loadingCallme: false,
            loading: false,
            status: 'sms', //'call'
            code1: '',
            code2: '',
            code3: '',
            code4: '',
            code5: '',
            code6: ''
        };
    }

    componentDidMount() {
        if (this.props.user != null && isEmpty(this.props.user.phone)) {
            this.props.navigation.navigate(RouteNames.EditPhoneScreen);
        }
    }

    verify = async () => {
        const { code1, code2, code3, code4, code5, code6 } = this.state;
        await this.setState({ loading: true });
        apiFactory.post('verify-code', { code: code1 + code2 + code3 + code4 + code5 + code6 }).then(async () => {
            this.setState({ loading: false });
            await this.props.setHasVerifiedPhone(true);
        }, async error => {
            this.setState({
                loading: false,
                code1: '',
                code2: '',
                code3: '',
                code4: '',
                code5: '',
                code6: ''
            });
            alerts.error(translate('attention'), translate('phone_verification.wrong'));
        });
    };

    resend = async () => {
        const { user } = this.props;
        await this.setState({ loadingResend: true });
        apiFactory.post('send-verification-code', { phone: user.phone }).then(() => {
            this.setState({ loadingResend: false });
        }, error => {
            this.setState({ loadingResend: false });
            alerts.error(translate('attention'), extractErrorMessage(error));
        });
    };

    callme = () => {
        this.setState({
            status: 'call',
            code1: '',
            code2: '',
            code3: '',
            code4: '',
            code5: '',
            code6: ''
        })
    }
    textme = () => {
        this.setState({
            status: 'sms',
            code1: '',
            code2: '',
            code3: '',
            code4: '',
            code5: '',
            code6: ''
        })
    }

    changeNumber = () => {
        this.props.navigation.navigate(RouteNames.EditPhoneScreen);
    };

    render() {
        const { user } = this.props;
        const { loading, loadingResend, loadingCallme, status, } = this.state;

        return <Authpage onKeyboardDidShow={() => {
            this.setState({
                isKeyboadVisible: true
            });
        }}
            onKeyboardDidHide={() => {
                this.setState({
                    isKeyboadVisible: false
                });
            }}>
            <KeyboardAwareScrollView style={[{ width: '100%' }]} keyboardShouldPersistTaps='handled'>
                <View style={[{ width: '100%', alignItems: 'center', flex: 1, paddingHorizontal: 20, marginTop: 30 }]}>
                    <Text style={Theme.styles.headerTitle}>{translate('phone_verification.header')}</Text>
                    <Text style={[Theme.styles.locationDescription, { marginTop: 18, lineHeight: 20, }]}>
                        {status == 'sms' ? translate('phone_verification.text') : translate('phone_verification.calltext')}
                        <TouchableOpacity onPress={this.changeNumber}>
                            <Text style={styles.phoneNumber}>{user.phone}</Text>
                        </TouchableOpacity>
                    </Text>
                    <View style={[Theme.styles.row_center, { width: '100%', marginTop: 30, justifyContent: 'space-between', }]}>
                        {
                            [1, 2, 3, 4, 5, 6].map(item =>
                                <AuthInput
                                    key={item}
                                    setRef={(input) => {
                                        if (item == 1) {
                                            this.code1 = input
                                        }
                                        else if (item == 2) {
                                            this.code2 = input
                                        }
                                        else if (item == 3) {
                                            this.code3 = input
                                        }
                                        else if (item == 4) {
                                            this.code4 = input
                                        }
                                        else if (item == 5) {
                                            this.code5 = input
                                        }
                                        else if (item == 6) {
                                            this.code6 = input
                                        }
                                    }}
                                    underlineColorAndroid={'transparent'}
                                    keyboardType={'phone-pad'}
                                    selectionColor={Theme.colors.cyan2}
                                    onChangeText={code => {
                                        if (item == 1) {
                                            if (code.length <= 1) {
                                                this.setState({ code1: code })
                                            }
                                            if (code.length >= 1) {
                                                if (this.code2 != null) {
                                                    this.code2.focus()
                                                }
                                            }
                                        }
                                        else if (item == 2) {
                                            if (code.length <= 1) {
                                                this.setState({ code2: code })
                                            }
                                            if (code.length >= 1) {
                                                if (this.code3 != null) {
                                                    this.code3.focus()
                                                }
                                            }
                                        }
                                        else if (item == 3) {
                                            if (code.length <= 1) {
                                                this.setState({ code3: code })
                                            }
                                            if (code.length >= 1) {
                                                if (this.code4 != null) {
                                                    this.code4.focus()
                                                }
                                            }
                                        }
                                        else if (item == 4) {
                                            if (code.length <= 1) {
                                                this.setState({ code4: code })
                                            }
                                            if (code.length >= 1) {
                                                if (this.code5 != null) {
                                                    this.code5.focus()
                                                }
                                            }
                                        }
                                        else if (item == 5) {
                                            if (code.length <= 1) {
                                                this.setState({ code5: code })
                                            }
                                            if (code.length >= 1) {
                                                if (this.code6 != null) {
                                                    this.code6.focus()
                                                }
                                            }
                                        }
                                        else if (item == 6) {
                                            if (code.length <= 1) {
                                                this.setState({ code6: code })
                                            }
                                            if (code.length >= 1) {
                                                Keyboard.dismiss()
                                            }
                                        }
                                    }}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (item == 6) {
                                            if (nativeEvent.key === 'Backspace') {
                                                if (this.code5 != null) {
                                                    this.code5.focus()
                                                }
                                            }
                                        }
                                        if (item == 5) {
                                            if (nativeEvent.key === 'Backspace') {
                                                if (this.code4 != null) {
                                                    this.code4.focus()
                                                }
                                            }
                                        }
                                        if (item == 4) {
                                            if (nativeEvent.key === 'Backspace') {
                                                if (this.code3 != null) {
                                                    this.code3.focus()
                                                }
                                            }
                                        }
                                        if (item == 3) {
                                            if (nativeEvent.key === 'Backspace') {
                                                if (this.code2 != null) {
                                                    this.code2.focus()
                                                }
                                            }
                                        }
                                        if (item == 2) {
                                            if (nativeEvent.key === 'Backspace') {
                                                if (this.code1 != null) {
                                                    this.code1.focus()
                                                }
                                            }
                                        }
                                    }}
                                    returnKeyType={'next'}
                                    autoCapitalize={'none'}
                                    style={{ width: 55, height: 60, }}
                                    textAlign='center'
                                    fontSize={22}
                                    fontFamily={Theme.fonts.bold}
                                    value={this.state['code' + item]}
                                />
                            )
                        }
                    </View>
                    <MainBtn
                        title={translate('phone_verification.button')}
                        loading={loading}
                        style={{ width: '100%', marginTop: 50, }}
                        onPress={this.verify}
                    />
                </View>

                {/* <TouchableOpacity disabled={loadingCallme} style={{ marginTop: 30 }} onPress={status == 'sms' ? this.callme : this.textme}>
                    {
                        loadingCallme ? <ActivityIndicator
                            style={styles.registerButtonText}
                            size={Theme.sizes.normal}
                            color={Theme.colors.cyan2} />
                            :
                            <Text style={styles.callmeTxt}>{status == 'sms' ? 'Call Me Instead' : 'Text Me Instead'}</Text>
                    }
                </TouchableOpacity> */}
            </KeyboardAwareScrollView>
            <View style={[Theme.styles.row_center, { marginBottom: 40 }]}>
                <Text style={styles.callmeTxt}>
                    {status == 'sms' ? translate('phone_verification.not_received') : translate('phone_verification.not_called')}
                </Text>
                <TouchableOpacity
                    disabled={loadingResend}
                    onPress={this.resend}>
                    {
                        loadingResend ? <ActivityIndicator
                            style={styles.registerButtonText}
                            size={Theme.sizes.normal}
                            color={Theme.colors.cyan2} />
                            :
                            <Text style={styles.resendText}>
                                {status == 'sms' ? translate('phone_verification.resend') : translate('phone_verification.recall')}
                            </Text>
                    }
                </TouchableOpacity>
            </View>
        </Authpage >
    }
}

function mapStateToProps({ app }) {
    return {
        user: app.user,
    };
}

export default connect(mapStateToProps, {
    setHasVerifiedPhone,
})(withNavigation(PhoneVerificationScreen));
