import React from 'react';
import {Image, ImageBackground, KeyboardAvoidingView, TextInput, TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import {withNavigation} from 'react-navigation';
import Theme from '../../../theme';
import AppText from '../../../common/components/AppText';
import {translate} from '../../../common/services/translate';

class OfflineContactSupportScreen extends React.PureComponent {

    static navigationOptions = () => {
        return {
            title: 'Live Support',
        };
    };

    render () {
        return (
            <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
                <ImageBackground source={require('../../../common/assets/images/chat/half_bckground.png')}
                                 style={{width: '100%', height: '80%'}}>
                    <View style={{
                        padding: 10,
                        margin: 8,
                        flexDirection: 'column',
                        marginTop: 20,
                        marginLeft: 10,
                        marginRight: 10,
                    }}>
                        <View style={{flexDirection: 'row'}}>
                            <AppText style={{
                                textAlign: 'center',
                                fontFamily: 'SanFranciscoDisplay-Bold',
                                fontSize: 24,
                                color: 'white',
                            }}>
                                {translate('chat.greetings')}
                            </AppText>
                            <Image
                                source={require('../../../common/assets/images/chat/hand.png')}
                                style={{
                                    width: 25,
                                    height: 25,
                                    marginLeft: 4,
                                }}
                            />
                        </View>
                        <View style={{flexDirection: 'column', marginTop: 8}}>
                            <AppText style={{
                                fontFamily: 'SanFranciscoDisplay-Bold',
                                fontSize: 14,
                                color: 'white',
                            }}>
                                {translate('chat.can_talk_to')}
                            </AppText>
                            <AppText style={{
                                fontFamily: 'SanFranciscoDisplay-Semibold',
                                fontSize: 14,
                                color: 'white',
                            }}>
                                {translate('chat.24_7')}
                            </AppText>
                        </View>
                    </View>
                    <View style={styles.cardStyle}>
                        <View style={{
                            marginTop: 8,
                            marginBottom: 8,
                            flexDirection: 'column',
                            marginLeft: 14,
                            marginRight: 10,
                        }}>
                            <AppText style={{color: '#28CAD7', fontSize: 12}}>
                                {translate('chat.no_operators')}
                            </AppText>
                            <AppText style={{color: '#28CAD7', fontSize: 12}}>
                                {translate('chat.contact')}
                            </AppText>
                        </View>
                        <View style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <TextInput
                                underlineColorAndroid='transparent'
                                style={{
                                    width: 310,
                                    height: 32,
                                    padding: 10,
                                    margin: 8,
                                    color: '#C8C8C8',
                                    fontSize: 11,
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    borderColor: '#C8C8C8',
                                    backgroundColor: 'rgba(0,0,0,0)',
                                }}
                                placeholder="Emri juaj"/>
                            <TextInput
                                underlineColorAndroid='transparent'
                                style={{
                                    width: 310,
                                    padding: 10,
                                    color: '#C8C8C8',
                                    height: 32,
                                    margin: 8,
                                    fontSize: 11,
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    borderColor: '#C8C8C8',
                                    backgroundColor: 'rgba(0,0,0,0)',
                                }}
                                placeholder={translate('chat.contactForm.email')}/>
                            <TextInput
                                underlineColorAndroid='transparent'
                                style={{
                                    width: 310,
                                    padding: 10,
                                    color: '#C8C8C8',
                                    height: 32,
                                    margin: 8,
                                    fontSize: 11,
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    borderColor: '#C8C8C8',
                                    backgroundColor: 'rgba(0,0,0,0)',
                                }}
                                placeholder={translate('chat.contactForm.phone')}
                                keyboardType='numeric'/>
                            <TextInput
                                underlineColorAndroid='transparent'
                                style={{
                                    width: 310,
                                    padding: 10,
                                    color: '#C8C8C8',
                                    height: 32,
                                    margin: 8,
                                    fontSize: 11,
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    borderColor: '#C8C8C8',
                                    backgroundColor: 'rgba(0,0,0,0)',
                                }}
                                placeholder={translate('chat.contactFrom.subject')}
                            />
                            <TextInput
                                underlineColorAndroid='transparent'
                                style={{
                                    width: 310,
                                    padding: 10,
                                    color: '#C8C8C8',
                                    height: 120,
                                    margin: 8,
                                    fontSize: 11,
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    borderColor: '#C8C8C8',
                                    textAlign: 'left',
                                    backgroundColor: 'rgba(0,0,0,0)',
                                }}
                                placeholder={translate('chat.contactForm.message')}
                            />
                            <TouchableOpacity style={{
                                backgroundColor: Theme.colors.cyan2,
                                width: 310,
                                height: 40,
                                marginTop: 12,
                                marginBottom: 12,
                                padding: 10,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 5,
                            }} onPress={this.register}>
                                <AppText style={{
                                    fontFamily: 'SanFranciscoDisplay-Medium',
                                    color: Theme.colors.white,
                                    fontSize: 16,
                                    textAlign: 'center',
                                }}>{translate('chat.contactForm.send')}</AppText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </KeyboardAvoidingView>
        );
    }
}

const styles = {
    cardStyle: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#C8C8C8',
        shadowOffset: {width: 0, height: 2},
        marginLeft: 13,
        marginRight: 13,
    },
};

const mapStateToProps = () => ({});

export default connect(
    mapStateToProps,
    {},
)(withNavigation(OfflineContactSupportScreen));
