import React from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, View, Text, FlatList, ScrollView, Switch, Platform, SafeAreaView } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import FastImage from "react-native-fast-image";
import ImagePicker from 'react-native-image-crop-picker';
import Theme from "../../../theme";
import RouteNames from '../../../routes/names';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import { createGroupChannel, uploadImage, sendGroupChatInviteNotification } from '../../../common/services/chat';
import BackButton from "../../../common/components/buttons/back_button";
import MainBtn from "../../../common/components/buttons/main_button";
import AuthInput from '../../../common/components/AuthInput';
import ImgPickOptionModal from '../../../common/components/modals/ImgPickOptionModal';
import UserListItem from '../components/UserListItem';
// svgs
import Svg_upload from '../../../common/assets/svgs/ic_upload.svg';
import { getImageFullURL } from '../../../common/services/utility';
import AppText from '../../../common/components/AppText';

class CreateGroupScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showPickerModal: false,
            loading: false,
            photo: null,
            groupId: props.route.params.groupId,
            photo_url: props.route.params.photo,
            permitted: props.route.params.permitted || true,
            group_name: props.route.params.full_name || '',
            Pre_Friends: [props.user, ...props.route.params.users],
            Friends: [props.user, ...props.route.params.users],
            selectedFriends: [],
            group_admin: props.route.params.admin || props.user,
        };
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.props.route?.params?.users != prevProps.route?.params?.users) {
            this.setState({
                Friends: [this.props.user, ...(this.props.route?.params?.users || [])],
            })
        }
    }

    onImageUpload = () => {
        ImagePicker.openPicker({
            mediaType: 'photo',
            cropping: true,
            includeBase64: true,
        }).then(image => {
            this.setState({
                photo: image,
                showPickerModal: false
            })
        })
            .catch(error => {

            });
    }

    onCapture = () => {
        ImagePicker.openCamera({
            cropping: true,
            includeBase64: true,
        }).then(image => {
            this.setState({
                photo: image,
                showPickerModal: false
            })
        })
            .catch(error => {

            });
    }

    canEditable = () => {
        if (this.state.groupId == null) {  // create new
            return true;
        }
        else if (this.state.groupId && this.state.group_admin.id == this.props.user.id) { // admin edit
            return true;
        }
        return false;
    }

    renderTitleBar() {
        return (
            <View style={styles.titleContainer}>
                <BackButton onPress={() => {
                    this.props.navigation.goBack();
                }} />
                <Text style={styles.title}>{this.state.groupId ? translate('social.chat.group_details') : translate('social.new_group')}</Text>
            </View>
        );
    }

    renderForm() {
        const { photo, photo_url } = this.state;
        return (
            <View style={[Theme.styles.col_center, styles.searchContainer]}>
                <TouchableOpacity style={[Theme.styles.col_center, styles.uploadBtn]}
                    onPress={() => {
                        if (this.canEditable()) {
                            this.setState({ showPickerModal: true })
                        }
                    }}>
                    {
                        photo != null || photo_url != null ?
                            <FastImage source={{ uri: photo ? photo.path : photo_url }}
                                style={styles.avatarImg}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                            :
                            <View style={[Theme.styles.col_center]}>
                                <Svg_upload />
                                <Text style={styles.uploadBtnTxt}>{translate('social.upload_avatar')}</Text>
                            </View>
                    }
                </TouchableOpacity>
                <AuthInput
                    editable={this.canEditable()}
                    placeholder={translate('social.group_name')}
                    underlineColorAndroid={'transparent'}
                    keyboardType={'default'}
                    placeholderTextColor={'#DFDFDF'}
                    onChangeText={group_name => this.setState({ group_name })}
                    value={this.state.group_name}
                    returnKeyType={'done'}
                    autoCapitalize={'none'}
                    secure={false}
                    style={{ marginTop: 30 }}
                />
            </View>
        );
    }

    renderPermission() {
        return (
            <View style={styles.tabContainer}>
                <View style={[Theme.styles.row_center, { width: '100%', }]}>
                    <Text style={[Theme.styles.flex_1, styles.subjectTitle]}>{translate('social.member_can_add_people')}</Text>
                    <Switch
                        style={Platform.OS == 'ios' && { transform: [{ scaleX: 0.7 }, { scaleY: 0.65 }] }}
                        trackColor={{ false: "#C0EBEC", true: "#C0EBEC" }}
                        thumbColor={this.state.permitted ? Theme.colors.cyan2 : "#C0EBEC"}
                        ios_backgroundColor="#C0EBEC"
                        onValueChange={() => {
                            if (this.canEditable()) {
                                this.setState({ permitted: !this.state.permitted })
                            }
                        }}
                        value={this.state.permitted == true}
                    />
                </View>
            </View>
        );
    }

    onCreateGroup = async () => {
        if (this.state.group_admin.id == null) {
            return alerts.error(translate('attention'), translate('social.choose_group_admin'));
        }
        // if (this.state.photo == null || this.state.photo.data == null) {
        //     return alerts.error(translate('attention'), translate('social.upload_group_photo'));
        // }
        if (this.state.group_name == '') {
            return alerts.error(translate('attention'), translate('social.enter_group_name'));
        }

        this.setState({ loading: true })
        let photo_url = this.state.photo_url || getImageFullURL('default_group');
        if (this.state.photo != null && this.state.photo.data != null) {
            try {
                let res = await uploadImage(this.state.photo.data);
                if (res != null && res.data != null && res.data.success == true) {
                    photo_url = res.data.url;
                }
                else {
                    this.setState({ loading: false })
                    alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
                    return;
                }
            } catch (error) {
                console.log('uploadImage', error)
                this.setState({ loading: false })
                alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
                return;
            }
        }

        let members = [];
        this.state.Friends.map(friend => {
            members.push({
                id: friend.id,
                username: friend.username,
                full_name: friend.full_name,
                photo: friend.photo,
                phone: friend.phone,
                email: friend.email
            })
        })

        let group_data = {
            full_name: this.state.group_name,
            photo: photo_url,
            permitted: this.state.permitted,
            admin: {
                id: this.state.group_admin.id,
                username: this.state.group_admin.username,
                full_name: this.state.group_admin.full_name,
                photo: this.state.group_admin.photo,
                phone: this.state.group_admin.phone,
                email: this.state.group_admin.email
            },
            creator: {
                id: this.props.user.id,
                username: this.props.user.username,
                full_name: this.props.user.full_name,
                photo: this.props.user.photo,
                phone: this.props.user.phone,
                email: this.props.user.email
            },
            members: members,
            users: [...members.map(i => i.id)]
        }

        if (this.state.groupId) {
            group_data.id = this.state.groupId;
        }

        let channelID = await createGroupChannel(group_data);
        this.setState({ loading: false })
        if (channelID != null) {
            if (this.state.groupId == null) {
                sendGroupChatInviteNotification(channelID, group_data.full_name, group_data.users.filter(i => i != this.props.user.id));
            }
            else {
                let new_added_users = group_data.users.filter(i => (
                    i != this.props.user.id && 
                    (this.state.Pre_Friends.findIndex(f => f.id == i) == -1)
                ))
                if (new_added_users.length > 0) {
                    console.log('================================ new_added_users ', new_added_users)
                    sendGroupChatInviteNotification(channelID, group_data.full_name, new_added_users);
                }
            }
            this.props.navigation.pop(2);
            this.props.navigation.navigate(RouteNames.MessagesScreen, { channelId: channelID });
        }
        else {
            alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
                {this.renderTitleBar()}
                <ScrollView style={{ flex: 1, }}>
                    <View style={{ paddingHorizontal: 20 }}>
                        {this.renderForm()}
                        {this.state.groupId == null && this.renderPermission()}
                        <View style={[Theme.styles.row_center, { width: '100%', marginTop: 20, marginBottom: 20, }]}>
                            <Text style={[Theme.styles.subjectTitle, { flex: 1, fontSize: 19, marginRight: 10, }]}>
                                {this.state.groupId ? translate('social.chat.group_members') : translate('social.choose_group_admin')}
                            </Text>
                            {
                                (this.state.groupId != null) &&
                                <TouchableOpacity onPress={() => {
                                    this.props.navigation.navigate(RouteNames.NewGroupScreen, { isAddMember: true, users: this.props.route.params.users });
                                }}>
                                    <AppText style={[styles.addNew]}>+ {translate('social.chat.add_member')}</AppText>
                                </TouchableOpacity>
                            }
                        </View>
                        {
                            this.state.Friends.map((item, index) =>
                                <UserListItem
                                    key={item.id}
                                    full_name={item.username || item.full_name}
                                    photo={item.photo}
                                    invite_status={item.invite_status}
                                    type={this.state.groupId ? 'role' : 'checkbox'}
                                    isAdmin={this.state.groupId && this.state.group_admin.id == item.id}
                                    checked={this.state.group_admin.id == item.id}
                                    style={{ marginBottom: 15 }}
                                    onPress={() => {
                                        if (this.state.groupId == null) {
                                            this.setState({ group_admin: item })
                                        }
                                        else {
                                            if (item.id != this.props.user.id) {
                                                this.props.navigation.navigate(RouteNames.SnapfooderScreen, { user: item });
                                            }
                                        }
                                    }}
                                />
                            )
                        }
                    </View>
                </ScrollView>
                {
                    this.canEditable() &&
                    <View style={[styles.btmbtn]}>
                        <MainBtn
                            loading={this.state.loading}
                            disabled={this.state.loading}
                            title={this.state.groupId == null ? translate('proceed') : translate('update')}
                            style={{ width: '100%' }}
                            onPress={() => {
                                this.onCreateGroup()
                            }}
                        />
                    </View>
                }
                <ImgPickOptionModal title={translate('social.upload_avatar')} showModal={this.state.showPickerModal}
                    onCapture={this.onCapture}
                    onImageUpload={this.onImageUpload}
                    onClose={() => this.setState({ showPickerModal: false })} />
            </View>
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
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 40,
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
        marginTop: 15,
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
        paddingVertical: 21,
        flexDirection: 'row',
        marginTop: 20
    },
    listContainer: {
        flex: 1,
        width: '100%',
        marginTop: 20
    },
    btmbtn: { marginBottom: 40, width: '100%', paddingHorizontal: 20 },
    uploadBtn: { width: 100, height: 100, borderRadius: 15, borderWidth: 1, borderColor: Theme.colors.gray9 },
    uploadBtnTxt: { marginTop: 16, fontSize: 12, color: Theme.colors.gray5, fontFamily: Theme.fonts.semiBold },
    subjectTitle: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9 },
    sectionView: { width: '100%', alignItems: 'flex-start', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: Theme.colors.gray9 },
    avatarImg: { width: 100, height: 100, borderRadius: 15, },
    addNew: { fontSize: 16, lineHeight: 21, color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold },
});

const mapStateToProps = ({ app, chat }) => ({
    isLoggedIn: app.isLoggedIn,
    user: app.user,
    messages: chat.messages,
    safeAreaDims: app.safeAreaDims,
});

export default connect(
    mapStateToProps,
    {},
)(withNavigation(CreateGroupScreen));
