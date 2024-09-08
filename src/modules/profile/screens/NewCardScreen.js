import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { width } from 'react-native-dimension';
import { connect } from 'react-redux';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import MainBtn from '../../../common/components/buttons/main_button';
import AuthInput from '../../../common/components/AuthInput';
import Header1 from '../../../common/components/Header1';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import { updateProfileDetails } from '../../../store/actions/auth';
// svgs
import Svg_cardbg from '../../../common/assets/svgs/card_bg.svg';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const NewCardScreen = (props) => {
	const [loading, setLoading] = useState(false);

	const [name, setName] = useState('');
	const [card_num, setCardNum] = useState('');
	const [cvv, setCvv] = useState('');
	const [expiry_month, setExpiryMonth] = useState('');
	const [expiry_year, setExpiryYear] = useState('');
	const [expiry_date, setExpiryDate] = useState('');

	useEffect(() => {
		if(expiry_year.length > 0){
			setExpiryDate(expiry_month + '/' + expiry_year)	
		}else{
			setExpiryDate(expiry_month)
		}
	}, [expiry_month, expiry_year]);
	
	const inputExpiry = (value) => {
		value = value.replace('/', '');
		if (value.length > 4) {
			return;
		}
		setExpiryMonth(value.slice(0, 2));
		setExpiryYear(value.slice(2, 4));
	};

	const formatCardNum = (num) => {
		let formatted = '';
		for (var i = 0; i < num.length; i++) {
			if (i != 0 && i % 4 == 0) {
				formatted = formatted + ' ';
			}
			formatted = formatted + num[i];
		}
		return formatted;
	};

	const unformatCardNum = (num) => {
		let unformatted = '';
		for (var i = 0; i < num.length; i++) {
			if (num[i] != ' ') {
				unformatted = unformatted + num[i];
			}
		}
		return unformatted;
	};

	const _renderCard = () => {
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView, { padding: 20 }]}>
				<View style={styles.cardview}>
					<Svg_cardbg style={styles.cardBg} width={width(100) - 40} height={width(50) - 20} />
					<View style={[Theme.styles.col_center, styles.cardInfo]}>
						<Text style={[Theme.styles.flex_1, styles.name]}>{name}</Text>
						<Text style={[Theme.styles.flex_1, styles.card]}>{formatCardNum(card_num)}</Text>
						<View style={[Theme.styles.row_center, { width: '100%', marginTop: 14 }]}>
							<Text style={styles.cvv}>CVV: {cvv}</Text>
							<Text style={styles.cvv}>
								{translate('card.expiry')}:{' '}
								{expiry_date}
							</Text>
						</View>
					</View>
				</View>
			</View>
		);
	};

	const _renderForm = () => {
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView]}>
				<AuthInput
					keyboardType='decimal-pad'
					value={card_num}
					onChangeText={(val) => {
						if (val.length <= 16) {
							setCardNum(val);
						}
					}}
					placeholder={translate('card.number')}
					style={styles.marginB20}
				/>
				<AuthInput
					value={name}
					onChangeText={(val) => setName(val)}
					placeholder={translate('card.cardholder_name')}
					style={styles.marginB20}
				/>
				<View style={[Theme.styles.row_center, styles.marginB20]}>
					<View style={{ flex: 1 }}>
						<AuthInput
							keyboardType='decimal-pad'
							value={expiry_date}
							onChangeText={inputExpiry}
							placeholderTextColor={'#9F9494'}
                        	selectionColor={Theme.colors.cyan2}
							placeholder={translate('card.expiry_date')}
						/>
					</View>
					<View style={{ width: 20 }} />
					<View style={{ flex: 1 }}>
						<AuthInput
							keyboardType='decimal-pad'
							value={cvv}
							onChangeText={(val) => {
								if (val.length <= 3) {
									setCvv(val);
								}
							}}
							placeholder='CVV'
						/>
					</View>
				</View>
			</View>
		);
	};

	const validateCard = () => {
		if (name == '') {
			alerts.error(translate('alerts.error'), translate('card.wrong_name'));
			return false;
		}
		if (card_num.length != 16) {
			alerts.error(translate('alerts.error'), translate('card.wrong_number'));
			return false;
		}
		if (cvv.length != 3) {
			alerts.error(translate('alerts.error'), translate('card.wrong_cvv'));
			return false;
		}

		let year = parseInt(expiry_year);
		let month = parseInt(expiry_month);

		let this_year = new Date().getFullYear() - 2000;
		let this_month = new Date().getMonth() + 1;

		if (year < this_year || month <= 0 || month > 12) {
			console.log(this_year, year);
			alerts.error(translate('alerts.error'), translate('card.wrong_expiry_date'));
			return false;
		}
		if (year == this_year && month < this_month) {
			console.log(month, this_month);
			alerts.error(translate('alerts.error'), translate('card.wrong_expiry_date'));
			return false;
		}
		return true;
	};

	const changePrimary = async (card) => {
		try {
			await props.updateProfileDetails({
				default_card_id: card.id,
			});
			setLoading(false);
			props.navigation.goBack();
		} catch (error) {
			setLoading(false);
			console.log('change card Primary', error);
			// alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
			props.navigation.goBack();
		}
	};

	const onSaveCard = () => {
		if (validateCard() == false) {
			return;
		}
		setLoading(true);
		apiFactory
			.post(`stripe/payment-methods/create`, {
				name: name,
				number: card_num,
				cvc: cvv,
				exp_month: expiry_month,
				exp_year: expiry_year,
			})
			.then(
				({ data }) => {
					console.log('onSaveCard', data.payment_method);
					changePrimary(data.payment_method);
				},
				(error) => {
					setLoading(false);
					console.log('onSaveCard error', error);
					const message = error.message || translate('generic_error');
					alerts.error(translate('alerts.error'), message);
				}
			);
	};

	return (
		<View style={styles.container}>
			<View style={styles.formView}>
				{_renderCard()}
				<KeyboardAwareScrollView style={[{ flex: 1, width: '100%', paddingHorizontal: 20 }]} keyboardShouldPersistTaps='handled'>
					{_renderForm()}
				</KeyboardAwareScrollView>
				<View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 40 }}>
					<MainBtn
						disabled={
							loading ||
							name == '' ||
							card_num == '' ||
							cvv == '' ||
							expiry_month == '' ||
							expiry_year == ''
						}
						loading={loading}
						title={translate('card.save_card')}
						onPress={onSaveCard}
					/>
				</View>
			</View>
			<Header1
				style={styles.header}
				onLeft={() => {
					props.navigation.goBack();
				}}
				title={translate('payment_method.new_card')}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		backgroundColor: Theme.colors.white,
	},
	header: { position: 'absolute', top: 0, left: 0, height: 80, justifyContent: 'flex-end', paddingHorizontal: 20 },
	formView: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '100%',
		marginTop: 80,
	},
	marginB20: { marginBottom: 20 }, 
	sectionView: { width: '100%', alignItems: 'flex-start' },
	cardview: { width: width(100) - 40, height: width(50) - 20 },
	cardBg: { position: 'absolute', top: 0, left: 0 },
	cardInfo: {
		width: width(100) - 40,
		height: width(50) - 20,
		padding: 20,
		justifyContent: 'space-between',
		alignItems: 'flex-start',
	},
	name: {
		width: '100%',
		textAlign: 'left',
		marginBottom: 14,
		fontSize: 15,
		color: Theme.colors.white,
		fontFamily: Theme.fonts.semiBold,
	},
	// cardInput: {borderColor: Theme.colors.placeholder},
	card: {
		width: '100%',
		textAlign: 'left',
		fontSize: 21,
		color: Theme.colors.white,
		fontFamily: Theme.fonts.semiBold,
	},
	cvv: { flex: 1, fontSize: 15, color: Theme.colors.white, fontFamily: Theme.fonts.medium },
});

const mapStateToProps = ({ app }) => ({});

export default connect(mapStateToProps, {
	updateProfileDetails,
})(NewCardScreen);
