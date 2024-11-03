import React from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, View, Text, ScrollView, Image } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import MapView, { Callout, PROVIDER_GOOGLE, Marker } from "react-native-maps";
import ImageView from "react-native-image-viewing";
import Entypo from 'react-native-vector-icons/Entypo'
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';
import { createSingleChannel, findChannel } from '../../../common/services/chat';
import { SocialMapScreenStyles } from "../../../config/constants";
import BackButton from "../../../common/components/buttons/back_button";
import MainBtn from "../../../common/components/buttons/main_button";
import TransBtn from '../../../common/components/buttons/trans_button';
import BirthdayModal from '../../../common/components/modals/BirthdayModal';
import Theme from '../../../theme';
import Config from '../../../config';
import RouteNames from '../../../routes/names';
import SuggestedUserItem from '../components/SuggestedUserItem';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SnapfooderAvatar from '../components/SnapfooderAvatar';
import Svg_chat from '../../../common/assets/svgs/msg/chat.svg'
import { isEmpty } from '../../../common/services/utility';
import AppText from '../../../common/components/AppText';
import { goActiveScreenFromPush } from '../../../store/actions/app';

class SnapfooderScreen extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isCreatingChannel: false,
            btnLoading: false,
            isCheckedFriend: false,
            isBirthdayModal: false,
            suggestedLoading: null,
            isFriend: false,
            user: this.props.route.params.user,
            isMe: (this.props.route?.params?.user?.id == this.props.user?.id),
            isInviteReceived: this.props.route.params.isInviteReceived == true,
            acceptLoading: false,
            declineLoading: false,
            isReady: false,
            galleryVisible: false,
            galleryImages: [],
            interests: []
        };
    }

    componentDidMount() {
        this._isMounted = true
        this.props.goActiveScreenFromPush({
            isSnapfooderVisible: false,
        });

        if (this.state.user != null) {
            
            this.getSnapfoodDetail(this.state.user.id, true)
            this.getSnapfooderGallery(this.state.user.id)
            this.checkFriend(this.state.user.id)
        }
        this.setState({ isReady: true })
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.props.goActiveScreenFromPush({
            isSnapfooderVisible: false,
        });
    }

    getSnapfoodDetail = async (user_id, initLoading = false) => {
        if (initLoading == true) {
            await this.setState({ suggestedLoading: true });
        }
        apiFactory.get(`users/snapfooders/${user_id}`).then(({ data }) => {
            const res_snapfooder = data['snapfooder'];
            if (this._isMounted == true) {
                this.setState({
                    user: res_snapfooder,
                    suggestedLoading: false,
                });
            }
        },
            (error) => {
                
                const message = error.message || translate('generic_error');
                if (this._isMounted == true) {
                    this.setState({
                        suggestedLoading: false,
                    });
                }
                
            });
    }

    getSnapfooderGallery = async (user_id) => {
        apiFactory.get(`users/gallery?user_id=${user_id}`)
            .then(({ data }) => {
                let galleries = data.gallery || [];
                let tmp = [];
                for (let i = 0; i < galleries.length; i++) {
                    if (galleries[i].photo) {
                        tmp.push({
                            uri: galleries[i].photo
                        })
                    }
                }
                this.setState({
                    galleryImages: tmp,
                    interests: data.interests || []
                })
            })
            .catch(err => {
                
            });
    }

    checkFriend = async (snapfooder_id) => {
        if (this.state.isMe) { return }
        this.setState({ isCheckedFriend: false })
        apiFactory.post(`users/friends/check`, {
            user_id: this.props.user.id,
            friend_id: snapfooder_id
        }).then(({ data }) => {
            
            if (this._isMounted == true) {
                this.setState({
                    isFriend: data.success == true,
                    isCheckedFriend: true
                });
            }
        },
            (error) => {
                this.setState({ isCheckedFriend: true })
                
            });
    }

    onSendInvitation = async () => {
        this.setState({ isBirthdayModal: false })
        
        if (this.state.user == null) { return }
        await this.setState({ btnLoading: true });
        apiFactory.post(`users/friends/update`, {
            user_id: this.props.user.id,
            friend_id: this.state.user.id,
            status: 'invited'
        }).then((res) => {
            this.getSnapfoodDetail(this.state.user.id)
            if (this._isMounted == true) {
                this.setState({
                    btnLoading: false,
                });
            }
        },
            (error) => {
                const message = error.message || translate('generic_error');
                if (this._isMounted == true) {
                    this.setState({
                        btnLoading: false,
                    });
                }
                alerts.error(translate('alerts.error'), message);
            });
    }

    onCancelInvitation = async () => {
        if (this.state.user == null) { return }
        await this.setState({ btnLoading: true });
        apiFactory.post(`users/friends/remove`, {
            user_id: this.props.user.id,
            friend_id: this.state.user.id
        }).then((res) => {
            this.getSnapfoodDetail(this.state.user.id)
            if (this._isMounted == true) {
                this.setState({
                    btnLoading: false,
                });
            }
        },
            (error) => {
                const message = error.message || translate('generic_error');
                if (this._isMounted == true) {
                    this.setState({
                        btnLoading: false,
                    });
                }
                alerts.error(translate('alerts.error'), message);
            });
    }

    replyInvitation = async (status) => {
        if (this.state.user == null) { return }
        if (status == 'accepted') {
            await this.setState({ acceptLoading: true });
        }
        else {
            await this.setState({ declineLoading: true });
        }

        apiFactory.post(`users/friends/update`, {
            user_id: this.state.user.id,
            friend_id: this.props.user.id,
            status: status
        })
            .then((res) => {
                this.checkFriend(this.state.user.id);
                this.getSnapfoodDetail(this.state.user.id)
                if (this._isMounted == true) {
                    if (status == 'accepted') {
                        this.setState({ isInviteReceived: false, acceptLoading: false });
                    }
                    else {
                        this.setState({ isInviteReceived: false, declineLoading: false });
                    }
                }
            },
                (error) => {
                    const message = error.message || translate('generic_error');
                    if (this._isMounted == true) {
                        if (status == 'accepted') {
                            this.setState({ acceptLoading: false });
                        }
                        else {
                            this.setState({ declineLoading: false });
                        }
                    }
                    alerts.error(translate('alerts.error'), message);
                });
    }

    onRemoveFriend = async () => {
        if (this.state.user == null) { return }
        let message = this.props.user.sex == 'female' ? translate('social.delete_friend_female_confirm') : translate('social.delete_friend_confirm')
        message = message.replace('{user}', this.state.user.username || this.state.user.full_name);
        alerts
            .confirmation(translate('alerts.confirmation'), message)
            .then(async () => {
                await this.setState({ btnLoading: true });
                apiFactory.post(`users/friends/remove`, {
                    user_id: this.props.user.id,
                    friend_id: this.state.user.id
                }).then((res) => {
                    this.checkFriend(this.state.user.id);
                    if (this._isMounted == true) {
                        this.setState({
                            btnLoading: false,
                        });
                    }
                },
                    (error) => {
                        const message = error.message || translate('generic_error');
                        if (this._isMounted == true) {
                            this.setState({
                                btnLoading: false,
                            });
                        }
                        alerts.error(translate('alerts.error'), message);
                    });
            });
    }

    onEnterChannel = async () => {
        this.setState({ isBirthdayModal: false })
        const partner = this.state.user;
        if (partner == null) { return }
        let found_channel = await findChannel(this.props.user.id, partner.id)
        
        if (found_channel != null) {
            this.props.navigation.navigate(RouteNames.MessagesScreen, { channelId: found_channel.id })
        }
        else {
            this.setState({ isCreatingChannel: true })
            let channelID = await createSingleChannel(this.props.user, partner);
            this.setState({ isCreatingChannel: false })
            if (channelID != null) {
                this.props.navigation.navigate(RouteNames.MessagesScreen, { channelId: channelID })
            }
            else {
                alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
            }
        }
    }

    renderMap() {
        if (this.state.suggestedLoading != false) {
            return null;
        }
        let latitude = parseFloat(this.state.user.latitude)
        let longitude = parseFloat(this.state.user.longitude)
        if (latitude == null || longitude == null || isNaN(latitude) == true || isNaN(longitude) == true) {
            return null;
        }
        return (
            <View style={styles.mapcontainer}>
                <View style={styles.mapview}>
                    {
                        <MapView
                            customMapStyle={SocialMapScreenStyles}
                            provider={PROVIDER_GOOGLE}
                            showsUserLocation={false}
                            showsMyLocationButton={false}
                            showsPointsOfInterest={false}
                            showsBuildings={false}
                            style={{ width: '100%', height: 214 }}
                            region={{
                                latitude: latitude,
                                longitude: longitude,
                                latitudeDelta: 0.006,
                                longitudeDelta: 0.02,
                            }}
                        >
                            {
                                (this.state.isFriend || this.state.user.map_visible == 1) &&
                                <Marker
                                    tracksInfoWindowChanges={false}
                                    tracksViewChanges={false}
                                    key={'marker_position'}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                    coordinate={{ latitude: latitude, longitude: longitude }}
                                >
                                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#25DEE240', alignItems: 'center', justifyContent: 'center' }}>
                                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#50b7ed' }} />
                                    </View>
                                </Marker>
                            }
                        </MapView>
                    }
                </View>
            </View>
        );
    }

    renderTitleBar() {
        return (
            <View style={styles.titleContainer}>
                <BackButton iconCenter={true} onPress={() => {
                    this.props.navigation.goBack();
                }} />
                <View style={{ flex: 1 }}>
                </View>
            </View>
        );
    }

    renderSuggestedUsers = (items) => {
        if (this.state.isMe) { return null; }
        return <View style={[Theme.styles.col_center_start, styles.userHorizList]}>
            <View style={styles.divider} />
            <Text style={styles.subjectTitle}>{translate('chat.suggested_users')}</Text>
            <ScrollView
                horizontal={true}
                style={{ width: '100%', marginTop: 16, paddingBottom: 15, }}
            >
                {
                    items.map((item, index) =>
                        <SuggestedUserItem
                            key={item.id}
                            id={item.id}
                            full_name={item.username || item.full_name}
                            invited={item.invite_status == 'invited'}
                            photo={item.photo}
                            onViewProfile={() => {
                                this.getSnapfoodDetail(item.id)
                                this.getSnapfooderGallery(item.id)
                                this.checkFriend(item.id);
                            }}
                        />
                    )
                }
                {this.renderMyContactsItem()}
            </ScrollView>
            <View style={styles.scrollviewHider} />
        </View>
    }

    renderMyContactsItem = () => {
        return (
            <View style={[Theme.styles.col_center, { justifyContent: 'flex-start', marginRight: 15, }]}>
                <TouchableOpacity activeOpacity={0.9} style={[Theme.styles.col_center, styles.mycontactsView]} onPress={this.navigateToMyContacts}>
                    <AntDesign name="contacts" size={50} color={Theme.colors.cyan2} />
                    <View style={Theme.styles.col_center}>
                        <Text style={styles.mycontactsName}>{translate('Contacts')}</Text>
                        <TouchableOpacity onPress={this.navigateToMyContacts}>
                            <Text style={styles.mycontactsBtnName}>{translate('social.inviteFriends')}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
                <View style={{ marginVertical: 10 }}></View>
            </View>
        );

    }

    navigateToMyContacts = () => {
        
        this.props.navigation.navigate(RouteNames.MyContacts);
    };

    renderBioBlock = () => {
        let isBioVisible = false;
        if (!isEmpty(this.state.user.bio_text) && (this.state.isMe || this.state.user.bio_text_public == 1 || (this.state.isFriend && this.state.user.bio_text_public == 0))) {
            isBioVisible = true;
        }
        if (isBioVisible || this.state.galleryImages.length > 0 || this.state.interests.length > 0) {
            return (
                <View style={[{ width: '100%', paddingHorizontal: 20 }]}>
                    <View style={[styles.bioBlock]}>
                        {
                            this.state.galleryImages.length > 0 &&
                            <TouchableOpacity style={[Theme.styles.row_center, styles.bioPhotoBtn]} onPress={() => {
                                this.setState({
                                    galleryVisible: true,
                                })
                            }}>
                                <Entypo name={'images'} color={Theme.colors.text} size={18} />
                                <AppText style={styles.photosTxt}>{translate('social.photos')}</AppText>
                            </TouchableOpacity>
                        }
                        {(isBioVisible && this.state.galleryImages.length > 0) &&
                            <View style={styles.bioblockDivider} />
                        }
                        {
                            !isEmpty(this.state.user.bio_text) && <AppText style={styles.bioTxt}>{this.state.user.bio_text}</AppText>
                        }
                        {(this.state.interests.length > 0 && (isBioVisible || this.state.galleryImages.length > 0)) &&
                            <View style={styles.bioblockDivider} />
                        }
                        {
                            this.state.interests.filter(i => i.category == 'social').length > 0 &&
                            <>
                                <AppText style={styles.interestCatTxt}>{translate('interests.social_interest')}</AppText>
                                <AppText style={styles.interestTxt}>
                                    {this.state.interests.filter(i => i.category == 'social')
                                        .map(i => (this.props.language == 'en' ? i.title_en : i.title)).join(', ')}
                                </AppText>
                            </>
                        }
                        {
                            this.state.interests.filter(i => i.category == 'food').length > 0 &&
                            <>
                                <AppText style={[styles.interestCatTxt, (this.state.interests.filter(i => i.category == 'social').length > 0) && { marginTop: 8 }]}>
                                    {translate('interests.food_interest')}</AppText>
                                <AppText style={styles.interestTxt}>
                                    {this.state.interests.filter(i => i.category == 'food')
                                        .map(i => (this.props.language == 'en' ? i.title_en : i.title)).join(', ')}
                                </AppText>
                            </>
                        }
                    </View>
                </View>
            );
        }
        return null;
    }

    render() {
        const { user, isFriend, isInviteReceived, btnLoading, acceptLoading, declineLoading } = this.state
        
        return (
            <View style={styles.container}>
                {this.renderTitleBar()}
                <ScrollView style={styles.container}>
                    <SnapfooderAvatar
                        full_name={user.username || user.full_name}
                        photo={user.photo}
                        birthdate={user.birthdate}
                        // country={user.country}
                        onPressBirthday={() => {
                            if (!this.state.isMe) {
                                this.setState({ isBirthdayModal: true })
                            }
                        }}
                        onPressPhoto={() => {
                            if (this.state.galleryImages.length > 0) {
                                this.setState({
                                    galleryVisible: true,
                                })
                            }
                        }}
                    />
                    {this.renderBioBlock()}
                    {this.renderMap()}
                    {
                        this.state.suggestedLoading == false && user.suggested_users &&
                        this.renderSuggestedUsers(user.suggested_users || [])
                    }
                </ScrollView>
                {
                    this.state.isMe != true && this.state.isCheckedFriend &&
                    <View style={[{ width: '100%', paddingHorizontal: 20, marginBottom: 40 }]}>
                        {
                            isFriend &&
                            <TouchableOpacity
                                style={[Theme.styles.row_center, styles.chatBtn]}
                                activeOpacity={0.75}
                                onPress={this.onEnterChannel}
                                disabled={this.state.isCreatingChannel}>
                                <Svg_chat width={22} height={22} />
                                <Text style={styles.chatBtnTxt}>Chat</Text>
                            </TouchableOpacity>
                        }
                        {
                            isFriend ?
                                <TransBtn
                                    disabled={btnLoading}
                                    loading={btnLoading}
                                    btnTxtColor={Theme.colors.gray7}
                                    title={translate('friend_related.remove_friend')}
                                    onPress={this.onRemoveFriend}
                                /> :
                                isInviteReceived ?
                                    <View style={[Theme.styles.row_center, { width: '100%' }]}>
                                        <View style={[Theme.styles.col_center, { flex: 1 }]}>
                                            <MainBtn
                                                disabled={declineLoading}
                                                loading={declineLoading}
                                                style={{ width: '100%', backgroundColor: Theme.colors.gray7 }}
                                                title={translate('friend_related.reject_invitation')}
                                                onPress={() => this.replyInvitation('canceled')}
                                            />
                                        </View>
                                        <View style={{ width: 16 }} />
                                        <View style={[Theme.styles.col_center, { flex: 1 }]}>
                                            <MainBtn
                                                disabled={acceptLoading}
                                                loading={acceptLoading}
                                                style={{ width: '100%', backgroundColor: Theme.colors.cyan2 }}
                                                title={translate('friend_related.accept_invitation')}
                                                onPress={() => this.replyInvitation('accepted')}
                                            />
                                        </View>
                                    </View>
                                    :
                                    <MainBtn
                                        disabled={btnLoading}
                                        loading={btnLoading}
                                        style={{ backgroundColor: user.invite_status == 'invited' ? Theme.colors.gray7 : Theme.colors.cyan2 }}
                                        title={user.invite_status == 'invited' ? translate('friend_related.cancel_invitation') : translate('friend_related.add_friend')}
                                        onPress={user.invite_status == 'invited' ? this.onCancelInvitation : this.onSendInvitation}
                                    />
                        }
                    </View>
                }
                <BirthdayModal
                    showModal={this.state.isBirthdayModal}
                    full_name={user.username || user.full_name}
                    invite_status={user.invite_status}
                    isFriend={isFriend}
                    onClose={() => {
                        this.setState({ isBirthdayModal: false })
                    }}
                    onChat={this.onEnterChannel}
                    onInvite={this.onSendInvitation}
                />
                <ImageView
                    images={this.state.galleryImages}
                    imageIndex={0}
                    visible={this.state.galleryVisible}
                    onRequestClose={() => this.setState({ galleryVisible: false })}
                    FooterComponent={({ imageIndex }) => {
                        return (
                            <Text style={styles.indicator}>{imageIndex + 1} / {this.state.galleryImages.length}</Text>
                        )
                    }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: Theme.colors.white,
    },
    titleContainer: {
        marginTop: 50,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
    },
    mapcontainer: { paddingHorizontal: 20, paddingTop: 10, },
    mapview: { overflow: 'hidden', width: '100%', height: 214, borderRadius: 10, marginBottom: 20, },
    divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9, },
    userHorizList: { width: '100%', paddingLeft: 20, alignItems: 'flex-start', },
    subjectTitle: { marginTop: 15, fontSize: 18, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
    scrollviewHider: { width: '100%', marginTop: -12, height: 15, backgroundColor: Theme.colors.white },
    chatBtn: { marginTop: 12, marginBottom: 8 },
    chatBtnTxt: { color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold, fontSize: 18, marginLeft: 12 },
    mycontactsView: { width: 120, paddingVertical: 12, borderRadius: 12, backgroundColor: Theme.colors.gray8 },
    mycontactsAvatar: { width: 50, height: 50, borderRadius: 10, },
    mycontactsName: { marginTop: 8, fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
    mycontactsBtnName: { marginTop: 10, fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },
    indicator: { width: '100%', textAlign: 'center', marginBottom: 20, fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white },
    bioBlock: { alignItems: 'flex-start', marginBottom: 15, padding: 15, flexDirection: 'column', width: '100%', borderWidth: 1, borderColor: Theme.colors.gray6, borderRadius: 12, },
    bioPhotoBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: Theme.colors.gray6 },
    bioTxt: { fontSize: 15, fontFamily: Theme.fonts.medium, lineHeight: 21, color: Theme.colors.gray2 },
    bioblockDivider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray6, marginVertical: 10, },
    photosTxt: { marginLeft: 8, fontSize: 16, fontFamily: Theme.fonts.semiBold, lineHeight: 19, color: Theme.colors.text },
    interestCatTxt: {fontSize: 16, fontFamily: Theme.fonts.medium, lineHeight: 21, color: Theme.colors.cyan2},
    interestTxt: { fontSize: 15, fontFamily: Theme.fonts.medium, lineHeight: 21, color: Theme.colors.gray2 },
});

const mapStateToProps = ({ app, chat }) => ({
    user: app.user,
    language: app.language
});

export default connect(
    mapStateToProps,
    { goActiveScreenFromPush },
)(withNavigation(SnapfooderScreen));
