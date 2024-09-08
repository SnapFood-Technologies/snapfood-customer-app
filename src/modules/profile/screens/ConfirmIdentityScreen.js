import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { width, height } from 'react-native-dimension';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import AppText from '../../../common/components/AppText';
import MainBtn from '../../../common/components/buttons/main_button';
import AuthInput from '../../../common/components/AuthInput';
import RouteNames from '../../../routes/names';
import apiFactory from '../../../common/services/apiFactory'; 
import alerts from '../../../common/services/alerts';

class ConfirmIdentityScreen extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = { 
            loading: false,  
            password: '',
        };
    }

    onConfirm=()=>{
        if(this.state.password == '') {
            return;
        }
        this.setState({loading : true});
        apiFactory.post(`users/confirm-identity`, {
            password : this.state.password
        })
        .then(({data}) => { 
            this.setState({loading : false});
			console.log('onConfirm', data) 
            if(data.success == 1) {
                this.props.navigation.navigate(RouteNames.PaymentMethodsScreen); 
            } 
        },
        (error) => {
            this.setState({loading : false});
			console.log('onConfirm error', error)
            const message =  error.message || translate('generic_error'); 
            alerts.error(translate('alerts.error'), message);
        });
        
    }
 
    render() {
        const { loading,  } = this.state;
       
        return (
            <View style={[Theme.styles.background, { backgroundColor: '#ffffff' }]}>
                <View style={[styles.formview]}>
                    <AppText style={[Theme.styles.headerTitle, styles.title]}>
                        {translate('confirm_identity.title')}
                    </AppText>
                    <AppText style={[Theme.styles.description, styles.description]}>
                        {translate('confirm_identity.desc')}
                    </AppText>
                    <AuthInput
                        placeholder={translate('auth_login.password')}
                        underlineColorAndroid={'transparent'} 
                        placeholderTextColor={Theme.colors.gray5}
                        onChangeText={password => this.setState({ password })} 
                        returnKeyType={'done'}
                        autoCapitalize={'none'}
                        value={this.state.password}
                        secure={true}
                        setRef={ref => ref && ref.setNativeProps({ style: { fontFamily: 'Yellix-Medium' } })} 
                        hideEye={true}
                        style={{ marginBottom: 50 }}
                    />
                    <MainBtn
                        disabled={loading}
                        loading={loading}
                        title={translate('confirm')}
                        onPress={this.onConfirm}
                    />
                </View>
                <View style={[Theme.styles.row_center, { width: width(100), position: 'absolute', top: height(100) - 100 }]}>
                    <TouchableOpacity style={Theme.styles.row_center} onPress={() => {
                        this.props.navigation.goBack();
                    }}>
                        <AppText style={styles.cancelText}>
                            {translate('cancel')}
                        </AppText>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    formview: { flex: 1, width: '100%', position: 'relative' },
    title: { marginTop: 80, marginBottom: 25, },
    description: { marginBottom: 25, textAlign: 'center' },
    cancelText: {
        color: Theme.colors.text,
        fontSize: 14,
        fontFamily: Theme.fonts.semiBold,
        marginVertical: Theme.sizes.xTiny,
    }
})
export default ConfirmIdentityScreen;
