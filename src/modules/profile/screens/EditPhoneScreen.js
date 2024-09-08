import React from 'react';
import {ActivityIndicator, Dimensions, SafeAreaView, TouchableOpacity, View} from 'react-native';
import {withNavigation} from 'react-navigation';
import {connect} from 'react-redux';
import AppText from '../../../common/components/AppText';
import {translate} from '../../../common/services/translate';
import styles from './styles';
import AuthContainer from '../components/AuthContainer';
import ElevatedView from 'react-native-elevated-view';
import RouteNames from '../../../routes/names';
import Theme from '../../../theme';
import AuthInput from '../components/AuthInput';
import {trimPhoneNumber, validatePhoneNumber} from '../../../common/services/utility';
import alerts from '../../../common/services/alerts';
import {updateProfileDetails} from '../../../store/actions/auth';
import { getDefaultPhonePlaceholder } from '../../../common/services/user';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

class EditPhoneScreen extends React.Component {

    constructor () {
        super();

        this.state = {
            loading: false,
            phone: '',
        };
    }

    goBack = () => {
        if (this.props.user.phone || this.state.phone) {
            const backRoute = this.props.navigation.getParam('backScreenView');
            this.props.navigation.replace(RouteNames.PhoneVerificationScreen, {
                backScreenView: backRoute,
            });
        } else {
            this.props.navigation.navigate(RouteNames.HomeScreen);
        }
    };

    update = async () => {
        const user = {...this.props.user};
        user.phone = trimPhoneNumber(this.state.phone);
        const isValidPhone = validatePhoneNumber(user.phone);
        if (!isValidPhone) {
            alerts.error(translate('attention'), translate('wrong_phone_format'));
        } else {
            await this.setState({loading: true});
            setTimeout(async () => {
                await this.props.updateProfileDetails(user);
                this.goBack();
            }, 500);
        }
    };

    render () {
        const {loading} = this.state;

        return <AuthContainer onBackPress={this.goBack}>
            <SafeAreaView style={styles.container}>
                <View style={[styles.centeredContainer]}>
                    <AppText style={[styles.headerTitle, {marginBottom: 0}]}>{translate('edit_phone.header1')}</AppText>
                    <AppText style={[styles.headerTitle, {marginTop: 0}]}>{translate('edit_phone.header2')}</AppText>
                    <ElevatedView elevation={1} style={[styles.mainContainer, {
                        alignItems: 'center',
                    }]}>
                        <View style={{
                            width: windowWidth - (Theme.sizes.normal) - (2 * Theme.sizes.large),
                            paddingHorizontal: Theme.sizes.normal,
                        }}>
                            <AppText style={{
                                marginVertical: Theme.sizes.base,
                                fontSize: 19,
                                textAlign: 'center',
                                fontFamily: 'SanFranciscoDisplay-Bold',
                                color: Theme.colors.text,
                            }}>{translate('edit_phone.text')}</AppText>

                            <AuthInput
                                icon={require('../../../common/assets/images/auth/auth_phone_icon.png')}
                                placeholder={translate(getDefaultPhonePlaceholder())}
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                returnKeyType={'next'}
                                autoCapitalize={'none'}
                                onSubmitEditing={() => this.update()}
                                keyboardType={'phone-pad'}
                                placeholderTextColor={'#DFDFDF'}
                                selectionColor={Theme.colors.cyan2}
                                onChangeText={phone => this.setState({phone})}
                                value={this.state.phone}
                            />

                            <TouchableOpacity
                                onPress={this.update}
                                disabled={loading}
                                style={styles.updatePhoneButton}>
                                {
                                    loading ? <ActivityIndicator
                                            style={styles.loginButtonText}
                                            size={Theme.sizes.normal}
                                            color={Theme.colors.whitePrimary}/>
                                        :
                                        <AppText style={styles.verifyButtonText}>
                                            {translate('edit_phone.button')}
                                        </AppText>
                                }
                            </TouchableOpacity>
                        </View>
                    </ElevatedView>
                    <View style={{height: windowHeight * 0.25}}/>
                </View>
            </SafeAreaView>
        </AuthContainer>;
    }
}

function mapStateToProps ({app}) {
    return {
        user: app.user,
    };
}

export default connect(mapStateToProps, {
    updateProfileDetails,
})(withNavigation(EditPhoneScreen));
