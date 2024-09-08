import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Keyboard
} from 'react-native';
import StarRating from 'react-native-star-rating';
import { connect } from 'react-redux';
import { setTmpOrder } from '../../../store/actions/app';
import { getOrderDetail } from '../../../store/actions/orders';
import { extractErrorMessage, openExternalUrl } from '../../../common/services/utility';
import { translate } from '../../../common/services/translate';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import Theme from '../../../theme';
import MainBtn from '../../../common/components/buttons/main_button';
import ButtonCheckbox from '../../../common/components/buttons/button_chbox';
import Header1 from '../../../common/components/Header1';
import CommentInput from '../components/CommentInput';
// svgs
import Svg_restaurant from '../../../common/assets/svgs/rate_restaurant.svg';
import Svg_dishes from '../../../common/assets/svgs/rate_dishes.svg';
import Svg_rider from '../../../common/assets/svgs/rate_rider.svg';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const OrderReviewScreen = (props) => {
	const [hideBtn, setHideBtn] = useState(false);
	const [loading, setLoading] = useState(false);
	const [rate_restaurant, setRateRestaurant] = useState({});
	const [rate_dishes, setRateDishes] = useState({});
	const [rate_rider, setRateRider] = useState({});

	useEffect(() => {
		Keyboard.addListener('keyboardDidShow', onKeyboardDidShow);
		Keyboard.addListener('keyboardDidHide', onKeyboardDidHide);

		return () => {
			Keyboard.removeListener('keyboardDidShow', onKeyboardDidShow);
			Keyboard.removeListener('keyboardDidHide', onKeyboardDidHide);
		};
	}, [])

	const onKeyboardDidShow = () => {
		setHideBtn(true);
	}
	const onKeyboardDidHide = () => {
		setHideBtn(false);
	}

	const rates = [
		{
			icon: <Svg_restaurant />,
			type: 'restaurant',
			question: translate('order_review.rate_restaurant'),
			options: [
				translate('order_review.great_menu'),
				translate('order_review.reasonable_price'),
				translate('order_review.good_service'),
			],
		},
		{
			icon: <Svg_dishes />,
			type: 'dish',
			question: translate('order_review.rate_dish'),
			options: [
				translate('order_review.great_dish'),
				translate('order_review.tasty'),
				translate('order_review.perfectly_cooked'),
			],
		},
		{
			icon: <Svg_rider />,
			type: 'rider',
			question: translate('order_review.rate_rider'),
			options: [
				translate('order_review.fast_accurate'),
				translate('order_review.hot_meal'),
				translate('order_review.friendly_handover'),
			],
		},
	];

	const getCategTxt = (options) => {
		let txt = '';
		options.slice(0, options.length - 1).map((i) => {
			txt = txt + i + ',';
		});
		txt = txt + options[options.length - 1];
		return txt;
	};
	const onSubmitReview = () => {
		if (rate_restaurant.rating == null) {
			return alerts.error(translate('attention'), translate('order_review.add_restaurant_rating'));
		}
		if (rate_dishes.rating == null) {
			return alerts.error(translate('attention'), translate('order_review.add_dishes_rating'));
		}
		if (rate_rider.rating == null) {
			return alerts.error(translate('attention'), translate('order_review.add_courier_rating'));
		}

		let order_review = {
			vendor_rating: rate_restaurant.rating,
			dish_rating: rate_dishes.rating,
			rider_rating: rate_rider.rating,

			vendor_categ: getCategTxt(rate_restaurant.options || []),
			dish_categ: getCategTxt(rate_dishes.options || []),
			rider_categ: getCategTxt(rate_rider.options || []),

			vendor_comment: rate_restaurant.comment,
			dish_comment: rate_dishes.comment,
			rider_comment: rate_rider.comment,

			customer_name: props.user.username || props.user.full_name,
		};

		setLoading(true);
		apiFactory.post(`orders/${props.order.id}/review`, order_review).then(
			() => {
				getOrderDetail(props.order.id)
					.then((order_data) => {
						setLoading(false);
						props.setTmpOrder(order_data);
						alerts.info('', translate('order_review.review_success')).then((res) => {
							props.navigation.goBack();
						});
					})
					.catch((error) => {
						setLoading(false);
						console.log('getOrderDetail', error);
					});
			},
			(error) => {
				setLoading(false);
				console.log('getOrderDetail', error);
				alerts.error(translate('restaurant_details.we_are_sorry'), translate('checkout.something_is_wrong'));
			}
		);
	};

	const renderRateComp = (data, index) => {
		const ratingValue = () => {
			if (data.type == 'restaurant') {
				return rate_restaurant.rating || 0;
			} else if (data.type == 'dish') {
				return rate_dishes.rating || 0;
			} else {
				return rate_rider.rating || 0;
			}
		};
		const isCheckedOption = (option) => {
			let options = [];
			if (data.type == 'restaurant') {
				options = rate_restaurant.options;
			} else if (data.type == 'dish') {
				options = rate_dishes.options;
			} else {
				options = rate_rider.options;
			}
			options = options || [];

			let found_index = options.findIndex((i) => i == option);
			if (found_index == -1) {
				return false;
			}
			return true;
		};
		const commentVal = () => {
			if (data.type == 'restaurant') {
				return rate_restaurant.comment || '';
			} else if (data.type == 'dish') {
				return rate_dishes.comment || '';
			} else {
				return rate_rider.comment || '';
			}
		};

		return (
			<View
				key={index}
				style={[
					Theme.styles.col_center,
					{
						width: '100%',
						paddingTop: 20,
						paddingBottom: 10,
						borderBottomWidth: 1,
						borderBottomColor: Theme.colors.gray9,
					},
				]}
			>
				<View style={[Theme.styles.row_center, { width: '100%', marginBottom: 20 }]}>
					{data.icon}
					<View style={[Theme.styles.col_center, { alignItems: 'flex-start', flex: 1, marginLeft: 12 }]}>
						<Text style={styles.question}>{data.question}</Text>
						<StarRating
							disabled={false}
							maxStars={5}
							rating={ratingValue()}
							// containerStyle={{ width: '100%', }}
							starStyle={{ marginRight: 6 }}
							starSize={18}
							fullStarColor={Theme.colors.red1}
							emptyStar={'star'}
							emptyStarColor={Theme.colors.gray7}
							// starStyle = {{color : '#FFBF13'}}
							selectedStar={(rating) => {
								if (data.type == 'restaurant') {
									setRateRestaurant({
										...rate_restaurant,
										rating: rating,
									});
								} else if (data.type == 'dish') {
									setRateDishes({
										...rate_dishes,
										rating: rating,
									});
								} else {
									setRateRider({
										...rate_rider,
										rating: rating,
									});
								}
							}}
						/>
					</View>
				</View>
				<View style={[Theme.styles.row_center_start, { width: '100%', flexWrap: 'wrap', marginBottom: 12 }]}>
					{data.options.map((item, index) => (
						<ButtonCheckbox
							key={index}
							onSelect={(name) => {
								let options = [];
								if (data.type == 'restaurant') {
									options = rate_restaurant.options;
								} else if (data.type == 'dish') {
									options = rate_dishes.options;
								} else {
									options = rate_rider.options;
								}
								options = options || [];

								let tmp = options.slice(0, options.length);
								let found_index = tmp.findIndex((i) => i == name);
								if (found_index == -1) {
									tmp.push(name);
								} else {
									tmp.splice(found_index, 1);
								}

								if (data.type == 'restaurant') {
									setRateRestaurant({
										...rate_restaurant,
										options: tmp,
									});
								} else if (data.type == 'dish') {
									setRateDishes({
										...rate_dishes,
										options: tmp,
									});
								} else {
									setRateRider({
										...rate_rider,
										options: tmp,
									});
								}
							}}
							style={{ marginRight: 6, marginBottom: 6 }}
							name={item}
							isChecked={isCheckedOption(item)}
						/>
					))}
				</View>
				<CommentInput
					placeholder={
						data.type == 'restaurant'
							? translate('order_review.restaurant_comment')
							: data.type == 'dish'
								? translate('order_review.dishes_comment')
								: translate('order_review.rider_comment')
					}
					comments={commentVal()}
					onChangeText={(comment) => {
						if (data.type == 'restaurant') {
							setRateRestaurant({
								...rate_restaurant,
								comment,
							});
						} else if (data.type == 'dish') {
							setRateDishes({
								...rate_dishes,
								comment,
							});
						} else {
							setRateRider({
								...rate_rider,
								comment,
							});
						}
					}}
				/>
			</View>
		);
	};
	return (
		<View style={styles.container}>
			<Header1
				style={{ marginBottom: 0, paddingHorizontal: 20 }}
				onLeft={() => {
					props.navigation.goBack();
				}}
				title={translate('order_review.review_order')}
			/>
			<View style={styles.formView}>
				<KeyboardAwareScrollView
					style={{ flex: 1, width: '100%', paddingHorizontal: 20 }}
					extraScrollHeight={12}
					keyboardShouldPersistTaps='handled'
				>
					{rates.map((rate_input, index) => renderRateComp(rate_input, index))}
				</KeyboardAwareScrollView>
				{
					!hideBtn &&
					<View style={[{ width: '100%', paddingHorizontal: 20, paddingBottom: 40 }]}>
						<MainBtn
							disabled={loading}
							loading={loading}
							title={translate('order_review.submit_review')}
							onPress={onSubmitReview}
						/>
					</View>
				}

			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 20,
		flexDirection: 'column',
		alignItems: 'center',
		backgroundColor: '#ffffff',
	},
	formView: {
		flex: 1,
		marginTop: 12,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '100%',
	},
	question: { marginBottom: 12, fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9 },
});

const mapStateToProps = ({ app }) => ({
	order: app.tmp_order,
	user: app.user,
});

export default connect(mapStateToProps, {
	setTmpOrder,
})(OrderReviewScreen);
