import React from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';
import Theme from '../../../theme';
import AppText from '../../../common/components/AppText';
import MainBtn from '../../../common/components/buttons/main_button';
import AuthInput from '../../../common/components/AuthInput';
import Authpage from '../../../common/components/Authpage';
import RouteNames from '../../../routes/names';

class ResetPassScreen extends React.PureComponent {

    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            loading: false,
            isKeyboadVisible: false,
            email: this.props.route.params.email,
            password: '',
            confirm_password: '',
        };
    }

    onResetPass = () => {
        const { password, confirm_password } = this.state;

        if (password != '' && password == confirm_password) {
            this.setState({ loading: true });
            apiFactory.post('reset-password', { email: this.state.email, password: password })
                .then((response) => {
                    this.setState({ loading: false });
                    
                    this.props.navigation.navigate(RouteNames.ResetPassDoneScreen);
                })
                .catch((error) => {
                    this.setState({ loading: false });
                    if (error != null && error.message != null) {
                        alerts.error('Error', error.message);
                    }
                    
                })
        }

    };

    render() {
        const { loading, loaded, loadingFacebook } = this.state;
        // if (!loaded) {
        //     return null;
        // }
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
                        <AppText style={[Theme.styles.headerTitle, styles.title]}>
                            {translate('auth_resets_pass.header_title')}
                        </AppText>
                        <AuthInput
                            placeholder={translate('auth_resets_pass.new_pass')}
                            underlineColorAndroid={'transparent'}
                            keyboardType={'default'}
                            placeholderTextColor={Theme.colors.gray5}
                            onChangeText={password => this.setState({ password })}
                            returnKeyType={'next'}
                            autoCapitalize={'none'}
                            value={this.state.password}
                            style={{ marginBottom: 15 }}
                        />
                        <AuthInput
                            placeholder={translate('auth_resets_pass.confirm_pass')}
                            underlineColorAndroid={'transparent'}
                            keyboardType={'default'}
                            autoCapitalize={'none'}
                            placeholderTextColor={Theme.colors.gray5}
                            onChangeText={confirm_password => this.setState({ confirm_password })}
                            // onSubmitEditing={() => this.login()}
                            returnKeyType={'done'}
                            value={this.state.confirm_password}
                            style={{ marginBottom: 50 }}
                        />
                        <MainBtn
                            disabled={loading}
                            loading={loading}
                            title={translate('auth_resets_pass.button')}
                            onPress={this.onResetPass}
                        />
                    </View>
                </KeyboardAwareScrollView>
            </Authpage>
        );
    }
}

const styles = StyleSheet.create({
    formview: { flex: 1, width: '100%', paddingHorizontal: 20, position: 'relative' },
    title: { marginTop: 30, marginBottom: 35, },
})
export default ResetPassScreen;
