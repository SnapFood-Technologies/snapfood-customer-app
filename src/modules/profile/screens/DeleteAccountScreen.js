
import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { LoginManager } from 'react-native-fbsdk';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import RouteNames from '../../../routes/names';
import { changePassword, logout } from '../../../store/actions/auth';
import { setTmpPassChanged } from '../../../store/actions/app';
import alerts from '../../../common/services/alerts';
import Header1 from '../../../common/components/Header1';
import MainBtn from '../../../common/components/buttons/main_button';
import { AppText } from '../../../common/components';
import { getStorageKey, KEYS } from '../../../common/services/storage';
import apiFactory from '../../../common/services/apiFactory';
import { deleteUserStory } from '../../../common/services/user_story';
import { deleteUserChannels } from '../../../common/services/chat';
import { deleteUserCallChannels } from '../../../common/services/call';
import Spinner from 'react-native-loading-spinner-overlay';


const DeleteAccountScreen = (props) => {
    const [loading, setLoading] = useState(false);

    const onDeleteAccount = async () => {
        let apple_auth_code = null;
        try {
            apple_auth_code = await getStorageKey(KEYS.APPLE_LOGIN_AUTH_CODE);
        } catch (e) {
        }

        setLoading(true);
        apiFactory.post(`account-delete`, {
            authorization_code: apple_auth_code
        })
            .then(async (res) => {
                await deleteUserStory(props.user.id);
                await deleteUserChannels(props.user.id);
                await deleteUserCallChannels(props.user.id);
                dologout();
            })
            .catch(err => {
                setLoading(false);
                console.log(err);
                alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
            });
    };

    const dologout = async () => {
        try {
            LoginManager.logOut();
        } catch (e) {
            console.log('LoginManager.logOut', e)
        }
        try {
            await props.logout();
        } catch (e) {
            console.log('logout', e)
        }

        setLoading(false);
        if (props.hometab_navigation != null) {
            props.hometab_navigation.jumpTo(RouteNames.HomeStack)
        }
        props.navigation.goBack();
        props.navigation.goBack();
        props.navigation.navigate(RouteNames.WelcomeScreen, { backRoute: RouteNames.BottomTabs });

        alerts.info(translate('alerts.account_deleted_title'), translate('alerts.account_deleted_description')).then((res) => {
        });
    }

    return (
        <View style={styles.container}>
            <Spinner visible={loading}/>
            <Header1
                style={{ marginTop: 10, paddingHorizontal: 20 }}
                onLeft={() => {
                    props.setTmpPassChanged(false);
                    props.navigation.goBack();
                }}
                title={translate('account.delete_account')}
            />
            <View style={styles.scrollview}>
                <View style={[Theme.styles.col_center, { width: '100%', marginVertical: 20 }]}>
                    <AppText style={styles.deleteAccountSubtitle}>
                        {translate('account.delete_account_subtitle')}
                    </AppText>
                </View>
                <View style={{ height: 20, }} />
                <View style={[Theme.styles.col_center, { width: '100%' }]}>
                    <AppText style={styles.deleteAccountDescription}>
                        {translate('account.delete_account_description')}
                    </AppText>
                </View>
            </View>
            <View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 40 }}>
                <MainBtn
                    disabled={loading}
                    loading={loading}
                    title={translate('account.delete_my_account')}
                    style={styles.deleteButton}
                    title_style={styles.deleteButtonTxt}
                    onPress={() => {
                        onDeleteAccount();
                    }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    formview: {
        flex: 1,
        marginTop: 10,
        paddingHorizontal: 20,
    },
    scrollview: { flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: Theme.colors.white },
    deleteAccountSubtitle: { fontSize: 22, lineHeight: 24, fontFamily: Theme.fonts.medium, color: Theme.colors.text, textAlign: 'center' },
    deleteAccountDescription: { fontSize: 18, lineHeight: 22, fontFamily: Theme.fonts.medium, color: Theme.colors.text, textAlign: 'center' },
    deleteButton: { backgroundColor: Theme.colors.gray8 },
    deleteButtonTxt: { fontFamily: Theme.fonts.semiBold, color: Theme.colors.red1, fontSize: 18, },
});

function mapStateToProps({ app }) {
    return {
        user: app.user,
        language: app.language,
        hometab_navigation: app.hometab_navigation,
    };
}

export default connect(mapStateToProps, {
    changePassword,
    setTmpPassChanged,
    logout
})(DeleteAccountScreen);
