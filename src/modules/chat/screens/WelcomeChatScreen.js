import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import {withNavigation} from 'react-navigation';
import Theme from '../../../theme';
import {translate} from '../../../common/services/translate';
import RouteNames from '../../../routes/names';

class WelcomeChatScreen extends React.PureComponent {

    constructor (props) {
        super(props);
    }

    static navigationOptions = () => {
        return {
            title: 'Live Support',
        };
    };

    componentDidMount ()  {
        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            this.checkForMessages();
        });
    }

    componentDidUpdate () {
        const {isLoggedIn} = this.props;
        if (isLoggedIn) {
            this.checkForMessages();
        }
    }

    componentWillUnmount () {
        // this.focusListener.remove();
    }

    checkForMessages = () => {
        const {messages} = this.props;
        if (messages && messages.length > 0) {
            this.goToChat();
        }
    };

    goToChat = () => {
        this.props.navigation.replace(RouteNames.ChatScreen);
    };

    offlineSupport = () => {
        this.props.navigation.navigate(RouteNames.OfflineContactSupportScreen);
    };

    handleOnPress () {
        const {isLoggedIn} = this.props;
        if (!isLoggedIn) {
            return this.props.navigation.navigate(RouteNames.LoginScreen);
        } else {
            this.goToChat();
        }
    }

    render () {
        return (
            <View style={styles.container}>
                <View style={styles.welcomeView}>
                    <TouchableOpacity onPress={() => this.offlineSupport()}>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={styles.welcomeText}>{translate('chat.welcome_title')}</Text>
                            <Image
                                source={require('../../../common/assets/images/chat/hand.png')}
                                style={{
                                    width: 25,
                                    height: 25,
                                    marginLeft: 8,
                                    marginTop: 20,
                                }}
                            />
                        </View>

                    </TouchableOpacity>
                    <Text style={styles.welcomeDescriptionText}>{translate('chat.welcomeMessage')}</Text>
                </View>
                <View style={styles.welcomeViewImage}>
                    <Image style={{width: 120, height: 120}}
                           source={require('../../../common/assets/images/chat/ChatIcon.png')}/>
                </View>
                <TouchableOpacity onPress={this.handleOnPress.bind(this)}>
                    <View style={styles.startChatButton}>
                        <Text style={styles.chatButton}>{translate('chat.start_communication')}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'space-between',
    },
    welcomeView: {
        alignItems: 'center',
        marginTop: 50,
    },
    welcomeViewImage: {
        alignItems: 'center',
        marginTop: -20,
    },
    welcomeText: {
        color: '#000000',
        fontFamily: Theme.fonts.semiBold,
        fontSize: 22,
        textAlign: 'center',
        paddingTop: 20,
    },
    welcomeDescriptionText: {
        color: '#000000',
        fontFamily: Theme.fonts.medium,
        fontSize: 15,
        textAlign: 'center',
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    chatButton: {
        fontSize: 16,
        color: 'white',
        fontFamily: Theme.fonts.semiBold,
    },
    startChatButton: {
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.colors.primary,
    },
});

const mapStateToProps = ({app, chat}) => ({
    isLoggedIn: app.isLoggedIn,
    messages: chat.messages,
});

export default connect(
    mapStateToProps,
    {},
)(withNavigation(WelcomeChatScreen));
