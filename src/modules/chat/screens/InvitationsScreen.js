import React from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, View, Text, FlatList, SafeAreaView, Platform } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import BackButton from "../../../common/components/buttons/back_button";
import { getFriends } from '../../../store/actions/app';
import { goActiveScreenFromPush } from '../../../store/actions/app';
import { appMoment } from '../../../common/services/translate';
import { translate } from '../../../common/services/translate';
import { getImageFullURL, isEmpty } from '../../../common/services/utility';
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';
import FastImage from "react-native-fast-image";
import { default as AntIcon } from 'react-native-vector-icons/AntDesign';
import Theme from "../../../theme";
import RouteNames from '../../../routes/names';
import { setNewInvites } from "../../../store/actions/chat"
import NoFriends from '../components/NoFriends';

class InvitationsScreen extends React.Component {
    _isMounted = false
    _Timer = null
    constructor(props) {
        super(props);
        this.state = {
            isReceived: true,
            all_invitations: [],
            all_sents: [],
            inviteLoading: null,
            sentLoading: null,
        };
    }

    componentDidMount = () => {
        this._isMounted = true;

        this.removefocusListener = this.props.navigation.addListener('focus', () => {
            this.seenInvitation()
            this.getAllInvites()
            this.getAllSents()
        });
        this.props.goActiveScreenFromPush({
            isInvitationVisible: false
        })

        this._Timer = setInterval(() => {
            this.getAllInvites(true)
            this.getAllSents(true)
        }, 6000)
    }

    componentWillUnmount() {
        this._isMounted = false;
        if (this.removefocusListener) {
            this.removefocusListener()
        }

        if (this._Timer) {
            clearInterval(this._Timer);
            this._Timer = null;
        }
    }

    getAllInvites = async (isRefresh = false) => {
        if (isRefresh == false) {
            this.setState({ inviteLoading: true })
        }
        apiFactory.get(`users/invitations`).then(({ data }) => {
            
            const res_invitations = data['invitations'];
            if (this._isMounted == true) {
                this.setState({
                    all_invitations: res_invitations,
                });
                if (isRefresh != false) {
                    this.setState({
                        inviteLoading: false
                    });
                }
            }
        },
            (error) => {
                this.setState({ inviteLoading: false })
                const message = error.message || translate('generic_error');
                // alerts.error(translate('alerts.error'), message);
            });
    };

    getAllSents = async (isRefresh = false) => {
        if (isRefresh == false) {
            this.setState({ sentLoading: true })
        }
        this.props.getFriends('invited').then(data => {
            if (this._isMounted == true) {
                this.setState({
                    all_sents: data,
                })
                if (isRefresh != false) {
                    this.setState({
                        sentLoading: false
                    });
                }
            }
        })
            .catch(err => {
                
                this.setState({ sentLoading: false })
            })
    };

    seenInvitation = async () => {
        apiFactory.post(`users/invitations/seen`, {
            friend_id: this.props.user.id,
        })
            .then((res) => {
                this.getAllInvites()
                this.props.setNewInvites([]);
            },
                (error) => {
                    const message = error.message || translate('generic_error');
                    alerts.error(translate('alerts.error'), message);
                });
    }

    replyInvitation = async (item, status) => {
        apiFactory.post(`users/friends/update`, {
            user_id: item.id,
            friend_id: this.props.user.id,
            status: status
        })
            .then((res) => {
                this.getAllInvites()
            },
                (error) => {
                    const message = error.message || translate('generic_error');
                    alerts.error(translate('alerts.error'), message);
                });
    }

    onCancelInvitation = async (item) => {
        apiFactory.post(`users/friends/remove`, {
            user_id: this.props.user.id,
            friend_id: item.id
        }).then((res) => {
            this.getAllSents()
        },
            (error) => {
                const message = error.message || translate('generic_error');
                alerts.error(translate('alerts.error'), message);
            });
    }

    render() {
        const { isReceived } = this.state;
        return (
            <View style={styles.container}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                    {this.renderTitleBar()}
                    {this.renderTab()}
                    {isReceived ? this.renderReceived() : this.renderSent()}
                </View>
            </View>
        );
    }

    renderTitleBar() {
        return (
            <View style={styles.titleContainer}>
                <BackButton onPress={() => {
                    this.props.navigation.goBack();
                }} />
                <Text style={styles.title}>{translate('social.invitation')}</Text>
            </View>
        );
    }

    renderTab() {
        const { isReceived } = this.state;
        return (
            <View style={styles.tabContainer}>
                {this.renderTabButton('Received', isReceived, () => {
                    this.setState({ isReceived: true })
                })}
                <View style={styles.spaceRow} />
                {this.renderTabButton('Sent', !isReceived, () => {
                    this.setState({ isReceived: false })
                })}
            </View>
        );
    }

    renderTabButton(title, isSelected, onPress) {
        return (
            <TouchableOpacity style={[styles.tabButton, { backgroundColor: isSelected ? '#E0FBFB' : 'white' }]}
                onPress={onPress}>
                <Text style={[styles.tabText, { color: isSelected ? '#50b7ed' : 'black' }]}>{translate(title)}</Text>
            </TouchableOpacity>
        );
    }

    renderReceived() {
        return (
            <FlatList
                style={styles.listContainer}
                data={this.state.all_invitations}
                numColumns={1}
                keyExtractor={item => item.id.toString()}
                renderItem={this.renderReceivedItem}
                ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
                ListEmptyComponent={() => this.state.inviteLoading == false && <NoFriends title={translate('social.no_invitations_invite_received')} desc={translate('social.no_invitations_invite_received_description')} />}
            />);
    }

    renderReceivedItem = ({ item }) => {
        return (
            <TouchableOpacity style={styles.chatContainer}
                onPress={() => {
                    this.props.navigation.navigate(RouteNames.SnapfooderScreen, { user: item, isInviteReceived: true });
                }}
            >
                <FastImage
                    style={styles.avatar}
                    source={{ uri: getImageFullURL(item.photo) }}
                    resizeMode={FastImage.resizeMode.cover} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.username || item.full_name}</Text>
                    <Text style={styles.time}>{appMoment(item['invite_date']).format('DD/MM/YYYY')}</Text>
                </View>
                <TouchableOpacity onPress={() => this.replyInvitation(item, 'canceled')} style={{ marginRight: 20, width: 30, height: 30, borderRadius: 6, backgroundColor: '#AAA8BF', alignItems: 'center', justifyContent: 'center' }}>
                    <AntIcon name="close" size={16} color={'#FFFFFF'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.replyInvitation(item, 'accepted')} style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: '#00C22D', alignItems: 'center', justifyContent: 'center' }}>
                    <AntIcon name="check" size={16} color={'#FFFFFF'} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    }

    renderSent() {
        return (
            <FlatList
                style={styles.listContainer}
                data={this.state.all_sents}
                numColumns={1}
                keyExtractor={item => item.id.toString()}
                renderItem={this.renderSentItem}
                ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
                ListEmptyComponent={() => this.state.inviteLoading == false && <NoFriends title={translate('social.no_invitations_invite_sent')} desc={translate('social.no_invitations_invite_sent_description')} />}
            />);
    }

    renderSentItem = ({ item }) => {
        return (
            <TouchableOpacity style={styles.chatContainer}
                onPress={() => {
                    this.props.navigation.navigate(RouteNames.SnapfooderScreen, { user: item });
                }}
            >
                <FastImage
                    style={styles.avatar}
                    source={{ uri: getImageFullURL(item.photo) }}
                    resizeMode={FastImage.resizeMode.cover} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.username || item.full_name}</Text>
                    <Text style={styles.time}>{appMoment(item['invite_date']).format('DD/MM/YYYY')}</Text>
                </View>
                <TouchableOpacity onPress={() => this.onCancelInvitation(item)}>
                    <Text style={styles.invite}>{translate('cancel')}</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        marginTop: 30,
    },
    title: {
        alignSelf: 'center',
        flex: 1,
        textAlign: 'center',
        marginRight: 30,
        fontSize: 19,
        fontFamily: Theme.fonts.bold
    },
    searchContainer: {
        marginTop: 20
    },
    spaceRow: {
        width: 15
    },
    spaceCol: {
        height: 10
    },
    tabContainer: {
        borderColor: '#F6F6F9',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingVertical: 10,
        flexDirection: 'row',
        marginTop: 10
    },
    tabButton: {
        flex: 1,
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tabText: {
        fontSize: 16,
        fontFamily: Theme.fonts.semiBold
    },
    chatContainer: {
        padding: 10,
        flexDirection: 'row',
        borderRadius: 15,
        backgroundColor: '#FAFAFC',
        alignItems: 'center'
    },
    listContainer: {
        flex: 1,
        width: '100%',
        marginTop: 20
    },
    avatar: {
        width: 35,
        height: 35,
        borderRadius: 18,
        backgroundColor: 'red',
        marginRight: 20
    },
    name: {
        flex: 1,
        fontSize: 17,
        color: Theme.colors.text,
        fontFamily: Theme.fonts.semiBold
    },
    time: {
        fontSize: 15,
        color: Theme.colors.text,
        marginTop: 5,
        fontFamily: Theme.fonts.medium
    },
    invite: {
        color: '#AAA8BF',
        fontSize: 17,
        fontFamily: Theme.fonts.semiBold
    }
});

const mapStateToProps = ({ app, chat }) => ({
    isLoggedIn: app.isLoggedIn,
    user: app.user,
    messages: chat.messages,
    safeAreaDims: app.safeAreaDims,
});

export default connect(mapStateToProps, { getFriends, goActiveScreenFromPush, setNewInvites })(
    withNavigation(InvitationsScreen)
);
