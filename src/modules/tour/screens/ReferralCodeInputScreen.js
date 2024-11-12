import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AuthInput from '../../../common/components/AuthInput';
import Authpage from '../../../common/components/Authpage';
import MainBtn from "../../../common/components/buttons/main_button";
import AppTooltip from '../../../common/components/AppTooltip';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import alerts from '../../../common/services/alerts';
import { setSkipReferralCodeInputView } from '../../../store/actions/app';
import apiFactory from '../../../common/services/apiFactory';

class ReferralCodeInputScreen extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            refferalCode: '',
            loading: false,
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    update = async () => {
        if (this.state.refferalCode == null || this.state.refferalCode.trim() == '') {
            return alerts.error(translate('attention'), translate('referral_code_input_view.attention'));
        }

        try {
            this.setState({ loading: true });
            await apiFactory.post(`register-referral-code`, {
                refferal_code: this.state.refferalCode
            });
            this.setState({ loading: false });
            this.props.setSkipReferralCodeInputView(true);
        } catch (error) {
            
            this.setState({ loading: false });
            const message = error.message || translate('checkout.something_is_wrong');
            return alerts.error(translate('attention'), translate(message));
        }
    };

    onSkip = () => {
        this.props.setSkipReferralCodeInputView(true);
    }

    render() {
        const { loading, } = this.state;

        return <React.Fragment>
            <Authpage onKeyboardDidShow={() => { }} onKeyboardDidHide={() => { }}>
                <KeyboardAwareScrollView style={[{ width: '100%' }]} keyboardShouldPersistTaps='handled'>
                    <View style={[{ width: '100%', alignItems: 'center', flex: 1, paddingHorizontal: 20, marginTop: 30 }]}>
                        <Text style={Theme.styles.headerTitle}>
                            {translate('referral_code_input_view.title')}
                        </Text>
                        <Text style={[{
                            color: Theme.colors.text,
                            fontFamily: Theme.fonts.regular,
                            fontSize: Theme.sizes.small, marginTop: 10
                        }]}>
                            {translate('referral_code_input_view.description')}
                        </Text>
                        <View style={[{ width: '100%', marginTop: 25, }]}>
                            <View style={[Theme.styles.row_center, { marginBottom: 0, width: '100%' }]}>
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
                        </View>
                        <MainBtn
                            title={translate('referral_code_input_view.submit')}
                            loading={loading}
                            style={{ width: '100%', marginTop: 30, marginBottom: 5}}
                            onPress={this.update}
                        />
                        <TouchableOpacity
                            onPress={this.onSkip}
                        >
                            <Text style={{paddingVertical: 20, width: 150, textAlign: 'center', fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7 }}>{translate('referral_code_input_view.skip')}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
            </Authpage >
        </React.Fragment >
    }
}

function mapStateToProps({ app }) {
    return {
        user: app.user,
    };
}

export default connect(mapStateToProps, {
    setSkipReferralCodeInputView
})(withNavigation(ReferralCodeInputScreen));
