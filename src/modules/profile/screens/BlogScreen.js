import React from 'react';
import {connect} from 'react-redux';
import {ActivityIndicator, FlatList, RefreshControl, ScrollView, View, TouchableOpacity} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import {getLanguage, translate} from '../../../common/services/translate';
import apiFactory from '../../../common/services/apiFactory';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BlockSpinner from '../../../common/components/BlockSpinner'; 
import BlogItem from '../components/BlogItem';
import Theme from '../../../theme';
import alerts from '../../../common/services/alerts';
import {setProfileBlogs,} from '../../../store/actions/app';
import { AuthInput, RoundIconBtn, } from '../../../common/components';
import Header1 from '../../../common/components/Header1';
import FastImage from 'react-native-fast-image';
import AppText from '../../../common/components/AppText';
import RouteNames from '../../../routes/names';

const IS_LOADING = 'isLoading';
const IS_REFRESHING = 'isRefreshing';
const IS_LOADING_NEXT = 'isLoadingNext';

class BlogScreen extends React.Component {
    _isMounted = true
    constructor (props) {
        super(props);

        this.state = {
            language: getLanguage(),
            [IS_LOADING]: true,
            [IS_REFRESHING]: false,
            [IS_LOADING_NEXT]: false,
            blog: [], 
            selectedCategory: null,
            title: '',
            page: 1,
            totalPages: 1,
        };
    }

    static navigationOptions = () => {
        return {
            title: translate('account.blog_menu'),
        };
    };

    componentDidMount () {
        this._isMounted = true;
        this.getBlog();
        this.getCategories();
    } 

    componentWillUnmount() {
        this._isMounted = false;
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.profile_blog_filter.category_id !== this.props.profile_blog_filter.category_id) {
            
            await this.setState({
                page: 1,
                selectedCategory: this.props.profile_blog_filter.category_id,
            }); 
            
            this.getBlog(IS_REFRESHING);
        }
    } 

    getBlog = async (propToLoad = IS_LOADING) => {
        const {title, page, selectedCategory} = this.state;
        const params = [
            `title=${title}`,
            `page=${page}`,
            `category_id=${selectedCategory ? selectedCategory : ''}`,
        ];
        await this.setState({[propToLoad]: true});
        apiFactory.get(`blogs?${params.join('&')}`).then(({data}) => {
            const blog = data['blogs'];
            let blogItems = this.state.blog;
            if ([IS_LOADING, IS_LOADING_NEXT].indexOf(propToLoad) > -1) {
                blogItems = [
                    ...blogItems,
                    ...blog['data'],
                ];
            } else {
                blogItems = blog['data'];
            }
            if (this._isMounted == true) {
                this.setState({
                    blog: blogItems,
                    page: blog['current_page'],
                    totalPages: blog['last_page'],
                    [propToLoad]: false,
                });
            }
        }, (error) => {
            const message = error.message || translate('generic_error');
            if (this._isMounted == true) {
                this.setState({
                    [propToLoad]: false,
                });
                alerts.error(translate('alerts.error'), message);
            }
        });
    };

    getCategories = () => {
        apiFactory.get('blogs/categories').then(({data}) => { 
            this.props.setProfileBlogs(data.categories) 
        });
    };

    loadNextPage = async () => {
        const {page, totalPages} = this.state;
        if (!this.state[IS_LOADING_NEXT] && page < totalPages) {
            await this.setState({
                page: page + 1,
            });
            this.getBlog(IS_LOADING_NEXT);
        }
    };

    renderNextLoader = () => {
        if (this.state.loadingNextVendors) {
            return <ActivityIndicator size={Theme.sizes.xLarge} color={Theme.colors.primary}/>;
        }
        return null;
    };

    changeQuery = async (title) => {
        await this.setState({title});
        this.getBlog('none');
    };

  
    renderNoData = () => {
        return <View style={{marginTop: 50, marginBottom: 300}}>
            <View style={Theme.styles.noData.imageContainer}>
                <FastImage
                    resizeMode={FastImage.resizeMode.contain}
                    source={require('../../../common/assets/images/noblog.png')}
                    style={Theme.styles.noData.noImage}
                />
            </View>
            <AppText style={Theme.styles.noData.noTitle}>
                {translate('blog.no_blog')}
            </AppText>
            <AppText style={Theme.styles.noData.noDescription}>
                {translate('blog.no_blog_message')}
            </AppText>
        </View>;
    };
 
    renderSearchView = () => {
        return <View style={[Theme.styles.row_center, { width: '100%', marginBottom: 16, paddingHorizontal: 20 }]}>
            <AuthInput
                placeholder={translate('search.search_keywords')}
                underlineColorAndroid={'transparent'}
                autoCapitalize={'none'}
                returnKeyType={'done'}
                isSearch={true}
                style={{ flex: 1, height: 45, marginRight: 12, }}
                value={this.state.title}
                onChangeText={this.changeQuery} 
                rightComp={this.state.title !== '' ? (
                    <TouchableOpacity onPress={() => {
                        this.changeQuery('') 
                    }}>
                        <Entypo name={'circle-with-cross'} color={'#878E97'} size={18} />
                    </TouchableOpacity>
                ) : null}
            />
            <RoundIconBtn style={{ width: 45, height: 45 }} icon={<MaterialIcons name='filter-list' size={26} color={Theme.colors.cyan2} />}
                onPress={() => this.props.navigation.navigate(RouteNames.BlogFilterScreen)} />
        </View>
    }

    render () {
        const {isLoading, blog} = this.state;

        if (isLoading) {
            return <BlockSpinner/>;
        }

        const isRefreshing = this.state[IS_REFRESHING];

        return <View style={[Theme.styles.col_center, {flex: 1, backgroundColor : Theme.colors.white, }]}>
            <Header1
				style={{ marginTop: 10, marginBottom: 10, paddingHorizontal: 20 }}
				onLeft={() => { this.props.navigation.goBack() }}
				title={translate('account.blog_menu')}
			/>
            {this.renderSearchView()}
            <FlatList
                keyExtractor={item => item.id.toString()}
                style={{paddingHorizontal : 20, flex: 1, width: '100%'}}
                onEndReachedThreshold={0.3}
                data={blog}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => this.getBlog(IS_REFRESHING)}
                    />
                } 
                ListEmptyComponent={this.renderNoData()}
                ListFooterComponent={this.renderNextLoader()}
                onEndReached={this.loadNextPage}
                renderItem={({item}) => (
                    <BlogItem key={item.id.toString()}
                              onPress={() => {
                                  this.props.navigation.push(RouteNames.BlogDetailsScreen, {
                                      blog: item,
                                  });
                              }}
                              item={item}
                              language={this.props.language}
                    />
                )}
            /> 
        </View>;

    }
}

function mapStateToProps ({app}) {
    return {
        language : app.language,
        safeAreaDims: app.safeAreaDims, 
        profile_blog_filter : app.profile_blog_filter,
    };
}

export default connect(
    mapStateToProps,
    {
        setProfileBlogs, 
    },
)(BlogScreen);
