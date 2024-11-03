import React from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import FastImage from "react-native-fast-image";
import Theme from "../../../theme";
import RouteNames from "../../../routes/names";
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';
import { getImageFullURL, isEmpty } from '../../../common/services/utility';
import BackButton from "../../../common/components/buttons/back_button";
import SearchBox from "../../../common/components/social/search/SearchBox";
import NoFriends from '../../chat/components/NoFriends';
import RadioBtn from '../../../common/components/buttons/radiobtn';
import { setPaymentInfoCart, } from '../../../store/actions/shop';

const IS_LOADING = 'isLoading';
const IS_REFRESHING = 'isRefreshing';
const IS_LOADING_NEXT = 'isLoadingNext';

class SnapfoodersSplitScreen extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            searchTerms: '',
            page: 1,
            totalPages: 1,
            snapfooders: [],
        };
    }

    componentDidMount = () => {
        this._isMounted = true;
        this.props.setPaymentInfoCart({
            ...this.props.payment_info,
            splits: []
        })
        this.getSnapfooders(IS_REFRESHING)
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onChangeSearch = async (searchTerms) => {
        await this.setState({ searchTerms });
        this.getSnapfooders('none');
    };

    onGoDetail = (user) => {
        this.props.navigation.navigate(RouteNames.SnapfooderScreen, { user: user})
    }
    
    getSelectedCnt=()=>{ 
        let found = this.props.splits.filter(i => i.id != this.props.user.id)
        return found.length;
    }

    goSplitOrder = () => {
        let tmp = this.props.splits.slice(0, this.props.splits.length) 
        let found = tmp.findIndex(i => i.id == this.props.user.id)
        if (found < 0) {
            tmp = [this.props.user].concat(tmp)
        }
        
        this.props.setPaymentInfoCart({
            ...this.props.payment_info,
            splits: tmp
        }) 
        this.props.navigation.navigate(RouteNames.SplitOrderScreen)
    }

    getSnapfooders = async (propToLoad = IS_LOADING) => {
        const { searchTerms, page } = this.state;
        const params = [
            `name=${searchTerms}`,
            `page=${page}`,
            `online_payment=1`
        ];
        await this.setState({ [propToLoad]: true });
        apiFactory.get(`users/snapfooders?${params.join('&')}`).then(({ data }) => {
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
            if (this._isMounted) {
                this.setState({
                    snapfooders: snapfooders,
                    page: res_snapfooders['current_page'],
                    totalPages: res_snapfooders['last_page'],
                    [propToLoad]: false,
                });
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

    loadNextPage = async () => {
        const { page, totalPages } = this.state;
        if (!this.state[IS_LOADING_NEXT] && page < totalPages) {
            await this.setState({
                page: page + 1,
            });
            this.getSnapfooders(IS_LOADING_NEXT);
        }
    };

    renderNextLoader = () => {
        if (this.state[IS_LOADING_NEXT]) {
            return <ActivityIndicator size={28} color={Theme.colors.primary} />;
        }
        return null;
    };

    render() {
        return (
            <View style={styles.container}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
                <View style={{ flex: 1, }}>
                    {this.renderTitleBar()}
                    {this.renderSearchBar()}
                    {this.renderFriendList()}
                </View>
                {
                    this.getSelectedCnt() > 0 && <View style={[Theme.styles.col_center, styles.bottomBtnView]}>
                        <TouchableOpacity onPress={this.goSplitOrder} style={[Theme.styles.row_center, styles.bottomBtn]}>
                            <Text style={[styles.bottomBtnTxt1]}>{this.getSelectedCnt()} {translate('selected')}</Text>
                            <Text style={[styles.bottomBtnTxt2]}>{translate('proceed')}</Text>
                        </TouchableOpacity>
                    </View>
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
                style={styles.listContainer}
                data={this.state.snapfooders}
                numColumns={1}
                keyExtractor={item => item.id.toString()}
                renderItem={(item) => this.renderFriendItem(item)}
                ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state[IS_REFRESHING]}
                        onRefresh={() => this.getSnapfooders(IS_REFRESHING)}
                    />
                }
                ListFooterComponent={this.renderNextLoader()}
                ListEmptyComponent={() => this.state[IS_REFRESHING] == false && <NoFriends title={translate('social.no_snapfooders')} desc={translate('social.no_snapfooders_desc')} />}
                onEndReachedThreshold={0.3}
                onEndReached={this.loadNextPage}
            />

        );
    }

    renderFriendItem = ({ item }) => {
        const onPress = () => {
            let tmp = this.props.splits.slice(0, this.props.splits.length)
            let foundUser = this.props.splits.findIndex(i => i.id == item.id)
            if (foundUser >= 0) {
                tmp.splice(foundUser, 1)
            }
            else {
                tmp.push(item)
            }
            this.props.setPaymentInfoCart({
                ...this.props.payment_info,
                splits: tmp
            })
        }
        return (
            <TouchableOpacity style={styles.chatContainer} onPress={onPress}>
                <FastImage
                    style={styles.avatar}
                    source={{ uri: getImageFullURL(item.photo) }}
                    resizeMode={FastImage.resizeMode.cover}
                />
                <View style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
                    <Text style={styles.name}>{item.username || item.full_name}</Text>
                    <RadioBtn onPress={onPress} checked={this.props.splits.findIndex(i => i.id == item.id) >= 0} />
                </View>
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
        paddingHorizontal: 20,
        marginTop: 50
    },
    title: {
        alignSelf: 'center',
        flex: 1,
        textAlign: 'center',
        marginRight: 30,
        fontSize: 18,
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
        fontSize: 14,
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
        marginTop: 20,
        paddingHorizontal: 20
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 6,
        backgroundColor: 'red',
        marginRight: 20
    },
    name: {
        flex: 1,
        fontSize: 16,
        color: 'black',
        fontFamily: Theme.fonts.semiBold
    },
    invite: {
        color: '#50b7ed',
        fontSize: 14,
        fontFamily: Theme.fonts.semiBold
    },
    bottomBtnView: { height: 55, width: '100%', paddingHorizontal: 20, position: 'absolute', bottom: 40, backgroundColor: 'transparent', },
    bottomBtn: { justifyContent: 'space-between', backgroundColor: Theme.colors.btnPrimary, height: 50, width: '100%', paddingHorizontal: 20, borderRadius: 12, },
    bottomBtnTxt1: { fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.white },
    bottomBtnTxt2: { fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white },
});

const mapStateToProps = ({ app, shop }) => ({
    user: app.user,
    payment_info: shop.payment_info,
    splits: shop.payment_info.splits || [],
});

export default connect(mapStateToProps, {
    setPaymentInfoCart,
})(SnapfoodersSplitScreen);
