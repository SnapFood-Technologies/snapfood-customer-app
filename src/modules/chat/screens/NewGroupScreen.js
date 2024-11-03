import React from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import Theme from "../../../theme";
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';
import { getFriends } from '../../../store/actions/app';
import RouteNames from "../../../routes/names";
import { translate } from '../../../common/services/translate';
import BackButton from "../../../common/components/buttons/back_button";
import MainBtn from "../../../common/components/buttons/main_button";
import SearchBox from "../../../common/components/social/search/SearchBox";
import UserListItem from '../components/UserListItem';
import NoFriends from '../components/NoFriends';

const IS_LOADING = 'isLoading';
const IS_REFRESHING = 'isRefreshing';
const IS_LOADING_NEXT = 'isLoadingNext';

class NewGroupScreen extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isFriend: true,
            isAddMember: (props.route?.params?.isAddMember == true),
            selectedFriends: (props.route?.params?.users || []),
            all_friends : [],
            snapfooders : [],
            page: 1,
            totalPages : 1,
            searchTerms : '',
            friend_loaded : false,
            snapfooders_loaded : false,
        };
    }

    componentDidMount = () => {
        this._isMounted = true;
        this.getAllFriends()
        this.getSnapfooders(IS_REFRESHING)

        this.removefocusListener = this.props.navigation.addListener('focus', () => {
            this.getSnapfooders(IS_REFRESHING)
		});
    }

    componentWillUnmount=()=>{
        this._isMounted = false;
        if (this.removefocusListener) {
			this.removefocusListener();
		}
    }

    onChangeSearch = async (searchTerms) => {
        
        await this.setState({searchTerms});
        this.getAllFriends(searchTerms);
        this.getSnapfooders('none');
    };

    onSendInvitation = async (item) => {
        apiFactory.post(`users/friends/update`, {
            user_id :  this.props.user.id,
            friend_id : item.id ,
            status : 'invited'
        }).then((res) => {
            this.getSnapfooders('none');
        },
            (error) => {
                const message = error.message || translate('generic_error');
                alerts.error(translate('alerts.error'), message);
            });
    }

    onCancelInvitation = async (item) => {
        apiFactory.post(`users/friends/remove`, {
            user_id :  this.props.user.id,
            friend_id : item.id
        }).then((res) => {
            this.getSnapfooders('none');
        },
        (error) => {
            const message = error.message || translate('generic_error');
            alerts.error(translate('alerts.error'), message);
        });
    }

    getAllFriends=(searchTerm)=>{
        this.props.getFriends('accepted', searchTerm).then(data => {
            this.setState({all_friends : data, friend_loaded : true})
        })
        .catch(err => {
            this.setState({friend_loaded : true})
            
        })
    }

    getSnapfooders = async (propToLoad = IS_LOADING) => {
        const {searchTerms, page} = this.state;
        let page_num = page;
        if (propToLoad == IS_REFRESHING || propToLoad == 'none') {
            page_num = 1;
        }
        const params = [
            `name=${searchTerms}`,
            `page=${page_num}`,
        ];
        await this.setState({[propToLoad]: true});
        apiFactory.get(`users/snapfooders?${params.join('&')}`).then(({data}) => {
            const res_snapfooders = data['snapfooders'];
            let snapfooders = this.state.snapfooders;
            if ([IS_LOADING, IS_LOADING_NEXT].indexOf(propToLoad) > -1) {
                snapfooders = [
                    ...snapfooders,
                    ...res_snapfooders['data'],
                ];
            } else {
                snapfooders = res_snapfooders['data'];
            }
            if (this._isMounted)  {
                this.setState({
                    snapfooders: snapfooders,
                    page: res_snapfooders['current_page'],
                    totalPages: res_snapfooders['last_page'],
                    [propToLoad]: false,
                    snapfooders_loaded : true,
                });
            }
        },
        (error) => {
            const message = error.message || translate('generic_error');
            this.setState({
                [propToLoad]: false,
                snapfooders_loaded : true,
            });
            alerts.error(translate('alerts.error'), message);
        });
    };

    loadNextPage = async () => {
        const {page, totalPages} = this.state;
        if (!this.state[IS_LOADING_NEXT] && page < totalPages) {
            await this.setState({
                page: page + 1,
            });
            this.getSnapfooders(IS_LOADING_NEXT);
        }
    };

    renderNextLoader = () => {
        if (this.state[IS_LOADING_NEXT]) {
            return <ActivityIndicator size={28} color={Theme.colors.primary}/>;
        }
        return <View style={{ height: 90 }} />;
    };

    renderTitleBar() {
        return (
            <View style={styles.titleContainer}>
                <BackButton onPress={() => {
                    this.props.navigation.goBack();
                }} />
                <Text style={styles.title}>{this.state.isAddMember ? translate('social.add_member'): translate('social.new_group')}</Text>
            </View>
        );
    }

    renderSearchBar() {
        return (
            <View style={styles.searchContainer}>
                <SearchBox onChangeText={this.onChangeSearch} hint={translate('social.search.friends')} />
            </View>
        );
    }

    renderTab() {
        const { isFriend } = this.state;
        return (
            <View style={styles.tabContainer}>
                {this.renderTabButton('Friends', isFriend, () => {
                    this.setState({ isFriend: true })
                })}
                <View style={styles.spaceRow} />
                {this.renderTabButton('Snapfooders', !isFriend, () => {
                    this.setState({ isFriend: false })
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

    renderFriendList() {
        return (
            <FlatList
                style={styles.listContainer}
                data={this.state.all_friends}
                numColumns={1}
                keyExtractor={item => item.id.toString()}
                renderItem={(item, index) => (
                    <UserListItem
                        key={item.item.id}
                        full_name={item.item.username || item.item.full_name}
                        photo={item.item.photo}
                        invite_status={item.item.invite_status}
                        type='checkbox'
                        checked={this.state.selectedFriends.findIndex(i => i.id == item.item.id) != -1}
                        onPress={() => {
                            let tmp = this.state.selectedFriends.slice(0, this.state.selectedFriends.length)
                            let foundIndex = this.state.selectedFriends.findIndex(i => i.id == item.item.id)
                            if (foundIndex != -1) {
                                tmp.splice(foundIndex, 1)
                            }
                            else {
                                tmp.push(item.item)
                            }

                            this.setState({ selectedFriends: tmp })
                        }}
                    />
                )}
                ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
                ListFooterComponent={() => <View style={{ height: 90 }} />}
                ListEmptyComponent={()=>(this.state.friend_loaded == true && <NoFriends title={translate('social.no_friends_from_new_group')} />)}
            />);
    }

    renderSnapfooders() {
        return (
            <FlatList
                style={styles.listContainer}
                data={this.state.snapfooders}
                numColumns={1}
                keyExtractor={item => item.id.toString()}
                renderItem={(item, index) => (
                    <UserListItem
                        key={item.item.id}
                        full_name={item.item.username || item.item.full_name}
                        photo={item.item.photo}
                        invite_status={item.item.invite_status}
                        type='snapfooder'
                        onPress={()=>{
                            this.props.navigation.navigate(RouteNames.SnapfooderScreen, { user: item.item });
                        }}
                        onRightBtnPress={
                            item.item.invite_status == 'invited' ?
                            ()=>this.onCancelInvitation(item.item) :
                            ()=>this.onSendInvitation(item.item)
                        }
                    />
                )}
                ItemSeparatorComponent={() => <View style={styles.spaceCol}/>}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state[IS_REFRESHING]}
                        onRefresh={() => this.getSnapfooders(IS_REFRESHING)}
                    />
                }
                ListFooterComponent={this.renderNextLoader()}
                ListEmptyComponent={() => this.state.snapfooders_loaded == true && <NoFriends title={translate('social.no_snapfooders_from_new_group')} />}
                onEndReachedThreshold={0.3}
                onEndReached={this.loadNextPage}
            />
        );
    }

    render() {
        const { isFriend } = this.state;
        return (
            <View style={styles.container}>
                <View style={{ flex: 1,  }}>
                    {this.renderTitleBar()}
                    {this.renderSearchBar()}
                    <View style={{ paddingHorizontal: 20, }}>
                        {this.renderTab()}
                    </View>
                    {isFriend ? this.renderFriendList() : this.renderSnapfooders()}
                </View>
                {
                    this.state.selectedFriends.length > 0 &&
                    <View style={[styles.btmbtn]}>
                        <MainBtn
                            title={translate('proceed')}
                            style={{ width: '100%' }}
                            onPress={() => {
                                this.props.navigation.navigate(RouteNames.CreateGroupScreen, {users: this.state.selectedFriends})
                            }}
                        />
                    </View>
                }
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
        paddingVertical: 10,
        paddingHorizontal: 20,
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
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 5,
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
    btmbtn: { position: 'absolute', bottom: 40, left: 0, width: '100%', paddingHorizontal: 20 }
});

const mapStateToProps = ({ app, chat }) => ({
    isLoggedIn: app.isLoggedIn,
    user: app.user,
    messages: chat.messages,
    safeAreaDims: app.safeAreaDims,
});

export default connect(
    mapStateToProps,
    {getFriends},
)(withNavigation(NewGroupScreen));
