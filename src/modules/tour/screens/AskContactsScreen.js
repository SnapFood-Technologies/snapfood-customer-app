import React from 'react';
import { View, StyleSheet, Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import { connect } from 'react-redux'
import FastImage from 'react-native-fast-image';
import Spinner from 'react-native-loading-spinner-overlay';
import RNContacts from 'react-native-contacts';
import { setAskedContactsPerm, } from '../../../store/actions/app';
import { updateProfileDetails } from '../../../store/actions/auth';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import { KEYS, setStorageKey } from '../../../common/services/storage';
import AppText from '../../../common/components/AppText';
import MainBtn from '../../../common/components/buttons/main_button';
import TransBtn from '../../../common/components/buttons/trans_button';
import RouteNames from '../../../routes/names';

class AskContactsScreen extends React.PureComponent {

    constructor(props) {
        super(props);
        this.props = props

        this.state = {
            loading: false,
        };
    }

    async componentDidMount() {
    }

    accessContacts = () => {
        if (Platform.OS == 'android') {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).then((res) => {
                console.log('PermissionsAndroid.request ', res);
                if (res == 'granted') {
                    this.props.navigation.navigate(RouteNames.ContactsScreen)
                } else {
                    Alert.alert(translate('attention'), translate('contactUnavailable'), [
                        {
                            text: translate('cancel'),
                            onPress: () => { }, // console.log('Cancel Pressed'),
                            style: 'cancel',
                        },
                        {
                            text: translate('settings'), onPress: () => {
                                Linking.openSettings()
                            }
                        },
                    ]);
                }
            });
        } else {
            RNContacts.checkPermission().then((res) => {
                if (res === 'authorized' || res === 'undefined') {
                    RNContacts.requestPermission();
                    this.props.navigation.navigate(RouteNames.ContactsScreen)
                } else if (res === 'denied') {
                    Alert.alert(translate('attention'), translate('contactUnavailable'), [
                        {
                            text: translate('cancel'),
                            onPress: () => { }, // console.log('Cancel Pressed'),
                            style: 'cancel',
                        },
                        {
                            text: translate('settings'), onPress: () => {
                                Linking.openSettings()
                            }
                        },
                    ]);
                }
            });
        }
    };

    onNotNow = async () => {
        try {
            await setStorageKey(KEYS.ASKED_CONTACTS_PERMISSION, true);
        } catch (e) {
            console.log(e);
        }
        this.props.setAskedContactsPerm(true);
    }

    render() {
        return (
            <View style={[Theme.styles.background, { backgroundColor: '#ffffff' }]}>
                <Spinner visible={this.state.loading} />
                <View style={[Theme.styles.col_center_start, styles.formview]}>
                    <FastImage
                        source={require('../../../common/assets/images/contacts.png')}
                        style={{ width: 220, height: 191 }}
                        resizeMode={'contain'}
                    />
                    <AppText style={[Theme.styles.locationTitle, styles.title]}>
                        {translate('ask_contacts.title')}
                    </AppText>
                    <AppText style={[Theme.styles.locationDescription, styles.description]}>
                        {translate('ask_contacts.description')}
                    </AppText>
                </View>
                <View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 12 }}>
                    <MainBtn
                        title={translate('ask_contacts.button')}
                        onPress={() => this.accessContacts()}
                    />
                    {
                        this.props.systemSettings.enable_ask_contact_skip == 1 &&
                        <TransBtn
                            style={{ marginTop: 10,}}
                            title={translate('ask_contacts.later')}
                            onPress={() => {
                                this.onNotNow()
                            }}
                        />
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    formview: { flex: 1, width: '100%', paddingTop: 80 },
    title: { marginTop: 25, },
    description: { marginTop: 12, marginBottom: 25, textAlign: 'center' },
})

const mapStateToProps = ({ app }) => ({
    isLoggedIn: app.isLoggedIn,
    systemSettings: app.systemSettings || {}
});

export default connect(mapStateToProps, {
    setAskedContactsPerm, updateProfileDetails
})(AskContactsScreen);
