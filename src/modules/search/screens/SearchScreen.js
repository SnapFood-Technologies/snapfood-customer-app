import React from 'react';
import { FlatList, ScrollView, Keyboard, TouchableOpacity, View, Text, AsyncStorage, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import RBSheet from 'react-native-raw-bottom-sheet';
import { throttle } from 'throttle-debounce';
import { withNavigation } from 'react-navigation';
import { width } from 'react-native-dimension';
import { AutoCompleteInput } from '../../../common/components';
import styles from '../styles/styles';
import { translate } from '../../../common/services/translate';
import apiFactory from '../../../common/services/apiFactory';
import VendorItem from '../../../common/components/vendors/VendorItem';
import VendorFoodItem from '../../../common/components/vendors/VendorFoodItem';
import StartItem from '../components/StartItem';
import PopularItem from '../components/PopularItem';
import { setVendorCart, } from '../../../store/actions/shop';
import { setTmpFood, } from '../../../store/actions/app';
import { AuthInput, RoundIconBtn } from '../../../common/components';
import BlockSpinner from '../../../common/components/BlockSpinner';
import Theme from '../../../theme';
import RouteNames from '../../../routes/names';
import { height } from 'react-native-dimension';
import { getTweakSearch } from '../../../common/services/utility';
import { OrderType_Delivery } from '../../../config/constants';
import VendorSearchItem from '../../../common/components/vendors/VendorSearchItem';

const windowHeight = Dimensions.get('window').height;
const IS_LOADING_CATEGORIES = 'isLoadingCategories';
const IS_LOADING_RESTAURANTS = 'isLoadingRestaurants';

class SearchScreen extends React.Component {
	getRestaurants = throttle(500, (text) => {
		let { latitude, longitude } = this.props.coordinates;
		const { selectedAddress } = this.props;
		if (selectedAddress && selectedAddress.id) {
			latitude = selectedAddress.lat;
			longitude = selectedAddress.lng;
		}
		this.setState({ is_loading_restaurants: true });
		apiFactory
			.get(`vendors?lat=${latitude}&lng=${longitude}&name=${text}&per_page=999`)
			.then(({ data }) => {
				this.setState({ is_loading_restaurants: false, restaurants: data.vendors.data });
			})
			.catch((error) => {
				this.setState({ is_loading_restaurants: false });
			});
	});

	getFilteredRestaurants = throttle(500, () => {
		this.setState({ modalVisible: false });
		let { latitude, longitude } = this.props.coordinates;
		const { selectedAddress } = this.props;
		if (selectedAddress && selectedAddress.id) {
			latitude = selectedAddress.lat;
			longitude = selectedAddress.lng;
		}

		let arr = [`lat=${latitude}`, `lng=${longitude}`, `name=${this.state.text}`, `title=${this.state.text}`];

		this.state.filters.map((item) => {
			if (item.check === true) {
				arr.push(`${item.keyFilter}=1`);
			}
		});
		apiFactory.get(`vendors?` + arr.join('&')).then(({ data }) => {
			this.setState({ restaurants: data.vendors.data });
		})
			.catch((error) => {
			});
		apiFactory
			.get(`products?` + arr.join('&'))
			.then(({ data }) => {
				this.setState({ foodItems: data.products.data });
			})
			.catch((error) => {
			});
		this.RBSheet.close();
	});

	getItems = throttle(500, (text) => {
		let { latitude, longitude } = this.props.coordinates;
		const { selectedAddress } = this.props;
		if (selectedAddress && selectedAddress.id) {
			latitude = selectedAddress.lat;
			longitude = selectedAddress.lng;
		}

		this.setState({ is_loading_items: true });
		apiFactory
			.get(`products?lat=${latitude}&lng=${longitude}&title=${text}`)
			.then(({ data }) => {
				this.setState({ is_loading_items: false, foodItems: data.products.data });
			})
			.catch((error) => {
				this.setState({ is_loading_items: false });
			});
	});

	constructor(props) {
		super(props);
		this.state = {
			categories: [],
			foodItems: [],
			selected: '',
			modalVisible: true,
			restaurants: [],
			popularSearches: [],
			filters: [
				{
					title: translate('search.recommended'),
					check: false,
					keyFilter: 'recommended',
				},
				{
					title: translate('vendor_filter.delivery_by_snapfood'),
					check: false,
					keyFilter: 'delivery_by_snapfood',
				},
				{
					title: translate('search.free_delivery'),
					check: false,
					keyFilter: 'free_delivery',
				},
				{
					title: translate('search.fastest'),
					check: false,
					keyFilter: 'fastest',
				},
				{
					title: translate('search.distance'),
					check: false,
					keyFilter: 'distance',
				},
			],
			suggested: [],
			recents: [],
			text: '',
			[IS_LOADING_CATEGORIES]: false,
			[IS_LOADING_RESTAURANTS]: false,
			is_loading_restaurants: null,
			is_loading_items: null,
			selectedRestaurant: {},
			restaurantSelected: false,
			searched: false
		};
	}

	componentDidMount() {
		this.getCategories();
		this.getPopularSearch();
		this.getRecents();
	}

	getRecents = async () => {
		try {
			let recents = await AsyncStorage.getItem('recents');
			let newrecents = JSON.parse(recents);
			if (newrecents == null) {
				this.setState({ recents: [] });
			} else {
				var filtered = newrecents.filter(function (el) {
					return el != null;
				});

				this.setState({ recents: filtered });
			}
		} catch (error) {
			console.log("get recents throw error");
			console.log(error);
		}
	};

	clearAllRecents = async () => {
		try {
			await AsyncStorage.removeItem('recents');
			this.setState({ recents: [] });
		} catch (err) {
			console.log('clearAllRecents ', err);
		}
	};

	removeRecentItem = async (text) => {
		try {
			let { recents } = this.state;
			if (text) {
				var filtered = recents.filter(function (el) {
					return el != text;
				});
				await AsyncStorage.setItem('recents', JSON.stringify(filtered));
				this.setState({ recents: filtered });
			}
		} catch (err) {
			console.log('clearAllRecents ', err);
		}
	};

	getCategories = async () => {
		await this.setState({
			[IS_LOADING_CATEGORIES]: true,
		});
		apiFactory.get('vendors/food-categories').then(({ data }) => {
			this.setState({ [IS_LOADING_CATEGORIES]: false, categories: data['food_categories'] });
		});
	};

	getPopularSearch = async () => {
		await this.setState({
			[IS_LOADING_CATEGORIES]: true,
		});
		apiFactory.get('search/suggestions').then(({ data }) => {
			this.setState({ [IS_LOADING_CATEGORIES]: false, popularSearches: data['suggestions'] });
		});
	};

	search = (text) => {
		if (text.length > 2) {
			this.setState({ text: text, searched: true, });
			this.getRestaurants(text);
			this.getItems(text);
			if (text) {
				let { recents } = this.state;
				recents.push(text);
				if (recents.length >= 8) {
					let newrecents = recents.slice(1);
					this.setState({ recents: newrecents });
				}
				AsyncStorage.setItem('recents', JSON.stringify(recents));
			}
		} else {
			this.setState({ text: text, searched: false });
			this.setState({ restaurants: [] });
		}

		Keyboard.dismiss()
	};

	getSearchSuggestions = async (keyword) => {
		if (keyword != '') {
			this.setState({ text: keyword });
			let search_key = getTweakSearch(keyword);
			apiFactory.get(`/search/keywords-suggestions?search=${search_key}`).then(({ data }) => {
				this.setState({ suggested: data['suggestions'] || [] });
				console.log(data['suggestions'])
			});
		}
		else {
			this.setState({ text: keyword, suggested: [], searched: false });
		}
	};

	onFavChange = (data) => {
		let found_index = this.state.restaurants.findIndex((i) => i.id == data.id);

		if (found_index != -1) {
			let tmp = this.state.restaurants.slice(0, this.state.restaurants.length);
			tmp[found_index].isFav = data.isFav;
			this.setState({ restaurants: tmp });
		}
	};
	onProductFavChange = (data) => {
		let found_index = this.state.foodItems.findIndex((i) => i.id == data.id);

		if (found_index != -1) {
			let tmp = this.state.foodItems.slice(0, this.state.foodItems.length);
			tmp[found_index].isFav = data.isFav;
			this.setState({ foodItems: tmp });
		}
	};

	showSimilar = async (restaurant) => {
		this.goToRestaurantDetails(restaurant);
	};

	goToRestaurantDetails = (vendor) => {
		this.props.setVendorCart(vendor);
		this.props.rootStackNav.navigate(RouteNames.VendorScreen);
	};

	renderSearchView = () => {
		const { suggested, text } = this.state;
		return (
			<View style={[Theme.styles.row_center, { width: '100%', height: 50, marginBottom: 6, paddingHorizontal: 20 }]}>
				<AutoCompleteInput
					placeholder={translate('search.search_vendors_on_search')}
					underlineColorAndroid={'transparent'}
					autoCapitalize={'none'}
					returnKeyType={'done'}
					isSearch={true}
					data={(suggested.length == 1 && suggested[0].keyword.toLowerCase() == text.toLowerCase()) ? [] : suggested}
					value={text}
					onChangeText={(t) => this.getSearchSuggestions(t)}
					onSelectedText={(text) => {
						this.search(text);
						this.setState({ suggested: [] });
					}}
					showClearBtn={this.state.text != ''}
					style={{ width: width(100) - 100 }}
					onBlur={() => {
						this.search(this.state.text);
						this.setState({ suggested: [] })
					}}
					onSubmitEditing={() => {
					}}
				/>
				<RoundIconBtn
					style={{ position: 'absolute', top: 0, right: 20, width: 49, height: 49 }}
					icon={<MaterialIcons name='filter-list' size={26} color={Theme.colors.cyan2} />}
					onPress={() => this.RBSheet.open()}
				/>
			</View>
		);
	};

	render() {
		if (this.state[IS_LOADING_CATEGORIES]) {
			return <BlockSpinner />;
		}

		const {
			filters,
			restaurants,
			selected,
			recents,
			foodItems,
			popularSearches,
			selectedRestaurant,
			restaurantSelected,
		} = this.state;
		const { text } = this.state;

		let filteredRecents = recents.filter((value, index, self) => self.indexOf(value) === index);

		// let array_last_eight;
		// if(filteredRecents.length > 12) {
		// 	array_last_eight = filteredRecents.slice(-8);
		// 	filteredRecents = array_last_eight;
		// }

		return (
			<View style={[styles.searchView]}>
				<RBSheet
					ref={(ref) => (this.RBSheet = ref)}
					closeOnDragDown={true}
					duration={300}
					closeOnPressBack={true}
					height={450}
					customStyles={{
						container: {
							borderTopLeftRadius: 10,
							borderTopRightRadius: 10,
							alignItems: 'center',
						},
					}}
				>
					<View onPress={() => { }} style={{ height: '100%' }}>
						<View style={{ flexDirection: 'column', borderTopLeftRadius: 15, borderTopRightRadius: 15, backgroundColor: '#fff' }}>
							<View style={{ flexDirection: 'row' }}>
								<TouchableOpacity
									onPress={() => this.RBSheet.close()}
									style={{ height: 20, width: 20, left: 15, top: 15, flex: 1, zIndex: 1 }}
								>
									<Icon name={'cross'} size={25} color={'#000'} />
								</TouchableOpacity>
								<Text
									style={{
										width: '95%',
										top: 15,
										fontSize: 20,
										textAlign: 'center',
										fontFamily: Theme.fonts.bold,
										color: '#25252D',
									}}
								>
									{translate('search.filter')}
								</Text>
							</View>
							<FlatList
								data={filters}
								style={{ marginTop: 30, }}
								keyExtractor={(item, index) => index}
								renderItem={({ item, index }) => {
									return (
										<TouchableOpacity
											onPress={() => {
												let arr = filters;
												arr[index].check = !arr[index].check;
												this.setState({ filters: arr });
											}}
											style={{
												flexDirection: 'row',
												paddingVertical: 10,
												alignItems: 'center',
												justifyContent: 'center',
												height: 50,
											}}
										>
											<Text
												style={{
													width: '80%',
													left: 0,
													height: '100%',
													fontSize: 18,
													fontFamily: Theme.fonts.medium,
													color: '#25252D',
												}}
											>
												{item.title}
											</Text>
											<FontAwesome
												name={item.check === true ? 'check-circle' : 'circle-thin'}
												size={30}
												style={{}}
												color={item.check === true ? Theme.colors.cyan2 : 'lightgray'}
											/>
										</TouchableOpacity>
									);
								}}
							/>
							<TouchableOpacity
								onPress={() => this.getFilteredRestaurants()}
								style={{
									width: '90%',
									height: 45,
									alignItems: 'center',
									justifyContent: 'center',
									borderRadius: 5,
									bottom: '10%',
									backgroundColor: Theme.colors.cyan2,
									alignSelf: 'center',
									marginBottom: 8,
								}}
							>
								<Text style={{ color: '#fff', fontSize: 18, lineHeight: 22, fontFamily: Theme.fonts.bold }}>
									{translate('search.applyFilters')}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</RBSheet>
				<View style={{ flex: 1, marginTop: 108, }}>
					{this.state.searched && (
						<View
							style={{
								flexDirection: 'row',
								paddingHorizontal: 20,
								justifyContent: 'flex-start',
								marginBottom: 20,
							}}
						>
							<View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 14 }}>
								<TouchableOpacity onPress={() => this.setState({ selectedRestaurant: true })}>
									<Text
										style={{
											color: selectedRestaurant ? Theme.colors.cyan2 : '#B5B5B5',
											fontSize: 18.5,
											fontFamily: Theme.fonts.medium,
										}}
									>
										{translate('search.restaurants_tab')}
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={{ marginLeft: 20 }}
									onPress={() => this.setState({ selectedRestaurant: false })}
								>
									<Text
										style={{
											color: !selectedRestaurant ? Theme.colors.cyan2 : '#B5B5B5',
											fontSize: 18.5,
											fontFamily: Theme.fonts.medium,
										}}
									>
										{translate('search.items_tab')}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					)}
					{
						!this.state.searched ?
							(
								<FlatList
									style={{ flex: 1, paddingHorizontal: 20 }}
									data={filteredRecents.reverse()}
									keyExtractor={(item) => item}
									keyboardShouldPersistTaps='never'
									renderItem={({ item }) => {
										return (
											<StartItem
												title={item}
												cat='recents'
												onPress={() => this.search(item)}
												onRemove={(text) => this.removeRecentItem(text)}
											/>
										);
									}}
									ListHeaderComponent={() => (
										<View style={[Theme.styles.row_center]}>
											<Text style={[styles.subjectTitle, { flex: 1 }]}>{translate('search.recents')}</Text>
											<TouchableOpacity onPress={this.clearAllRecents}>
												<Text style={styles.clearallBtn}>{translate('search.clear_all')}</Text>
											</TouchableOpacity>
										</View>
									)}
									ListFooterComponent={() => (
										<>
											<View style={{ height: 50 }}>
												<Text style={styles.subjectTitle}>{translate('search.popular')}</Text>
											</View>
											<View style={styles.popularSearches}>
												{popularSearches.map((item, index) => (
													<PopularItem key={index} title={item} onPress={() => this.search(item)} />
												))}
											</View>
										</>
									)}
								/>
							) :
							(
								selectedRestaurant ?
									<FlatList
										style={{ flex: 1, paddingHorizontal: 20 }}
										data={restaurants}
										keyExtractor={(item) => item.id.toString()}
										renderItem={({ item, index }) => {
											return (
												<View key={item.id}>
													<VendorItem
														data={{
															...item,
															selected_order_method: OrderType_Delivery
														}}
														vendor_id={item.id}
														isFav={item.isFav}
														is_open={item.is_open}
														style={{ width: '100%', marginBottom: 12 }}
														onFavChange={this.onFavChange}
														onSelect={() => {
															this.showSimilar(item);
														}}
													/>
													{restaurants.length != (index + 1) && (
														<View style={{ width: '100%', height: 4, marginBottom: 12, backgroundColor: Theme.colors.gray6, }} />
													)}
												</View>
											);
										}}
										ListEmptyComponent={() => (
											this.state.is_loading_restaurants == false ?
												<View
													style={{
														height: windowHeight / 1.5,
														justifyContent: 'center',
														alignItems: 'center',
													}}
												>
													<View>
														<FastImage
															source={require('../../../common/assets/images/search.png')}
															style={{
																marginBottom: 30,
																width: 40,
																height: 40,
																resizeMode: 'contain',
															}}
														/>
													</View>
													<Text
														style={{
															fontSize: 17,
															color: '#7E7E7E',
															fontFamily: Theme.fonts.medium,
														}}
													>
														{translate('search.not_found_part_one')}
													</Text>
													<Text
														style={{
															color: '#25252D',
															fontSize: 17,
															fontFamily: Theme.fonts.medium,
															marginTop: 3,
														}}
													>
														{"'" + text + "'"}
													</Text>
													<Text
														style={{
															fontSize: 17,
															color: '#7E7E7E',
															fontFamily: Theme.fonts.medium,
															marginTop: 12,
														}}
													>
														{translate('search.not_found_part_two')}
													</Text>
												</View>
												: null
										)}
									/>
									:
									<FlatList
										style={{ flex: 1, paddingHorizontal: 20 }}
										data={foodItems}
										keyExtractor={(item) => item.id.toString()}
										renderItem={({ item, index }) => {
											return (
												<View style={[Theme.styles.col_center, { width: '100%' }]}>
													{
														(item.vendor != null) &&
														(index == 0 || (index > 0 && (item.vendor_id != foodItems[index - 1].vendor_id))) &&
														< VendorSearchItem
															data={{
																...item.vendor,
																selected_order_method: OrderType_Delivery
															}}
															vendor_id={item.vendor_id}
															style={{ width: '100%', marginBottom: 12 }}
															onSelect={() => {
																this.goToRestaurantDetails(item.vendor);
															}}
														/>
													}
													<VendorFoodItem
														data={item}
														food_id={item.id}
														isFav={item.isFav}
														onSelect={(data) => {
															this.props.setTmpFood(data);
															this.props.rootStackNav.navigate(RouteNames.FoodScreen);
															// this.goToRestaurantDetails(data.vendor);
														}}
														onFavChange={this.onProductFavChange}
													/>
												</View>

											);
										}}
										ListEmptyComponent={() =>
											this.state.is_loading_items == false ?
												<View
													style={{
														height: windowHeight / 1.5,
														justifyContent: 'center',
														alignItems: 'center',
													}}
												>
													<View>
														<FastImage
															source={require('../../../common/assets/images/search.png')}
															style={{
																marginBottom: 30,
																width: 40,
																height: 40,
																resizeMode: 'contain',
															}}
														/>
													</View>
													<Text
														style={{
															fontSize: 17,
															color: '#7E7E7E',
															fontFamily: Theme.fonts.medium,
														}}
													>
														{translate('search.not_found_part_one')}
													</Text>
													<Text
														style={{
															color: '#25252D',
															fontSize: 17,
															fontFamily: Theme.fonts.medium,
															marginTop: 3,
														}}
													>
														{"'" + text + "'"}
													</Text>
													<Text
														style={{
															fontSize: 17,
															color: '#7E7E7E',
															fontFamily: Theme.fonts.medium,
															marginTop: 12,
														}}
													>
														{translate('search.not_found_part_two')}
													</Text>
												</View>
												: null
										}
									/>
							)
					}
				</View>
				<View style={{ position: 'absolute', top: 50, left: 0, width: '100%', flexDirection: 'row', alignItems: 'center', }}>{this.renderSearchView()}</View>
			</View>
		);
	}
}

function mapStateToProps({ app, vendors, shop }) {
	return {
		coordinates: app.coordinates,
		favourites: vendors.favourites,
		selectedAddress: shop.selectedAddress,
	};
}

export default connect(mapStateToProps, {
	setVendorCart, setTmpFood
})(withNavigation(SearchScreen));
