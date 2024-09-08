import React from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, KeyboardAvoidingView, View, Text, FlatList, Image, SafeAreaView } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import moment from 'moment';
import FastImage from "react-native-fast-image";
import { setMessagesSeen, setAllChannels } from '../../../store/actions/chat';
import { sendMessage } from '../../../common/services/chat';
import SearchBox from "../../../common/components/social/search/SearchBox";
import { translate } from '../../../common/services/translate';
import { isEmpty, convertTimestamp2Date, getImageFullURL, checkInSameWeek } from '../../../common/services/utility';
import Theme from "../../../theme";
import RouteNames from '../../../routes/names';
import NoChats from '../components/NoChats';
import { AppText, RadioBtn } from '../../../common/components';
import MainButton from '../../../common/components/buttons/main_button';
// svgs
import Svg_rad_active from '../../../common/assets/svgs/radio_selected.svg'
import Svg_rad_inactive from '../../../common/assets/svgs/radio_unselected.svg'
import { height, width } from 'react-native-dimension';

class ForwardScreen extends React.Component {
    _isMounted = false
    constructor(props) {
        super(props);

        this.state = {
            channelData: this.props.route.params.channelData,
            targetMessage: this.props.route.params.message,
            display_channels: this.props.chat_channels.filter(i => i.id != this.props.route.params.channelData.id),
            selectedChannel: {},
        };
    }

    onChangeSearch = async (search) => {
        search = search.toLowerCase();
        const user_id = this.props.user.id;
        let filtered_channels = [];
        let channels = this.props.chat_channels.filter(i => i.id != this.props.route.params.channelData.id);

        channels.map((channel) => {
            if (channel.channel_type == 'single' && channel.partner != null && channel.creator != null) {
                if (user_id == channel.creator.id && channel.partner.full_name != null && (channel.partner.username || channel.partner.full_name).toLowerCase().includes(search)) {
                    filtered_channels.push(channel)
                }
                else if (user_id == channel.partner.id && channel.creator.full_name != null && (channel.creator.username || channel.creator.full_name).toLowerCase().includes(search)) {
                    filtered_channels.push(channel)
                }
            }
            else {
                if (channel.full_name != null && channel.full_name.toLowerCase().includes(search)) {
                    filtered_channels.push(channel)
                }
            }
        })

        this.setState({ display_channels: filtered_channels })
    }

    onForward = () => {
        if (this.state.selectedChannel.id == null) {
            return;
        }
        let newMsg = {
            ...this.state.targetMessage,
            likes: [],
            isForward: true,
            user: {
                _id: this.props.user.id,
                username: this.props.user.username,
                full_name: this.props.user.full_name,
                photo: this.props.user.photo,
                phone: this.props.user.phone,
                email: this.props.user.email,
            },
        };

        sendMessage(this.state.selectedChannel.id, this.props.user.id, newMsg);
        this.props.navigation.goBack();
        this.props.navigation.navigate(RouteNames.MessagesScreen, { channelId: this.state.selectedChannel.id });
    }

    renderSearchbar() {
        return (
            <View style={[Theme.styles.row_center, styles.searchContainer]}>
                <TouchableOpacity
                    onPress={() => {
                        this.props.navigation.goBack();
                    }}
                >
                    <AppText>{translate('cancel')}</AppText>
                </TouchableOpacity>
                <View style={styles.spaceRow} />
                <SearchBox onChangeText={this.onChangeSearch} hint={translate('social.search.chat')} />
            </View>
        );
    }

    renderChatItem({ item }) {
        const user_id = this.props.user.id
        const getPhoto = () => {
            if (item.channel_type == 'single') {
                if (user_id == item.creator.id) {
                    return getImageFullURL(item.partner.photo)
                }
                else if (user_id == item.partner.id) {
                    return getImageFullURL(item.creator.photo)
                }
            }
            else {
                return getImageFullURL(item.photo)
            }
            return getImageFullURL('default')
        }
        const getName = () => {
            if (item.channel_type == 'single') {
                if (user_id == item.creator.id) {
                    return item.partner.username || item.partner.full_name
                }
                else if (user_id == item.partner.id) {
                    return item.creator.username || item.creator.full_name
                }
            }
            else {
                return item.username || item.full_name
            }
            return ''
        }
        const getLastMsg = () => {
            if (item.last_msg == null) { return ''; }
            if (item.last_msg.user == null) { return ''; }

            let isMe = false;
            let last_msg_user = item.last_msg.user.username || item.last_msg.user.full_name;
            if (user_id == item.last_msg.user._id) {
                last_msg_user = translate('you');
                isMe = true;
            }

            if (item.channel_type == 'single') {
                if (item.last_msg.map != null) {
                    return isMe ? translate('social.chat.you_shared_location') : translate('social.chat.user_shared_location')
                }
                else if (item.last_msg.emoji != null) {
                    return (item.last_msg.emoji != null && item.last_msg.emoji.length > 0) ? item.last_msg.emoji.map(item => item.code).join('') : '';
                }
                else if (item.last_msg.images != null) {
                    return isMe ? translate('social.chat.you_shared_photo') : translate('social.chat.user_shared_photo')
                }
                else if (item.last_msg.audio != null) {
                    return isMe ? translate('social.chat.you_shared_audio') : translate('social.chat.user_shared_audio')
                }
                else if (item.last_msg.text != null) {
                    return item.last_msg.text;
                }
                return ''
            }
            else {
                if (item.last_msg.map != null) {
                    return last_msg_user + ': ' + (isMe ? translate('social.chat.you_shared_location') : translate('social.chat.user_shared_location'));
                }
                else if (item.last_msg.emoji != null) {
                    return last_msg_user + ': ' + (isMe ? translate('social.chat.you_sent_emoji') : translate('social.chat.user_sent_emoji'))
                    // + (item.last_msg.emoji.code != null ? item.last_msg.emoji.code : item.last_msg.emoji.name)
                }
                else if (item.last_msg.images != null) {
                    return last_msg_user + ': ' + (isMe ? translate('social.chat.you_shared_photo') : translate('social.chat.user_shared_photo'))
                }
                else if (item.last_msg.audio != null) {
                    return last_msg_user + ': ' + (isMe ? translate('social.chat.you_shared_audio') : translate('social.chat.user_shared_audio'))
                }
                else if (item.last_msg.text != null) {
                    return last_msg_user + ': ' + item.last_msg.text;
                }
                return ''
            }
        }
        const getTime = () => {
            if (item.last_msg != null && item.last_msg.createdAt != null) {
                let msg_moment = moment(convertTimestamp2Date(item.last_msg.createdAt));
                let cur_moment = moment();
                if (msg_moment.format('DD/MM/YYYY') == cur_moment.format('DD/MM/YYYY')) {
                    return moment(convertTimestamp2Date(item.last_msg.createdAt)).format('h:mm A');
                }
                if (checkInSameWeek(convertTimestamp2Date(item.last_msg.createdAt))) {
                    return msg_moment.format('dddd');
                }
                return msg_moment.format('DD/MM/YYYY');
            }
            else {
                return ''
            }
        }
        const getUnreadCnt = () => {
            if (item.unread_cnt != null) {
                return item.unread_cnt[this.props.user.id] || 0
            }
            return 0
        }

        return (
            <TouchableOpacity style={styles.chatContainer}
                onPress={() => {
                    this.setState({ selectedChannel: item })
                }}>
                <View style={[Theme.styles.col_center]}>
                    <FastImage
                        style={styles.avatar}
                        source={{ uri: getPhoto() }}
                        resizeMode={FastImage.resizeMode.cover} />
                </View>
                <View style={[Theme.styles.col_center, { flex: 1 }]}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.name}>{getName()}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'flex-end' }}>
                        <Text style={styles.message} numberOfLines={2} >{getLastMsg()}</Text>
                        {/* {
                            getUnreadCnt() > 0 &&
                            <View style={styles.unreadContainer}>
                                <Text style={styles.unread}>{getUnreadCnt()}</Text>
                            </View>
                        } */}
                    </View>
                </View>
                <View style={[Theme.styles.col_center]}>
                    {
                        this.state.selectedChannel.id == item.id ?
                            <Svg_rad_active width={22} height={22} /> : <Svg_rad_inactive width={22} height={22} />
                    }
                </View>

            </TouchableOpacity>
        );
    }

    render() {
        return (
            <View style={[Theme.styles.col_center, styles.screen]}>
                <TouchableOpacity
                    style={[Theme.styles.col_center, styles.overlay]}
                    activeOpacity={1}
                    onPress={() => {
                        this.props.navigation.goBack()
                    }}
                />
                <View style={[Theme.styles.col_center, styles.container]}>
                    {this.renderSearchbar()}
                    <FlatList
                        style={styles.listContainer}
                        data={this.state.display_channels}
                        numColumns={1}
                        keyExtractor={item => item.id.toString()}
                        renderItem={(item, index) => this.renderChatItem(item)}
                        ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
                        ListFooterComponent={() => <View style={styles.spaceCol} />}
                        ListEmptyComponent={() => <NoChats />}
                    />
                    <View style={[Theme.styles.col_center, styles.btnContainer]}>
                        <MainButton
                            title={translate('social.chat.forward')}
                            disabled={this.state.selectedChannel.id == null}
                            style={{ width: '100%' }}
                            onPress={this.onForward}
                        />
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    screen: { width: '100%', height: '100%', paddingTop: 86, justifyContent: 'flex-end' },
    overlay: { width: width(100), height: height(100), position: 'absolute', top: 0, left: 0 },
    container: {
        justifyContent: "center",
        alignItems: "center",
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        width: '100%',
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: 'row',
        marginTop: 20,
    },
    spaceRow: {
        width: 15
    },
    spaceCol: {
        height: 15
    },
    chatContainer: {
        padding: 10,
        flexDirection: 'row',
        borderRadius: 15,
        backgroundColor: '#FAFAFC'
    },
    listContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 6,
        backgroundColor: 'red',
        marginRight: 10
    },
    name: {
        flex: 1,
        fontSize: 16,
        color: Theme.colors.text,
        fontFamily: Theme.fonts.semiBold
    },
    time: {
        fontSize: 14,
        color: Theme.colors.gray7,
        fontFamily: Theme.fonts.semiBold
    },
    message: {
        flex: 1,
        fontSize: 14,
        color: Theme.colors.text,
        fontFamily: Theme.fonts.medium,
        marginRight: 24
    },
    unreadContainer: {
        marginLeft: 20,
        height: 15,
        paddingHorizontal: 4,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F55A00',
    },
    unread: {
        textAlign: 'center',
        color: 'white',
        fontSize: 12,
        lineHeight: 14,
    },
    btnContainer: { width: '100%', paddingHorizontal: 20, paddingBottom: 30 }
});

const mapStateToProps = ({ app, chat }) => ({
    isLoggedIn: app.isLoggedIn,
    language: app.language,
    user: app.user,
    chat_channels: chat.chat_channels || []
});

export default connect(
    mapStateToProps,
    {
        setMessagesSeen,
        sendMessage,
        setAllChannels,
    },
)(withNavigation(ForwardScreen));
