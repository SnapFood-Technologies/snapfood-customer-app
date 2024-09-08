import React from 'react';
import { View, StyleSheet, Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import { connect } from 'react-redux'
import { updateProfileDetails, getLoggedInUser } from '../../../store/actions/auth';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import AppText from '../../../common/components/AppText';
import MainBtn from '../../../common/components/buttons/main_button';
import TransBtn from '../../../common/components/buttons/trans_button';
import RouteNames from '../../../routes/names';
import Svg_img from '../../../common/assets/svgs/wallet/money_added.svg';

class DepositSuccessScreen extends React.PureComponent {
    constructor(props) {
        super(props);
        this.props = props

        this.state = {
            loading: false,
            isTransfer: this.props.route.params?.isTransfer == true
        };
    }

    async componentDidMount() {
        this.props.getLoggedInUser();
    }

    render() {
        return (
            <View style={[Theme.styles.background, { backgroundColor: '#ffffff' }]}>
                <View style={[Theme.styles.col_center, styles.formview]}>
                    <Svg_img />
                    <AppText style={[Theme.styles.locationTitle, styles.title]}>
                        {this.state.isTransfer ? translate('transfer_balance.success') : translate('deposit_card.success')}
                    </AppText>
                    <AppText style={[Theme.styles.locationDescription, styles.description]}>
                        {
                            (this.state.isTransfer ?
                                translate('transfer_balance.success_desc')
                                :
                                translate('deposit_card.success_desc')
                            ).replace('XXX', `${this.props.route.params?.amount}`)
                        }
                    </AppText>
                    <AppText style={[Theme.styles.locationDescription, styles.balance]}>
                        {this.state.isTransfer ? translate('transfer_balance.your_balance') : translate('deposit_card.your_balance')} {this.props.route.params?.balance} L
                    </AppText>
                </View>
                <View style={{ width: '100%', paddingHorizontal: 20, }}>
                    <MainBtn
                        title={this.state.isTransfer ? translate('transfer_balance.back_wallet') : translate('deposit_card.back_wallet')}
                        onPress={() => {
                            this.props.navigation.navigate(RouteNames.WalletScreen);
                        }}
                    />
                </View>
                <TransBtn
                    style={{ marginTop: 15, }}
                    title={this.state.isTransfer ? translate('transfer_balance.back_home') : translate('deposit_card.back_home')}
                    onPress={() => {
                        if (this.props.hometab_navigation != null) {
                            this.props.hometab_navigation.jumpTo(RouteNames.HomeStack);
                        }
                        this.props.navigation.navigate(RouteNames.BottomTabs);
                    }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    formview: { flex: 1, width: '100%', paddingTop: 80 },
    title: { marginTop: 30, },
    description: { marginTop: 12, fontSize: 18, marginBottom: 35, textAlign: 'center' },
    balance: { fontSize: 19, fontFamily: Theme.fonts.semiBold, color: Theme.colors.red1 }
})

const mapStateToProps = ({ app }) => ({
    isLoggedIn: app.isLoggedIn,
    hometab_navigation: app.hometab_navigation,
});

export default connect(mapStateToProps, {
    updateProfileDetails, getLoggedInUser
})(DepositSuccessScreen);
