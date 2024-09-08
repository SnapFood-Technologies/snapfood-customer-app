import React from 'react';
import { StyleSheet, TouchableOpacity, RefreshControl, View, Text, FlatList, Image, SafeAreaView, Platform } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import moment from 'moment';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import FastImage from 'react-native-fast-image';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Swipeout from 'react-native-swipeout';
import Feather from 'react-native-vector-icons/Feather';
import Spinner from 'react-native-loading-spinner-overlay';
import { setMessagesSeen, setAllChannels, setAllCallChannels } from '../../../store/actions/chat';
import RouteNames from '../../../routes/names';
import NewConvOptionModal from '../../../common/components/modals/NewConvOptionModal';
import ConfirmModal from '../../../common/components/modals/ConfirmModal';
import SearchBox from '../../../common/components/social/search/SearchBox';
import { translate } from '../../../common/services/translate';
import { appMoment } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import { isEmpty, convertTimestamp2Date, getImageFullURL, checkInSameWeek } from '../../../common/services/utility';
import FireStore from '../../../common/services/firebase';
import BlockSpinner from '../../../common/components/BlockSpinner';
import Theme from '../../../theme';
import { CALL_STATUS, ROLE_CUSTOMER } from '../../../config/constants';
import { deleteChannel } from '../../../common/services/chat';
import NoChats from '../components/NoChats';
import NoCalls from '../components/NoCalls';
import SwitchTab from '../../../common/components/SwitchTab';
import UserStories from '../components/UserStories';
import { goActiveScreenFromPush } from '../../../store/actions/app';
// svgs
import Svg_newcall from '../../../common/assets/svgs/btn_new_call.svg';
import Svg_newmsg from '../../../common/assets/svgs/btn_new_chat.svg';
import Svg_more from '../../../common/assets/svgs/btn_more.svg';
import Svg_outgoingcall from '../../../common/assets/svgs/ic_outgoingcall.svg';
import Svg_incomingcall from '../../../common/assets/svgs/ic_incomingcall.svg';
import Svg_missedcall from '../../../common/assets/svgs/ic_missedcall.svg';
import InviteContactsFriendModal from '../../../common/components/modals/InviteContactsFriendModal';
import { seconds2Time } from '../../../common/services/utility';

var call_channel_collection = FireStore.collection('call-channels');

var _navigation = null;
class ChatScreen extends React.Component {
    _isMounted = false
    constructor(props) {
        super(props);

        _navigation = props.navigation;
        this.state = {
            showConvModal: false,
            display_channels: [],
            isChatList: true,
            call_display_channels: [],
            isLoadingChat: null,
            isLoadingCall: null,
            isLoadingRemove: false,
            selectedChannel: null,
            isDeleteConfirm: false,
            appBadgeCount: 0,
            isRefreshing: false,
            refreshTime: new Date().getTime(),
        };
    }

    componentDidMount = () => {
        this.props.goActiveScreenFromPush({
            isGeneralStoryVisible: false
        })

        this._isMounted = true;
        this.removefocusListener = this.props.navigation.addListener('focus', () => {
            console.log('focus listener : get new invites')
            this.getBadgeCount();
        });
        this.getBadgeCount();

        this.setState({ display_channels: this.getChatChannels() }, () => {
            this.setState({ isLoadingChat: false });
        });
        this.getCallChannelsListner(this.props.user.id);
    }

    componentWillUnmount() {
        this._isMounted = false;
        if (this.removefocusListener) {
            this.removefocusListener()
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.props.user.id != prevProps.user.id) {
            console.log('componentDidUpdate : get Channels Listner')
            this.getCallChannelsListner(this.props.user.id);
        }
        const newChannels = this.getChatChannels();
        if (JSON.stringify(newChannels || []) !== JSON.stringify(this.state.display_channels || [])) {
            this.setState({ display_channels: newChannels, isLoadingChat: false, });
        }
    }

    getBadgeCount = () => {
        if (Platform.OS == 'ios') {
            try {
                PushNotificationIOS.getApplicationIconBadgeNumber(badge => {
                    this.setState({ appBadgeCount: badge })
                })
            } catch (error) {

            }
        }
    }

    canPassFilter = (chatUserId, chatUser, search, channel) => {
        const { full_name: name, username } = chatUser || {};
        const userId = this.props.user?.id;
        const canReturn = userId == chatUserId && name != null && (username || name).toLowerCase().includes(search);
        return canReturn && channel;
    };

    getChatChannels = () => {
        const search = this.state?.search || '';
        if (!search) return this.props.chat_channels;
        return this.props.chat_channels
            .map((channel) => {
                const { channel_type, partner, creator, full_name: channelName, last_msg } = channel || {};
                const canReturnFiltered = (chatUserId, chatUser) =>
                    this.canPassFilter(chatUserId, chatUser, search, channel);

                if (channel_type == 'single' && partner != null && creator != null) {
                    return canReturnFiltered(partner?.id, creator) || canReturnFiltered(creator?.id, partner);
                } else if (channelName) {
                    return !!(channelName != null && channelName.toLowerCase().includes(search)) && channel;
                } else {
                    const text = last_msg?.text || "";
                    const includeText = !!(text != null && text.toLowerCase().includes(search));
                    const creatorName = creator?.full_name || "";
                    const includeCreatorName = !!(creatorName != null && creatorName.toLowerCase().includes(search));
                    return !!(includeText || includeCreatorName) && channel;
                }
            })
            .filter(Boolean);
    };

    onChangeSearch = async (search) => {
        search = search.toLowerCase();
        this.setState({ search });

        let filtered_call_channels = [];
        this.props.call_channels.map((channel) => {
            const { partnerData } = channel || {};
            const { username, full_name } = partnerData || {};
            if (partnerData != null && (username || full_name).toLowerCase().includes(search)) {
                filtered_call_channels.push(channel);
            }
        });

        this.setState({ call_display_channels: filtered_call_channels })
    }

    getCallChannelsListner = (user_id) => {
        if (this.callchannel_listener) {
            console.log('remove old chat channel listener')
            this.callchannel_listener()
        }
        this.setState({ isLoadingCall: true })
        this.callchannel_listener = call_channel_collection.where('users', 'array-contains', user_id).orderBy('createdAt', 'desc').limit(200).onSnapshot((snapshots) => {
            let tmp_channels = [];
            for (let i = 0; i < snapshots.docs.length; i++) {
                let data = snapshots.docs[i].data();
                if (data) {
                    let partnerData = null;
                    let type = '';
                    let status = data.status;
                    let missedCount = 0;
                    if (data.partner && data.caller && data.caller.id == user_id) {
                        partnerData = data.partner;
                        type = 'outgoing';
                    }
                    else if (data.partner && data.caller && data.partner.id == user_id) {
                        partnerData = data.caller;
                        type = 'incoming';
                    }

                    if (type == 'incoming' && status == CALL_STATUS.missed) {
                        missedCount = 1;
                    }

                    if (partnerData) {
                        tmp_channels.push({
                            id: data.id,
                            partnerData: partnerData,
                            type: type,
                            isVideoCall: data.isVideoCall != false,
                            missedCount: missedCount,
                            status: status,
                            duration: data.duration,
                            createdAt: data.createdAt
                        })
                    }
                }
            }
            this.setState({ call_display_channels: tmp_channels, isLoadingCall: false })
            this.props.setAllCallChannels(tmp_channels)
        },
            (error) => {
                this.setState({ isLoadingCall: false })
                console.log('call channel listener error', error)
            });
    }

    onDeleteChannel = async () => {
        if (this.state.selectedChannel == null) { return; }
        this.setState({ isLoadingRemove: true })
        let ret = await deleteChannel(this.state.selectedChannel.id);
        if (ret != true) {
            this.setState({ isDeleteConfirm: false, isLoadingRemove: false, });
            alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
        }
        else {
            this.setState({ isDeleteConfirm: false, isLoadingRemove: false, });
        }
    }

    renderSearchbar() {
        const { isChatList } = this.state;
        return (<View style={styles.searchContainer}>
            <TouchableOpacity
                style={styles.moreContainer}
                onPress={() => {
                    this.props.navigation.push(RouteNames.MyFriendsScreen);
                }} >
                <Feather name='user-plus' size={22} color={Theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.spaceRow} />
            <SearchBox onChangeText={this.onChangeSearch} hint={translate('social.search.chat')} />
            <View style={styles.spaceRow} />
            <TouchableOpacity onPress={() => {
                if (isChatList) {
                    this.setState({ showConvModal: true })
                }
                else {
                    this.props.navigation.push(RouteNames.NewCallScreen);
                }
            }} >
                {isChatList ? <Svg_newmsg width={45} height={45} /> : <Svg_newcall width={45} height={45} />}
            </TouchableOpacity>
            <View style={styles.spaceRow} />
            <Menu>
                <MenuTrigger>
                    <View style={styles.moreContainer}>
                        <Svg_more width={45} height={45} />
                        {
                            (this.props.new_invites.length > 0 || this.state.appBadgeCount > 0)
                            && <View style={styles.moreAlert} />
                        }
                    </View>
                </MenuTrigger>
                <MenuOptions optionsContainerStyle={styles.popupContainer}>
                    <MenuOption onSelect={() => { this.props.navigation.push(RouteNames.InvitationsScreen); }} >
                        <View style={{ padding: 5, paddingBottom: 12, alignItems: 'center', borderColor: '#F6F6F9', borderBottomWidth: 1, flexDirection: 'row' }}>
                            <Text style={styles.popupText}>{translate('social.invitation')}</Text>
                            {
                                this.props.new_invites.length > 0 &&
                                <Text style={{ color: '#F55A00', fontSize: 11, marginLeft: 5, fontFamily: Theme.fonts.medium }}>
                                    ({this.props.new_invites.length} new)</Text>
                            }
                        </View>
                    </MenuOption>
                    <MenuOption onSelect={() => { this.props.navigation.push(RouteNames.MyFriendsScreen); }} >
                        <View style={{ paddingHorizontal: 5, paddingBottom: 12, borderColor: '#F6F6F9', borderBottomWidth: 1, flexDirection: 'row' }}>
                            <Text style={styles.popupText}>{translate('social.my_friends')}</Text>
                        </View>
                    </MenuOption>
                    <MenuOption onSelect={() => {
                        this.props.navigation.push(RouteNames.SnapfoodMapScreen);
                    }}>
                        <View style={{ paddingHorizontal: 5, paddingBottom: 10, alignItems: 'center', flexDirection: 'row' }}>
                            <Text style={styles.popupText}>{translate('social.snapfood_map')}</Text>
                            {
                                this.state.appBadgeCount > 0 &&
                                <View style={{
                                    width: 10,
                                    height: 10,
                                    marginLeft: 4,
                                    marginTop: 4,
                                    backgroundColor: '#F55A00',
                                    borderRadius: 10
                                }} />
                            }
                        </View>
                    </MenuOption>
                    <MenuOption onSelect={() => { this.props.navigation.push(RouteNames.StorySettingScreen); }} >
                        <View style={{ paddingHorizontal: 5, paddingBottom: 12, borderColor: '#F6F6F9', borderBottomWidth: 1, flexDirection: 'row' }}>
                            <Text style={styles.popupText}>{translate('account.story_setting')}</Text>
                        </View>
                    </MenuOption>
                </MenuOptions>
            </Menu>
        </View>);
    }

    renderTab() {
        const { isChatList } = this.state;
        return <View style={[Theme.styles.col_center, { width: '100%', }]}>
            <View style={[Theme.styles.row_center, styles.operationTab]}>
                <SwitchTab
                    items={['Chats', 'Calls']}
                    curitem={isChatList == true ? 'Chats' : 'Calls'}
                    style={{ width: '100%', paddingLeft: 0, paddingRight: 0 }}
                    onSelect={(item) => {
                        this.setState({ isChatList: item == 'Chats' })
                    }}
                />
            </View>
        </View>
    }

    renderCallItem(item, index) {
        let lastCallColor;
        let lastCallIcon;
        let lastCallText;
        let name = '';
        let time = '';
        let duration = '';
        let avatar = 'default';

        if (item.item.partnerData) {
            name = item.item.partnerData.username || item.item.partnerData.full_name;
            avatar = item.item.partnerData.photo;
        }
        if (item.item.missedCount > 0) {
            lastCallColor = '#F55A00';
            lastCallIcon = <Svg_missedcall />
            lastCallText = "" + item.item.missedCount + translate('video_call.miss_call');
        } else if (item.item.type == 'incoming') {
            lastCallColor = '#00C22D';
            lastCallIcon = <Svg_incomingcall />
            lastCallText = translate('video_call.incoming');
            if (item.item.duration > 0) {
                duration = seconds2Time(item.item.duration / 1000)
            }
        }
        else {
            lastCallColor = '#50b7ed';
            lastCallIcon = <Svg_outgoingcall />
            lastCallText = translate('video_call.outgoing');
            if (item.item.duration > 0) {
                duration = seconds2Time(item.item.duration / 1000)
            }
        }

        if (item.item.createdAt) {
            let msg_moment = moment(new Date(item.item.createdAt));
            let cur_moment = moment();
            if (msg_moment.format('DD/MM/YYYY') == cur_moment.format('DD/MM/YYYY')) {
                time = msg_moment.format('h:mm A');
            }
            else if (checkInSameWeek(new Date(item.item.createdAt))) {
                time = msg_moment.format('dddd');
            }
            else {
                time = msg_moment.format('DD/MM/YYYY');
            }
        }


        return (
            <TouchableOpacity style={[Theme.styles.row_center, styles.chatContainer]} onPress={() => {
                if (item.item.partnerData && _navigation) {
                    _navigation.navigate(RouteNames.VideoCallScreen, {
                        type: 'outgoing',
                        isVideoCall: item.item.isVideoCall != false,
                        OutgoingCallReceiver: {
                            id: item.item.partnerData.id,
                            username: item.item.partnerData.username || null,
                            full_name: item.item.partnerData.full_name || null,
                            photo: item.item.partnerData.photo || null,
                            phone: item.item.partnerData.phone || null,
                            email: item.item.partnerData.email || null,
                            role: ROLE_CUSTOMER
                        }
                    });
                }
            }}>
                <FastImage
                    style={styles.avatar}
                    source={{ uri: getImageFullURL(avatar) }}
                    resizeMode={FastImage.resizeMode.contain} />
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.time}>{time}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                                {lastCallIcon}
                                <Text style={{ marginLeft: 5, color: lastCallColor, fontSize: 14, fontFamily: Theme.fonts.regular }}>{lastCallText}</Text>
                            </View>
                            {!isEmpty(duration) &&
                                <Text style={styles.duration}>{duration}</Text>
                            }
                        </View>
                        {item.item.isVideoCall != false ?
                            <Feather name="video" size={20} color={Theme.colors.cyan2} /> :
                            <Feather name="phone" size={20} color={Theme.colors.cyan2} />
                        }
                    </View>
                </View>
            </TouchableOpacity>
        );
    }


    renderHistory() {
        return (
            <FlatList
                style={styles.listContainer}
                data={this.state.isChatList ? this.state.display_channels : this.state.call_display_channels}
                numColumns={1}
                keyboardDismissMode='on-drag'
                keyboardShouldPersistTaps='handled'
                keyExtractor={item => item.id.toString()}
                renderItem={(item, index) => this.state.isChatList ? this.renderChatItem(item) : this.renderCallItem(item)}
                ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
                ListFooterComponent={() => <View style={styles.footerCol} />}
                ListEmptyComponent={() =>
                    (this.state.isChatList && this.state.isLoadingChat == false) ?
                        <NoChats />
                        :
                        (!this.state.isChatList && this.state.isLoadingCall == false) &&
                        <NoCalls />
                }
                ListHeaderComponent={
                    <View style={{ width: '100%', marginBottom: 12, }}>
                        <UserStories navigation={this.props.navigation} forceReload={this.state.refreshTime} />
                        {this.renderTab()}
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={() => {
                            this.setState({
                                isRefreshing: true,
                                refreshTime: new Date().getTime()
                            });
                            setTimeout(() => {
                                this.setState({
                                    isRefreshing: false,
                                });
                            }, 800)
                        }}
                    />
                }
            />);
    }

    renderSnapFoodMapButton() {
        return (
            <View style={styles.SnapFoodMapContainer}>
                <TouchableOpacity style={[Theme.styles.col_center, styles.SnapFoodMapButton]} onPress={() => {
                    this.props.navigation.push(RouteNames.SnapfoodMapScreen)
                }}>
                    {/* <Entypo name='map' size={30} color={Theme.colors.white} /> */}
                    <FastImage
                        source={
                            require('../../../common/assets/images/chat/open_maps.png')
                        }
                        style={styles.SnapFoodMapImage}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    renderChatItem({ item }) {
        const user_id = this.props.user.id
        const getPhoto = () => {
            if (item.channel_type == 'single' || item.channel_type == 'admin_support') {
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
            else if (item.channel_type == 'admin_support') {
                if (user_id == item.creator.id) {
                    return translate(item.partner.username || item.partner.full_name)
                }
                else if (user_id == item.partner.id) {
                    return translate(item.creator.username || item.creator.full_name)
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

            if (item.channel_type == 'single' || item.channel_type == 'admin_support') {
                if (item.last_msg.map != null) {
                    return isMe ? translate('social.chat.you_shared_location') : translate('social.chat.user_shared_location')
                }
                else if (item.last_msg.emoji != null) {
                    return (item.last_msg.emoji != null && item.last_msg.emoji.length > 0) ? item.last_msg.emoji.map(item => item.code).join('') : '';
                }
                else if (item.last_msg.images != null) {
                    if (item.last_msg.reply_type == 'story' && item.last_msg.text != null) {
                        return item.last_msg.text;
                    }
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

        const canDelete = () => {
            if (item == null) { return false; }
            if (item.channel_type == 'single' || item.channel_type == 'admin_support') {
                return true;
            }
            if (item.channel_type != 'single' && item.admin != null && item.admin.id == user_id) {
                return true;
            }
            return false;
        }

        return (
            <Swipeout
                autoClose={true}
                disabled={!canDelete()}
                backgroundColor={Theme.colors.white}
                right={[
                    {
                        text: translate('address_list.delete'),
                        backgroundColor: '#f44336',
                        underlayColor: 'rgba(0, 0, 0, 0.6)',
                        onPress: () => {
                            this.setState({
                                selectedChannel: item,
                                isDeleteConfirm: true
                            });
                        },
                    },
                ]}
            >
                <TouchableOpacity style={styles.chatContainer} onPress={() => {
                    this.props.navigation.navigate(RouteNames.MessagesScreen, { channelId: item.id })
                }}>
                    <FastImage
                        style={styles.avatar}
                        source={{ uri: getPhoto() }}
                        resizeMode={FastImage.resizeMode.cover} />
                    <View style={{ flex: 1, }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.name}>{getName()}</Text>
                            <Text style={styles.time}>{getTime()}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'flex-end' }}>
                            <Text style={styles.message} numberOfLines={2} >{getLastMsg()}</Text>
                            {
                                getUnreadCnt() > 0 &&
                                <View style={styles.unreadContainer}>
                                    <Text style={styles.unread}>{getUnreadCnt()}</Text>
                                </View>
                            }
                        </View>
                    </View>
                </TouchableOpacity>
            </Swipeout>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.isLoadingRemove} />
                {this.renderSearchbar()}
                {
                    this.renderHistory()
                }
                <NewConvOptionModal showModal={this.state.showConvModal}
                    goChat={() => {
                        this.setState({ showConvModal: false })
                        this.props.navigation.push(RouteNames.NewChatScreen);
                    }}
                    goGroupChat={() => {
                        this.setState({ showConvModal: false })
                        this.props.navigation.navigate(RouteNames.NewGroupScreen)
                    }}
                    onClose={() => this.setState({ showConvModal: false })} />

                <ConfirmModal showModal={this.state.isDeleteConfirm}
                    title={this.state.selectedChannel ?
                        (this.state.selectedChannel.channel_type == 'single' ?
                            translate('social.delete_conv_confirm') : translate('group_related.confirm_del_group'))
                        :
                        translate('social.delete_conv_confirm')
                    }
                    yes={translate('social.delete_confirm_yes')} no={translate('social.delete_confirm_no')}
                    onYes={this.onDeleteChannel}
                    onClose={() => this.setState({ isDeleteConfirm: false })} />
                <InviteContactsFriendModal />
                {this.renderSnapFoodMapButton()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 0,
        flexDirection: 'row',
        marginTop: 38,
    },
    moreContainer: {
        width: 45,
        height: 45,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E9E9F7',
        alignItems: 'center',
        justifyContent: 'center'
    },
    moreIcon: {
        height: 20,
        width: 20
    },
    moreAlert: {
        width: 10,
        height: 10,
        backgroundColor: '#F55A00',
        position: 'absolute',
        top: -5,
        right: -5,
        borderRadius: 10
    },
    spaceRow: {
        width: 15
    },
    spaceCol: {
        height: 15
    },
    footerCol: {
        height: 75
    },
    operationTab: { height: 62, width: '100%', marginTop: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F6F6F9' },
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
        paddingBottom: 10,
        marginTop: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
        backgroundColor: '#FAFAFC'
    },
    name: {
        flex: 1,
        fontSize: 17,
        color: Theme.colors.text,
        fontFamily: Theme.fonts.semiBold
    },
    time: {
        fontSize: 15,
        color: Theme.colors.gray7,
        fontFamily: Theme.fonts.semiBold
    },
    duration: {
        marginTop: 4,
        fontSize: 15,
        lineHeight: 18,
        color: Theme.colors.gray7,
        fontFamily: Theme.fonts.medium
    },
    message: {
        flex: 1,
        fontSize: 15,
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
        fontSize: 13,
        lineHeight: 15,
    },
    popupContainer: {
        width: 160,
        borderColor: '#E9E9F7',
        borderRadius: 12,
        backgroundColor: 'white',
        borderWidth: 2,
        paddingHorizontal: 2,
        marginTop: 50,
        elevation: 0
    },
    popupText: {
        color: Theme.colors.text,
        fontSize: 17,
        fontFamily: Theme.fonts.semiBold
    },
    SnapFoodMapContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    SnapFoodMapButton: {
        width: 65,
        height: 65,
        // borderRadius: 30,
        elevation: 10,
    },
    SnapFoodMapImage: {
        width: 65,
        height: 65
    },
});

const mapStateToProps = ({ app, chat }) => ({
    isLoggedIn: app.isLoggedIn,
    language: app.language,
    user: app.user,
    new_invites: chat.new_invites,
    isLoadingChat: app.isLoadingChat,
    chat_channels: chat.chat_channels || [],
    call_channels: chat.call_channels || [],
});

export default connect(mapStateToProps, {
    setMessagesSeen,
    setAllChannels,
    setAllCallChannels,
    goActiveScreenFromPush,
})(withNavigation(ChatScreen));