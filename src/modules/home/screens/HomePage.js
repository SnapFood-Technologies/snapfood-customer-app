import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
	AppState,
	Image,
	Platform,
	ActivityIndicator,
	ScrollView,
	TouchableOpacity,
	Text,
	View,
	StyleSheet,
	RefreshControl,
	Keyboard,
	KeyboardAvoidingView,
} from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import { width, height } from 'react-native-dimension';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect, useSelector } from 'react-redux';
import apiFactory from '../../../common/services/apiFactory';
import {
	setHomeVendorFilter,
	setHomeVendorSort,
	loadInvitationTimerSetting,
	getReferralsRewardsSetting,
	getActiveVendors,
	setShowWhereHeardFeedbackModal,
	getSystemSettings,
	setShowAnnounceModal,
	setInvitationTimerSetting,
	setLocationDiffTooltip,
	setHomeScroller,
	getPromotionBanner,
	getMembershipSetting,
	updateLanguage,
	saveInterestsFromOnboard,
	getAllPromotionBanners,
} from '../../../store/actions/app';
import { getFeaturedBlocks, getVendors, getFoodCategories, toggleFavourite } from '../../../store/actions/vendors';
import { setVendorCart } from '../../../store/actions/shop';
import { extractErrorMessage, getImageFullURL, openExternalUrl } from '../../../common/services/utility';
import { translate } from '../../../common/services/translate';
import { getOpenedAppCount, getFakeBadgeAvailabilty, updateFakeBadgeLastTime } from '../../../common/services/rate';
import {
	SNAPFOOD_CITYS,
	VSort_Title,
	VSort_Closest,
	VSort_FastDelivery,
	VSort_HighRating,
	VSort_Low2HighPrice,
	VSort_PopularFirst,
} from '../../../config/constants';
import Theme from '../../../theme';
import RouteNames from '../../../routes/names';
import { OrderType_Delivery, OrderType_Pickup, OrderType_Reserve } from '../../../config/constants';
import {
	AuthInput,
	AppBadge,
	MainBtn,
	RoundIconBtn,
	ImageCarousel,
	VendorItem,
	SwitchTab,
} from '../../../common/components';
import FeatureList from '../components/FeatureList';
import Switch from '../components/Switch';
import CategItem from '../components/CategItem';
import HomeHeader from '../components/HomeHeader';
import BlockSpinner from '../../../common/components/BlockSpinner';
import NoRestaurants from '../../../common/components/restaurants/NoRestaurants';
import ContactsSettingModal from '../../../common/components/modals/ContactsSettingModal';
import CityChangeModal from '../../../common/components/modals/CityChangeModal';
import WhereHeardFeedbackModal from '../../../common/components/modals/WhereHeardFeedbackModal';
import AnnounceModal from '../../../common/components/modals/AnnounceModal';
import EarnInvitationRemindModal from '../../../common/components/modals/EarnInvitationRemindModal';
import InviteTimer from '../components/InviteTimer';
import { AutoCompleteInput } from '../../../common/components';
import { setupLocationUpdates } from '../../../common/services/location';
import PromoBannerItem from '../../../common/components/banner/PromoBannerItem';
import UnConfirmedOrderToast from '../../../common/components/order/UnConfirmedOrderToast';
import HomeWelcomeHeader from '../components/HomeWelcomeHeader';
import BannerList from '../components/BannerList';
import { useMemo } from 'react';

const expectedBlocks = [
	{ key: 'suggested', icon: 'top' },
	{ key: 'new', icon: 'new' },
	{ key: 'exclusive', icon: 'collision' },
	{ key: 'is_grocery', icon: null },
	{ key: 'free_delivery', icon: null },
	{ key: 'order_again', icon: null },
	// { key: 'all', icon: null },
];
const vertPerPage = 10;

const HomePage = (props) => {
	const total_banners = useSelector((state) => state.app.all_banners || []);
	const catsLoaded = useRef(false);
	const featureLoaded = useRef(false);
	const vendorsLoaded = useRef(false);

	const _homeScroller = useRef(null);
	const foodCategScroller = useRef(null);
	const foodCategScrollerXoffset = useRef(0);
	const foodCategID = useRef(null);
	const appState = useRef(AppState.currentState);
	const _appStateListener = useRef(null);

	const [loading, setLoading] = useState(false);

	const [curFoodCatID, setCurFoodCatID] = useState(null);

	const [foodCategories, setFoodCats] = useState([]);
	const [featuredBlocks, setFeaturedBlocks] = useState([]);
	const [allvendors, setAllVendors] = useState([]);

	const [dataLoading, setDataLoading] = useState(true);
	const [showCateg, setShowCateg] = useState(false);

	const [vertLoading, setVertLoading] = useState(false);

	const [isRefreshing, setRefreshing] = useState(false);

	const [categoryLeftArrow, setCategoryLeftArrow] = useState(false);
	const [categoryRightArrow, setCategoryRightArrow] = useState(false);

	const [vertPage, setVertPage] = useState(1);
	const [vertTotalPages, setVertTotalPages] = useState(1);

	const [headerPadding, setHeaderPadding] = useState(false);

	const _Timer = useRef(null);
	useEffect(() => {
		props.getSystemSettings();
		props.getAllPromotionBanners();
		props.getActiveVendors(props.coordinates.latitude, props.coordinates.longitude);
		_Timer.current = setInterval(() => {
			props.getActiveVendors(props.coordinates.latitude, props.coordinates.longitude);
			props.getAllPromotionBanners();
		}, 15000);

		return () => {
			if (_Timer.current) {
				clearInterval(_Timer.current);
				_Timer.current = null;
			}
		};
	}, [props.coordinates.latitude, props.coordinates.longitude]);

	useEffect(() => {
		foodCategID.current = null;
		setCurFoodCatID(null);
		loadData(true);
	}, [
		props.home_vendor_filter.vendor_type,
		props.home_vendor_filter.order_type,
		props.coordinates.latitude,
		props.coordinates.longitude,
		props.isLoggedIn,
	]);

	useEffect(() => {
		if (dataLoading == false) {
			loadVendors(1, vertPerPage, true);
		}
	}, [
		props.home_vendor_filter.is_meal,
		props.home_vendor_filter.is_dietary,
		props.home_vendor_filter.ongoing_offer,
		props.home_vendor_filter.open_now,
		props.home_vendor_filter.online_payment,
		props.home_vendor_filter.delivery_by_snapfood,
		props.home_vendor_filter.searchTerm,
		props.home_vendor_filter.low_fee,
		props.home_vendor_filter.high_fee,
		props.home_vendor_sort,
	]);

	useEffect(() => {
		if (dataLoading == false) {
			onFavChange(props.vendorData);
		}
	}, [props.vendorData.isFav]);

	useEffect(() => {
		if (_homeScroller.current) {
			props.setHomeScroller(_homeScroller.current);
		}
	}, [_homeScroller.current]);

	useEffect(() => {
		if (Platform.OS == 'ios') {
			setFakeBadge();
		}

		if (props.isLoggedIn) {
			setupLocationUpdates();
			props.getMembershipSetting();
			props.getAllPromotionBanners();
			props.setShowWhereHeardFeedbackModal(true);
			props.setShowAnnounceModal(true);
			updateLanguage();
			saveInterestsFromOnboard();
		}

		props.getReferralsRewardsSetting();
		props.loadInvitationTimerSetting();

		if (_appStateListener.current) {
			try {
				_appStateListener.current?.remove();
			} catch (error) {}
		}
		_appStateListener.current = AppState.addEventListener('change', (nextAppState) => {
			if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
				props.loadInvitationTimerSetting();
			}

			appState.current = nextAppState;
			if (appState.current == 'background') {
				props.setInvitationTimerSetting({ showTimer: false });
			}
		});

		return () => {
			_appStateListener.current?.remove();
		};
	}, [props.isLoggedIn]);

	const setFakeBadge = async () => {
		const isAvailable = await getFakeBadgeAvailabilty();
		if (props.isLoggedIn && isAvailable) {
			PushNotificationIOS.getApplicationIconBadgeNumber((badge) => {
				if (badge == 0) {
					PushNotificationIOS.setApplicationIconBadgeNumber(1);
					updateFakeBadgeLastTime();
					return;
				}
			});
		} else {
			PushNotificationIOS.setApplicationIconBadgeNumber(0);
		}
	};

	const goRootStackScreen = (name, params) => {
		if (params) {
			props.rootStackNav.navigate(name, params);
		} else {
			props.rootStackNav.navigate(name);
		}
	};
	const goTabStackScreen = (name) => {
		props.homeTabNav.navigate(name);
	};

	const getFilers = (flag) => {
		const {
			vendor_type,
			order_type,
			is_meal,
			is_dietary,
			ongoing_offer,
			open_now,
			online_payment,
			delivery_by_snapfood,
			low_fee,
			high_fee,
			searchTerm,
		} = props.home_vendor_filter;
		let filters = [];
		if (vendor_type == 'Vendors') {
			filters.push('vendor_type=Restaurant');
		} else {
			filters.push('vendor_type=Grocery');
		}
		filters.push('order_method=' + order_type);

		if (flag == 1) {
			return filters;
		}

		if (foodCategID.current != null) {
			filters.push(`food_category_ids[]=${foodCategID.current}`);
		}
		if (flag == 2) {
			return filters;
		}
		if (is_meal) {
			filters.push('is_meal=1');
		}
		if (is_dietary) {
			filters.push('is_dietary=1');
		}
		if (ongoing_offer) {
			filters.push('promotions=1');
		}
		if (open_now) {
			filters.push('open_now=1');
		}
		if (online_payment) {
			filters.push('online_payment=1');
		}
		if (delivery_by_snapfood) {
			filters.push('delivery_by_snapfood=1');
		}
		if (low_fee != null) {
			filters.push(`low_fee=${low_fee}`);
		}
		if (high_fee != null) {
			filters.push(`high_fee=${high_fee}`);
		}
		if (searchTerm != '') {
			filters.push('name=' + searchTerm);
		}
		return filters;
	};

	const getSortDir = (sort_type) => {
		if (sort_type == VSort_Title) {
			return 1;
		} else if (sort_type == VSort_FastDelivery) {
			return 1;
		} else if (sort_type == VSort_HighRating) {
			return -1;
		} else if (sort_type == VSort_Closest) {
			return 1;
		} else if (sort_type == VSort_Low2HighPrice) {
			return 1;
		} else if (sort_type == VSort_PopularFirst) {
			return -1;
		} else {
			return 1;
		}
	};

	const loadData = async (includeCatLoad = false, isHomeRefresh = false) => {
		if (isHomeRefresh) {
			setRefreshing(true);
		} else {
			setDataLoading(true);
		}

		setShowCateg(includeCatLoad == false);
		if (includeCatLoad) {
			loadCategories();
		}
		loadVendors(1, vertPerPage, true);
		loadFeaturedBlocks();
		props.getAllPromotionBanners();
	};

	const loadCategories = async () => {
		try {
			catsLoaded.current = false;
			let formattedFoodCategories = [];
			let categs_filterKeys = getFilers(1);
			let categs_response = await getFoodCategories(categs_filterKeys);
			setCategoryLeftArrow(false);
			setCategoryRightArrow(false);
			if (
				!!categs_response &&
				!!categs_response.food_categories &&
				!!categs_response.food_categories.length >= 0
			) {
				formattedFoodCategories = categs_response.food_categories.map(
					({ icon, id, search_count, title_en, title_sq, image }) => ({
						id,
						icon,
						title_en,
						title_sq,
						image,
						selected: false,
					})
				);
			}

			catsLoaded.current = true;
			setFoodCats(formattedFoodCategories);
			var foodCategeriesLenght = Math.ceil(formattedFoodCategories.length / 4);
			setCategoryRowLength(foodCategeriesLenght);
			setCurrentCategoryRow(1);
			checkDataLoading();
		} catch (error) {
			catsLoaded.current = true;
			checkDataLoading();
		}
	};

	const loadVendors = async (page, perPage, forceLoading = false) => {
		try {
			if (!vertLoading || forceLoading) {
				vendorsLoaded.current = false;
				if (forceLoading) {
					setVertLoading(true);
				}
				let { latitude, longitude } = props.coordinates;
				let filterKeys = getFilers();
				let order_dir = getSortDir(props.home_vendor_sort);

				let vendorsData = await getVendors(
					page,
					latitude,
					longitude,
					props.home_vendor_sort,
					order_dir,
					perPage,
					filterKeys
				);

				if (page > 1) {
					const currentVendorIds = allvendors.map((x) => x.id);
					const newVendors = vendorsData.data.filter((x) => currentVendorIds.indexOf(x.id) === -1);
					setVertPage(vendorsData['current_page']);
					setVertTotalPages(vendorsData['last_page']);
					setAllVendors([...allvendors, ...newVendors]);
				} else {
					setVertPage(vendorsData['current_page']);
					setVertTotalPages(vendorsData['last_page']);
					setAllVendors(vendorsData.data);
				}
				vendorsLoaded.current = true;
				setVertLoading(false);
				checkDataLoading();
				setLoading(false);
			}
		} catch (error) {
			vendorsLoaded.current = true;
			setVertLoading(false);
			checkDataLoading();
			setLoading(false);
		}
	};

	const loadFeaturedBlocks = async () => {
		try {
			featureLoaded.current = false;
			let { latitude, longitude } = props.coordinates;
			let filterKeys = getFilers(2);
			let _featuredBlocks = await props.getFeaturedBlocks(latitude, longitude, filterKeys);
			setFeaturedBlocks(_featuredBlocks || []);
			featureLoaded.current = true;
			checkDataLoading();
		} catch (error) {
			featureLoaded.current = true;
			checkDataLoading();
		}
	};

	const isEmptyData = () => {
		let featured_cnt = 0;
		expectedBlocks.map(({ key, icon }) => {
			if (featuredBlocks[key] && featuredBlocks[key].vendors) {
				featured_cnt = featured_cnt + featuredBlocks[key].vendors.length;
			}
		});
		return featured_cnt == 0 && allvendors.length == 0;
	};

	const checkDataLoading = () => {
		if (catsLoaded.current == true && featureLoaded.current == true && vendorsLoaded.current == true) {
			setDataLoading(false);
			setRefreshing(false);
		}
	};

	const goVendorDetail = (vendor) => {
		props.setVendorCart(vendor);
		goRootStackScreen(RouteNames.VendorScreen, { active_ordermethod: props.home_vendor_filter.order_type });
	};

	const onFavChange = (data) => {
		let found_all_index = allvendors.findIndex((i) => i.id == data.id);
		if (found_all_index != -1) {
			let tmp = allvendors.slice(0, allvendors.length);
			tmp[found_all_index].isFav = data.isFav;
			setAllVendors(tmp);
		}

		let _featuredBlocks = Object.assign({}, featuredBlocks);

		expectedBlocks.map(({ key, icon }) => {
			if (
				_featuredBlocks[key] != null &&
				_featuredBlocks[key].vendors != null &&
				_featuredBlocks[key].vendors.length > 0
			) {
				let found_index = _featuredBlocks[key].vendors.findIndex((i) => i.id == data.id);
				if (found_index != -1) {
					_featuredBlocks[key].vendors[found_index].isFav = data.isFav;
				}
			}
		});
		setFeaturedBlocks(_featuredBlocks);
	};

	const isCloseToLeft = ({ layoutMeasurement, contentOffset, contentSize }) => {
		return contentOffset.x >= 20;
	};
	const isCloseToRight = ({ layoutMeasurement, contentOffset, contentSize }) => {
		return layoutMeasurement.width + contentOffset.x <= contentSize.width - 20;
	};

	// const [isCategCollapsed, setCategCollapsed] = useState(true);

	const [categoryRowLength, setCategoryRowLength] = useState(0);
	const [currentCategoryRow, setCurrentCategoryRow] = useState(1);

	const _renderCategories = () => {
		if (foodCategories == null || foodCategories.length == 0) {
			return null;
		}
		return (
			<View style={[Theme.styles.col_center, { marginTop: 8 }]}>
				<View style={[Theme.styles.row_center, styles.categoryWrap]}>
					{foodCategories
						.slice(
							0,
							currentCategoryRow == 1
								? 4
								: currentCategoryRow == categoryRowLength
								? foodCategories.length
								: currentCategoryRow * 4
						)
						.map((cat, index) => (
							<View key={cat.id} style={[Theme.styles.col_center, styles.categoryItemWrap]}>
								<CategItem
									category={cat}
									cat_id={cat.id}
									isSelected={curFoodCatID == cat.id}
									onSelect={(categ) => {
										if (foodCategID.current == categ.id) {
											foodCategID.current = null;
											setCurFoodCatID(null);
										} else {
											foodCategID.current = categ.id;
											setCurFoodCatID(categ.id);
										}
										loadData(false);

										setCurrentCategoryRow(1);
										try {
											_homeScroller.current?.scrollToPosition(0, 0);
										} catch (error) {}
									}}
								/>
							</View>
						))}
				</View>
				{foodCategories.length > 4 && (
					<View style={[Theme.styles.row_center]}>
						{currentCategoryRow > 1 && (
							<TouchableOpacity
								style={{}}
								onPress={() => {
									setCurrentCategoryRow(1);
									try {
										_homeScroller.current?.scrollToPosition(0, 0);
									} catch (error) {}
								}}
							>
								<Feather name={'chevron-up'} color={Theme.colors.cyan2} size={28} />
							</TouchableOpacity>
						)}
						{currentCategoryRow > 1 && <View style={{ width: 5 }}></View>}
						{currentCategoryRow < categoryRowLength && (
							<TouchableOpacity
								style={{}}
								onPress={() => {
									if (currentCategoryRow == 1 && categoryRowLength > 3) {
										setCurrentCategoryRow(currentCategoryRow + 2);
									} else if (categoryRowLength - currentCategoryRow >= 3) {
										setCurrentCategoryRow(currentCategoryRow + 3);
									} else if (categoryRowLength - currentCategoryRow == 2) {
										setCurrentCategoryRow(currentCategoryRow + 3);
									} else {
										setCurrentCategoryRow(currentCategoryRow + 1);
									}
								}}
							>
								<Feather name={'chevron-down'} color={Theme.colors.cyan2} size={28} />
							</TouchableOpacity>
						)}
					</View>
				)}
			</View>
		);
	};

	const _renderFeatureBlocks = () => {
		const validBlocks = expectedBlocks.filter(({ key, icon }) => {
			return (
				featuredBlocks[key] != null &&
				featuredBlocks[key].block &&
				featuredBlocks[key].block['is_active'] &&
				featuredBlocks[key].vendors &&
				featuredBlocks[key].vendors.length > 0 &&
				featuredBlocks[key].block.display_count > 0
			);
		});

		return (
			<View style={{ width: '100%', marginTop: 8 }}>
				{validBlocks.length > 0 && (
					<>
						<FeatureList
							label={
								props.language == 'sq'
									? featuredBlocks[validBlocks[0].key].block.title_sq
									: featuredBlocks[validBlocks[0].key].block.title_en
							}
							items={
								validBlocks[0].key == 'order_again'
									? featuredBlocks[validBlocks[0].key].vendors.slice(
											0,
											featuredBlocks[validBlocks[0].key].block.display_count
									  )
									: featuredBlocks[validBlocks[0].key].vendors
							}
							active_vendors={props.active_vendors}
							onFavChange={onFavChange}
							isPromoBannerBeneath={true}
							goVendorDetail={(vendor) => {
								goVendorDetail(vendor);
							}}
						/>
						<BannerList
							navigation={props.navigation}
							hasDivider={validBlocks.length > 1}
							position={'featured'}
						/>
					</>
				)}
				{validBlocks.slice(1, validBlocks.length).map(({ key, icon }) => {
					return (
						<FeatureList
							key={key}
							label={
								props.language == 'sq'
									? featuredBlocks[key].block.title_sq
									: featuredBlocks[key].block.title_en
							}
							items={
								key == 'order_again'
									? featuredBlocks[key].vendors.slice(0, featuredBlocks[key].block.display_count)
									: featuredBlocks[key].vendors
							}
							active_vendors={props.active_vendors}
							onFavChange={onFavChange}
							goVendorDetail={(vendor) => {
								goVendorDetail(vendor);
							}}
						/>
					);
				})}
			</View>
		);
	};

	const _renderSearchView = () => {
		if (dataLoading != false) {
			return null;
		}
		return (
			<View style={[Theme.styles.row_center, { width: '100%', marginBottom: 20 }]}>
				<AuthInput
					placeholder={
						props.home_vendor_filter.vendor_type == 'Vendors'
							? translate('search.search_vendors')
							: translate('search.search_grocery')
					}
					underlineColorAndroid={'transparent'}
					autoCapitalize={'none'}
					returnKeyType={'done'}
					isSearch={true}
					value={props.home_vendor_filter.searchTerm}
					onChangeText={(searchTerm) => {
						props.setHomeVendorFilter({
							searchTerm: searchTerm,
						});
					}}
					style={{ flex: 1, height: 45, marginRight: 12 }}
					rightComp={
						props.home_vendor_filter.searchTerm !== '' ? (
							<TouchableOpacity
								onPress={() => {
									props.setHomeVendorFilter({
										searchTerm: '',
									});
								}}
							>
								<Entypo name={'circle-with-cross'} color={'#878E97'} size={18} />
							</TouchableOpacity>
						) : null
					}
				/>
				<RoundIconBtn
					style={{ width: 45, height: 45 }}
					icon={<MaterialIcons name='filter-list' size={26} color={Theme.colors.cyan2} />}
					onPress={() => goRootStackScreen(RouteNames.FilterScreen)}
				/>
			</View>
		);
	};

	const getSearchSuggestions = async (keyword) => {
		if (keyword != '') {
			setSearchText(keyword);
			apiFactory.get(`/search/keywords-suggestions?search=${keyword}`).then(({ data }) => {
				setSuggested(data['suggestions'] || []);
			});
		} else {
			props.setHomeVendorFilter({
				searchTerm: keyword,
			});
			setSearchText(keyword);
			setSuggested([]);
		}
	};

	const [searchtext, setSearchText] = useState('');
	const [suggested, setSuggested] = useState([]);

	const search = (text) => {
		if (text.length > 2) {
			setSearchText(text);
			props.setHomeVendorFilter({
				searchTerm: text,
			});
		} else {
			setSearchText(text);
			setSuggested([]);
		}

		Keyboard.dismiss();
	};

	const renderAutoSearchView = () => {
		if (dataLoading != false) {
			return null;
		}
		return (
			<View style={[Theme.styles.row_center, { width: '100%', height: 50, marginBottom: 6 }]}>
				<AutoCompleteInput
					placeholder={
						props.home_vendor_filter.vendor_type == 'Vendors'
							? translate('search.search_vendors')
							: translate('search.search_grocery')
					}
					underlineColorAndroid={'transparent'}
					autoCapitalize={'none'}
					returnKeyType={'done'}
					fontSize={17}
					isSearch={true}
					data={
						suggested.length == 1 && suggested[0].keyword.toLowerCase() == searchtext.toLowerCase()
							? []
							: suggested
					}
					value={searchtext}
					onChangeText={(t) => getSearchSuggestions(t)}
					onSelectedText={(text) => {
						search(text);
						setSuggested([]);
					}}
					showClearBtn={searchtext != ''}
					style={{ width: width(100) - 100, left: 0 }}
					onBlur={() => {
						search(searchtext);
						setSuggested([]);
					}}
					onSubmitEditing={() => {}}
				/>
				<RoundIconBtn
					style={{ position: 'absolute', top: 0, right: 0, width: 49, height: 49 }}
					icon={<MaterialIcons name='filter-list' size={26} color={Theme.colors.cyan2} />}
					onPress={() => goRootStackScreen(RouteNames.FilterScreen)}
				/>
			</View>
		);
	};

	const banner_pos_in_vendors = useMemo(() => {
		if (total_banners != null && total_banners.length > 0) {
			let vendor_banners = total_banners.filter((b) => b.position == 1);
			if (vendor_banners.length > 0) {
				return vendor_banners[0].position_in_vendors || 1;
			}
		}
		return -1;
	}, [total_banners]);

	const _renderVertVendors = () => {
		if (dataLoading == false && allvendors.length == 0) {
			if (props.home_vendor_filter.searchTerm == null || props.home_vendor_filter.searchTerm == '') {
				return (
					<NoRestaurants
						desc={
							props.home_vendor_filter.vendor_type == 'Vendors'
								? translate('no_restaurant_filter')
								: translate('no_grocery_filter')
						}
						style={{ marginVertical: 20, paddingBottom: 100 }}
					/>
				);
			}
			return (
				<NoRestaurants
					desc={
						props.home_vendor_filter.vendor_type == 'Vendors'
							? translate('no_restaurant_search')
							: translate('no_grocery_search')
					}
					style={{ marginVertical: 20, paddingBottom: 100 }}
				/>
			);
		}

		return (
			<View
				style={[
					Theme.styles.col_center_start,
					{ width: '100%', alignItems: 'flex-start', minHeight: height(40) },
				]}
			>
				<Text style={styles.subjectTitle}>
					{props.home_vendor_filter.vendor_type == 'Vendors'
						? translate('all_vendors')
						: translate('all_grocery')}
				</Text>
				<ScrollView style={{ width: '100%', marginTop: 16 }}>
					{(banner_pos_in_vendors < 0 ? allvendors : allvendors.slice(0, banner_pos_in_vendors)).map(
						(vendor, index) => (
							<View key={vendor.id} style={[Theme.styles.col_center, { width: '100%' }]}>
								<VendorItem
									data={vendor}
									vendor_id={vendor.id}
									isFav={vendor.isFav}
									is_open={props.active_vendors.findIndex((v) => v.id == vendor.id) != -1}
									style={{ width: '100%', marginBottom: 16, marginRight: 0 }}
									onFavChange={onFavChange}
									onSelect={() => goVendorDetail(vendor)}
								/>
								{allvendors.length != index + 1 && (
									<View
										style={{
											width: '100%',
											height: 4,
											marginBottom: 12,
											backgroundColor: Theme.colors.gray6,
										}}
									/>
								)}
							</View>
						)
					)}
					{banner_pos_in_vendors >= 0 && <BannerList navigation={props.navigation} hasDivider={true} />}
					{banner_pos_in_vendors >= 0 &&
						allvendors.slice(banner_pos_in_vendors).map((vendor, index) => (
							<View key={vendor.id} style={[Theme.styles.col_center, { width: '100%' }]}>
								<VendorItem
									data={vendor}
									vendor_id={vendor.id}
									isFav={vendor.isFav}
									is_open={props.active_vendors.findIndex((v) => v.id == vendor.id) != -1}
									style={{ width: '100%', marginBottom: 16, marginRight: 0 }}
									onFavChange={onFavChange}
									onSelect={() => goVendorDetail(vendor)}
								/>
								{allvendors.length != index + 1 && (
									<View
										style={{
											width: '100%',
											height: 4,
											marginBottom: 12,
											backgroundColor: Theme.colors.gray6,
										}}
									/>
								)}
							</View>
						))}
				</ScrollView>
			</View>
		);
	};

	const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
		return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
	};

	const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
		return contentOffset.y == 0;
	};

	const isLeaveFromTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
		return contentOffset.y > 15;
	};

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			{props.isLoggedIn && (
				<HomeWelcomeHeader
					onGoProfile={() => {
						goTabStackScreen(RouteNames.ProfileStack);
					}}
				/>
			)}
			<KeyboardAwareScrollView
				ref={_homeScroller}
				keyboardShouldPersistTaps='handled'
				style={{ ...styles.scrollview, marginTop: headerPadding == true ? 8 : 0 }}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={() => {
							props.getActiveVendors(props.coordinates.latitude, props.coordinates.longitude);
							loadData(true, true);
						}}
					/>
				}
				onScroll={async ({ nativeEvent }) => {
					if (isCloseToTop(nativeEvent)) {
						await loadVendors(1, vertPerPage);
						if (headerPadding == true) {
							setHeaderPadding(false);
						}
					}
					if (isCloseToBottom(nativeEvent)) {
						if (vertPage < vertTotalPages) {
							if (!loading) {
								setLoading(true);
								await loadVendors(vertPage + 1, vertPerPage);
							}
						}
					}
					if (isLeaveFromTop(nativeEvent)) {
						if (headerPadding == false) {
							setHeaderPadding(true);
						}
					}
				}}
				extraHeight={50}
			>
				<HomeHeader
					language={props.language}
					curTab={props.home_vendor_filter.vendor_type}
					coordinates={props.coordinates}
					isLoggedIn={props.isLoggedIn}
					cashback_amount={props.user.cashback_amount}
					photo={props.user.photo}
					locationTooltipMsg={props.home_diff_location_tooltip}
					onClearLocationTooltip={() => props.setLocationDiffTooltip(null)}
					onLocationSetup={(coordinates) => {
						goRootStackScreen(RouteNames.LocationSetupScreen, { from_home: true, coords: coordinates });
					}}
					onGoWallet={() => {
						goRootStackScreen(RouteNames.WalletScreen);
					}}
					onGoProfile={() => {
						goTabStackScreen(RouteNames.ProfileStack);
					}}
					onTabChange={(item) => {
						props.setHomeVendorFilter({
							order_type: OrderType_Delivery,
						});
						setTimeout(() => {
							props.setHomeVendorFilter({
								vendor_type: item,
							});
						}, 200);
					}}
				/>
				<View style={[Theme.styles.row_center, styles.operationTab]}>
					<SwitchTab
						curitem={props.home_vendor_filter.order_type}
						items={
							props.home_vendor_filter.vendor_type == 'Vendors'
								? [OrderType_Delivery, OrderType_Pickup, OrderType_Reserve]
								: [OrderType_Delivery, OrderType_Pickup]
						}
						onSelect={(item) => {
							setTimeout(() => {
								props.setHomeVendorFilter({
									order_type: item,
								});
							}, 200);
						}}
						style={{ width: '100%' }}
						activetxt_style={
							props.language == 'en' ? { fontSize: 19, lineHeight: 20 } : { fontSize: 19, lineHeight: 20 }
						}
						inactivetxt_style={
							props.language == 'en' ? { fontSize: 19, lineHeight: 20 } : { fontSize: 19, lineHeight: 20 }
						}
					/>
				</View>
				{dataLoading != false ? (
					<View
						style={{
							height: height(100) - (props.isLoggedIn ? 300 : 260),
							width: '100%',
							backgroundColor: Theme.colors.white,
						}}
					>
						<BlockSpinner />
					</View>
				) : (
					<>
						{_renderCategories()}
						{isEmptyData() == true ? (
							<NoRestaurants
								desc={
									props.home_vendor_filter.vendor_type == 'Vendors'
										? translate('no_restaurant_search')
										: translate('no_grocery_search')
								}
								style={{ marginVertical: 20, paddingBottom: 100 }}
							/>
						) : (
							<>
								{_renderFeatureBlocks()}
								{/* {_renderSearchView()} */}
								<View style={{ width: '100%' }}>
									<View style={{ height: 68 }} />
									{!isRefreshing && vertLoading ? (
										<BlockSpinner style={{ minHeight: 80, paddingBottom: 260 }} />
									) : (
										_renderVertVendors()
									)}
									{vertLoading == false && vertPage < vertTotalPages && (
										<ActivityIndicator
											size='small'
											color={Theme.colors.cyan2}
											style={{ paddingVertical: 10 }}
										/>
									)}

									<View
										style={{
											position: 'absolute',
											left: 0,
											top: 0,
											width: width(100) - 40,
											flexDirection: 'row',
											alignItems: 'center',
										}}
									>
										{renderAutoSearchView()}
									</View>
								</View>
							</>
						)}
					</>
				)}
			</KeyboardAwareScrollView>
			{props.show_change_city_modal != true && <ContactsSettingModal />}
			{props.show_change_city_modal != true && <WhereHeardFeedbackModal />}
			{props.show_change_city_modal != true && <AnnounceModal />}
			{props.show_change_city_modal != true &&
				props.referralsRewardsSetting.show_earn_invitation_module == true &&
				props.invitationTimerSetting.can_invite == true && (
					<EarnInvitationRemindModal navigation={props.navigation} />
				)}
			<CityChangeModal />
			{props.referralsRewardsSetting.show_earn_invitation_module == true &&
				props.invitationTimerSetting.showTimer == true && <InviteTimer style={styles.timer} />}
			<UnConfirmedOrderToast navigation={props.navigation} />
		</View>
	);
};

const styles = StyleSheet.create({
	operationTab: {
		height: 62,
		width: '100%',
		marginTop: 14,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: '#F6F6F9',
	},
	subjectTitle: { fontSize: 22, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	divider: { width: '100%', height: 1, backgroundColor: '#F6F6F9' },
	scrollview: { flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: Theme.colors.white },
	scrollviewHider: { width: '100%', marginTop: -12, height: 15, backgroundColor: Theme.colors.white },
	modalContent: {
		width: '100%',
		paddingVertical: 40,
		paddingHorizontal: 20,
		backgroundColor: Theme.colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	modalBtnTxt: { fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	modalCityContent: {
		width: '100%',
		height: height(90),
		paddingVertical: 35,
		backgroundColor: Theme.colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	modalQContent: {
		width: '100%',
		paddingBottom: 35,
		paddingTop: 20,
		paddingHorizontal: 20,
		backgroundColor: Theme.colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	timer: { position: 'absolute', bottom: 0, left: 20 },
	leftArrowView: {
		position: 'absolute',
		left: 0,
		top: 0,
		zIndex: 10,
		borderTopRightRadius: 15,
		borderBottomRightRadius: 15,
		height: '100%',
		paddingHorizontal: 4,
	},
	rightArrowView: {
		position: 'absolute',
		right: 0,
		top: 0,
		borderTopRightRadius: 15,
		borderBottomRightRadius: 15,
		height: '100%',
		paddingHorizontal: 4,
	},
	arrow: { width: 32, height: 32, borderRadius: 18, backgroundColor: '#50b7ed' },
	categoryWrap: { width: width(100) - 26, flexWrap: 'wrap', justifyContent: 'flex-start' },
	categoryItemWrap: { width: '25%', padding: 7 },
});

const mapStateToProps = ({ app, shop }) => ({
	user: app.user || {},
	isLoggedIn: app.isLoggedIn,
	coordinates: app.coordinates,
	address: app.address || {},
	language: app.language,
	home_vendor_filter: app.home_vendor_filter,
	home_vendor_sort: app.home_vendor_sort,
	referralsRewardsSetting: app.referralsRewardsSetting || {},
	invitationTimerSetting: app.invitationTimerSetting || {},
	vendorData: shop.vendorData,
	show_change_city_modal: app.show_change_city_modal,
	active_vendors: app.active_vendors || [],
	show_announce_modal: app.show_announce_modal,
	home_diff_location_tooltip: app.home_diff_location_tooltip,
	banner_promotion: app.banner_promotion,
	student_banner_promotion: app.student_banner_promotion,
});

export default connect(mapStateToProps, {
	setHomeVendorFilter,
	setHomeVendorSort,
	setVendorCart,
	getFeaturedBlocks,
	toggleFavourite,
	loadInvitationTimerSetting,
	getReferralsRewardsSetting,
	getActiveVendors,
	setShowWhereHeardFeedbackModal,
	getSystemSettings,
	setShowAnnounceModal,
	setInvitationTimerSetting,
	setLocationDiffTooltip,
	setHomeScroller,
	getPromotionBanner,
	getMembershipSetting,
	getAllPromotionBanners,
})(HomePage);
