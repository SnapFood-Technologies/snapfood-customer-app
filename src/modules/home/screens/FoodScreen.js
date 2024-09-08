import React, { useEffect, useState, useMemo } from 'react';
import {
	Image,
	InteractionManager,
	Share,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Text,
	View,
	StyleSheet,
	ImageBackground,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { width, height } from 'react-native-dimension';
import FastImage from 'react-native-fast-image';
import Gallery from 'react-native-image-gallery';
import { connect } from 'react-redux';
import { setTmpFood } from '../../../store/actions/app';
import { AddProduct2Cart, updateCartItems } from '../../../store/actions/shop';
import { toggleProductFavourite } from '../../../store/actions/vendors';
import ImageCarousel from '../../../common/components/image_carousel/Carousel';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import ImgGalleryModal from '../../../common/components/modals/ImgGalleryModal';
import Theme from '../../../theme';
import Config from '../../../config';
import RoundIconBtn from '../../../common/components/buttons/round_icon_button';
import RadioBtn from '../../../common/components/buttons/radiobtn';
import Counter from '../../../common/components/buttons/counter';
import MainBtn from '../../../common/components/buttons/main_button';
import CommentView from '../components/CommentView';
import RouteNames from '../../../routes/names';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { checkVendorOpen } from '../../../store/actions/vendors';
import { compareProductItems, isEmpty } from '../../../common/services/utility';
import PriceLabel from '../../../common/components/vendors/PriceLabel';
import ProductOptions from '../components/ProductOptions';
import { mixpanel } from '../../../AppRoot';

const FoodScreen = (props) => {

	const [isGalleryModal, ShowGalleryModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [addtions, setAddtions] = useState([]);
	const [options, setOptions] = useState([]);
	const [comments, setComments] = useState('');
	const [cartNum, setCartNum] = useState(1);

	const extraAdditions = useMemo(() => {
		if (props.tmpFoodData?.product_options && props.tmpFoodData?.product_options.length > 0) {
			return props.tmpFoodData?.product_options.filter(item => item.type == 'addition');
		}
		return [];
	}, [props.tmpFoodData?.product_options]);

	const extraOptions = useMemo(() => {
		if (props.tmpFoodData?.product_options && props.tmpFoodData?.product_options.length > 0) {
			return props.tmpFoodData?.product_options.filter(item => item.type == 'option');
		}
		return [];
	}, [props.tmpFoodData?.product_options]);

	useEffect(() => {
		return () => {
			console.log('FoodScreen screen unmount');
		};
	}, []);

	const onPressFav = () => {
		props
			.toggleProductFavourite(props.tmpFoodData.id, props.tmpFoodData.isFav == 1 ? 0 : 1)
			.then((res) => {
				props.setTmpFood({ ...props.tmpFoodData, isFav: props.tmpFoodData.isFav == 1 ? 0 : 1 });
			})
			.catch((error) => {
				console.log('onPressFav', error);
			});
	};

	const onShare = async () => {
		const shareOptions = {
			title: 'Snapfood Vendor',
			message:
				Platform.OS === 'android'
					? `https://snapfood.al/restaurant/${props.vendorData['hash_id']}/${props.vendorData['slug']}`
					: '',
			url: `https://snapfood.al/restaurant/${props.vendorData['hash_id']}/${props.vendorData['slug']}`,
			subject: 'Link for Snapfood',
		};
		await Share.share(shareOptions);
	};

	const onPressAddCart = () => {

		let items = props.cartItems.filter((i) => i.vendor_id != props.vendorData.id);
		if (items.length > 0) {
			checkVendorOpen(items[0].vendor_id)
				.then((is_open) => {
					if (is_open == true) {
						alerts
							.confirmation(
								translate('restaurant_details.new_order_question'),
								translate('restaurant_details.new_order_text'),
								translate('confirm'),
								translate('cancel')
							)
							.then(() => {
								onConfirmReset();
							});
					}
					else {
						onConfirmReset();
					}
				})
				.catch((error) => {
					onConfirmReset();
				})

		} else {
			if (cartNum <= 0) {
				// remove item from cart
				onRemoveItem();
			} else {
				onAddCart();
			}
		}
	};

	const validateRequiredOption = () => {
		if (props.tmpFoodData?.option_selected_required == 1 && options.length == 0) {
			return alerts.error(translate('attention'), translate('restaurant_details.option_is_required'));
		}
		return true;
	}

	const onConfirmReset = async () => {
		if (validateRequiredOption()) {
			let selectedOptions = [
				...addtions, ...options
			];

			let cartItem = {...props.tmpFoodData};
			cartItem.quantity = cartNum;
			cartItem.comments = comments;
			cartItem.options = selectedOptions;

			setLoading(true);
			await props.updateCartItems([cartItem]);
			setTimeout(() => {
				setLoading(false);
				props.navigation.goBack();
			}, 700);
		}
	};

	const onAddCart = () => {
		mixpanel.track('Cart Session Created')
		if (validateRequiredOption()) {
			let selectedOptions = [
				...addtions, ...options
			];

			let cartItem = {...props.tmpFoodData};
			cartItem.quantity = cartNum;
			cartItem.comments = comments;
			cartItem.options = selectedOptions;

			setLoading(true);
			props.AddProduct2Cart(cartItem);
			setTimeout(() => {
				setLoading(false);
				props.navigation.goBack();
			}, 700);
		}
	};

	const onRemoveItem = async () => {
		try {
			let tmp = props.cartItems.slice(0, props.cartItems.length);
			let foundIndex = tmp.findIndex((i) => compareProductItems(i, props.tmpFoodData));

			setLoading(true);
			if (foundIndex != -1) {
				tmp.splice(foundIndex, 1);
				await props.updateCartItems(tmp);
			}

			setTimeout(() => {
				setLoading(false);
				props.navigation.goBack();
			}, 700);
		} catch (error) {
			setLoading(false);
			console.log('onRemoveItem', error);
		}
	};

	const _renderHeader = () => {
		return (
			<View style={[Theme.styles.row_center, styles.header]}>
				<RoundIconBtn
					style={styles.headerBtn}
					icon={<Feather name='chevron-left' size={22} color={Theme.colors.text} />}
					onPress={() => {
						props.navigation.goBack();
					}}
				/>
				<View style={[Theme.styles.row_center_end, { flex: 1, alignItems: 'flex-end' }]}>
					<RoundIconBtn
						style={styles.headerBtn}
						icon={<Entypo name='share' size={20} color={Theme.colors.text} />}
						onPress={onShare}
					/>
					<RoundIconBtn
						style={{ width: 33, height: 33, borderRadius: 8, backgroundColor: '#fff', marginLeft: 6 }}
						icon={
							<Entypo
								name='heart'
								size={22}
								color={props.tmpFoodData.isFav == 1 ? Theme.colors.cyan2 : Theme.colors.gray5}
							/>
						}
						onPress={onPressFav}
					/>
				</View>
			</View>
		);
	};

	const _renderInfoView = () => {
		return (
			<View style={[Theme.styles.col_center_start, styles.infoView]}>
				<View style={[Theme.styles.row_center, { justifyContent: 'flex-start' }]}>
					<Text style={styles.title}>{props.tmpFoodData.title}</Text>
				</View>
				<Text style={styles.descTxt}>{props.tmpFoodData.description}</Text>
				<PriceLabel price={props.tmpFoodData.price} discount_price={props.tmpFoodData.discount_price} />
			</View>
		);
	};

	const _renderCartBtns = () => {
		return (
			<View style={[Theme.styles.row_center, styles.cartBtns]}>
				<Counter
					value={cartNum}
					onPlus={() => setCartNum(cartNum + 1)}
					onMinus={() => {
						let foundIndex = props.cartItems.findIndex((i) => i.id == props.tmpFoodData.id);
						if (foundIndex != -1) {
							// if edit ?
							setCartNum(cartNum > 0 ? cartNum - 1 : cartNum);
						} else {
							setCartNum(cartNum > 1 ? cartNum - 1 : cartNum);
						}
					}}
				/>
				<View style={[Theme.styles.row_center_end, { flex: 1, marginLeft: 20 }]}>
					<MainBtn
						disabled={(props.vendorData.is_open != 1 && props.vendorData.can_schedule != 1) || loading}
						loading={loading}
						title={translate('restaurant_details.add_to_cart')}
						style={{ width: '100%' }}
						onPress={onPressAddCart}
					/>
				</View>
			</View>
		);
	};

	const renderImage = () => {
		if (props.tmpFoodData.use_full_image == 1 && !isEmpty(props.tmpFoodData.new_image_path)) {
			return (
				<TouchableOpacity style={{ width: '100%', height: 270, }} onPress={() => { ShowGalleryModal(true) }}>
					<FastImage
						source={{ uri: `${Config.IMG_BASE_URL}${props.tmpFoodData.new_image_path}` }}
						style={[styles.img, { height: 270 }]}
						resizeMode={FastImage.resizeMode.cover}
					/>
				</TouchableOpacity>
			)
		}
		if (!isEmpty(props.tmpFoodData.image_path)) {
			return (
				<TouchableOpacity style={{ width: '100%', height: 190, }} onPress={() => { ShowGalleryModal(true) }}>
					<FastImage
						source={{ uri: `${Config.IMG_BASE_URL}${props.tmpFoodData.image_path}?w=600&h=600` }}
						style={[styles.img]}
						resizeMode={FastImage.resizeMode.cover}
					/>
				</TouchableOpacity>
			)
		}
		return <View style={{ height: 100 }} />;
	}

	const getModalImagePath = () => {
		if (props.tmpFoodData.use_full_image == 1 && !isEmpty(props.tmpFoodData.new_image_path)) {
			return `${Config.IMG_BASE_URL}${props.tmpFoodData.new_image_path}`
		}
		return `${Config.IMG_BASE_URL}${props.tmpFoodData.image_thumbnail_path}?w=600&h=600`
	}

	return (
		<React.Fragment>
			<KeyboardAwareScrollView style={[{ flex: 1, backgroundColor: '#fff' }]} keyboardShouldPersistTaps='handled'>
				<View style={[Theme.styles.col_center_start, Theme.styles.background, { padding: 0 }]}>
					{renderImage()}
					{
						<View style={{ padding: 20, width: '100%' }}>
							{_renderInfoView()}
							{
								extraAdditions.length > 0 &&
								<ProductOptions
									options={extraAdditions}
									type='addition'
									isMultiple={props.tmpFoodData?.addition_selected_type == 0}
									values={addtions}
									onSelect={(item) => {
										let index = addtions.findIndex(i => i.id == item.id);
										if (props.tmpFoodData?.addition_selected_type == 0) { // multiple
											if (index == -1) {
												setAddtions(pre => [...pre, item]);
											}
											else {
												let cpy = addtions.slice(0);
												cpy.splice(index, 1);
												setAddtions(cpy);
											}
										}
										else {
											if (index == -1) {
												setAddtions([item]);
											}
											else {
												setAddtions([]);
											}
										}
									}}
								/>
							}
							{
								extraOptions.length > 0 &&
								<ProductOptions
									options={extraOptions}
									type='option'
									isMultiple={props.tmpFoodData?.option_selected_type == 0}
									isRequired={props.tmpFoodData?.option_selected_required == 1}
									values={options}
									onSelect={(item) => {
										let index = options.findIndex(i => i.id == item.id);
										if (props.tmpFoodData?.option_selected_type == 0) { // multiple
											if (index == -1) {
												setOptions(pre => [...pre, item]);
											}
											else {
												let cpy = options.slice(0);
												cpy.splice(index, 1);
												setOptions(cpy);
											}
										}
										else {
											if (index == -1) {
												setOptions([item]);
											}
											else {
												setOptions([]);
											}
										}
									}}
								/>
							}
							<View style={{ height: 12 }} />
							<CommentView
								title={translate('restaurant_details.additional_note')}
								placeholder={translate('restaurant_details.add_additional_note')}
								comments={comments}
								onChangeText={(text) => setComments(text)}
							/>
							{_renderCartBtns()}
						</View>
					}
					{_renderHeader()}
				</View>
			</KeyboardAwareScrollView>
			<ImgGalleryModal
				index={0}
				images={[{
					source: {
						uri: getModalImagePath()
					}
				}
				]}
				showModal={isGalleryModal}
				onClose={() => ShowGalleryModal(false)}
			/>
		</React.Fragment>
	);
};

const styles = StyleSheet.create({
	header: {
		position: 'absolute',
		top: 40,
		left: 20,
		right: 20,
		height: 50,
		width: width(100) - 40,
		alignItems: 'flex-end',
	},
	headerBtn: { width: 33, height: 33, borderRadius: 8, backgroundColor: Theme.colors.white },
	title: { fontSize: 19, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	descTxt: {
		marginTop: 8,
		marginBottom: 8,
		lineHeight: 14,
		textAlign: 'left',
		fontSize: 16,
		fontFamily: Theme.fonts.medium,
		color: Theme.colors.gray7,
	},
	divider: { width: '100%', height: 1, backgroundColor: '#F6F6F9' },
	infoView: {
		width: '100%',
		alignItems: 'flex-start',
		paddingBottom: 20,
		backgroundColor: Theme.colors.white,
		borderBottomWidth: 1,
		borderBottomColor: '#F6F6F9',
	},
	subTitle: {
		marginTop: 24,
		marginBottom: 12,
		fontSize: 17,
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.text,
	},
	optionItem: { height: 40, width: '100%' },
	optionTxt: { flex: 1, fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
	commentView: { width: '100%', alignItems: 'flex-start' },
	commentInput: {
		maxHeight: '90%',
		width: '100%',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Theme.colors.gray6,
		textAlignVertical: 'top',
		padding: 16,
		fontSize: 14,
		fontFamily: Theme.fonts.medium,
		color: Theme.colors.text,
	},
	cartBtns: { width: '100%', marginTop: 12, marginBottom: 40 },
	img: { width: '100%', height: 190, resizeMode: 'cover' },
	age18: { marginLeft: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: Theme.colors.red1 },
	age18txt: { fontSize: 12, lineHeight: 14, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white, }
});

const mapStateToProps = ({ app, shop }) => ({
	tmpFoodData: app.tmpFoodData,
	cartItems: shop.items,
	vendorData: shop.vendorData,
});

export default connect(mapStateToProps, {
	AddProduct2Cart,
	setTmpFood,
	toggleProductFavourite,
	updateCartItems,
})(FoodScreen);
