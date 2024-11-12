import React from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import Theme from '../../../theme';
import alerts from '../../../common/services/alerts';
import RouteNames from '../../../routes/names';
import { extractErrorMessage, trimPhoneNumber, validateUserData } from '../../../common/services/utility';
import { facebookLogin, login, PHONE_NOT_VERIFIED, register, appleLogin } from '../../../store/actions/auth';
import { translate } from '../../../common/services/translate';
import AuthContainer from '../components/AuthContainer';
import AppText from '../../../common/components/AppText';
import ElevatedView from 'react-native-elevated-view';
import FastImage from 'react-native-fast-image';
import AuthInput from '../components/AuthInput';
import appleAuth, { AppleButton } from '@invertase/react-native-apple-authentication';
import styles from './styles';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import { getAddresses } from '../../../store/actions/app';
import Config from '../../../config';
import { getDefaultPhonePlaceholder } from '../../../common/services/user';
import { mixpanel } from '../../../AppRoot';

const windowWidth = Dimensions.get('window').width;

class RegisterScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            loadingFacebook: false,
            loading: false,
            full_name: '',
            email: '',
            phone: '',
            password: '',
            pass2: '',
        };
    }

    goBack = () => {
        this.props.navigation.goBack();
    };

    fbError = () => {
        this.setState({ loadingFacebook: false });
        alerts.error(translate('attention'), translate('accept_access'));
    };

    fbLogin = () => {
		mixpanel.track('User Registration', {method: 'facebook'})
        this.setState({ loadingFacebook: true });
        if (Config.isAndroid) {
            LoginManager.setLoginBehavior('web_only');
        }
        LoginManager.logInWithPermissions(['public_profile', 'email']).then((result) => {
            if (result.isCancelled) {
                this.fbError();
            } else {
                AccessToken.getCurrentAccessToken().then(async ({ accessToken }) => {
                    this.props.facebookLogin(accessToken.toString()).then(() => {
                        this.setState({ loadingFacebook: false });
                        this.props.getAddresses();
                        this.goBack();
                    }, (error) => {
                        if (error.code === PHONE_NOT_VERIFIED) {
                            const backRoute = this.props.navigation.getParam('backScreenView');
                            if (error.hasPhone) {
                                this.props.navigation.navigate(RouteNames.PhoneVerificationScreen, {
                                    backScreenView: backRoute,
                                });
                            } else {
                                this.props.navigation.navigate(RouteNames.EditPhoneScreen, {
                                    backScreenView: backRoute,
                                });
                            }
                        } else {
                            this.setState({ loadingFacebook: false });
                            alerts.error(translate('attention'), extractErrorMessage(error));
                        }
                    });
                });
            }
        }).catch(() => {
            this.fbError();
        });
    };

    register = () => {
        const { full_name, email, phone, password, pass2, loading } = this.state;
		mixpanel.track('User Registration', {method: 'simple'})
        validateUserData({ full_name, email, phone, password, pass2 }, true).then(async () => {
            if (!loading) {
                if (password.length < 6) {
                    alerts.error(translate('attention'), translate('account_change_pass.validate_cell_pass_min'));
                    return;
                }
                await this.setState({ loading: true });
                try {
                    await this.props.register({ full_name, email, phone: trimPhoneNumber(phone), password });
                    try {
                        await this.props.login({ email, password });
                    } catch (e) {
                    }
                    const backRoute = this.props.navigation.getParam('backScreenView');
                    this.props.navigation.replace(RouteNames.PhoneVerificationScreen, {
                        backScreenView: backRoute,
                    });
                } catch (e) {
                    alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(e));
                    this.setState({ loading: false });
                }
            }
        });
    };

    focusOn = input => {
        this[input].focus();
    };

    handleAppleLogin = (appleAuthRequestResponse) => {

        const { user, identityToken, email, fullName } = appleAuthRequestResponse;
        this.setState({ loading: true });

        this.props.appleLogin({ user, identityToken, email, fullName }).then(() => {
            this.setState({ loading: false });
            this.props.getAddresses();
            this.goBack();
			mixpanel.track('User Registration', {method: 'apple'})
        }, (error) => {

            if (error.code === PHONE_NOT_VERIFIED) {
                const backRoute = this.props.navigation.getParam('backScreenView');
                if (error.hasPhone) {
                    this.props.navigation.navigate(RouteNames.PhoneVerificationScreen, {
                        backScreenView: backRoute,
                    });

                } else {
                    this.props.navigation.navigate(RouteNames.EditPhoneScreen, {
                        backScreenView: backRoute,
                    });

                }

            } else {
                this.setState({ loading: false });
                alerts.error(translate('attention'), extractErrorMessage(error));
            }

        });

    };


    onAppleButtonPress = async () => {
        try {

            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME]
            });

            const { identityToken } = appleAuthRequestResponse;

            if (identityToken) {
                this.handleAppleLogin(appleAuthRequestResponse)
            } else {
                
            }

        } catch (error) {
            
        }

    };

    render() {
        const { loading, loadingFacebook } = this.state;
        return <AuthContainer onBackPress={this.goBack}>
            <SafeAreaView style={styles.container}>
                <View style={styles.centeredContainer}>
                    <AppText style={styles.headerTitle}>{translate('auth_register.header')}</AppText>
                    <ElevatedView elevation={1} style={[styles.mainContainer, {
                        alignItems: 'center',
                    }]}>
                        {/*START FORM CONTAINER*/}
                        <View style={{
                            width: windowWidth - (Theme.sizes.normal) - (2 * Theme.sizes.large),
                            paddingHorizontal: Theme.sizes.normal,
                        }}>
                            {/*START LOGO*/}
                            <View style={{ alignItems: 'center' }}>
                                <FastImage
                                    style={{
                                        width: '60%',
                                        height: 55,
                                        resizeMode: 'contain',
                                        marginVertical: 25,
                                    }}
                                    source={require('../../../common/assets/images/logo.png')}
                                    resizeMode={FastImage.resizeMode.contain} />
                            </View>
                            {/*END LOGO*/}
                            <AuthInput
                                icon={require('../../../common/assets/images/auth/auth_user_icon.png')}
                                placeholder={translate('account_details.full_name')}
                                returnKeyType={'next'}
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                onSubmitEditing={() => this.focusOn('email')}
                                underlineColorAndroid={'transparent'}
                                placeholderTextColor={'#DFDFDF'}
                                selectionColor={Theme.colors.cyan2}
                                onChangeText={full_name => this.setState({ full_name })}
                                value={this.state.full_name}
                            />
                            <AuthInput
                                icon={require('../../../common/assets/images/auth/auth_envelope_icon.png')}
                                placeholder={translate('account_details.email')}
                                setRef={(input) => {
                                    this.email = input;
                                }}
                                autoCorrect={false}
                                returnKeyType={'next'}
                                autoCapitalize={'none'}
                                onSubmitEditing={() => this.focusOn('phone')}
                                keyboardType={'email-address'}
                                underlineColorAndroid={'transparent'}
                                placeholderTextColor={'#DFDFDF'}
                                selectionColor={Theme.colors.cyan2}
                                onChangeText={email => this.setState({ email })}
                                value={this.state.email}
                            />
                            <AuthInput
                                icon={require('../../../common/assets/images/auth/auth_phone_icon.png')}
                                placeholder={translate(getDefaultPhonePlaceholder())}
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                setRef={(input) => {
                                    this.phone = input;
                                }}
                                returnKeyType={'next'}
                                autoCapitalize={'none'}
                                onSubmitEditing={() => this.focusOn('password')}
                                keyboardType={'phone-pad'}
                                placeholderTextColor={'#DFDFDF'}
                                selectionColor={Theme.colors.cyan2}
                                onChangeText={phone => this.setState({ phone })}
                                value={this.state.phone}
                            />
                            <AuthInput
                                icon={require('../../../common/assets/images/auth/auth_lock_icon.png')}
                                placeholder={translate('auth_register.password')}
                                underlineColorAndroid={'transparent'}
                                secureTextEntry={true}
                                setRef={(input) => {
                                    this.password = input;
                                }}
                                autoCapitalize={'none'}
                                placeholderTextColor={'#DFDFDF'}
                                onChangeText={password => this.setState({ password })}
                                onSubmitEditing={() => this.focusOn('pass2')}
                                returnKeyType={'next'}
                                value={this.state.password}
                            />
                            <AuthInput
                                icon={require('../../../common/assets/images/auth/auth_lock_icon.png')}
                                placeholder={translate('auth_register.password_again')}
                                setRef={(input) => {
                                    this.pass2 = input;
                                }}
                                returnKeyType={'done'}
                                autoCapitalize={'none'}
                                onSubmitEditing={() => this.register()}
                                underlineColorAndroid={'transparent'}
                                secureTextEntry={true}
                                placeholderTextColor={'#DFDFDF'}
                                onChangeText={pass2 => this.setState({ pass2 })}
                                value={this.state.pass2}
                            />
                            <TouchableOpacity
                                onPress={this.register}
                                disabled={loading}
                                style={styles.registerFormButton}>
                                {
                                    loading ? <ActivityIndicator
                                        style={styles.loginButtonText}
                                        size={Theme.sizes.normal}
                                        color={Theme.colors.whitePrimary} />
                                        :
                                        <AppText style={styles.loginButtonText}>
                                            {translate('auth_register.submit')}
                                        </AppText>
                                }
                            </TouchableOpacity>

                            {
                                (Platform.OS === 'android') ? null :
                                    <AppleButton
                                        buttonStyle={AppleButton.Style.WHITE}
                                        buttonType={AppleButton.Type.CONTINUE}
                                        style={styles.appleButtonRegister}
                                        onPress={() => this.onAppleButtonPress()}
                                    />

                            }
                        </View>
                        {/*END FORM CONTAINER*/}
                    </ElevatedView>
                    <View style={{ alignItems: 'center' }}>
                        <AppText style={styles.connectWith}>
                            {translate('auth_login.or_login_with')}
                        </AppText>

                        {
                            loadingFacebook ? <ActivityIndicator
                                style={styles.loginButtonText}
                                size={Theme.sizes.normal}
                                color={Theme.colors.primary} /> : <TouchableOpacity onPress={this.fbLogin}>
                                <FastImage
                                    resizeMode={FastImage.resizeMode.contain}
                                    style={{ width: 50, height: 50 }}
                                    source={require('../../../common/assets/images/auth/auth_facebook.png')} />
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </SafeAreaView>
        </AuthContainer>;
    }

}

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
        appleLogin
    },
)(withNavigation(RegisterScreen));

