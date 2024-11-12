import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { setTmpFood } from '../../../store/actions/app';
import { toggleFavourite } from '../../../store/actions/vendors';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import Theme from '../../../theme';
import { VendorFoodItem } from '../../../common/components';
import RouteNames from '../../../routes/names';
import {
	setVendorCart,
	AddProduct2Cart,
	AddProductVendorCheck,
	removeProductFromCart,
	updateCartItems,
} from '../../../store/actions/shop';
import { height } from 'react-native-dimension';
import { ScrollView } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import { checkVendorOpen } from '../../../store/actions/vendors';

const VendorSearchFoodList = (props) => {
	const { vendorData, navigation, searchTerm, onClose } = props;
	const [productsListDimensions, setProductsListDimensions] = useState([]);
	const [filteredItems, setFilteredItems] = useState([]);

	useEffect(() => {
		onProductFavChange(props.tmpFoodData);
	}, [props.tmpFoodData.isFav]);

	useEffect(() => {
		onSearchTermChanged(searchTerm);
	}, [searchTerm]);

	const goFoodDetail = (food_data) => {
		props.setTmpFood(food_data);
		navigation.navigate(RouteNames.FoodScreen);
		onClose.call();
	};

	const onProductFavChange = (data) => {
		const { categories } = vendorData;
		if (categories && categories.length && categories.length > 0) {
			let tmp = categories.slice(0, categories.length);
			let cat_index = tmp.findIndex((i) => i.id == data.category_id);
			if (cat_index != -1) {
				if (tmp[cat_index].products && tmp[cat_index].products.length && tmp[cat_index].products.length > 0) {
					let product_index = tmp[cat_index].products.findIndex((i) => i.id == data.id);
					if (product_index != -1) {
						tmp[cat_index].products[product_index].isFav = data.isFav;

						props.setVendorCart({ ...vendorData, categories: tmp });
					}
				}
			}
		}
	};

	const onSearchTermChanged = (search) => {
		search = search.toLowerCase();
		const filteredVendors = [];
		if (vendorData != null || vendorData.categories != null) {
			if (search != '' && search.length >= 3) {
				vendorData.categories.map((curCat, index) => {
					if (curCat.products != null && curCat.products.length != null && curCat.products) {
						let curCategory = { title: curCat.title, products: [] };
						let filtereredProducts = [];
						curCat.products.map((product, productIndex) => {
							if (product.title.toLowerCase().includes(search)) {
								filtereredProducts.push(product);
							}
						});
						if (filtereredProducts.length > 0) {
							curCategory.products = filtereredProducts;
							filteredVendors.push(curCategory);
						}
					}
				});
				setFilteredItems(filteredVendors);
			} else {
				setFilteredItems([]);
			}
		} else {
			setFilteredItems([]);
		}
	};

	const onPressAddCart = (product) => {
		props.AddProductVendorCheck(product).then(({ available, vendor_id }) => {
			
			if (available) {
				onAddCart(product);
			}
			else {
				props.checkVendorOpen(vendor_id)
					.then((is_open) => {
						if (is_open == true) {
							alerts
								.confirmation(
									translate('restaurant_details.new_order_question'),
									translate('restaurant_details.new_order_text'),
									translate('confirm'),
									translate('cancel')
								)
								.then(async () => {
									resetCart(product);
								});
						}
						else {
							resetCart(product);
						}
					})
					.catch((err) => {
						resetCart(product);
					})
			}
		})
			.catch(err => {
				
			});
	};

	const resetCart = async (product) => {
		let cartItem = product;
		cartItem.quantity = 1;
		cartItem.comments = '';
		cartItem.options = [];

		await props.updateCartItems([cartItem]);
	}


	const onAddCart = (product) => {
		let foundIndex = props.cartItems.findIndex((i) => i.id == product.id);
		if (foundIndex == -1) {
			let cartItem = { ...product };
			cartItem.quantity = 1;
			cartItem.comments = '';
			cartItem.options = [];

			props.AddProduct2Cart(cartItem);
		} else {
			let cartItem = props.cartItems[foundIndex];
			cartItem.quantity = cartItem.quantity + 1;

			props.AddProduct2Cart(cartItem);
		}
		onClose.call();
	};

	const onRmvCart = async (product) => {
		try {
			await props.removeProductFromCart(product);
		} catch (error) {
			
		}
	};

	const _renderVertFoods = (curCat) => {
		return props.vendorData.vendor_type == 'Restaurant' ? (
			<View style={[Theme.styles.col_center_start, styles.foodList]}>
				{curCat.products != null &&
					curCat.products.length != null &&
					curCat.products.map((item, index) => (
						<VendorFoodItem
							key={item.id}
							cartEnabled={true}
							diabled={props.vendorData.is_open != 1}
							data={item}
							food_id={item.id}
							isFav={item.isFav}
							cartCnt={getCartCnt(item)}
							onFavChange={onProductFavChange}
							onSelect={goFoodDetail}
						/>
					))}
			</View>
		) : (
			<View style={[Theme.styles.col_center_start, styles.foodList]}>
				<View style={[Theme.styles.row_center_start, { width: '100%', flexWrap: 'wrap' }]}>
					{curCat.products != null &&
						curCat.products.length != null &&
						curCat.products.map((item, index) => (
							<View
								key={index}
								style={{
									width: '50%',
									marginBottom: 12,
									paddingLeft: index % 2 == 1 ? 10 : 0,
									paddingRight: index % 2 == 1 ? 0 : 10,
								}}
							>
								<GroceryFoodItem
									style={{ width: '100%' }}
									diabled={props.vendorData.is_open != 1}
									data={item}
									food_id={item.id}
									title_lines={1}
									isFav={item.isFav}
									cartCnt={getCartCnt(item)}
									onAddCart={onPressAddCart}
									onRmvCart={onRmvCart}
									onFavChange={onProductFavChange}
									onSelect={goFoodDetail}
								/>
							</View>
						))}
				</View>
			</View>
		);
	};

	const renderMenuCategory = (item, index) => {
		return (
			<View
				key={'searchMenuCategory_'+ index}
				// onLayout={(event) => {
				// 	const { y } = event.nativeEvent.layout;
				// 	const newPrdouctsListDimensions = [...productsListDimensions];
				// 	newPrdouctsListDimensions[index] = { index, y };
				// 	setProductsListDimensions(newPrdouctsListDimensions);
				// }}
			>
				<View style={styles.foodCategoryContainer}>
					<Text style={styles.foodCategory}>{item.title}</Text>
				</View>
			</View>
		);
	};

	const getCartCnt = (food_data) => {
		let foundIndex = props.cartItems.findIndex((i) => i.id == food_data.id);
		if (foundIndex != -1) {
			return props.cartItems[foundIndex].quantity;
		}
		return 0;
	};

	const _renderNoItems = () => {
		return (
			<View
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					paddingHorizontal: 18,
					height: '50%',
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
						fontSize: 16,
						color: '#7E7E7E',
						fontFamily: Theme.fonts.medium,
					}}
				>
					{translate('search.not_found_part_one')}
				</Text>
				<Text
					style={{
						color: '#25252D',
						fontSize: 16,
						fontFamily: Theme.fonts.medium,
						marginTop: 3,
					}}
				>
					{"'" + searchTerm + "'"}
				</Text>
				<Text
					style={{
						fontSize: 16,
						color: '#7E7E7E',
						fontFamily: Theme.fonts.medium,
						marginTop: 12,
					}}
				>
					{translate('search.not_found_part_two')}
				</Text>
			</View>
		);
	};

	if (vendorData == null || vendorData.categories == null) {
		return null;
	}

	if (searchTerm.length >= 3 && filteredItems.length === 0) return _renderNoItems();
	return (
		<View style={{ backgroundColor: Theme.colors.white, height: filteredItems.length > 0 ? height(100) : 0 }}>
			<View style={{ height: 15 }}></View>
			<ScrollView style={{ flex: 1 }}>
				{filteredItems.map((category, index) => {
					return (
						<React.Fragment key={category.id}>
							{renderMenuCategory(category, index)}
							{_renderVertFoods(category)}
							<View style={{height: 10}}></View>
						</React.Fragment>
					);
				})}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9 },
	foodList: {
		flex: 1,
		paddingHorizontal: 18,
		backgroundColor: Theme.colors.white,
		alignItems: 'flex-start',
		// paddingBottom: 50,
	},

	foodCategoryContainer: {
		paddingHorizontal: 20,
		width: '100%',
		height: 42,
		justifyContent: 'flex-end',
		paddingBottom: 12,
	},
	foodCategory: { fontSize: 21, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
});

const mapStateToProps = ({ app, shop }) => ({
	tmpFoodData: app.tmpFoodData,
	vendorData: shop.vendorData,
	isLoggedIn: app.isLoggedIn,
	cartItems: shop.items,
});

export default connect(mapStateToProps, {
	setVendorCart,
	toggleFavourite,
	setTmpFood,
	AddProduct2Cart,
	AddProductVendorCheck,
	updateCartItems,
	removeProductFromCart,
	checkVendorOpen
})(VendorSearchFoodList);
