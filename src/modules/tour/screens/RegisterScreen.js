import React from 'react';
import { Keyboard, ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import AppText from '../../../common/components/AppText';
import MainBtn from '../../../common/components/buttons/main_button';
import AuthInput from '../../../common/components/AuthInput';
import RouteNames from '../../../routes/names';
import { facebookLogin, login, PHONE_NOT_VERIFIED, register, appleLogin, setAsLoggedIn } from '../../../store/actions/auth';
import { extractErrorMessage, trimPhoneNumber, validateUserData } from '../../../common/services/utility';
import { getAddresses } from '../../../store/actions/app';
import alerts from '../../../common/services/alerts';
import { getDefaultPhonePlaceholder } from '../../../common/services/user';


class RegisterScreen extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            loading: false,
            isKeyboadVisible: false,
            loadingFacebook: false,
            full_name: '',
            phone: '',
            email: '',
            password: '',
        };
    }

    state = {
        isKeyboadVisible: false,
        text: ""
    };

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener(
            "keyboardDidShow",
            this.keyboardDidShow
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            "keyboardDidHide",
            this._keyboardDidHide
        );
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    keyboardDidShow = () => {
        this.setState({
            isKeyboadVisible: true
        });
    };

    _keyboardDidHide = () => {
        this.setState({
            isKeyboadVisible: false
        });
    };

    next() {
        this.setState({
            nextScreen: true,
        });
    }

    onEmailDone = () => {
        this.passwordInput.focus();
    };

    goBack = () => {
        this.props.navigation.navigate(RouteNames.HomeScreen);
    };

    register = () => {
        const { full_name, phone, email, password } = this.state;
        let pass2 = password;
        validateUserData({ full_name, email, phone, password, pass2 }, true).then(async () => {
            if (!this.state.loading) {
                if (password.length < 6) {
                    alerts.error(translate('attention'), translate('account_change_pass.validate_cell_pass_min'));
                    return;
                }
                this.setState({ loading: true });
                try {
                    await this.props.register({ full_name, email, phone: trimPhoneNumber(phone), password });

                    await this.props.login({ email, password });
                    await this.props.getAddresses();
                    await this.props.setAsLoggedIn();

                } catch (e) {
                    
                    alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(e));
                    this.setState({ loading: false });
                }
            }
        });
    };

    render() {
        const { loading, loaded, loadingFacebook } = this.state;
        // if (!loaded) {
        //     return null;
        // }
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff', }}>
                <KeyboardAwareScrollView style={[{ flex: 1, width: '100%', padding: 20 }]} keyboardShouldPersistTaps='handled'>
                    <View style={[styles.formview]}>
                        <AppText style={[Theme.styles.headerTitle, styles.title]}>
                            {translate('create_account')}
                        </AppText>
                        <AuthInput
                            placeholder={translate('auth_register.full_name')}
                            underlineColorAndroid={'transparent'}
                            keyboardType={'default'}
                            placeholderTextColor={'#DFDFDF'}
                            selectionColor={Theme.colors.cyan2}
                            onChangeText={full_name => this.setState({ full_name })}
                            // onSubmitEditing={() => this.onEmailDone()}
                            returnKeyType={'next'}
                            autoCapitalize={'none'}
                            value={this.state.full_name}
                            secure={false}
                            style={{ marginBottom: 20 }}
                        />
                        <AuthInput
                            placeholder={translate(getDefaultPhonePlaceholder())}
                            underlineColorAndroid={'transparent'}
                            keyboardType={'phone-pad'}
                            placeholderTextColor={'#DFDFDF'}
                            selectionColor={Theme.colors.cyan2}
                            onChangeText={phone => this.setState({ phone })}
                            // onSubmitEditing={() => this.onEmailDone()}
                            returnKeyType={'next'}
                            autoCapitalize={'none'}
                            value={this.state.phone}
                            secure={false}
                            style={{ marginBottom: 20 }}
                        />
                        <AuthInput
                            placeholder={translate('auth_login.email_address')}
                            underlineColorAndroid={'transparent'}
                            keyboardType={'email-address'}
                            placeholderTextColor={'#DFDFDF'}
                            selectionColor={Theme.colors.cyan2}
                            onChangeText={email => this.setState({ email })}
                            // onSubmitEditing={() => this.onEmailDone()}
                            returnKeyType={'next'}
                            autoCapitalize={'none'}
                            value={this.state.email}
                            secure={false}
                            style={{ marginBottom: 20 }}
                        />
                        <AuthInput
                            placeholder={translate('auth_login.password')}
                            underlineColorAndroid={'transparent'}
                            setRef={(input) => {
                                this.passwordInput = input;
                            }}
                            autoCapitalize={'none'}
                            placeholderTextColor={'#DFDFDF'}
                            onChangeText={password => this.setState({ password })}
                            // onSubmitEditing={() => this.login()}
                            returnKeyType={'done'}
                            value={this.state.password}
                            secure={true}
                            style={{ marginBottom: 40 }}
                            setRef={ref => ref && ref.setNativeProps({ style: { fontFamily: 'Yellix-Medium' } })}
                        />
                        <MainBtn
                            disabled={loading}
                            loading={loading}
                            title={translate('create_account')}
                            onPress={() => this.register()}
                        />
                    </View>
                </KeyboardAwareScrollView>
                {
                    !this.state.isKeyboadVisible &&
                    <View style={[Theme.styles.row_center, styles.bottom]}>
                        <AppText style={styles.descTxt}>
                            Already registered?
                        </AppText>
                        <TouchableOpacity style={{ marginLeft: 6 }} onPress={() => {
                            this.props.navigation.navigate(RouteNames.LoginScreen)
                        }}>
                            <AppText style={styles.create_accountText}>
                                {translate('auth_login.login_button')}
                            </AppText>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    formview: { flex: 1, width: '100%', backgroundColor: '#ffffff', position: 'relative' },
    title: { marginTop: 80, marginBottom: 35, },
    descTxt: {
        color: Theme.colors.text,
        fontSize: 14,
        fontFamily: Theme.fonts.semiBold,
        marginVertical: Theme.sizes.xTiny,
    },
    create_accountText: {
        color: Theme.colors.btnPrimary,
        fontSize: 14,
        fontFamily: Theme.fonts.semiBold,
        marginVertical: Theme.sizes.xTiny,
    },
    bottom: { marginBottom: 40 }
})

const mapStateToProps = ({ app }) => ({
    user: app.user,
});

export default connect(
    mapStateToProps,
    {
        register,
        login,
        facebookLogin,
        getAddresses,
        setAsLoggedIn,
        appleLogin
    },
)(RegisterScreen);
