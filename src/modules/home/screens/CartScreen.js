import React from 'react';
import {
	ActivityIndicator,
	Keyboard,
	InteractionManager,
	ScrollView,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	KeyboardAvoidingView,
	ImageBackground,
	View,
	StatusBar,
	Platform,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Foundation from 'react-native-vector-icons/Foundation';
import FastImage from 'react-native-fast-image';
import Tooltip from 'react-native-walkthrough-tooltip';
import ContentLoader from '@sarmad1995/react-native-content-loader';
import { width } from 'react-native-dimension';
import { calculateCartTotal, compareProductItems, extractErrorMessage, validatePhoneNumber } from '../../../common/services/utility';
import RouteNames from '../../../routes/names';
import { translate } from '../../../common/services/translate';
import DotBorderButton from '../../../common/components/buttons/dot_border_button';
import styles from './styles/cart';
import apiFactory from '../../../common/services/apiFactory';
import Header1 from '../../../common/components/Header1';
import Theme from '../../../theme';
import Config from '../../../config';
import {
	getDiscount,
	updateCartItems,
	setCutleryCart,
	setCommentCart,
	setCouponCart,
	setPriceCart,
	setDeliveryInfoCart,
	setPaymentInfoCart,
	setVendorCart,
} from '../../../store/actions/shop';
import { setTmpFood, getAddresses, getReferralsRewardsSetting, getSystemSettings } from '../../../store/actions/app';
import { getVendorDetail } from '../../../store/actions/vendors';
import alerts from '../../../common/services/alerts';
import GroceryFoodItem from '../components/GroceryFoodItem';
import CartItem from '../components/CartItem';
import CartDelivery from '../components/CartDelivery';
import FontelloIcon from '../../../common/components/FontelloIcon';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Counter from '../../../common/components/buttons/counter';
import AuthInput from '../../../common/components/AuthInput';
import InfoRow from '../../../common/components/InfoRow';
import MainBtn from '../../../common/components/buttons/main_button';
import RoundIconBtn from '../../../common/components/buttons/round_icon_button';
import CommentView from '../components/CommentView';
import { OrderType_Delivery, OrderType_Pickup, OrderType_Reserve, Order_Pickedup } from '../../../config/constants';
import AppTooltip from '../../../common/components/AppTooltip';
import { isEmpty } from '../../../common/services/utility';
import { AppText, RadioBtn } from '../../../common/components';
import OrderFriendsModal from '../../../common/components/modals/OrderFriendsModal';
import { getFriends } from '../../../store/actions/app';
import { setOrderFor, setConfirmLegalAge } from '../../../store/actions/shop';
import ChooseFriendBtn from '../components/ChooseFriendBtn';
import { getStorageKey, KEYS, setStorageKey } from '../../../common/services/storage';
import CartGiftOrderView from '../components/CartGiftOrderView';
import ImgCartPromoBg from '../../../common/assets/images/cart_promo_bg.png';


class CartScreen extends React.Component {
	constructor(props) {
		super(props);
		this.props = props;
		this.state = {
			vendorData: {},

			promo_code: '',

			promoFreeItems: [],
			discount: 0,
			delivery_fee: 0,

			cartItems: [],
			suggestedItems: [],
			maxDeliveryTime: 0,
			minOrderPrice: 0,
			smallOrderFee: 0,
			coupon: '',
			outOfDeliveryArea: false,
			loading_coupon: false,
			has_valid_coupon: false,
			loading_invitation_code: false,
			has_valid_invitation_code: false,
			showInfoPop: false,
			isReady: false,

			selected_friend: null,
			friends: [],
			showOrderFriendsModal: false,

			showOrderFor: false,
			legal_age: false,
			legal_age_error: false,
			gift_permission_error: false,
		};

		this.deliveryFee = 0;
		this.couponObj = null;
		this.discountObj = null;
	}

	async componentDidMount() {
		this._isMounted = true;

		this.setState({
			vendorData: this.props.vendorData,
			maxDeliveryTime: this.props.vendorData['maximum_delivery_time'] || 0,
			minOrderPrice: this.props.vendorData['delivery_minimum_order_price'] || 0,
			smallOrderFee: this.props.vendorData['small_order_fee'] || 0,
		});

		this.getAllFriends();
		this.props.getReferralsRewardsSetting();
		this.props.getSystemSettings();
		await this.loadSuggestedItems();
		this.loadDiscount()
		this.getInviteCode();
		this.getCouponCode();
		this.getCashBackInput();
		this.props.setCouponCart(null);
		if (this.props.delivery_info.address != null) {
			await this.getDeliveryFees(
				this.props.vendorData.id,
				this.props.delivery_info.address.lat,
				this.props.delivery_info.address.lng
			);
		}
		this.setState({
			isReady: true,
		});
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.vendorData.id != prevProps.vendorData.id) {
			this.getDeliveryFees(this.props.vendorData.id);
			this.loadSuggestedItems();
			this.loadDiscount();
			this.getCashBackInput();
			this.getCouponCode();
			this.setState({
				vendorData: this.props.vendorData,
				maxDeliveryTime: this.props.vendorData['maximum_delivery_time'] || 0,
				minOrderPrice: this.props.vendorData['delivery_minimum_order_price'] || 0,
				smallOrderFee: this.props.vendorData['small_order_fee'] || 0,
			});
		}
		if (this.props.cartItems != prevProps.cartItems) {
			this.loadSuggestedItems();
			this.loadDiscount();
		}
		if (
			this.props.delivery_info.address != null &&
			(
				(this.props.delivery_info.address.id != prevProps.delivery_info.address.id) ||
				(this.props.delivery_info.address.lat != prevProps.delivery_info.address.lat) ||
				(this.props.delivery_info.address.lng != prevProps.delivery_info.address.lng)
			)
		) {
			// address changed
			
			this.getDeliveryFees(
				this.props.vendorData.id,
				this.props.delivery_info.address.lat,
				this.props.delivery_info.address.lng
			);
		}
	}

	getAllFriends = () => {
		this.props
			.getFriends('accepted')
			.then((data) => {
				this.setState({ friends: data });
			})
			.catch((err) => {
				
			});
	};

	getInviteCode = async () => {
		try {
			let inviteCode = await getStorageKey(KEYS.INVITE_CODE);
			
			if (inviteCode) {
				apiFactory.post(`/invite-earn/validate-earninvitation-code`, {
					promo_code: inviteCode
				}).then(
					async ({ data }) => {
						if (data?.is_valid == true) {
							await this.setState({
								loading_invitation_code: false,
								promo_code: inviteCode,
								has_valid_invitation_code: data?.is_valid == true,
							});
						} else {
							try {
								await setStorageKey(KEYS.INVITE_CODE, null);
							} catch (e) {
								
							}
						}
					},
					async (error) => {
						
						await this.setState({
							loading_invitation_code: false,
							has_valid_invitation_code: false,
						});
						try {
							await setStorageKey(KEYS.INVITE_CODE, null);
						} catch (e) {
							
						}
						alerts.error(translate('alerts.error'), translate('cart.invalid_promotion_code'));
					}
				);
			}
		} catch (e) {
			
		}
	}

	getCouponCode = async () => {
		try {
			let couponCode = await getStorageKey(KEYS.COUPON_CODE);
			
			if (couponCode) {
				this.checkCoupon(couponCode);
			}
		} catch (e) {
			
		}
	}

	getCashBackInput = async () => {
		try {
			let cashbackInput = await getStorageKey(KEYS.CART_CASHBACK_INPUT);
			
			if (cashbackInput && cashbackInput.vendor_id && cashbackInput.cashback) {
				if (cashbackInput.vendor_id == this.props.vendorData.id) {
					this.props.setPriceCart({
						...this.props.cartPrice,
						cashback: cashbackInput.cashback,
					});
					return;
				}
			}

			try {
				await setStorageKey(KEYS.CART_CASHBACK_INPUT, null);
			} catch (e) {
				
			}
			this.props.setPriceCart({
				...this.props.cartPrice,
				cashback: 0,
			});
		} catch (e) {
			
		}
	}

	saveCashBackInput = async (cashback) => {
		try {
			let data = {
				vendor_id: this.props.vendorData.id,
				cashback: cashback
			}

			await setStorageKey(KEYS.CART_CASHBACK_INPUT, data);
		} catch (e) {
			
		}
	}

	// api
	validateCoupon = async (coupon, vendorId, total) => {
		return new Promise((resolve, reject) => {
			apiFactory.get(`/coupons?subtotal=${total}&vendor_id=${vendorId}&code=${coupon}`).then(
				async ({ data }) => {
					await this.setState({
						has_valid_coupon: true,
						coupon: coupon
					});
					try {
						await setStorageKey(KEYS.COUPON_CODE, coupon);
					} catch (e) {
						
					}
					resolve(data.coupon);
				},
				async (error) => {
					await this.setState({
						has_valid_coupon: false,
					});
					try {
						await setStorageKey(KEYS.COUPON_CODE, null);
					} catch (e) {
						
					}
					const message = extractErrorMessage(error);
					reject(message);
				}
			);
		});
	};

	checkCoupon = async (coupon_code) => {
		try {
			this.setState({ loading_coupon: true });
			let couponData = await this.validateCoupon(coupon_code, this.state.vendorData.id, this.getSubTotal());
			this.props.setCouponCart(couponData);
			this.couponObj = couponData;
			this.applyPromo(couponData);
		} catch (message) {
			
			if (typeof message === 'string') {
				alerts.error(translate('alerts.error'), message);
			}
		}
		this.setState({ loading_coupon: false });
	};

	// api
	validateInvitationCode = async () => {
		this.setState({ loading_invitation_code: true });
		apiFactory.post(`/invite-earn/validate-earninvitation-code`, {
			promo_code: this.state.promo_code
		}).then(
			async ({ data }) => {
				if (data?.is_valid == true) {
					await this.setState({
						loading_invitation_code: false,
						has_valid_invitation_code: data?.is_valid == true,
					});
				}
				else {
					await this.setState({
						loading_invitation_code: false,
						has_valid_invitation_code: data?.is_valid == true,
					});
					if (data?.is_used == 2) { // running order
						alerts.error(translate('alerts.error'), translate('cart.invalid_running_promotion_code'));
					}
					else {
						alerts.error(translate('alerts.error'), translate('cart.invalid_promotion_code'));
					}
				}
			},
			async (error) => {
				
				await this.setState({
					loading_invitation_code: false,
					has_valid_invitation_code: false,
				});
				alerts.error(translate('alerts.error'), translate('cart.invalid_promotion_code'));
			}
		);
	};

	getDeliveryFees = async (vendor_id, latitude, longitude) => {
		try {
			if (vendor_id == null || vendor_id == '' || latitude == null || longitude == null) {
				this.setState({ delivery_fee: 0 })
				return;
			}

			const params = [`vendor_id=${vendor_id}`];
			params.push(`lat=${latitude}`);
			params.push(`lng=${longitude}`);

			const queryParams = params.join('&');

			let response = await apiFactory.get(`checkout/delivery-fee?${queryParams}`);
			let data = response.data;
			this.setState({
				maxDeliveryTime: data['deliveryTime'] || this.state.maxDeliveryTime,
				minOrderPrice: data['minimumOrder'] || this.state.minOrderPrice,
				outOfDeliveryArea: data['outOfDeliveryArea'] || false,
				smallOrderFee: data['small_order_fee'] || this.state.smallOrderFee,
				delivery_fee: data['deliveryFee'] || 0,
			});

			this.deliveryFee = data['deliveryFee'] || 0;
		} catch (error) {
			
			// alerts.error(translate('attention'), extractErrorMessage(error));
		}
	};

	loadSuggestedItems = async () => {
		try {
			const cartItems = this.props.cartItems;
			const { vendorData } = this.props;
			if (vendorData == null) {
				return;
			}
			let categories = vendorData.categories;
			if (categories == null) {
				const { latitude, longitude } = this.props.coordinates;

				let data = await getVendorDetail(
					vendorData.id,
					latitude,
					longitude,
					this.props.delivery_info.handover_method
				);
				this.props.setVendorCart(data);
				categories = data.categories;
			}

			let suggestedItems = [];
			cartItems.map((cartItm) => {
				let category = categories.find((cat) => cat.id == cartItm.category_id);

				if (category != null && category.products != null) {
					let tmpProducts = [];
					category.products.slice(0, 30).map((p) => {
						let foundCart = cartItems.find((i) => i.id == p.id);
						let foundSuggested = suggestedItems.find((i) => i.id == p.id);
						if (foundCart == null && foundSuggested == null) {
							tmpProducts.push(p);
						}
					});

					tmpProducts.sort(function (a, b) {
						return Math.abs(a.price - cartItm.price) - Math.abs(b.price - cartItm.price);
					});
					suggestedItems.push(...tmpProducts.slice(0, 6));
				}
			});
			suggestedItems
				.sort(function (a, b) {
					return a.price - b.price;
				})
				.slice(0, 10);
			this.setState({ suggestedItems: suggestedItems });
		} catch (error) {
			
		}
	};
	// end api

	loadDiscount = () => {
		if (this.props.vendorData == null) { return; }
		let subTotal = this.getSubTotal();
		this.props.getDiscount(this.props.vendorData.id, null, subTotal)
			.then(res => {

				if (this._isMounted == true) {

					this.discountObj = res.discount;
					if (this.couponObj == null) {
						this.applyPromo(this.discountObj);
					}
				}
			})
			.catch(err => {
				if (this._isMounted == true) {
					this.discountObj = null;
					this.applyPromo(this.discountObj);
				}
				
			})
	}

	applyPromo = (promoData) => {
		
		if (promoData == null) {
			this.setState({ promoFreeItems: [], delivery_fee: this.deliveryFee, discount: 0 });
			return;
		}
		else if (promoData.vendor_type == 'product_discount') {
			this.applyPromoFreeItems(promoData);
			this.setState({ delivery_fee: this.deliveryFee, discount: 0 });
		}
		else if (promoData.type == 'fixed') {
			this.setState({ promoFreeItems: [], delivery_fee: this.deliveryFee, discount: promoData.value ? promoData.value : 0 });
		} else if (promoData.type == 'percentage') {
			this.setState({ promoFreeItems: [], delivery_fee: this.deliveryFee, discount: promoData.value ? promoData.value : 0 });
		} else if (promoData.type == 'item') {
			this.applyPromoFreeItems(promoData);
			this.setState({ delivery_fee: this.deliveryFee, discount: 0 });
		} else if (promoData.type == 'free_delivery') {
			this.setState({ promoFreeItems: [], delivery_fee: 0, discount: 0 });
		}

		if (promoData != null && promoData.sibling_promotion == 1) {
			this.setState({ showOrderFor: true });
		}
		else {
			this.setState({ showOrderFor: false });
		}
	};

	applyPromoFreeItems = (promoData) => {
		let free_products = [];
		if (promoData.vendor_type == 'product_discount' && promoData.free_items && promoData.free_items.length > 0) {
			let discount_products = this.props.cartItems.filter(c => ((c.discount_price != null) && (parseInt(c.discount_price) > 0) && (promoData.free_items.findIndex(f => f.product_id == c.id) != -1)));

			discount_products.map(d => {
				free_products.push({
					...d,
					quantity: 1,
					comments: '',
					options: []
				})
			})
		}
		else if (promoData.type == 'item' && promoData.product) {
			let cartItem = promoData.product;
			cartItem.quantity = 1;
			cartItem.comments = '';
			cartItem.options = [];

			if (promoData.value && parseInt(promoData.value) > 1) {
				cartItem.quantity = parseInt(promoData.value);
			}

			free_products.push(cartItem);
		}

		this.setState({ promoFreeItems: free_products });
	}

	revokeCoupon = () => {
		Keyboard.dismiss();
		this.setState({ has_valid_coupon: false, coupon: '' });
		this.props.setCouponCart(null);
		this.couponObj = null
		if (this.discountObj != null) {
			this.applyPromo(this.discountObj);
		}
		else {
			this.setState({ promoFreeItems: [], delivery_fee: this.deliveryFee, discount: 0 });
		}
		try {
			setStorageKey(KEYS.COUPON_CODE, null);
		} catch (e) {
			
		}
	}

	revokeEarnInvitationCode = async () => {
		Keyboard.dismiss();
		this.setState({ has_valid_invitation_code: false, promo_code: '' });
	}

	getSubTotal = () => {
		let sub_total = calculateCartTotal(this.props.cartItems);
		return sub_total;
	};

	getSmallOrderFee = () => {
		if (this.props.delivery_info.handover_method == OrderType_Delivery) {
			let subTotal = this.getSubTotal();
			if (subTotal < this.state.minOrderPrice) {
				if (this.state.smallOrderFee != null) {
					return parseInt(this.state.smallOrderFee) || 0;
				}
			}
		}
		return 0;
	};

	getTotalPrice = () => {
		const { cashback } = this.props.cartPrice;
		const { discount, delivery_fee } = this.state;

		let subtotal = this.getSubTotal();
		let total = subtotal - discount - cashback + this.getSmallOrderFee();

		if (this.props.delivery_info.handover_method == OrderType_Delivery) {
			total = total + delivery_fee;
		}

		return total;
	};

	hasLegalAgeProduct = () => {
		let find = this.props.cartItems.findIndex(c => c.age_18 == 1);
		return find != -1;
	};

	onChangeGiftPermissionError = () => {
		this.setState({ gift_permission_error: false })
	};

	renderCartProducts = () => {
		const onPlusItem = async (product) => {
			try {
				let tmp = this.props.cartItems.slice(0, this.props.cartItems.length);
				let foundIndex = tmp.findIndex((i) => compareProductItems(i, product));
				if (foundIndex != -1) {
					tmp[foundIndex].quantity = tmp[foundIndex].quantity + 1;
					await this.props.updateCartItems(tmp);
				}
			} catch (error) {
				
			}
		};

		const onMinusItem = async (product) => {
			try {
				let tmp = this.props.cartItems.slice(0, this.props.cartItems.length);
				let foundIndex = tmp.findIndex((i) => compareProductItems(i, product));
				if (foundIndex != -1) {
					tmp[foundIndex].quantity = tmp[foundIndex].quantity - 1;
					await this.props.updateCartItems(tmp);
				}
			} catch (error) {
				
			}
		};

		const onRemoveItem = async (product) => {
			try {
				let curCartCount = this.props.cartItems.length;
				let tmp = this.props.cartItems.slice(0, this.props.cartItems.length);
				let foundIndex = tmp.findIndex((i) => compareProductItems(i, product));
				if (foundIndex != -1) {
					tmp.splice(foundIndex, 1);
					await this.props.updateCartItems(tmp);
					if (curCartCount == 1) {
						try {
							await setStorageKey(KEYS.CART_CASHBACK_INPUT, null);
						} catch (e) {
							
						}
						this.props.setPriceCart({
							...this.props.cartPrice,
							cashback: 0,
						});
						this.props.navigation.goBack();
					}
				}
			} catch (error) {
				
			}
		};

		const onAddItem = async (product) => {
			try {
				let foundIndex = this.state.promoFreeItems.findIndex(f => f.id == product.id);
				if (foundIndex != -1) {
					let tmp = this.props.cartItems.slice(0, this.props.cartItems.length);

					let cartItem = this.state.promoFreeItems[foundIndex];
					cartItem.quantity = 1;
					cartItem.comments = '';
					cartItem.options = [];

					tmp.push(cartItem);
					await this.props.updateCartItems(tmp);
				}
			} catch (error) {
				
			}
		};

		const renderItems = () => {

			return (
				<>
					{
						this.props.cartItems.map((item, index) => (
							<CartItem
								key={index}
								data={
									(this.state.promoFreeItems.findIndex(f => f.id == item.id) != -1) ?
										{
											...item,
											quantity: item.quantity + this.state.promoFreeItems[this.state.promoFreeItems.findIndex(f => f.id == item.id)].quantity
										} : item
								}
								onPlus={onPlusItem}
								onMinus={onMinusItem}
								onDelete={onRemoveItem}
							/>
						))
					}
					{
						this.state.promoFreeItems &&
						this.state.promoFreeItems.filter(f => (this.props.cartItems.findIndex(c => c.id == f.id) == -1))
							.map((item, index) => (
								<CartItem
									data={item}
									onPlus={onAddItem}
									onMinus={onMinusItem}
									onDelete={onRemoveItem}
								/>
							))
					}
				</>
			);
		}

		return (
			<View style={[Theme.styles.col_center, { width: '100%', padding: 20 }]}>
				<View style={[Theme.styles.row_center_start]}>
					<RoundIconBtn
						style={{ ...Theme.styles.col_center, ...styles.LogoView }}
						icon={
							this.props.vendorData != null && (
								<FastImage
									style={styles.Logo}
									resizeMode={FastImage.resizeMode.contain}
									source={{ uri: Config.IMG_BASE_URL + this.props.vendorData.logo_thumbnail_path }}
								/>
							)
						}
						onPress={() => { }}
					/>
					<Text style={styles.LogoText}>{this.props.vendorData != null && this.props.vendorData.title}</Text>
				</View>
				<View style={[Theme.styles.row_center, { marginTop: 12 }]}>
					<Text style={[{ flex: 1, fontSize: 17, color: Theme.colors.text, fontFamily: Theme.fonts.bold }]}>
						{translate('cart.your_items')}
					</Text>
					<TouchableOpacity
						onPress={() => {
							this.props.navigation.navigate(RouteNames.VendorScreen);
						}}
					>
						<Text style={{ fontSize: 17, color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold }}>
							{translate('cart.see_menu')}
						</Text>
					</TouchableOpacity>
				</View>
				<View
					style={[
						Theme.styles.col_center,
						{
							width: '100%',
							marginTop: 16,
							padding: 12,
							paddingTop: 18,
							paddingBottom: 18,
							backgroundColor: Theme.colors.gray8,
							borderRadius: 15,
						},
					]}
				>
					{renderItems()}
				</View>
			</View>
		);
	};

	renderPromoDesc = () => {
		if (this.state.promoFreeObj && this.state.promoFreeObj.type == 'item' && parseInt(this.state.promoFreeObj.value) > 0) {
			return <Text style={styles.couponDescText}>{translate('cart.promo_free_item').replace('###', parseInt(this.state.promoFreeObj.value))}</Text>
		} else if (this.state.promoFreeObj && this.state.promoFreeObj.type == 'free_delivery') {
			return <Text style={styles.couponDescText}>{translate('cart.promo_free_delivery')}</Text>
		}
		return null;
	}

	renderCutlery = () => {
		return (
			<View style={[Theme.styles.col_center_start, { paddingHorizontal: 20 }]}>
				<View style={[Theme.styles.row_center, styles.sectionView]}>
					<View style={{ justifyContent: 'center', flex: 1 }}>
						<Text style={styles.subjectTitle}>{translate('cart.cutlery_description_off')}</Text>
					</View>
					<Counter
						value={this.props.cutlery}
						onPlus={() => this.props.setCutleryCart(this.props.cutlery + 1)}
						onMinus={() => {
							if (this.props.cutlery >= 1) {
								this.props.setCutleryCart(this.props.cutlery - 1);
							}
						}}
						style={{
							width: 122,
							height: 40,
							padding: 6,
							paddingHorizontal: 12,
							borderWidth: 1,
							borderColor: Theme.colors.gray6,
							backgroundColor: Theme.colors.white,
						}}
						btnColor={Theme.colors.cyan2}
						btnSize={20}
					/>
				</View>
			</View>
		);
	};

	renderCashBack = () => {
		return (
			<View style={[Theme.styles.col_center_start, { paddingHorizontal: 20 }]}>
				<View style={[Theme.styles.row_center, styles.sectionView, { marginTop: 12, borderBottomWidth: 0, borderTopWidth: 1, borderTopColor: Theme.colors.gray9 }]}>
					<View style={{ justifyContent: 'center', flex: 1 }}>
						<Text style={styles.subjectTitle}>{translate('cart.want_use_cashback')}</Text>
						<Text
							style={{
								marginTop: 5,
								fontSize: 15,
								fontFamily: Theme.fonts.medium,
								color: Theme.colors.gray7,
							}}
						>
							{translate('wallet.balance')} {parseInt(this.props.user.cashback_amount) || 0} L
						</Text>
					</View>
					<AuthInput
						style={{
							width: 122,
							height: 40,
							borderWidth: 1,
							borderColor: Theme.colors.gray6,
							backgroundColor: Theme.colors.white,
						}}
						placeholder={translate('cart.enter_cashback_value')}
						textAlign='center'
						keyboardType='decimal-pad'
						editable={parseInt(this.props.user.cashback_amount) > 0}
						value={this.props.cartPrice.cashback == 0 ? '' : '' + this.props.cartPrice.cashback}
						onChangeText={(t) => {
							let int_val = t != '' ? parseInt(t) : 0;
							let balance = this.props.user.cashback_amount || 0;

							if (int_val <= balance) {
								this.props.setPriceCart({
									...this.props.cartPrice,
									cashback: int_val,
								});
								this.saveCashBackInput(int_val);
							}
						}}
					/>
				</View>
			</View>
		);
	};

	renderOrderFor = () => {
		if (this.state.showOrderFor != true) { return null; }
		return (
			<View style={[Theme.styles.col_center_start, { paddingHorizontal: 20 }]}>
				<View style={[Theme.styles.flex_between, styles.sectionView]}>
					<Text style={styles.subjectTitle}>{translate('cart.order_for')}</Text>
					<ChooseFriendBtn
						friend={this.state.selected_friend}
						onSelect={() => {
							this.setState({ showOrderFriendsModal: true })
						}}
						onClear={() => {
							this.setState({ selected_friend: null })
						}}
					/>
				</View>
			</View>
		);
	}

	renderSuggestedProducts = () => {
		const onAddCart = async (data) => {
			try {
				let tmp = this.props.cartItems.slice(0, this.props.cartItems.length);
				let foundIndex = tmp.findIndex((i) => i.id == data.id);
				if (foundIndex != -1) {
					tmp[foundIndex].quantity = tmp[foundIndex].quantity + 1;
				} else {
					let cartItem = data;
					cartItem.quantity = 1;
					cartItem.comments = '';
					cartItem.options = [];

					tmp.push(cartItem);
				}
				await this.props.updateCartItems(tmp);
			} catch (error) {
				
			}
		};

		if (this.state.suggestedItems.length == 0) {
			return null;
		}
		return (
			<View style={[Theme.styles.col_center, { width: '100%', paddingLeft: 20, paddingTop: 20 }]}>
				<View style={[Theme.styles.row_center]}>
					<Text style={[{ flex: 1, fontSize: 18, color: Theme.colors.text, fontFamily: Theme.fonts.bold }]}>
						{translate('cart.suggested_items')}
					</Text>
				</View>
				<ScrollView horizontal={true} style={{ width: '100%', marginTop: 16, paddingBottom: 15 }}>
					{this.state.suggestedItems.map((item, index) => (
						<GroceryFoodItem
							key={index}
							data={item}
							food_id={item.id}
							title_lines={1}
							hideFav={true}
							style={{ width: 140, padding: 10, marginRight: 8 }}
							onAddCart={onAddCart}
							onRmvCart={() => { }}
							onFavChange={() => { }}
							onSelect={() => { }}
						/>
					))}
				</ScrollView>
				<View style={styles.scrollviewHider} />
				<View style={styles.divider} />
			</View>
		);
	};

	renderCouponInput = () => {
		const { coupon, loading_coupon, has_valid_coupon } = this.state;

		return (
			<View
				style={{
					flex: 1,
					paddingTop: 20,
					paddingBottom: 15,
					flexDirection: 'row',
					alignItems: 'center',
					marginHorizontal: 20,
					borderTopWidth: 1,
					borderTopColor: Theme.colors.gray9,
				}}
			>
				{!has_valid_coupon && (
					<View
						style={{
							flex: 1,
							marginRight: 15,
							flexDirection: 'row',
							alignItems: 'center',
							borderWidth: 1,
							borderColor: Theme.colors.gray6,
							borderRadius: 12,
						}}
					>
						<TextInput
							style={{
								flex: 1,
								paddingVertical: 12,
								paddingLeft: 10,
								fontSize: 15
							}}
							value={coupon}
							placeholder={translate('cart.coupon.placeholder')}
							onChangeText={(coupon) => this.setState({ coupon })}
							autoCapitalize={'none'}
							autoCorrect={false}
							returnKeyType={'done'}
							placeholderTextColor={Theme.colors.gray5}
						/>
						{coupon != null && coupon.length > 0 && (
							<TouchableOpacity
								style={{
									position: 'absolute',
									right: 10,
								}}
								onPress={() => this.checkCoupon(coupon)}
							>
								{loading_coupon ? (
									<ActivityIndicator color={Theme.colors.primary} />
								) : (
									<FontelloIcon
										icon='ok-1'
										size={Theme.icons.small}
										color={has_valid_coupon ? Theme.colors.cyan2 : Theme.colors.placeholder}
									/>
								)}
							</TouchableOpacity>
						)}
					</View>
				)}
				{coupon != null && coupon.length > 0 && has_valid_coupon && (
					<View
						style={{
							flex: 1,
							marginRight: 15,
							flexDirection: 'row',
							alignItems: 'center',
							borderWidth: 1,
							borderColor: Theme.colors.gray6,
							borderRadius: 12,
						}}
					>
						<View
							style={[
								Theme.styles.row_center_start,
								{
									flex: 1,
									paddingVertical: 18,
									paddingLeft: 10,
								},
							]}
						>
							<Text
								style={{
									marginRight: 8,
									fontSize: 13,
									fontFamily: Theme.fonts.semiBold,
									color: Theme.colors.text,
								}}
							>
								{coupon}
							</Text>
							<AntDesign name='checkcircle' size={16} color={'#00C22D'} />
						</View>

						<TouchableOpacity
							style={{
								position: 'absolute',
								right: 10,
							}}
							onPress={() => this.revokeCoupon()}
						>
							{loading_coupon ? (
								<ActivityIndicator color={Theme.colors.primary} />
							) : (
								<Text
									style={{
										fontSize: 13,
										fontFamily: Theme.fonts.semiBold,
										color: Theme.colors.gray7,
									}}
								>
									{translate('remove')}
								</Text>
							)}
						</TouchableOpacity>
					</View>
				)}
				<AppTooltip
					title={translate('tooltip.coupon_code_input')}
					description={translate('tooltip.coupon_code_input_description')}
				/>
			</View>
		);
	};

	renderPromoCode = () => {
		const { promo_code, loading_invitation_code, has_valid_invitation_code } = this.state;

		if (this.props.referralsRewardsSetting?.show_earn_invitation_module == true) {

			return (
				<View style={[Theme.styles.row_center, { marginBottom: 20, paddingHorizontal: 20, width: '100%' }]}>
					{!has_valid_invitation_code && (
						<View
							style={{
								flex: 1,
								marginRight: 15,
								flexDirection: 'row',
								alignItems: 'center',
								borderWidth: 1,
								borderColor: Theme.colors.gray6,
								borderRadius: 12,
							}}
						>
							<TextInput
								style={{
									flex: 1,
									paddingVertical: 12,
									paddingLeft: 10,
									fontSize: 15
								}}
								placeholder={translate('cart.add_promo_code')}
								value={this.state.promo_code}
								onChangeText={(t) => {
									this.setState({ promo_code: t })
								}}
								autoCapitalize={'none'}
								autoCorrect={false}
								returnKeyType={'done'}
								placeholderTextColor={Theme.colors.gray5}
							/>
							{promo_code != null && promo_code.length > 0 && (
								<TouchableOpacity
									style={{
										position: 'absolute',
										right: 10,
									}}
									onPress={() => this.validateInvitationCode()}
								>
									{loading_invitation_code ? (
										<ActivityIndicator color={Theme.colors.primary} />
									) : (
										<FontelloIcon
											icon='ok-1'
											size={Theme.icons.small}
											color={has_valid_invitation_code ? Theme.colors.cyan2 : Theme.colors.placeholder}
										/>
									)}
								</TouchableOpacity>
							)}
						</View>
					)}
					{promo_code != null && promo_code.length > 0 && has_valid_invitation_code && (
						<View
							style={{
								flex: 1,
								marginRight: 15,
								flexDirection: 'row',
								alignItems: 'center',
								borderWidth: 1,
								borderColor: Theme.colors.gray6,
								borderRadius: 12,
							}}
						>
							<View
								style={[
									Theme.styles.row_center_start,
									{
										flex: 1,
										paddingVertical: 18,
										paddingLeft: 10,
									},
								]}
							>
								<Text
									style={{
										marginRight: 8,
										fontSize: 13,
										fontFamily: Theme.fonts.semiBold,
										color: Theme.colors.text,
									}}
								>
									{promo_code}
								</Text>
								<AntDesign name='checkcircle' size={16} color={'#00C22D'} />
							</View>

							<TouchableOpacity
								style={{
									position: 'absolute',
									right: 10,
								}}
								onPress={() => this.revokeEarnInvitationCode()}
							>
								{loading_invitation_code ? (
									<ActivityIndicator color={Theme.colors.primary} />
								) : (
									<Text
										style={{
											fontSize: 13,
											fontFamily: Theme.fonts.semiBold,
											color: Theme.colors.gray7,
										}}
									>
										{translate('remove')}
									</Text>
								)}
							</TouchableOpacity>
						</View>
					)}

					<AppTooltip
						title={translate('tooltip.earn_invitation_code_input')}
						description={translate('tooltip.earn_invitation_code_input_description')}
					/>
				</View>
			);
		}
		return null;
	};

	renderGiftOrder = () => {
		if (this.props.systemSettings.enable_gift_order == 1 &&
			this.props.vendorData.enable_gift_order == 1 &&
			(
				this.props.delivery_info.handover_method == OrderType_Delivery ||
				this.props.delivery_info.handover_method == OrderType_Reserve
			) &&
			(
				this.props.user.has_membership != 1 ||
				(this.props.user.has_membership == 1 && this.props.systemSettings.enable_membership_gift_order == 1)
			)
		) {
			return (
				<View style={[Theme.styles.col_center_start, { width: '100%', paddingHorizontal: 20 }]}>
					<CartGiftOrderView
						navigation={this.props.navigation}
						routeParams={this.props.route?.params}
						gift_permission_error={this.state.gift_permission_error}
						onChangeGiftPermissionError={this.onChangeGiftPermissionError}
					/>
				</View>
			)
		}
		return null;
	}

	renderPriceInfo = () => {
		return (
			<View style={[Theme.styles.col_center, { width: '100%', paddingHorizontal: 20 }]}>
				<InfoRow name={translate('cart.subtotal')} value={parseInt(this.getSubTotal()) + ' L'} />
				<InfoRow
					name={translate('cart.discount')}
					value={
						parseInt(this.state.discount || 0) == 0
							? '0 L'
							: `-${parseInt(this.state.discount)} L`
					}
				/>
				<InfoRow
					name={translate('wallet.cashback')}
					value={
						parseInt(this.props.cartPrice.cashback || 0) == 0
							? '0 L'
							: `-${parseInt(this.props.cartPrice.cashback)} L`
					}
				/>
				{this.props.delivery_info.handover_method == OrderType_Delivery && this.getSmallOrderFee() > 0 && (
					<InfoRow
						keyItem={
							<View style={[Theme.styles.row_center_start, { flex: 1 }]}>
								<Text
									style={{
										marginRight: 8,
										fontSize: 17,
										fontFamily: Theme.fonts.medium,
										color: Theme.colors.text,
									}}
								>
									{translate('cart.small_order_fee')}
								</Text>
								<Tooltip
									isVisible={this.state.showInfoPop}
									backgroundColor={'transparent'}
									content={
										<Text
											style={{
												fontSize: 13,
												fontFamily: Theme.fonts.medium,
												color: Theme.colors.text,
											}}
										>
											{translate('cart.small_order_fee_desc')
												.replace('{0}', this.state.minOrderPrice)
												.replace('{1}', this.getSmallOrderFee())}
										</Text>
									}
									placement='top'
									tooltipStyle={{ backgroundColor: 'transparent' }}
									topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
									contentStyle={{ elevation: 7, borderRadius: 8 }}
									arrowStyle={{ elevation: 8 }}
									showChildInTooltip={false}
									disableShadow={false}
									onClose={() => this.setState({ showInfoPop: false })}
								>
									<TouchableOpacity
										ref={(r) => (this.info = r)}
										onPress={() => this.setState({ showInfoPop: true })}
									>
										<Foundation name='info' size={20} color={Theme.colors.gray7} />
									</TouchableOpacity>
								</Tooltip>
							</View>
						}
						value={parseInt(this.getSmallOrderFee()) + ' L'}
						style={{ height: 40 }}
					/>
				)}
				{this.props.delivery_info.handover_method == OrderType_Delivery && (
					<InfoRow
						name={translate('order_details.delivery_fee')}
						value={parseInt(this.state.delivery_fee) + ' L'}
					/>
				)}
				<InfoRow
					name={translate('cart.order_total')}
					value={parseInt(this.getTotalPrice()) + ' L'}
					keyStyle={{ fontFamily: Theme.fonts.bold }}
					valueStyle={{ fontFamily: Theme.fonts.bold }}
				/>
			</View>
		);
	};

	checkMultiPromoApply = () => {
		let cnt = 0;
		if (this.state.has_valid_invitation_code && isEmpty(this.state.promo_code) != true) {
			cnt = cnt + 1;
		}
		if (this.props.cartPrice.cashback > 0) {
			cnt = cnt + 1;
		}

		if (this.state.has_valid_coupon && isEmpty(this.state.coupon) != true) {
			cnt = cnt + 1;
		}

		return cnt > 1;
	}

	renderErrorMsg = () => {
		if (!this.checkMultiPromoApply()) {
			return null;
		}
		return (
			<View style={[Theme.styles.col_center, { marginTop: 20, width: '100%', paddingHorizontal: 20 }]}>
				<View style={[Theme.styles.col_center, styles.error_msg_view]}>
					<AppText style={styles.error_msg}>
						{translate('cart.not_possible_use_all_in_a_order')}
					</AppText>
				</View>
			</View>
		)
	}

	renderCartPromoBadge = () => {
		if (this.state.has_valid_coupon && isEmpty(this.state.coupon) != true) {
			return (
				<ImageBackground
					source={ImgCartPromoBg}
					style={[Theme.styles.col_center, { marginTop: 20, width: '100%', paddingVertical: 15, paddingHorizontal: 20 }]}>
					<AppText style={styles.promo_badge_title}>
						{translate('cart.a_coupon_value')}
					</AppText>
					<AppText style={styles.promo_badge_desc}>
						{translate('cart.a_coupon_value_a')} {parseInt(this.state.discount)}L {translate('cart.you_used_coupon')}
					</AppText>
				</ImageBackground>
			)
		}
		else if (parseInt(this.state.discount) > 0) {
			return (
				<ImageBackground
					source={ImgCartPromoBg}
					style={[Theme.styles.col_center, { marginTop: 20, width: '100%', paddingVertical: 15, paddingHorizontal: 20 }]}>
					<AppText style={styles.promo_badge_title}>
						{translate('cart.a_discount_value')}
					</AppText>
					<AppText style={styles.promo_badge_desc}>
						{translate('cart.a_discount_was_applied')} {parseInt(this.state.discount)}L {translate('cart.you_used_discount')}
					</AppText>
				</ImageBackground>
			)
		}
		return null;
	}

	onProceed = async () => {
		if (this.props.delivery_info.handover_method == OrderType_Delivery) {
			if (
				this.props.vendorData.can_schedule == 1 &&
				this.props.delivery_info.is_schedule == 1 &&
				isEmpty(this.props.delivery_info.schedule_time)
			) {
				return alerts.error(
					translate('restaurant_details.we_are_sorry'),
					translate('cart.select_schedule_time')
				);
			}

			if (this.props.delivery_info.address == null) {
				return alerts.error(
					translate('restaurant_details.we_are_sorry'),
					translate('checkout.select_address_to_checkout')
				);
			}
			if (this.state.outOfDeliveryArea == true) {
				return alerts.error(
					translate('restaurant_details.we_are_sorry'),
					translate('restaurant_details.no_in_vendor_support_zone')
				);
			}
		}

		if (this.props.delivery_info.handover_method == OrderType_Reserve) {
			if (this.props.user == null) {
				return;
			}
			this.props.setDeliveryInfoCart({
				reserve_for: this.props.user,
			});
		}

		if (this.props.delivery_info.handover_method != OrderType_Pickup && this.props.delivery_info.is_gift == true) {
			if (isEmpty(this.props.delivery_info.gift_recip_name)) {
				return alerts.error(
					translate('attention'),
					translate('cart.enter_recipient_name')
				);
			}
			if (isEmpty(this.props.delivery_info.gift_recip_phone)) {
				return alerts.error(
					translate('attention'),
					translate('cart.enter_recipient_phone')
				);
			}
			if (isEmpty(this.props.delivery_info.gift_from)) {
				return alerts.error(
					translate('attention'),
					translate('cart.enter_gift_order_from')
				);
			}
			// 
			if (this.props.delivery_info.gift_permission != true) {
				this.setState({ gift_permission_error: true })
				return alerts.error(
					null,
					(
						this.props.delivery_info.handover_method == OrderType_Reserve ?
							translate('cart.select_reserve_gift_permission')
							:
							translate('cart.select_gift_permission')
					)
				);
			}
			if (validatePhoneNumber(this.props.delivery_info.gift_recip_phone) != true) {
				return alerts.error(
					translate('cart.enter_valid_recipient_phone_title'),
					translate('cart.enter_valid_recipient_phone')
				);
			}
		}

		if (this.getTotalPrice() < 0) {
			return alerts.error(translate('restaurant_details.we_are_sorry'), translate('cart.order_is_under_0'));
		}

		if (this.checkMultiPromoApply()) {
			return;
		}

		if (this.hasLegalAgeProduct() && this.state.legal_age != true) {
			this.setState({ legal_age_error: true })
			return alerts.error(null, translate('cart.check_legal_age'));
		}

		if (this.state.selected_friend) {
			this.props.setOrderFor(this.state.selected_friend.id)
		}

		this.props.setConfirmLegalAge(this.state.legal_age);

		this.props.setPriceCart({
			...this.props.cartPrice,
			subtotal: this.getSubTotal(),
			small_order_fee: this.getSmallOrderFee(),
			order_total: this.getTotalPrice(),
			min_order_price: this.state.minOrderPrice,
			discount: this.state.discount || 0,
			delivery_fee: this.state.delivery_fee || 0,

			promo_code: this.state.has_valid_invitation_code ? this.state.promo_code : ''
		});
		this.props.setPaymentInfoCart({
			...this.props.payment_info,
			splits: [],
		});

		try {
			const inviteCode = await getStorageKey(KEYS.INVITE_CODE);
			if (inviteCode) {
				await setStorageKey(KEYS.INVITE_CODE, null);
			}
		} catch (e) {
			
		}
		this.props.navigation.navigate(RouteNames.CartPaymentScreen);
	};

	render() {
		return (
			<View style={styles.container}>
				<Header1
					style={{ width: width(100), paddingLeft: 20, paddingRight: 20, marginBottom: 0 }}
					onLeft={() => {
						this.props.navigation.goBack();
					}}
					title={translate('cart.title')}
				/>
				{this.state.isReady == false ? (
					<View style={{ width: width(100), marginTop: 20 }}>
						<ContentLoader
							primaryColor={Theme.colors.gray8}
							secondaryColor={Theme.colors.gray8}
							pRows={1}
							title={false}
							pHeight={[200]}
							pWidth={[width(100) - 20]}
						/>
						<ContentLoader
							primaryColor={Theme.colors.gray8}
							secondaryColor={Theme.colors.gray8}
							pRows={1}
							title={false}
							pHeight={[60]}
							pWidth={[width(100) - 20]}
						/>
						<ContentLoader
							primaryColor={Theme.colors.gray8}
							secondaryColor={Theme.colors.gray8}
							pRows={1}
							title={false}
							pHeight={[300]}
							pWidth={[width(100) - 20]}
						/>
					</View>
				) : (
					this.props.cartItems.length > 0 && (
						<KeyboardAwareScrollView style={[{ flex: 1, width: width(100) }]} keyboardShouldPersistTaps='handled' scrollIndicatorInsets={{ right: 1 }}>
							<CartDelivery
								navigation={this.props.navigation}
								isReorder={this.props.route?.params?.isReorder}
								outOfDeliveryArea={this.state.outOfDeliveryArea}
							/>
							{this.renderCartProducts()}
							{this.renderPromoDesc()}
							{this.props.delivery_info.handover_method != OrderType_Reserve && this.renderCutlery()}
							{this.renderOrderFor()}
							{this.renderSuggestedProducts()}
							{this.renderCartPromoBadge()}
							{this.renderCouponInput()}
							{this.renderPromoCode()}
							{this.renderGiftOrder()}
							{this.renderPriceInfo()}
							{this.renderErrorMsg()}
							{this.renderCashBack()}
							{
								this.props.delivery_info.handover_method == OrderType_Delivery &&
								<View
									style={{
										marginTop: 3,
										marginBottom: 20,
										paddingTop: 15,
										paddingBottom: 18,
										flexDirection: 'row',
										alignItems: 'center',
										marginHorizontal: 20,
										borderTopWidth: 1,
										borderTopColor: Theme.colors.gray9,
									}}
								>
									<CommentView
										comments={this.props.comments}
										onChangeText={(text) => this.props.setCommentCart(text)}
									/>
								</View>
							}
							{
								this.hasLegalAgeProduct() &&
								<TouchableOpacity style={[Theme.styles.row_center, styles.legal_age_view]}
									onPress={() => {
										this.setState({ legal_age: !this.state.legal_age })
									}}
								>
									<RadioBtn
										checked={this.state.legal_age} onPress={() => {
											this.setState({ legal_age: !this.state.legal_age, legal_age_error: false })
										}}
										hasError={this.state.legal_age != true && this.state.legal_age_error}
									/>
									<AppText style={styles.legal_age}>{translate('cart.confirm_legal_age')}</AppText>
								</TouchableOpacity>
							}
							<View style={{ width: '100%', paddingHorizontal: 20, marginTop: 20, marginBottom: 40 }}>
								<MainBtn
									// disabled={loading}
									// loading={loading}
									title={translate('cart.continue_to_payment')}
									onPress={this.onProceed}
								/>
							</View>
						</KeyboardAwareScrollView>
					)
				)}
				<OrderFriendsModal
					showModal={this.state.showOrderFriendsModal}
					friends={this.state.friends || []}
					onClose={() => {
						this.setState({ showOrderFriendsModal: false })
					}}
					onSelectFriend={(friend) => {
						this.setState({ showOrderFriendsModal: false, selected_friend: friend })
					}}
				/>
			</View>
		);
	}
}

const mapStateToProps = ({ app, shop }) => ({
	user: app.user || {},
	language: app.language,
	isLoggedIn: app.isLoggedIn,
	coordinates: app.coordinates,
	referralsRewardsSetting: app.referralsRewardsSetting || {},

	cartItems: shop.items || [],
	cutlery: shop.cutlery,
	coupon: shop.coupon,
	comments: shop.comments,
	cartPrice: shop.cartPrice,
	vendorData: shop.vendorData || {},

	delivery_info: shop.delivery_info,
	payment_info: shop.payment_info,

	systemSettings: app.systemSettings || {}
});

export default connect(mapStateToProps, {
	getDiscount,
	updateCartItems,
	setCutleryCart,
	setCommentCart,
	setCouponCart,
	setPriceCart,
	setTmpFood,
	setDeliveryInfoCart,
	getAddresses,
	setPaymentInfoCart,
	setVendorCart,
	getReferralsRewardsSetting,
	getSystemSettings,
	getFriends,
	setOrderFor,
	setConfirmLegalAge
})(withNavigation(CartScreen));
