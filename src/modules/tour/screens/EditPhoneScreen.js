import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AuthInput from '../../../common/components/AuthInput';
import Authpage from '../../../common/components/Authpage';
import MainBtn from "../../../common/components/buttons/main_button";
import Header1 from '../../../common/components/Header1';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import alerts from '../../../common/services/alerts';
import { extractErrorMessage, trimPhoneNumber, validatePhoneNumber } from '../../../common/services/utility';
import { setHasVerifiedPhone, updateProfileDetails } from '../../../store/actions/auth';
import { getDefaultPhonePlaceholder } from '../../../common/services/user';


class EditPhoneScreen extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            isKeyboadVisible: false,
            phone: this.props.user == null ? '' : this.props.user.phone,
            loading: false,
        };
    } 

    componentDidMount() {
        this._unsubscribe = this.props.navigation.addListener('beforeRemove', (e) => {
            console.log('beforeRemove called')
            e.preventDefault();
            if (this.props.user.phone) {
                this.props.navigation.dispatch(e.data.action)
            }
        });
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    update = async () => {
        if (this.props.user == null) { return; }
        const user = { ...this.props.user };
        user.phone = trimPhoneNumber(this.state.phone);
        const isValidPhone = validatePhoneNumber(user.phone);
        if (!isValidPhone) {
            return alerts.error(translate('attention'), translate('wrong_phone_format'));
        }

        try {
            this.setState({ loading: true });
            user.photo = null;
            await this.props.updateProfileDetails(user);
            this.setState({ loading: false });
            this.props.navigation.goBack();
        } catch (error) {
            console.log('update error', error)
            this.setState({ loading: false });
            return alerts.error(translate('attention'), translate('checkout.something_is_wrong'));
        }
    };

    render() {
        const { user } = this.props;
        const { loading, status, } = this.state;

        return <React.Fragment>
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
                    <View style={[{ width: '100%', alignItems: 'center', flex: 1, paddingHorizontal: 20, marginTop: 30 }]}>
                        <Text style={Theme.styles.headerTitle}>
                            {this.props.user.phone ? translate('edit_phone.header1') : translate('edit_phone.header1_new_user')}
                        </Text>
                        <Text style={[Theme.styles.locationDescription, { marginTop: 18, lineHeight: 20, }]}>
                            {this.props.user.phone ? translate('edit_phone.text') : translate('edit_phone.text_new_user')}
                        </Text>
                        <View style={[{ width: '100%', marginTop: 30, justifyContent: 'space-between', }]}>
                            <AuthInput
                                placeholder={translate(getDefaultPhonePlaceholder())}
                                underlineColorAndroid={'transparent'}
                                keyboardType={'phone-pad'}
                                placeholderTextColor={'#DFDFDF'}
                                selectionColor={Theme.colors.cyan2}
                                onChangeText={phone => this.setState({ phone })}
                                returnKeyType={'next'}
                                autoCapitalize={'none'}
                                value={this.state.phone}
                                secure={false}
                                style={{ marginBottom: 20 }}
                            />
                        </View>
                        <MainBtn
                            title={this.props.user.phone ? translate('edit_phone.button') : translate('edit_phone.button_new_user')}
                            loading={loading}
                            style={{ width: '100%', marginTop: 50, }}
                            onPress={this.update}
                        />
                    </View>
                </KeyboardAwareScrollView>
            </Authpage >
            <Header1
                style={{ position: 'absolute', left: 20, top: 0, }}
                onLeft={() => {
                    this.props.navigation.goBack();
                }}
                left={this.props.user.phone ? null : <View />}
                title={''}
            />
        </React.Fragment>
    }
}

function mapStateToProps({ app }) {
    return {
        user: app.user,
    };
}

export default connect(mapStateToProps, {
    setHasVerifiedPhone, updateProfileDetails
})(withNavigation(EditPhoneScreen));
