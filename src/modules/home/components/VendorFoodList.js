import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { setTmpFood } from '../../../store/actions/app';
import { toggleFavourite } from '../../../store/actions/vendors';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import Theme from '../../../theme';
import { VendorFoodItem } from '../../../common/components';
import RouteNames from '../../../routes/names';
import GroceryFoodItem from '../components/GroceryFoodItem';
import {
	setVendorCart,
	AddProduct2Cart,
	AddProductVendorCheck,
	removeProductFromCart,
	updateCartItems,
} from '../../../store/actions/shop';
import { checkVendorOpen } from '../../../store/actions/vendors';
import { OrderType_Delivery } from '../../../config/constants';

const VISIBLE_PRODUCT_CNT = 6;
const getVisibleCategoryIndex = (categories) => {
	if (categories == null || categories.length == 0) {
		console.log('getVisibleCategoryIndex called : ', 0);
		return 0;
	}

	let found_index = -1;
	let products_cnt = 0;
	categories.forEach((cat, index) => {
		if (cat.products != null) {
			products_cnt = products_cnt + cat.products.length;
		}
		if (found_index == -1 && products_cnt > VISIBLE_PRODUCT_CNT) {
			found_index = index;
		}
	});
	if (found_index != -1) {
		console.log('getVisibleCategoryIndex called : ', found_index + 1);
		return found_index + 1;
	}
	console.log('getVisibleCategoryIndex called : ', 'categories.length');
	return categories.length;
};

const VendorFoodList = (props) => {
	const { vendorData, handover_method, navigation, scrollChanged, onChangeDimensions } = props;
	const [productsListDimensions, setProductsListDimensions] = useState([]);

	useEffect(() => {
		console.log('tmpFoodData.isFav');
		onProductFavChange(props.tmpFoodData);
	}, [props.tmpFoodData.isFav]);

	const goFoodDetail = (food_data) => {
		props.setTmpFood(food_data);
		navigation.navigate(RouteNames.FoodScreen);
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
				console.log('Add Product VendorCheck err ', err)
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
	};

	const onRmvCart = async (product) => {
		try {
			await props.removeProductFromCart(product);
		} catch (error) {
			console.log('onRemoveItem', error);
		}
	};

	const _renderVertFoods = (curCat) => {
		return props.vendorData.vendor_type == 'Restaurant' ? (
			<View style={[Theme.styles.col_center_start, styles.foodList]}>
				{curCat.products != null &&
					curCat.products.length != null &&
					curCat.products
						.slice(0, scrollChanged == true ? curCat.products.length : VISIBLE_PRODUCT_CNT)
						.map((item, index) => (
							<VendorFoodItem
								key={item.id}
								cartEnabled={true}
								diabled={props.vendorData.is_open != 1 &&
									(
										(props.vendorData.can_schedule != 1)
										||
										(
											props.vendorData.can_schedule == 1 &&
											handover_method != OrderType_Delivery
										)
									)
								}
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
						curCat.products
							.slice(0, scrollChanged == true ? curCat.products.length : VISIBLE_PRODUCT_CNT)
							.map((item, index) => (
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
										diabled={props.vendorData.is_open != 1 &&
											(
												(props.vendorData.can_schedule != 1)
												||
												(
													props.vendorData.can_schedule == 1 &&
													handover_method != OrderType_Delivery
												)
											)
										}
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
				onLayout={(event) => {
					const { y } = event.nativeEvent.layout;
					const newPrdouctsListDimensions = [...productsListDimensions];
					newPrdouctsListDimensions[index] = { index, y };
					setProductsListDimensions(newPrdouctsListDimensions);
					onChangeDimensions(newPrdouctsListDimensions);
				}}
			>
				<View style={styles.foodCategoryContainer}>
					<Text style={styles.foodCategory}>{item.title}</Text>
				</View>
			</View>
		);
	};

	const getCartCnt = (food_data) => {
		let cnt = 0;
		let items = props.cartItems.filter((i) => i.id == food_data.id);
		for (let i = 0; i < items.length; i++) {
			cnt = cnt + items[i].quantity;
		}
		return cnt;
	};

	if (vendorData == null || vendorData.categories == null) {
		return null;
	}

	console.log('food list ');
	return (
		<View style={{ backgroundColor: Theme.colors.white }}>
			{vendorData.categories
				.slice(
					0,
					scrollChanged == true
						? vendorData.categories.length
						: getVisibleCategoryIndex(vendorData.categories)
				)
				.map((category, index) => {
					return (
						<React.Fragment key={category.id}>
							{renderMenuCategory(category, index)}
							{_renderVertFoods(category)}
						</React.Fragment>
					);
				})}
		</View>
	);
};

const styles = StyleSheet.create({
	divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9 },
	foodList: { width: '100%', paddingHorizontal: 18, backgroundColor: Theme.colors.white, alignItems: 'flex-start' },

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
})(VendorFoodList);
