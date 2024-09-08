import React from 'react';
import { View, StyleSheet } from 'react-native';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import AppText from '../../../common/components/AppText';
import MainBtn from '../../../common/components/buttons/main_button';
import Authpage from '../../../common/components/Authpage';
import RouteNames from '../../../routes/names';
import Svg_img from '../../../common/assets/svgs/pw_illustration.svg'

class ResetPassDoneScreen extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = { 
            loading: false,  
        };
    }
  
    render() { 
        return (
            <Authpage onKeyboardDidShow={() => { }} onKeyboardDidHide={() => { }}>
                <View style={[Theme.styles.col_center_start, styles.formview]}>
                    <Svg_img />
                    <AppText style={[styles.title]}>
                        {translate('auth_resets_pass.reset_done')}
                    </AppText>
                </View>
                <View style={{ paddingHorizontal: 20, width: '100%', marginBottom: 40 }}>
                    <MainBtn
                        style={{width:'100%'}} 
                        title={translate('auth_login.login_button')}
                        onPress={() => {
                            this.props.navigation.navigate(RouteNames.LoginScreen);
                        }}
                    />
                </View>
            </Authpage>
        );
    }
}

const styles = StyleSheet.create({
    formview: { flex: 1, width: '100%', paddingTop: 50 },
    title: { marginTop: 25, fontSize: 20, color: Theme.colors.text, fontFamily: Theme.fonts.bold },
})
export default ResetPassDoneScreen;
