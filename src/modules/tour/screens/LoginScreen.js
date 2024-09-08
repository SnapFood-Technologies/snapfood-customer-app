import React from 'react';
import { Image, ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { extractErrorMessage, trimPhoneNumber, validateUserData } from '../../../common/services/utility';
import { translate } from '../../../common/services/translate';
import { setAsLoggedIn, login, register, getLoggedInUser, PHONE_NOT_VERIFIED, setUserNeedLogin, updateProfileDetails } from '../../../store/actions/auth';
import { getAddresses, setAddress, addDefaultAddress, setShowChangeCityModal, checkLocationDiff } from '../../../store/actions/app';
import { getDefaultPhonePlaceholder, loadUserSetting } from '../../../common/services/user';
import alerts from '../../../common/services/alerts';
import { isEmpty, validateEmailAddress, openExternalUrl } from '../../../common/services/utility';
import Theme from '../../../theme';
import Header1 from '../../../common/components/Header1';
import SwitchTab from '../../../common/components/SwitchTab';
import AppText from '../../../common/components/AppText';
import MainBtn from '../../../common/components/buttons/main_button';
import AuthInput from '../../../common/components/AuthInput';
import Authpage from '../../../common/components/Authpage';
import AppTooltip from '../../../common/components/AppTooltip';
import CheckBox from '../../../common/components/buttons/checkbox';

const tabs = ['Login', 'Register']
class LoginScreen extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            hasRefferalCode: false,
            isKeyboadVisible: false,
            loadingFacebook: false,
            refferalCode: '',
            hasLinkedRefferal: false,
            email: '',
            password: '',
            curTab: props.route.params != null ? (props.route.params.page || 'Login') : 'Login',
            backRoute: props.route.params != null ? props.route.params.backRoute : null
        };
    }

    componentDidMount() {
        if (!isEmpty(this.props.refferalCode) && this.props.systemSettings?.enable_referral_deeplink == 1) {
            this.setState({
                refferalCode: this.props.refferalCode,
                hasRefferalCode: true,
                hasLinkedRefferal: true,
            });
        }
    }

    onChangeTab = (tab) => {
        if (this.state.curTab != tab) {
            this.setState({ email: '', password: '', full_name: '', phone: '' })
        }
        this.setState({ curTab: tab })
    }

    login = async () => {
        const { password } = this.state;
        const email = this.state.email.trim();
        if (email == '' || password == '') {
            alerts.error(translate('attention'), translate('fill_all_fields'));
            return;
        }
        if (validateEmailAddress(email) === false) {
            alerts.error(translate('attention'), translate('wrong_email_format'));
            return;
        }

        this.setState({ loading: true });
        try {
            const logged_user_data = await this.props.login({ email, password });

            this.setState({ loading: false });
            await loadUserSetting(this.props, logged_user_data);
            if (this.state.backRoute) {
                this.props.navigation.pop(2);
            }
        }
        catch (e) {
            console.log('login', e)
            this.setState({ loading: false });
            alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(e));
        }
    };

    register = () => {
        const { full_name, phone, password, refferalCode, hasLinkedRefferal } = this.state;
        const email = this.state.email.trim();
        let pass2 = password;
        validateUserData({ full_name, email, phone, password, pass2 }, true).then(async () => {
            if (!this.state.loading) {
                if (password.length < 6) {
                    alerts.error(translate('attention'), translate('account_change_pass.validate_cell_pass_min'));
                    return;
                }

                // if (hasLinkedRefferal && isEmpty(refferalCode)) {
                //     alerts.error(translate('attention'), translate('auth_register.validate_refferal_code'));
                //     return;
                // }

                this.setState({ loading: true });
                try {
                    let refferal_code = null;
                    if (!isEmpty(refferalCode)) {
                        refferal_code = refferalCode;
                    }
                    await this.props.register({ full_name, email, phone: trimPhoneNumber(phone), password, refferal_code });
                    const logged_user_data = await this.props.login({ email, password });

                    this.setState({ loading: false });
                    await loadUserSetting(this.props, logged_user_data);

                    if (this.state.backRoute) {
                        this.props.navigation.pop(2);
                    }
                }
                catch (e) {
                    console.log('register', e)
                    this.setState({ loading: false });
                    alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(e));
                }
            }
        });
    };

    _openForgetPassword = () => {
        openExternalUrl('https://snapfood.al/auth/login');
    };

    renderLoginForm() {
        const { loading, loadingFacebook } = this.state;
        return <View style={[{ flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: '#ffffff' }]} keyboardShouldPersistTaps='handled'>
            <KeyboardAwareScrollView style={[{ width: '100%' }]}>
                <View style={[styles.formview]}>
                    <AuthInput
                        placeholder={translate('auth_login.email_address')}
                        underlineColorAndroid={'transparent'}
                        keyboardType={'email-address'}
                        placeholderTextColor={'#DFDFDF'}
                        selectionColor={Theme.colors.cyan2}
                        onChangeText={email => this.setState({ email })}
                        // returnKeyType={'next'}
                        autoCapitalize={'none'}
                        value={this.state.email}
                        secure={false}
                        style={{ marginBottom: 20 }}
                    />
                    <AuthInput
                        placeholder={translate('auth_login.password')}
                        underlineColorAndroid={'transparent'}
                        autoCapitalize={'none'}
                        placeholderTextColor={'#DFDFDF'}
                        // ref={this.ref_loggin_password}
                        onChangeText={password => this.setState({ password })}
                        returnKeyType={'done'}
                        value={this.state.password}
                        secure={true}
                        style={{ marginBottom: 10 }}
                        setRef={ref => ref && ref.setNativeProps({ style: { fontFamily: 'Yellix-Medium' } })}
                    />
                    <TouchableOpacity style={{ width: '45%', alignSelf: 'flex-end', marginBottom: 40 }} onPress={this._openForgetPassword}>
                        <AppText style={styles.forgotPasswordText}>
                            {translate('auth_login.forgot_your_password')}
                        </AppText>
                    </TouchableOpacity>
                    <MainBtn
                        disabled={loading}
                        loading={loading}
                        title={translate('auth_login.login_button')}
                        onPress={() => {
                            this.login()
                        }}
                    />
                </View>
            </KeyboardAwareScrollView>
            {
                !this.state.isKeyboadVisible &&
                <View style={[Theme.styles.row_center, { width: '100%', marginBottom: 40, }]}>
                    <View style={[Theme.styles.row_center]}>
                        <AppText style={styles.descTxt}>
                            {translate('auth_login.no_account')}
                        </AppText>
                        <TouchableOpacity style={{ marginLeft: 6 }} onPress={() => this.setState({ curTab: 'Register' })}>
                            <AppText style={styles.create_accountText}>
                                {translate('create_account')}
                            </AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            }
        </View>
    }

    renderRegisterForm() {
        const { loading, loadingFacebook } = this.state;
        return (
            <View style={{ flex: 1, width: '100%', backgroundColor: '#ffffff', }}>
                <KeyboardAwareScrollView style={[{ flex: 1, width: '100%', paddingHorizontal: 20 }]} keyboardShouldPersistTaps='handled'>
                    <View style={[styles.formview]}>
                        <AuthInput
                            placeholder={translate('auth_register.full_name')}
                            underlineColorAndroid={'transparent'}
                            keyboardType={'default'}
                            placeholderTextColor={'#DFDFDF'}
                            selectionColor={Theme.colors.cyan2}
                            onChangeText={full_name => this.setState({ full_name })}
                            // returnKeyType={'next'}
                            autoCapitalize={'none'}
                            value={this.state.full_name}
                            secure={false}
                            style={{ marginBottom: 20 }}
                        />
                        <View style={[Theme.styles.row_center, { marginBottom: 20, width: '100%' }]}>
                            <AuthInput
                                placeholder={translate(getDefaultPhonePlaceholder())}
                                underlineColorAndroid={'transparent'}
                                keyboardType={'phone-pad'}
                                placeholderTextColor={'#DFDFDF'}
                                selectionColor={Theme.colors.cyan2}
                                onChangeText={phone => this.setState({ phone })}
                                // returnKeyType={'next'}
                                autoCapitalize={'none'}
                                value={this.state.phone}
                                secure={false}
                                style={{ flex: 1, marginRight: 15 }}
                            />
                            <AppTooltip
                                title={translate('tooltip.phone_number_required')}
                                description={translate('tooltip.phone_number_required_description')}
                            />
                        </View>

                        <AuthInput
                            placeholder={translate('auth_login.email_address')}
                            underlineColorAndroid={'transparent'}
                            keyboardType={'email-address'}
                            placeholderTextColor={'#DFDFDF'}
                            selectionColor={Theme.colors.cyan2}
                            onChangeText={email => this.setState({ email })}
                            // returnKeyType={'next'}
                            autoCapitalize={'none'}
                            value={this.state.email}
                            secure={false}
                            style={{ marginBottom: 20 }}
                        />
                        <AuthInput
                            placeholder={translate('auth_login.password')}
                            underlineColorAndroid={'transparent'}
                            autoCapitalize={'none'}
                            placeholderTextColor={'#DFDFDF'}
                            onChangeText={password => this.setState({ password })}
                            returnKeyType={'done'}
                            value={this.state.password}
                            secure={true}
                            style={{ marginBottom: 20 }}
                            setRef={ref => ref && ref.setNativeProps({ style: { fontFamily: 'Yellix-Medium' } })}
                        />
                        {
                            this.props.referralsRewardsSetting.show_referral_module == true && this.props.systemSettings?.enable_referral_input == 1 &&
                            <>
                                <View style={[Theme.styles.row_center_start, { marginBottom: 16 }]}>
                                    <CheckBox checked={this.state.hasRefferalCode}
                                        type={1}
                                        onPress={() => {
                                            this.setState({ hasRefferalCode: !this.state.hasRefferalCode })
                                        }} />
                                    <AppText style={[styles.refferalTxt, this.state.hasRefferalCode && { color: Theme.colors.gray7 }]}>{translate('auth_register.has_refferal')}</AppText>
                                </View>
                                {
                                    this.state.hasRefferalCode &&
                                    <View style={[Theme.styles.row_center, { marginBottom: 20, width: '100%' }]}>
                                        <AuthInput
                                            placeholder={translate('auth_register.refferal_code')}
                                            underlineColorAndroid={'transparent'}
                                            placeholderTextColor={'#DFDFDF'}
                                            selectionColor={Theme.colors.cyan2}
                                            onChangeText={refferalCode => this.setState({ refferalCode })}
                                            autoCapitalize={'none'}
                                            value={this.state.refferalCode}
                                            secure={false}
                                            style={{ flex: 1, marginRight: 15 }}
                                        />
                                        <AppTooltip
                                            title={translate('tooltip.referral_code_input')}
                                            description={translate('tooltip.referral_code_input_description')}
                                        />
                                    </View>
                                }
                            </>
                        }
                        <MainBtn
                            disabled={loading}
                            loading={loading}
                            style={{ marginTop: 30 }}
                            title={translate('create_account')}
                            onPress={() => this.register()}
                        />
                    </View>
                </KeyboardAwareScrollView>
                {
                    !this.state.isKeyboadVisible &&
                    <View style={[Theme.styles.row_center, { marginBottom: 40, }]}>
                        <AppText style={styles.descTxt}>
                            {translate('auth_register.already_registered')}
                        </AppText>
                        <TouchableOpacity style={{ marginLeft: 6 }} onPress={() => this.setState({ curTab: 'Login' })}>
                            <AppText style={styles.create_accountText}>
                                {translate('auth_login.login_button')}
                            </AppText>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        );
    }

    render() {
        return (
            <React.Fragment>
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
                    <SwitchTab
                        items={tabs}
                        curitem={this.state.curTab}
                        onSelect={(item) => this.onChangeTab(item)}
                        style={styles.tabstyle}
                        active_style={styles.active_style}
                        inactive_style={styles.inactive_style}
                        inactivetxt_style={styles.inactivetxt_style}
                        activetxt_style={styles.activetxt_style}
                    />
                    {
                        this.state.curTab == 'Login' ?
                            this.renderLoginForm() : this.renderRegisterForm()
                    }
                </Authpage>
                <Header1
                    style={{ position: 'absolute', left: 20, top: 0, }}
                    onLeft={() => {
                        this.props.navigation.pop();
                    }}
                    title={''}
                />
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    tabstyle: {
        paddingLeft: 0, paddingRight: 0, marginTop: -25, marginBottom: 40, width: 274, height: 50, borderRadius: 15,
        backgroundColor: '#fff', elevation: 1, shadowOffset: { width: 1, height: 1 },
        shadowColor: '#999',
        shadowOpacity: 0.6,
    },
    active_style: { height: 50, marginLeft: 0, marginRight: 0, borderRadius: 15, backgroundColor: Theme.colors.text },
    inactive_style: { height: 50, marginLeft: 0, marginRight: 0, borderRadius: 15, backgroundColor: Theme.colors.white },
    inactivetxt_style: { color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
    activetxt_style: { color: Theme.colors.white, fontFamily: Theme.fonts.semiBold, },
    formview: { flex: 1, width: '100%', position: 'relative' },
    forgotPasswordText: {
        color: '#F55A00',
        fontSize: 15,
        fontFamily: Theme.fonts.semiBold,
        textAlign: 'right',
        marginVertical: Theme.sizes.xTiny,
    },
    title: { marginTop: 80, marginBottom: 35, fontFamily: Theme.fonts.bold },
    descTxt: {
        color: Theme.colors.text,
        fontSize: 17,
        fontFamily: Theme.fonts.semiBold,
        marginVertical: Theme.sizes.xTiny,
    },
    create_accountText: {
        color: Theme.colors.btnPrimary,
        fontSize: 17,
        fontFamily: Theme.fonts.semiBold,
        marginVertical: Theme.sizes.xTiny,
    },
    refferalTxt: {
        marginLeft: 10,
        color: Theme.colors.gray5,
        fontSize: 16,
        fontFamily: Theme.fonts.medium,
    },
})


function mapStateToProps({ app }) {
    return {
        user: app.user,
        hasVerifiedPhone: app.hasVerifiedPhone,
        refferalCode: app.linkedRefferalCode,
        referralsRewardsSetting: app.referralsRewardsSetting || {},
        systemSettings: app.systemSettings || {},
    };
}

export default connect(mapStateToProps, {
    login,
    register,

    setAsLoggedIn,
    setUserNeedLogin,
    getLoggedInUser,
    setAddress,
    getAddresses,
    updateProfileDetails,
    addDefaultAddress,
    setShowChangeCityModal,
    checkLocationDiff
})(LoginScreen);
