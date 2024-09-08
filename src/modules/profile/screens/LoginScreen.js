import React from 'react';
import {ActivityIndicator, Dimensions, SafeAreaView, TouchableOpacity, View} from 'react-native';
import {withNavigation} from 'react-navigation';
import {connect} from 'react-redux';
import AppText from '../../../common/components/AppText';
import {extractErrorMessage, openExternalUrl} from '../../../common/services/utility';
import alerts from '../../../common/services/alerts';
import {facebookLogin, login, PHONE_NOT_VERIFIED, appleLogin} from '../../../store/actions/auth';
import RouteNames from '../../../routes/names'; 
import {getAddresses} from '../../../store/actions/app';
import {translate} from '../../../common/services/translate';
import {AccessToken, LoginManager} from 'react-native-fbsdk';
import appleAuth, { AppleButton } from '@invertase/react-native-apple-authentication';
import styles from './styles';
import AuthContainer from '../components/AuthContainer';
import AuthInput from '../components/AuthInput';
import FastImage from 'react-native-fast-image';
import Theme from '../../../theme';
import ElevatedView from 'react-native-elevated-view';
import Config from '../../../config';

const windowWidth = Dimensions.get('window').width;

class Login extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            loaded: false,
            loading: false,
            loadingFacebook: false,
            email: '',
            password: '',
        };
    }

    componentDidMount () { 
    }

    componentWillUnmount () {
        this.focusListener.remove();
    }
 
    goBack = () => {
        this.props.navigation.navigate(RouteNames.HomeScreen);
    };

    login = async () => {
        const {email, password} = this.state;
        await this.setState({loading: true});
        try {
            const backRoute = this.props.navigation.getParam('backScreenView');
            await this.props.login({email, password}).then(() => { 
                this.props.getAddresses();
                if (backRoute) {
                    this.props.navigation.navigate(backRoute);
                } else {
                    this.props.navigation.replace(RouteNames.ProfileScreen);
                }
            }, e => {
                if (e.code === PHONE_NOT_VERIFIED) {
                    this.props.navigation.replace(RouteNames.PhoneVerificationScreen, {
                        backScreenView: backRoute,
                    });
                } else {
                    alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(e));
                    this.setState({loading: false});
                }
            });
        } catch (e) {
            alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(e));
            await this.setState({loading: false});
        }
    };

    _openForgetPassword = () => {
        openExternalUrl('https://snapfood.al/auth/login');
    };

    fbError = () => {
        this.setState({loadingFacebook: false});
        alerts.error(translate('attention'), translate('accept_access'));
    };

    fbLogin = () => {
        this.setState({loadingFacebook: true});
        if (Config.isAndroid) {
            LoginManager.setLoginBehavior('web_only');
        }
        LoginManager.logInWithPermissions(['public_profile', 'email']).then((result) => {
            if (result.isCancelled) {
                this.fbError();
            } else {
                const backRoute = this.props.navigation.getParam('backScreenView');
                AccessToken.getCurrentAccessToken().then(async ({accessToken}) => {
                    this.props.facebookLogin(accessToken.toString()).then(() => {
                        this.setState({loadingFacebook: false}); 
                        this.props.getAddresses();
                        if (backRoute) {
                            this.props.navigation.navigate(backRoute);
                        } else {
                            this.props.navigation.replace(RouteNames.ProfileScreen);
                        }
                    }, (error) => {
                        if (error.code === PHONE_NOT_VERIFIED) {
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
                            this.setState({loadingFacebook: false});
                            alerts.error(translate('attention'), extractErrorMessage(error));
                        }
                    });
                });
            }
        }).catch(() => {
            this.fbError();
        });
    };

    goToRegister = () => {
        const backRoute = this.props.navigation.getParam('backScreenView');
        this.props.navigation.navigate(RouteNames.RegisterScreen, {
            backScreenView: backRoute,
        });
    };

    onEmailDone = () => {
        this.passwordInput.focus();
    };

    handleAppleLogin = async(appleAuthRequestResponse) => {

        const {user, identityToken, email, fullName} = appleAuthRequestResponse;
        await this.setState({loading: true});

        try {
            const backRoute = this.props.navigation.getParam('backScreenView');

            await this.props.appleLogin({user, identityToken, email, fullName}).then(() => {
                this.setState({loading: false}); 
                this.props.getAddresses();

                if (backRoute) {
                    this.props.navigation.navigate(backRoute);

                } else {
                    this.props.navigation.replace(RouteNames.ProfileScreen);
                }

            }, (error) => {

                if (error.code === PHONE_NOT_VERIFIED) {

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
                    this.setState({loading: false});
                    alerts.error(translate('attention'), extractErrorMessage(error));

                }

            });

        } catch (e) {

            alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(e));
            await this.setState({loading: false});

        }

    };

    onAppleButtonPress = async () => {

        try {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME]
            });

            const {identityToken} = appleAuthRequestResponse;

            if (identityToken) {
                this.handleAppleLogin(appleAuthRequestResponse)
            } else {
                console.log("invalid apple identity token")
            }

        } catch (error) {
            console.log(error)
        }
    };

    render () {
        const {loading, loaded, loadingFacebook} = this.state;
        if (!loaded) {
            return null;
        }
        return <AuthContainer onBackPress={this.goBack}>
            <SafeAreaView style={styles.container}>
                <View style={styles.centeredContainer}>
                    <AppText style={styles.headerTitle}>{translate('auth_login.header')}</AppText>
                    <ElevatedView elevation={1} style={[styles.mainContainer, {
                        alignItems: 'center',
                    }]}>
                        {/*START FORM CONTAINER*/}
                        <View style={{
                            width: windowWidth - (Theme.sizes.normal) - (2 * Theme.sizes.large),
                            paddingHorizontal: Theme.sizes.normal,
                        }}>
                            {/*START LOGO*/}
                            <View style={{alignItems: 'center'}}>
                                <FastImage
                                    style={{
                                        width: '60%',
                                        height: 55,
                                        resizeMode: 'contain',
                                        marginVertical: 25,
                                    }}
                                    source={require('../../../common/assets/images/logo.png')}
                                    resizeMode={FastImage.resizeMode.contain}/>
                            </View>
                            {/*END LOGO*/}
                            <AuthInput
                                icon={require('../../../common/assets/images/auth/auth_envelope_icon.png')}
                                placeholder={translate('auth_login.email')}
                                underlineColorAndroid={'transparent'}
                                keyboardType={'email-address'}
                                placeholderTextColor={'#DFDFDF'}
                                selectionColor={Theme.colors.cyan2}
                                onChangeText={email => this.setState({email})}
                                onSubmitEditing={() => this.onEmailDone()}
                                returnKeyType={'next'}
                                autoCapitalize={'none'}
                                value={this.state.email}
                            />
                            <AuthInput
                                icon={require('../../../common/assets/images/auth/auth_lock_icon.png')}
                                placeholder={translate('auth_login.password')}
                                underlineColorAndroid={'transparent'}
                                secureTextEntry={true}
                                setRef={(input) => {
                                    this.passwordInput = input;
                                }}
                                autoCapitalize={'none'}
                                placeholderTextColor={'#DFDFDF'}
                                onChangeText={password => this.setState({password})}
                                onSubmitEditing={() => this.login()}
                                returnKeyType={'done'}
                                value={this.state.password}
                            />
                            <TouchableOpacity onPress={this._openForgetPassword}>
                                <AppText style={styles.forgotPasswordText}>
                                    {translate('auth_login.forgot_your_password')}
                                </AppText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={this.login}
                                disabled={loading}
                                style={styles.loginButton}>
                                {
                                    loading ? <ActivityIndicator
                                            style={styles.loginButtonText}
                                            size={Theme.sizes.normal}
                                            color={Theme.colors.whitePrimary}/>
                                        :
                                        <AppText style={styles.loginButtonText}>
                                            {translate('auth_login.login_button')}
                                        </AppText>
                                }
                            </TouchableOpacity>

                            {
                                (Platform.OS === 'android') ? null :
                                  <AppleButton
                                      buttonStyle = {AppleButton.Style.WHITE}
                                      buttonType = {AppleButton.Type.CONTINUE}
                                      style = {styles.appleButton}
                                      onPress = {() => this.onAppleButtonPress()}
                                  />

                            }
                            <View style={{alignItems: 'center'}}>
                                <AppText style={styles.registerText}>
                                    {translate('auth_login.no_account')}
                                </AppText>

                                <TouchableOpacity style={styles.registerButton} onPress={this.goToRegister}>
                                    <AppText style={styles.registerButtonText}>
                                        {translate('auth_login.register')}
                                    </AppText>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/*END FORM CONTAINER*/}

                    </ElevatedView>
                    <View style={{alignItems: 'center'}}>
                        <AppText style={styles.connectWith}>
                            {translate('auth_login.or_login_with')}
                        </AppText>

                        {
                            loadingFacebook ? <ActivityIndicator
                                style={styles.loginButtonText}
                                size={Theme.sizes.normal}
                                color={Theme.colors.primary}/> : <TouchableOpacity onPress={this.fbLogin}>
                                <FastImage
                                    resizeMode={FastImage.resizeMode.contain}
                                    style={{width: 50, height: 50}}
                                    source={require('../../../common/assets/images/auth/auth_facebook.png')}/>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </SafeAreaView>
        </AuthContainer>;
    }
}

function mapStateToProps ({app}) {
    return {
        user: app.user,
        hasVerifiedPhone: app.hasVerifiedPhone,
    };
}

export default connect(mapStateToProps, {
    login, 
    getAddresses,
    facebookLogin,
    appleLogin
})(withNavigation(Login));
