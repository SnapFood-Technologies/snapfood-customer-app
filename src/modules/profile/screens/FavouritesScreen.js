import React, { useEffect, useState, useRef } from 'react';
import { Image, ActivityIndicator, ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';
import { height } from 'react-native-dimension';
import { connect } from 'react-redux'
import { setTmpFood, } from '../../../store/actions/app';
import { setVendorCart } from '../../../store/actions/shop';
import { getVendorFavourites, getProductFavourites, getVendorDetail } from '../../../store/actions/vendors';
import { extractErrorMessage, openExternalUrl } from '../../../common/services/utility';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts'
import Theme from '../../../theme';
import SwitchTab from '../../../common/components/SwitchTab';
import Header1 from '../../../common/components/Header1';
import RouteNames from '../../../routes/names';
import VendorItem from '../../../common/components/vendors/VendorItem';
import VendorFoodItem from '../../../common/components/vendors/VendorFoodItem';
import NoFavs from '../components/NoFavs';
import { OrderType_Delivery } from '../../../config/constants';

const FavouritesScreen = (props) => {
	const _isMounted = useRef(true);

	const [opType, setOpType] = useState('favorite.Vendors')
	const [vendors, setVendors] = useState([])
	const [items, setItems] = useState([])

	const [vendorLoading, setVendorLoading] = useState(null)
	const [itemsLoading, setItemsLoading] = useState(null)

	useEffect(() => {
		const focusListener = props.navigation.addListener('focus', () => {
			loadVendorFavorites()
			loadProductFavorites()
		});

		return () => {
			focusListener();
			_isMounted.current = false;
		}
	}, [])



	const loadVendorFavorites = () => {
		let { latitude, longitude } = props.coordinates;
		setVendorLoading(true)
		props.getVendorFavourites(latitude, longitude).then(data => {
			if (_isMounted.current == true) {
				setVendors(data)
				setVendorLoading(false)
			}
		})
			.catch(error => {
				if (_isMounted.current == true) {
					setVendorLoading(false)
					
				}
			})
	};

	const loadProductFavorites = () => {
		setItemsLoading(true)
		props.getProductFavourites().then(data => {
			if (_isMounted.current == true) {
				setItems(data)
				setItemsLoading(false)
			}
		})
			.catch(error => {
				if (_isMounted.current == true) {
					setItemsLoading(false)
					
				}
			})
	};

	const deleteFavorite = () => {
		loadVendorFavorites()
	};
	const deleteProductFavorite = () => {
		loadProductFavorites()
	};

	const goStackScreen = (name, params) => {
		if (params) {
			props.navigation.navigate(name, params)
		}
		else {
			props.navigation.navigate(name)
		}
	}

	const goProductVendor = (product) => {
		if (product.vendor_id == null) { return; }
		let { latitude, longitude } = props.coordinates;

		getVendorDetail(product.vendor_id, latitude, longitude).then((data) => {
			props.setVendorCart(data)
			goStackScreen(RouteNames.VendorScreen)
		})
			.catch(error => {
				if (_isMounted.current == true) {
					
					alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(error));
				}
			})
	}

	const _renderOperationTabs = () => {
		return <View style={[Theme.styles.row_center, styles.operationTab]}>
			<SwitchTab
				items={['favorite.Vendors', 'favorite.Items']}
				curitem={opType}
				style={{ width: '100%', paddingLeft: 0, paddingRight: 0 }}
				onSelect={(item) => setOpType(item)}
			/>
		</View>
	}

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			<Header1
				style={{ marginTop: 10, marginBottom: 10, paddingHorizontal: 20 }}
				onLeft={() => { props.navigation.goBack() }}
				title={translate('account.preferred')}
			/>
			<View style={{ width: '100%', paddingHorizontal: 20, }}>
				{_renderOperationTabs()}
			</View>
			<Swiper
				onIndexChanged={(index) => { }}
				scrollEnabled={false}
				loop={false}
				index={opType == 'favorite.Vendors' ? 0 : 1}
				showsPagination={false}
				style={{ height: height(100) - 150, }}
			>
				<ScrollView style={styles.scrollview}>
					<View style={{ height: 20, }} />
					{
						((vendorLoading == false) && (opType == 'favorite.Vendors' && vendors.length == 0)) ?
							<NoFavs isVendor={opType == 'favorite.Vendors'} style={{ marginTop: 40 }} />
							:
							vendors.map((vendor, index) =>
							<View key={vendor.id}>
									<VendorItem
										key={index}
										data={{
											...vendor,
											selected_order_method: OrderType_Delivery
										}}
										vendor_id={vendor.id}
										isFav={vendor.isFav}
										is_open={vendor.is_open}
										style={{ width: '100%', marginBottom: 12, }}
										onFavChange={deleteFavorite}
										onSelect={() => {
											props.setVendorCart(vendor)
											goStackScreen(RouteNames.VendorScreen)
										}}
									/>
									{vendors.length != (index + 1) && (
										<View style={{width:'100%', height: 4, marginBottom: 12, backgroundColor: Theme.colors.gray6, }}/>
									)}
                        	</View>
							)
					}
					<View style={{ height: 40, }} />
				</ScrollView>
				<ScrollView style={styles.scrollview}>
					<View style={{ height: 20, }} />
					{
						(itemsLoading == false) && (opType == 'favorite.Items' && items.length == 0) ?
							<NoFavs isVendor={opType == 'favorite.Vendors'} style={{ marginTop: 40 }} /> :
							items.map((item, index) =>
								<VendorFoodItem
									key={index}
									data={item}
									isFav={item.isFav}
									food_id={item.id}
									onSelect={(data) => {
										props.setTmpFood(data);
										goStackScreen(RouteNames.FoodScreen)
									}}
									onFavChange={deleteProductFavorite}
								/>
							)
					}
					<View style={{ height: 40, }} />
				</ScrollView>
			</Swiper>
		</View>
	);
}

const styles = StyleSheet.create({
	searchView: { width: '100%', paddingHorizontal: 20, marginTop: 48, },
	operationTab: { height: 62, width: '100%', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F6F6F9' },
	subjectTitle: { fontSize: 17, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	divider: { width: '100%', height: 1, backgroundColor: '#F6F6F9' },
	scrollview: { flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: Theme.colors.white },
	categList: { marginTop: 16, },
	scrollviewHider: { width: '100%', marginTop: -12, height: 15, backgroundColor: Theme.colors.white },

})


const mapStateToProps = ({ app }) => ({
	isLoggedIn: app.isLoggedIn,
	coordinates: app.coordinates,
});

export default connect(mapStateToProps, {
	getVendorFavourites, getProductFavourites, setTmpFood, setVendorCart,
})(FavouritesScreen);