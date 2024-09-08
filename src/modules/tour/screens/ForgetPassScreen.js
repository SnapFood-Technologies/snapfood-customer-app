import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { translate } from '../../../common/services/translate';
import { validateEmailAddress } from '../../../common/services/utility';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import Theme from '../../../theme';
import AppText from '../../../common/components/AppText';
import MainBtn from '../../../common/components/buttons/main_button';
import AuthInput from '../../../common/components/AuthInput';
import Authpage from '../../../common/components/Authpage';
import RouteNames from '../../../routes/names';
// svgs
import Svg_forgotpass from '../../../common/assets/svgs/auth/forgot_pass.svg';

class ForgetPassScreen extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            isKeyboadVisible: false,
            email: '',
        };
    }

    onForgotPass = () => {
        if (validateEmailAddress(this.state.email)) {
            apiFactory.post('forgot-password', { email: this.state.email })
                .then(({ data }) => {
                    console.log('onForgotPass', data)
                    if (data != null && data.success == true) {
                        this.props.navigation.navigate(RouteNames.ResetPassScreen, { email: this.state.email });
                    }
                    else if (data != null && data.message != null) {
                        alerts.error('Error', data.message);
                    }
                    else {
                        alerts.error('Error', 'Something went wrong!');
                    }
                })
                .catch((error) => {
                    if (error != null && error.message != null) {
                        alerts.error('Error', error.message);
                    }
                    console.log('onForgotPass error', error)
                })
        }
    }

    render() {
        const { loading, } = this.state;

        return (
            <Authpage onKeyboardDidShow={() => {
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
                    <View style={[styles.formview]}>
                        <View style={[Theme.styles.col_center, { marginTop: 22 },]}>
                            <Svg_forgotpass />
                        </View>
                        <AppText style={[Theme.styles.headerTitle, styles.title]}>
                            {translate('auth_forgot_pass.header_title')}
                        </AppText>
                        <AppText style={[Theme.styles.description, styles.description]}>
                            {translate('auth_forgot_pass.header_desc')}
                        </AppText>
                        <AuthInput
                            placeholder={translate('auth_login.email_address')}
                            underlineColorAndroid={'transparent'}
                            keyboardType={'email-address'}
                            placeholderTextColor={Theme.colors.gray5}
                            onChangeText={email => this.setState({ email })}
                            returnKeyType={'next'}
                            autoCapitalize={'none'}
                            value={this.state.email}
                            secure={false}
                            style={{ marginBottom: 40 }}
                        />
                        <MainBtn
                            disabled={loading}
                            loading={loading}
                            title={translate('confirm')}
                            onPress={this.onForgotPass}
                        />
                    </View>
                </KeyboardAwareScrollView>
                {
                    !this.state.isKeyboadVisible && <View style={[Theme.styles.row_center, {marginBottom: 40}]}>
                        <TouchableOpacity style={Theme.styles.row_center} onPress={() => {
                            this.props.navigation.goBack();
                        }}>
                            <AppText style={styles.cancelText}>
                                {translate('cancel')}
                            </AppText>
                        </TouchableOpacity>
                    </View>
                }
            </Authpage>
        );
    }
}

const styles = StyleSheet.create({
    formview: { flex: 1, width: '100%', paddingHorizontal: 20, position: 'relative' },
    title: { marginTop: 20, marginBottom: 17, },
    description: { marginBottom: 25, textAlign: 'center' },
    cancelText: {
        color: Theme.colors.text,
        fontSize: 14,
        fontFamily: Theme.fonts.semiBold,
        marginVertical: Theme.sizes.xTiny,
    }
})
export default ForgetPassScreen;
