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
import { updateProfileDetails } from '../../../store/actions/auth';


class EditNameScreen extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            full_name: this.props.user.full_name,
            username: this.props.user.username,
            loading: false,
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    update = async () => {
        if (this.props.user == null) { return; }
        if ((this.state.full_name == null || this.state.full_name.trim() == '') && (this.state.username == null || this.state.username.trim() == '')) {
            return alerts.error(translate('attention'), translate('edit_name.attention'));
        }

        const user = { ...this.props.user };
        user.full_name = this.state.full_name;
        user.username = this.state.username;
        try {
            this.setState({ loading: true });
            user.photo = null;
            await this.props.updateProfileDetails(user);
            // this.setState({ loading: false });
        } catch (error) {
            console.log('update error', error)
            this.setState({ loading: false });
            const message = error.message || translate('checkout.something_is_wrong');
            return alerts.error(translate('attention'), translate(message));
        }
    };

    render() {
        const { loading, } = this.state;

        return <React.Fragment>
            <Authpage onKeyboardDidShow={() => { }} onKeyboardDidHide={() => { }}>
                <KeyboardAwareScrollView style={[{ width: '100%' }]} keyboardShouldPersistTaps='handled'>
                    <View style={[{ width: '100%', alignItems: 'center', flex: 1, paddingHorizontal: 20, marginTop: 30 }]}>
                        <Text style={Theme.styles.headerTitle}>
                            {translate('edit_name.title')}
                        </Text>

                        <Text style={[{
                            color: Theme.colors.text,
                            fontFamily: Theme.fonts.regular,
                            fontSize: Theme.sizes.small, marginTop: 10
                        }]}>
                            {translate('edit_name.description')}
                        </Text>
                        <View style={[{ width: '100%', marginTop: 10, }]}>
                            <View style={[Theme.styles.row_center, { marginTop: 25, width: '100%' }]}>
                                <AuthInput
                                    placeholder={translate('auth_register.full_name')}
                                    underlineColorAndroid={'transparent'}
                                    keyboardType={'default'}
                                    placeholderTextColor={'#DFDFDF'}
                                    selectionColor={Theme.colors.cyan2}
                                    onChangeText={(full_name) => this.setState({ full_name: full_name })}
                                    returnKeyType={'next'}
                                    autoCapitalize={'none'}
                                    value={this.state.full_name}
                                    secure={false}
                                    style={{ flex: 1, marginRight: 15 }}
                                />
                                <AppTooltip
                                    title={translate('tooltip.full_name_required')}
                                    description={translate('tooltip.full_name_required_description')}
                                />
                            </View>
                            <View style={[Theme.styles.row_center, { marginTop: 20, marginBottom: 12, width: '100%' }]}>
                                <AuthInput
                                    placeholder={translate('auth_login.username')}
                                    underlineColorAndroid={'transparent'}
                                    keyboardType={'default'}
                                    placeholderTextColor={'#DFDFDF'}
                                    selectionColor={Theme.colors.cyan2}
                                    onChangeText={(username) => this.setState({ username: username })}
                                    returnKeyType={'done'}
                                    autoCapitalize={'none'}
                                    value={this.state.username}
                                    secure={false}
                                    style={{ flex: 1, marginRight: 15 }}
                                />
                                <AppTooltip
                                    title={translate('tooltip.username_required')}
                                    description={translate('tooltip.username_required_description')}
                                />
                            </View>
                        </View>
                        <MainBtn
                            title={translate('edit_name.button')}
                            loading={loading}
                            style={{ width: '100%', marginTop: 30, }}
                            onPress={this.update}
                        />
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
    updateProfileDetails
})(withNavigation(EditNameScreen));
