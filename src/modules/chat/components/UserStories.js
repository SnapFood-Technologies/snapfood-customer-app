import React from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, View, Text, FlatList, Linking, SafeAreaView, Platform } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { connect } from 'react-redux';
import moment from 'moment';
import FastImage from "react-native-fast-image";
import ImagePicker from 'react-native-image-crop-picker';
import SnapfoodStory from './snapfood-story';
import alerts from '../../../common/services/alerts';
import { setOpenStoryImgPickModal } from '../../../store/actions/chat';
import { getAllMyFriends } from '../../../store/actions/app';
import { isEmpty, convertTimestamp2Date, getImageFullURL, checkInSameWeek } from '../../../common/services/utility';
import apiFactory from '../../../common/services/apiFactory';
import Theme from "../../../theme";
import { story_collection, uploadImage, updateSeenStory, deleteStory, updateStoryViewers } from '../../../common/services/user_story';
import ImgPickOptionModal from '../../../common/components/modals/ImgPickOptionModal';
import { translate } from '../../../common/services/translate';
import { findChannel, createSingleChannel, sendMessage } from '../../../common/services/chat';
import RouteNames from '../../../routes/names';

var _navigation = null;
class UserStories extends React.Component {
    _isMounted = false
    _Timer = null
    constructor(props) {
        super(props);

        _navigation = props.navigation;
        this.state = {
            stories: [],
            isLoading: null,
            isUploading: false,
            isVideoModal: false
        };
    }

    componentDidMount = () => {
        this._isMounted = true;
        this.props.getAllMyFriends();
        this.getStoryListner();

        this._Timer = setInterval(() => {
            this.props.getAllMyFriends();
            this.getStoryListner();
        }, 40000)
    }

    componentWillUnmount() {
        this._isMounted = false;
        if (this.story_listener) {
            this.story_listener()
        }

        if (this._Timer) {
            clearInterval(this._Timer);
            this._Timer = null;
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.props.user.id != prevProps.user.id) {
            this.props.getAllMyFriends();
            this.getStoryListner(this.props.user.id);
        }

        if (this.props.all_friends != prevProps.all_friends) {
            this.getStoryListner(this.props.user.id);
        }

        if (this.props.forceReload != prevProps.forceReload) {
            
            this.getStoryListner(this.props.user.id);
        }
    }

    getStoryListner = (user_id) => {
        if (this.story_listener) {
            
            this.story_listener()
        }
        this.setState({ isLoading: true });
        let time = new Date().getTime() - 24 * 60 * 60 * 1000;
        this.story_listener = story_collection.where('active', '==', true).where('createdAt', '>=', time).orderBy('createdAt', 'desc').limit(50).onSnapshot((snapshots) => {
            var story_mine = {
                is_mine: true,
                seen: true,
                user_image: getImageFullURL(this.props.user.photo),
                active: true,
                user_id: this.props.user.id,
                user_fullname: this.props.user.full_name || null,
                user_name: this.props.user.username || null,
                user_phone: this.props.user.phone || null,
                user_email: this.props.user.email || null,
                stories: [],
            };

            var tmp_all_story_images = [];
            var tmp_stories = [];
            snapshots.forEach((doc) => {
                if (doc.data()) {
                    let _stories = doc.data().stories || [];
                    _stories = _stories.filter(s => parseInt(s.story_id) >= time);

                    if (doc.data().user_id == this.props.user.id) {
                        story_mine = {
                            ...doc.data(),
                            stories: _stories,
                            is_mine: true,
                            user_image: getImageFullURL(doc.data().user_image),
                            seen: (doc.data().unseen_cnt != null && doc.data().unseen_cnt[this.props.user.id] == 0)
                        }

                        _stories.forEach(s => {
                            tmp_all_story_images.push({
                                uri: s.story_image
                            })
                        })
                    }
                    else if (
                        doc.data().user_story_public == 1 ||
                        (
                            doc.data().user_story_public != 1 &&
                            (this.props.all_friends.findIndex(f => f.id == doc.data().user_id) != -1)
                        )
                    ) {
                        if (_stories.length > 0) {
                            tmp_stories.push({
                                ...doc.data(),
                                stories: _stories,
                                user_image: getImageFullURL(doc.data().user_image),
                                seen: (doc.data().unseen_cnt != null && doc.data().unseen_cnt[this.props.user.id] == 0)
                            });

                            _stories.forEach(s => {
                                tmp_all_story_images.push({
                                    uri: s.story_image
                                })
                            })
                        }
                    }
                }
            });

            tmp_stories.sort(function (a, b) {
                let a_val = a.seen == true ? 1 : 0;
                let b_val = b.seen == true ? 1 : 0;

                return a_val - b_val;
            });

            this.setState({ stories: [story_mine].concat(tmp_stories), isLoading: false });

            FastImage.preload(tmp_all_story_images);
        },
            (error) => {
                this.setState({ isLoading: false })
                
            });
    }


    onImageUpload = () => {
        ImagePicker.openPicker({
            multiple: true,
            cropping: false,
            includeBase64: true,
        }).then((images) => {
            this.props.setOpenStoryImgPickModal(false)
            this.onAddPhoto(images);
        }).catch(() => { });
    };

    onCapture = async () => {
        // ImagePicker.openCamera({
        //     includeBase64: true,
        // }).then((image) => {
        //     this.props.setOpenStoryImgPickModal(false)
        //     this.onAddPhoto([image]);
        // }).catch(() => { });

        this.props.setOpenStoryImgPickModal(false);
        if (_navigation) {
            _navigation.navigate(RouteNames.CameraScreen);
        }
    };

    onCaptureVideo = () => {
        this.props.setOpenStoryImgPickModal(false);
        if (_navigation) {
            _navigation.navigate(RouteNames.CameraScreen);
        }
    }

    onAddPhoto = async (images = []) => {
        if (images != null && images.length > 0) {
            if (_navigation) {
                if (images[0].mime?.includes('video')) {
                    let fileName = images[0].path.substring(images[0].path.lastIndexOf('/') + 1);
                    let file = {
                        fileName: fileName,
                        uri: images[0].path,
                        type: "video/*",
                    };
                    _navigation.navigate(RouteNames.StoryPreviewScreen, { videoData: file, isImage: false });
                }
                else {
                    _navigation.navigate(RouteNames.StoryPreviewScreen, { imageData: images[0], isImage: true, isCaptured: false });
                }
            }
        }
    };

    handleSeen = (item) => {
        updateSeenStory(item, this.props.user.id)
    }

    handleDelete = (image, storyItem) => {
        deleteStory(image, storyItem);
    }

    seen_image = (image, storyItem) => {
        updateStoryViewers(image, storyItem, this.props.user.id);
    }

    onGoUserProfile = (user) => {
        if (_navigation) {
            _navigation.navigate(RouteNames.SnapfooderScreen, { user: user });
        }
    };

    onEnterChannel = async (partner) => {
        if (_navigation == null) return;
        let found_channel = await findChannel(this.props.user.id, partner.id);
        if (found_channel != null) {
            _navigation.navigate(RouteNames.MessagesScreen, { channelId: found_channel.id });
        } else {
            this.setState({ isUploading: true });
            let channelID = await createSingleChannel(this.props.user, partner);
            this.setState({ isUploading: false });
            if (channelID != null) {
                _navigation.navigate(RouteNames.MessagesScreen, { channelId: channelID });
            } else {
                // alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
            }
        }
    };

    onSendStoryReplyMessage = async (story, image, thumb_image, message) => {
        let partner = {
            id: story.user_id,
            username: story.user_name || null,
            full_name: story.user_fullname || null,
            photo: story.user_image || null,
            phone: story.user_phone || null,
            email: story.user_email || null,
        }

        let channelID = null;
        let found_channel = await findChannel(this.props.user.id, partner.id);
        if (found_channel != null) {
            channelID = found_channel.id;
        } else {
            channelID = await createSingleChannel(this.props.user, partner);
        }

        if (channelID) {
            let newMsg = {
                user: {
                    _id: this.props.user.id,
                    username: this.props.user.username,
                    full_name: this.props.user.full_name,
                    photo: this.props.user.photo,
                    phone: this.props.user.phone,
                    email: this.props.user.email,
                },
                images: [image],
                thumb_image: thumb_image,
                reply_type: 'story',
                text: message
            };
            await sendMessage(channelID, this.props.user.id, newMsg);
        }
    };

    render() {
        if (this.state.stories == null || this.state.stories.length == 0) { return null }
        return (
            <>
                <Spinner visible={this.state.isUploading} />
                <SnapfoodStory
                    my_gender={this.props.user.sex}
                    data={this.state.stories || []}
                    duration={6}
                    customSwipeUpComponent={<View>
                        <Text>Swipe</Text>
                    </View>}
                    customCloseComponent={<AntDesign name='close' size={18} color={Theme.colors.white} />}
                    pressedBorderColor={Theme.colors.gray3}
                    unPressedBorderColor={Theme.colors.cyan2}
                    style={{ paddingHorizontal: 0, marginTop: 0 }}
                    onAddPhoto={() => {
                        this.props.setOpenStoryImgPickModal(true);
                    }}
                    onSeenItem={this.handleSeen}
                    onDeletePress={this.handleDelete}
                    onNamePress={(story_item) => {
                        this.onGoUserProfile({
                            id: story_item?.user_id,
                            full_name: story_item?.user_fullname,
                            email: story_item?.user_email,
                            username: story_item?.user_name,
                            photo: story_item?.user_image,
                            phone: story_item?.user_phone
                        })
                    }}
                    onMentionPress={(mention) => {
                        this.onGoUserProfile(mention)
                    }}
                    onViewerPress={(viewer) => {
                        viewer.is_friend == 1
                            ? this.onEnterChannel(viewer)
                            : this.onGoUserProfile(viewer)
                    }}
                    seen_image={this.seen_image}
                    onSendStoryReplyMessage={this.onSendStoryReplyMessage}
                />
                <ImgPickOptionModal
                    title={translate('social.add_to_story')}
                    showModal={this.props.isStoryImgPickModal}
                    onCapture={this.onCapture}
                    onCaptureVideo={this.onCaptureVideo}
                    onImageUpload={this.onImageUpload}
                    onClose={() => this.props.setOpenStoryImgPickModal(false)}
                />
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
});

const mapStateToProps = ({ app, chat }) => ({
    isLoggedIn: app.isLoggedIn,
    language: app.language,
    user: app.user,
    all_friends: app.all_friends,
    isStoryImgPickModal: chat.isStoryImgPickModal
});

export default connect(
    mapStateToProps,
    {
        getAllMyFriends,
        setOpenStoryImgPickModal
    },
)(UserStories);
