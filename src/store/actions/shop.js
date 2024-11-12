import { APP } from '../types';
import { KEYS, setStorageKey } from '../../common/services/storage';
import apiFactory from '../../common/services/apiFactory';
import { translate } from '../../common/services/translate';
import { compareProductItems } from '../../common/services/utility';

const syncCartItems=(cartData)=>{
	return new Promise(async (resolve, reject) => {
		apiFactory.post('products/sync-cart', cartData).then(
			async ({ data }) => {
				resolve();
			},
			(e) => {
				resolve();
			}
		);
	});
}

export const AddProduct2Cart = (cartItem) => async (dispatch, getState) => {
	return new Promise(async (resolve, reject) => {
		try {
			let items = getState().shop.items.slice(0, getState().shop.items.length);

			let foundIndex = items.findIndex(p => compareProductItems(p, cartItem) == true);
			if (foundIndex == -1) {
				items.push(cartItem)
			}
			else {
				items[foundIndex].quantity = cartItem.quantity;
				items[foundIndex].comments = cartItem.comments;
				items[foundIndex].options = cartItem.options;
			}

			await setStorageKey(KEYS.CART_ITEMS, items);
			await dispatch({
				type: APP.UPDATE_CART_ITEMS,
				payload: items,
			});
			syncCartItems({
				products: items.map(i => i.id),
				vendor_id: items[0].vendor_id
			});
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};


export const AddProductVendorCheck = (cartItem) => async (dispatch, getState) => {
	return new Promise(async (resolve, reject) => {
		try {
			let items = getState().shop.items.slice(0, getState().shop.items.length);
			let foundIndex = items.findIndex((i) => i.vendor_id != getState().shop.vendorData.id);

			if (foundIndex == -1) {
				resolve({ available: true });
			}
			else {
				resolve({ available: false, vendor_id: (items.length > 0 ? items[0].vendor_id : null) });
			}

		} catch (e) {
			reject(e);
		}
	});
};

export const removeProductFromCart = (cartItem, isAll = false) => async (dispatch, getState) => {
	return new Promise(async (resolve, reject) => {
		try {
			let items = getState().shop.items.slice(0, getState().shop.items.length);
			if (isAll == true) {
				items = items.filter(i => i.id != cartItem.id);
			}
			else {
				let foundIndex = items.findIndex((i) => i.id == cartItem.id);
				if (foundIndex != -1) {
					if (items[foundIndex].quantity <= 1) {
						items = items.filter(i => i.id != cartItem.id);
					}
					else {
						items[foundIndex].quantity = items[foundIndex].quantity - 1;
					}
				}
			}

			await setStorageKey(KEYS.CART_ITEMS, items);
			await dispatch({
				type: APP.UPDATE_CART_ITEMS,
				payload: items,
			});
			syncCartItems({
				products: items.map(i => i.id),
				vendor_id: items.length > 0 ?  items[0].vendor_id : null
			});
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};

export const updateCartItems = (items, sync = true) => async (dispatch) => {
	return new Promise(async (resolve, reject) => {
		try {
			await setStorageKey(KEYS.CART_ITEMS, items);
			await dispatch({
				type: APP.UPDATE_CART_ITEMS,
				payload: items,
			});
			if (sync) {
				syncCartItems({
					products: items.map(i => i.id),
					vendor_id: items.length > 0 ?  items[0].vendor_id : null
				});
			}
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};

export const setCutleryCart = (cutlery) => {
	return { type: APP.SET_CUTLERY_CART, payload: cutlery }
}
export const setCommentCart = (comments) => {
	return { type: APP.SET_COMMENT_CART, payload: comments }
}
export const setCouponCart = (coupon) => {
	return { type: APP.SET_COUPON_CART, payload: coupon }
}
export const setPriceCart = (prices) => {
	return { type: APP.SET_PRICE_CART, payload: prices }
}

export const setDeliveryInfoCart = (payload) => {
	return { type: APP.SET_DELIVERY_INFO_CART, payload: payload }
}

export const setPaymentInfoCart = (payload) => {
	return { type: APP.SET_PAYMENT_INFO_CART, payload: payload }
}

export const setVendorCart = (payload) => {
	return { type: APP.SET_VENDOR_CART, payload: payload }
}

export const updateCart = (items, restaurant) => async (dispatch) => {
	return new Promise(async (resolve, reject) => {
		try {
			await setStorageKey(KEYS.CART_ITEMS, items);
			await setStorageKey(KEYS.CART_RESTAURANT, restaurant);
			await dispatch({
				type: APP.UPDATE_CART,
				payload: items,
				restaurant,
			});
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};


export const setStoreAddress = (address) => async (dispatch) => {
	dispatch({
		type: APP.SET_ADDRESS,
		payload: address,
	});
};


export const clearCart = (items) => async (dispatch) => {
	return new Promise(async (resolve, reject) => {
		try {
			await setStorageKey(KEYS.CART_ITEMS, items);
			await dispatch({
				type: APP.CLEAR_CART,
				payload: items
			});
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};

export const sendOrder = (orderData) => (dispatch) => {
	return new Promise(async (resolve, reject) => {
		apiFactory.post('checkout', orderData).then(
			async ({ data }) => {
				try {
					resolve(data.order);
				} catch (e) {
					reject(e);
				}
			},
			(e) => {
				reject(e);
			}
		);
	});
};

export const reOrder = (order, restaurant) => (dispatch, getState) => {
	return new Promise(async (resolve, reject) => {
		apiFactory.get(`orders/${order.id}/reorder`).then(
			async ({ data }) => {
				let cart_items = [];
				const cartProducts = order.products || [];
				for (let i = 0; i < cartProducts.length; i++) {
					let index = data.products.findIndex((p) => p.id === cartProducts[i].product_id);
					if (index != -1) {
						let productItem = data.products[index];

						let options = (cartProducts[i].product_options || []).map(o => ({
							id : o.product_option_id,
							title : o.title,
							price : o.price,
							type : o.type,
							available : o.available,
							product_id: productItem.id,
							created_at : o.created_at,
							updated_at : o.updated_at,
						}));

						
						cart_items.push({
							...productItem,
							quantity : cartProducts[i].quantity,
							options: options,
							comments: cartProducts[i].item_instructions || ''
						})
					}
				}

				await setStorageKey(KEYS.CART_ITEMS, cart_items);
				await dispatch({
					type: APP.CLEAR_CART,
					payload: cart_items
				});
				if (getState().shop.vendorData == null || getState().shop.vendorData.id != restaurant.id) {
					await dispatch({ type: APP.SET_VENDOR_CART, payload: restaurant })
				}
				resolve(cart_items);
			},
			(error) => reject(error)
		);
	});
};

export const getDiscount = (vendorId, order_by, total) => (dispatch) => {
	return new Promise((resolve, reject) => {
		let endpoint = `discounts?vendor_id=${vendorId}`
		if (total) {
			endpoint = endpoint + `&subtotal=${total}`
		}
		if (order_by) {
			endpoint = endpoint + `&order_by=${order_by}`
		}
		apiFactory.get(endpoint).then(
			({ data }) => {
				resolve(data);
			},
			(err) => {
				reject(err);
			}
		);
	});
};

export const setCouponCode = (code) => async (dispatch) => {
	return new Promise(async (resolve, reject) => {
		try {
			await setStorageKey(KEYS.COUPON_CODE, code);
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};


export const setOrderFor = (payload) => {
	return { type: APP.SET_ORDER_FOR, payload: payload }
}

export const setConfirmLegalAge = (payload) => {
	return { type: APP.SET_CONFIRM_LEGAL_AGE, payload: payload }
}