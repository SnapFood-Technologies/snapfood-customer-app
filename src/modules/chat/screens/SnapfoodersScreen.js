import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, View, Text, FlatList, RefreshControl, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { withNavigation } from 'react-navigation';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { connect } from 'react-redux';
import FastImage from "react-native-fast-image";
import AntDesign from 'react-native-vector-icons/AntDesign'
import Theme from "../../../theme";
import RouteNames from "../../../routes/names";
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';
import { getImageFullURL, isEmpty } from '../../../common/services/utility';
import BackButton from "../../../common/components/buttons/back_button";
import SearchBox from "../../../common/components/social/search/SearchBox";
import NoFriends from '../components/NoFriends';
import UserListItem from '../components/UserListItem';
import { AppText } from '../../../common/components';
import ReferralRemindModal from '../../../common/components/modals/ReferralRemindModal';
import { setShowReferralRemindModal } from '../../../store/actions/app';

const IS_LOADING = 'isLoading';
const IS_REFRESHING = 'isRefreshing';
const IS_LOADING_NEXT = 'isLoadingNext';

const BottomPagination = ({ curPage, totalPages, onSelect }) => {
    const pageScroller = useRef(null);
    const pageScrollerXoffset = useRef(0);
    const [categoryLeftArrow, setCategoryLeftArrow] = useState(false);
    const [categoryRightArrow, setCategoryRightArrow] = useState(true);

    const isCloseToLeft = ({ layoutMeasurement, contentOffset, contentSize }) => {
        return contentOffset.x <= 20;
    };
    const isCloseToRight = ({ layoutMeasurement, contentOffset, contentSize }) => {
        return layoutMeasurement.width + contentOffset.x >= contentSize.width - 20;
    };

    if (totalPages > 1) {
        return <View style={[Theme.styles.row_center, { width: '100%', paddingBottom: 32, paddingTop: 12, paddingHorizontal: 20 }]}>
            <TouchableOpacity
                disabled={categoryLeftArrow != true}
                style={[Theme.styles.col_center, styles.arrow, { opacity: (categoryLeftArrow != true ? 0.6 : 1) }]}
                onPress={() => {
                    try {
                        pageScroller.current?.scrollTo({ x: 0 })
                    } catch (error) {
                    }
                }}
            >
                <AntDesign name='stepbackward' color={Theme.colors.white} size={20} />
            </TouchableOpacity>
            <ScrollView
                ref={pageScroller}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1 }}
                onScroll={({ nativeEvent }) => {
                    pageScrollerXoffset.current = nativeEvent.contentOffset.x;
                    if (isCloseToRight(nativeEvent)) {
                        setCategoryRightArrow(false);
                    } else {
                        setCategoryRightArrow(true);
                    }
                    if (isCloseToLeft(nativeEvent)) {
                        setCategoryLeftArrow(false);
                    } else {
                        setCategoryLeftArrow(true);
                    }
                }}
            >
                {
                    [...Array(totalPages).keys()].map((page, index) =>
                        <TouchableOpacity
                            key={page}
                            style={[Theme.styles.col_center, styles.page, page == curPage && {
                                backgroundColor: Theme.colors.cyan2
                            }]}
                            onPress={() => {
                                onSelect(page);
                            }}
                        >
                            <AppText style={[styles.pageTxt, page == curPage && {
                                color: Theme.colors.white
                            }]}>{page + 1}</AppText>
                        </TouchableOpacity>
                    )
                }
            </ScrollView>
            <TouchableOpacity
                disabled={categoryRightArrow != true}
                style={[Theme.styles.col_center, styles.arrow, { opacity: (categoryRightArrow != true ? 0.6 : 1) }]}
                onPress={() => {
                    try {
                        pageScroller.current?.scrollToEnd()
                    } catch (error) {
                    }
                }}
            >
                <AntDesign name='stepforward' color={Theme.colors.white} size={20} />
            </TouchableOpacity>
        </View>
    }
    return null;
}

class SnapfoodersScreen extends React.Component {
    _selected_user_id = null;
    _isMounted = false;
    _scroller = null;
    constructor(props) {
        super(props);
        this.state = {
            searchTerms: '',
            page: 0,
            totalPages: 1,
            snapfooders: [],
        };
    }

    componentDidMount = () => {
        this._isMounted = true;
        this.getSnapfooders(IS_REFRESHING)
        this.removefocusListener = this.props.navigation.addListener('focus', () => {
            if (this._selected_user_id != null) {
                this.updateSnapfoodDetail(this._selected_user_id)
            }
        });

        this.removeAppBadge();
        this.props.setShowReferralRemindModal(true);
    }

    componentWillUnmount() {
        this._isMounted = false;
        if (this.removefocusListener) {
            this.removefocusListener()
        }
    }

    removeAppBadge = () => {
        if (Platform.OS == 'ios') {
            try {
                PushNotificationIOS.setApplicationIconBadgeNumber(0);
            } catch (error) {

            }
        }
    }

    updateSnapfoodDetail = async (user_id) => {
        apiFactory.get(`users/snapfooders/${user_id}`).then(({ data }) => {
            const res_snapfooder = data['snapfooder'];
            if (this._isMounted == true) {
                let tmp = this.state.snapfooders.slice(0, this.state.snapfooders.length);
                let found_index = tmp.findIndex(i => i.id == user_id);
                if (found_index >= 0) {
                    tmp[found_index].invite_status = res_snapfooder.invite_status;
                    this.setState({ snapfooders: tmp });
                }
            }
        },
            (error) => {
                const message = error.message || translate('generic_error');
                
            });
    }

    onChangeSearch = async (searchTerms) => {
        await this.setState({ searchTerms });
        this.getSnapfooders('none');
    };

    onGoDetail = (user) => {
        this.props.navigation.navigate(RouteNames.SnapfooderScreen, { user: user })
    }

    getSnapfooders = async (propToLoad = IS_LOADING) => {
        const { searchTerms, page } = this.state;
        let page_num = page;
        if (propToLoad == 'none') {
            page_num = 0;
        }
        const params = [
            `name=${searchTerms}`,
            `page=${page_num}`,
            `with_friend=1`
        ];
        await this.setState({ [propToLoad]: true });
        apiFactory.get(`users/snapfooders-with-page?${params.join('&')}`).then(({ data }) => {
            this.setState({
                snapfooders: data['snapfooders'],
                totalPages: data['total_pages'],
                [propToLoad]: false,
            });
            try {
                this._scroller.scrollToOffset({ animated: false, offset: 0 });
            } catch (error) {
            }
        },
            (error) => {
                const message = error.message || translate('generic_error');
                this.setState({
                    [propToLoad]: false,
                });
                alerts.error(translate('alerts.error'), message);
            });
    };

    loadNewPage = async (new_page) => {
        
        await this.setState({
            page: new_page,
        });
        this.getSnapfooders(IS_REFRESHING);
    };

    onSendInvitation = async (item, callback) => {
        apiFactory
            .post(`users/friends/update`, {
                user_id: this.props.user.id,
                friend_id: item.id,
                status: 'invited',
            })
            .then(
                (res) => {
                    
                    if (callback) {
                        callback(true);
                    } else {
                        this.getSnapfooders('none');
                    }
                },
                (error) => {
                    const message = error.message || translate('generic_error');
                    alerts.error(translate('alerts.error'), message);
                }
            );
    };

    onCancelInvitation = async (item, callback) => {
        apiFactory
            .post(`users/friends/remove`, {
                user_id: this.props.user.id,
                friend_id: item.id,
            })
            .then(
                (res) => {
                    if (callback) {
                        callback(true);
                    } else {
                        this.getSnapfooders('none');
                    }
                },
                (error) => {
                    const message = error.message || translate('generic_error');
                    alerts.error(translate('alerts.error'), message);
                }
            );
    };

    render() {
        return (
            <View style={styles.container}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
                <View style={{ flex: 1, }}>
                    {this.renderTitleBar()}
                    {this.renderSearchBar()}
                    {this.renderFriendList()}
                    <BottomPagination
                        curPage={this.state.page}
                        totalPages={this.state.totalPages}
                        onSelect={(p) => {
                            this.loadNewPage(p)
                        }}
                    />
                </View>
                {
                    this.props.referralsRewardsSetting.show_referral_module == true && 
                    <ReferralRemindModal navigation={this.props.navigation} />
                }
            </View>
        );
    }

    renderTitleBar() {
        return (
            <View style={styles.titleContainer}>
                <BackButton onPress={() => {
                    this.props.navigation.goBack();
                }} />
                <Text style={styles.title}>{translate('social.snapfooders')}</Text>
            </View>
        );
    }

    renderSearchBar() {
        return (
            <View style={styles.searchContainer}>
                <SearchBox onChangeText={this.onChangeSearch} hint={translate('social.search.snapfooders')} />
            </View>
        );
    }

    renderFriendList() {
        return (
            <FlatList
                ref={(ref) => (this._scroller = ref)}
                style={styles.listContainer}
                data={this.state.snapfooders}
                numColumns={1}
                initialNumToRender={20}
                keyExtractor={item => item.id.toString()}
                renderItem={(item) => this.renderFriendItem(item)}
                ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state[IS_REFRESHING]}
                        onRefresh={() => this.getSnapfooders(IS_REFRESHING)}
                    />
                }
                ListEmptyComponent={() => this.state[IS_REFRESHING] == false && <NoFriends title={translate('social.no_snapfooders')} desc={translate('social.no_snapfooders_desc')} />}
            />
        );
    }

    renderFriendItem = ({ item }) => {
        return (
            <UserListItem
                full_name={item.username || item.full_name}
                photo={item.photo}
                invite_status={item.invite_status}
                isFriend={item.is_friend}
                type='invite_status'
                onPress={() => {
                    this._selected_user_id = item.id
                    this.onGoDetail(item)
                }}
                onRightBtnPress={
                    item.invite_status == 'invited'
                        ? () => this.onCancelInvitation(item)
                        : () => this.onSendInvitation(item)
                }
            />
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
        marginTop: 50
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
        flexDirection: 'row',
        marginTop: 15,
        paddingHorizontal: 20
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
    listContainer: {
        flex: 1,
        width: '100%',
        marginTop: 20,
        paddingHorizontal: 20
    },
    leftArrowView: { borderTopRightRadius: 15, borderBottomRightRadius: 15, paddingHorizontal: 4 },
    rightArrowView: { borderTopRightRadius: 15, borderBottomRightRadius: 15, paddingHorizontal: 4 },
    arrow: { marginHorizontal: 16, width: 32, height: 32, borderRadius: 18, backgroundColor: '#50b7ed' },
    page: { marginHorizontal: 4, width: 32, height: 32, borderRadius: 18, backgroundColor: Theme.colors.gray8 },
    pageTxt: { fontSize: 12, lineHeight: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium },
});

const mapStateToProps = ({ app, chat }) => ({
    isLoggedIn: app.isLoggedIn,
    user: app.user,
    messages: chat.messages,
    safeAreaDims: app.safeAreaDims,
    referralsRewardsSetting: app.referralsRewardsSetting || {},
});

export default connect(
    mapStateToProps,
    {setShowReferralRemindModal},
)(withNavigation(SnapfoodersScreen));
