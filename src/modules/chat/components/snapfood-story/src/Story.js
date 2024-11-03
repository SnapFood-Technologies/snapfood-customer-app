import React, { Fragment, useRef, useState, useEffect } from "react";
import { Dimensions, View, Platform, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import Modal from "react-native-modalbox";
import Feather from 'react-native-vector-icons/Feather'
import StoryListItem from "./StoryListItem";
import StoryCircleListView from "./StoryCircleListView";
import { isNullOrWhitespace } from "./helpers/ValidationHelpers";
import AndroidCubeEffect from "./components/AndroidCubeEffect";
import CubeNavigationHorizontal from "./components/CubeNavigationHorizontal";
import { TextStyle } from "react-native";
import Header1 from "../../../../../common/components/Header1";
import { translate } from "../../../../../common/services/translate";
import apiFactory from '../../../../../common/services/apiFactory';
import SnapfooderListItem from "../../SnapfooderListItem";
import Theme from "../../../../../theme";
import SnackBar from 'react-native-snackbar-component'

export const Story = (props) => {
    const {
        data,
        unPressedBorderColor,
        pressedBorderColor,
        style,
        onStart,
        onClose,
        duration,
        swipeText,
        customSwipeUpComponent,
        customCloseComponent,
        avatarSize,
        showAvatarText,
        avatarTextStyle,
        onAddPhoto,
        onSeenItem
    } = props;

    const [dataState, setDataState] = useState(data);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
    const [viewers, setViewers] = useState([]);
    const [selectedData, setSelectedData] = useState([]);

    const [showSnackBar, setShowSnackBar] = useState(false);

    const cube = useRef();

    // Component Functions
    const _handleStoryItemPress = (item, index) => {
        if (item == null || item.stories == null || item.stories.length == 0) {
            return;
        }
        const newData = dataState.slice(index);
        if (onStart) {
            onStart(item)
        }

        onSeenItem(item);

        setCurrentPage(0);
        setSelectedData(newData);
        setIsModalOpen(true);
    };

    useEffect(() => {
        setDataState(data);
    }, [data]);

    // useEffect(() => {
    //     handleSeen();
    // }, [currentPage]);

    // const handleSeen = () => {
    //     const seen = selectedData[currentPage];
    //     const seenIndex = dataState.indexOf(seen);
    //     if (seenIndex > 0) {
    //         if (!dataState[seenIndex]?.seen) {
    //             let tempData = dataState;
    //             dataState[seenIndex] = {
    //                 ...dataState[seenIndex],
    //                 seen: true
    //             }
    //             setDataState(tempData);
    //         }
    //     }
    // }

    function onStoryFinish(state) {
        if (isViewerModalOpen) { return; }
        if (!isNullOrWhitespace(state)) {
            if (state == "next") {
                const newPage = currentPage + 1;
                if (newPage < selectedData.length) {
                    setCurrentPage(newPage);
                    cube?.current?.scrollTo(newPage);
                } else {
                    setIsModalOpen(false);
                    setCurrentPage(0);
                    if (onClose) {
                        onClose(selectedData[selectedData.length - 1]);
                    }
                }
            } else if (state == "previous") {
                const newPage = currentPage - 1;
                if (newPage < 0) {
                    setIsModalOpen(false);
                    setCurrentPage(0);
                } else {
                    setCurrentPage(newPage);
                    cube?.current?.scrollTo(newPage);
                }
            }
        }
    }

    const onViewerOpen = (user_ids) => {
        setViewers([]);
        apiFactory
            .post(`users/snapfoods-data-list`, {
                user_ids: user_ids
            })
            .then(
                ({ data }) => {
                    
                    setViewers(data.snapfooders || []);
                },
                (error) => {
                    setViewers([]);
                    
                }
            );
    }

    const renderStoryList = () => selectedData.map((x, i) => {
        if (x.stories == null || x.stories.length == 0) {
            return <View />
        }
        return (<StoryListItem duration={duration}
            key={i}
            storyData={x}
            userId={x.user_id}
            userGender={props.my_gender}
            profileName={x.user_name || x.user_fullname}
            profileImage={x.user_image}
            stories={x.stories}
            is_mine={x.is_mine}
            unseen_cnt={x.unseen_cnt || {}}
            storyUniqueIndex={i}
            currentPage={currentPage}
            onFinish={onStoryFinish}
            swipeText={swipeText}
            isViewerModalOpen={isViewerModalOpen}
            customSwipeUpComponent={customSwipeUpComponent}
            customCloseComponent={customCloseComponent}
            seen_image={(image) => {
                props.seen_image(image, x);
            }}
            onSendStoryReplyMessage={props.onSendStoryReplyMessage}
            onViewerPress={(viewerIds) => {
                // setIsModalOpen(false);
                // if (onClose) {
                //     onClose(x);
                // }
                onViewerOpen(viewerIds);
                setIsViewerModalOpen(true);
            }}
            onDeletePress={(image) => {
                if (selectedData.length == 1 && selectedData[i].stories.length == 1) {
                    setIsModalOpen(false);
                    if (onClose) {
                        onClose(x);
                    }
                }
                if (x.is_mine == true && x.stories.length == 1) {
                    setIsModalOpen(false);
                    if (onClose) {
                        onClose(x);
                    }
                }
                else {
                    let tmp_images = selectedData[i].stories.filter(s => s.story_image != image);
                    let _selectedData = selectedData.slice(0);
                    _selectedData[i].stories = tmp_images;
                    setSelectedData(_selectedData);
                }
               
                props.onDeletePress(image, x);
            }}
            onClosePress={() => {
                setIsModalOpen(false);
                if (onClose) {
                    onClose(x);
                }
            }}
            onNamePress={()=>{
                props.onNamePress(x);
                setIsModalOpen(false);
                if (onClose) {
                    onClose(x);
                }
            }}
            onMentionPress={(mention)=>{
                props.onMentionPress(mention);
                setIsModalOpen(false);
                if (onClose) {
                    onClose(x);
                }
            }}
            onMessageSentCallback={() => {
                setShowSnackBar(true);
                setTimeout(() => {
                    setShowSnackBar(false);
                }, 1500)
            }}
            index={i} />)
    })

    const renderCube = () => {
        if (Platform.OS == 'ios') {
            return (
                <CubeNavigationHorizontal
                    ref={cube}
                    callBackAfterSwipe={(x) => {
                        if (x != currentPage) {
                            setCurrentPage(parseInt(x));
                        }
                    }}
                    callbackOnSwipe={() => {
                        
                        setShowSnackBar(false);
                    }}
                >
                    {renderStoryList()}
                </CubeNavigationHorizontal>
            )
        } else {
            return (<AndroidCubeEffect
                ref={cube}
                callBackAfterSwipe={(x) => {
                    if (x != currentPage) {
                        setCurrentPage(parseInt(x));
                    }
                }}
                callbackOnSwipe={() => {
                    
                    setShowSnackBar(false);
                }}
            >
                {renderStoryList()}
            </AndroidCubeEffect>)
        }
    }

    return (
        <Fragment>
            <View style={style}>
                <StoryCircleListView
                    handleStoryItemPress={_handleStoryItemPress}
                    onAddPhoto={onAddPhoto}
                    data={dataState}
                    avatarSize={avatarSize}
                    unPressedBorderColor={unPressedBorderColor}
                    pressedBorderColor={pressedBorderColor}
                    showText={showAvatarText}
                    textStyle={avatarTextStyle}
                />
            </View>
            <Modal
                style={{
                    flex: 1,
                    height: Dimensions.get("window").height,
                    width: Dimensions.get("window").width
                }}
                isOpen={isModalOpen}
                onClosed={() => setIsModalOpen(false)}
                keyboardTopOffset={0}
                position="center"
                swipeToClose
                swipeArea={250}
                backButtonClose
                coverScreen={true}
            >
                <View style={{ flex: 1, width: '100%', }}>
                    {renderCube()}
                    <SnackBar
                        top={25}
                        position='top'
                        visible={showSnackBar}
                        messageStyle={{ fontSize: 16, fontFamily: Theme.fonts.semiBold }}
                        textMessage={translate('social.story_message_sent')}
                        backgroundColor={Theme.colors.btnPrimary}
                        messageColor={Theme.colors.white}
                    />
                </View>
                <Modal
                    style={{
                        // flex: 1,
                        height: Dimensions.get("window").height * 0.85,
                        width: Dimensions.get("window").width
                    }}
                    isOpen={isViewerModalOpen}
                    onClosed={() => setIsViewerModalOpen(false)}
                    position="bottom"
                    backButtonClose
                // coverScreen={true}
                >
                    <View style={{ height: '100%', width: '100%', borderTopLeftRadius: 15, borderTopRightRadius: 15, backgroundColor: '#fff' }}>
                        <Header1
                            style={{ marginBottom: 0, height: 60, paddingHorizontal: 20, }}
                            onLeft={() => { setIsViewerModalOpen(false) }}
                            title={translate('social.viewers')}
                        />
                        <FlatList
                            style={{
                                flex: 1,
                                width: '100%',
                                marginTop: 25,
                                paddingLeft: 20,
                                paddingRight: 20,
                            }}
                            data={viewers}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={(item, index) => (
                                <SnapfooderListItem
                                    key={item.item.id}
                                    full_name={item.item.username || item.item.full_name}
                                    photo={item.item.photo}
                                    sex={item.item.sex ?? "male"}
                                    is_friend={item.item.is_friend == 1}
                                    is_invited={item.item.invite_status == 'invited'}
                                    onPress={() => {
                                        props.onViewerPress(item.item);
                                        setIsModalOpen(false);
                                        setIsViewerModalOpen(false);
                                    }}
                                />
                            )}
                            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                            ListFooterComponent={() => <View style={{ height: 65 }} />}
                            onEndReachedThreshold={0.3}
                        />
                    </View>
                </Modal>
            </Modal>
        </Fragment>
    );
};
export default Story;


Story.defaultProps = {
    showAvatarText: true
}
