import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { width } from 'react-native-dimension';
import { connect } from 'react-redux';
import CurrencyInput from 'react-native-currency-input';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import MainBtn from '../../../common/components/buttons/main_button';
import AuthInput from '../../../common/components/AuthInput';
import Header1 from '../../../common/components/Header1';
import CardItem from '../../../common/components/CardItem';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import { updateProfileDetails } from '../../../store/actions/auth';
import RouteNames from '../../../routes/names';
// svgs
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AppText, DotBorderButton } from '../../../common/components';

const DepositCardScreen = (props) => {
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState('');
	const [cards, setCards] = useState([])

	useEffect(() => {
		const focusListener = props.navigation.addListener('focus', () => {
			loadPaymentMethods()
		});

		return focusListener; // remove focus listener when it is unmounted
	}, [props.navigation]);

	const loadPaymentMethods = () => {
		apiFactory.get(`stripe/payment-methods`)
			.then(({ data }) => {
				setCards(data || []);
			},
				(error) => {
					
				});
	}

	const changePrimary = async (card) => {
		try {
			await props.updateProfileDetails({
				default_card_id: card.id
			})
		}
		catch (error) {
			
			alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
		}
	}

	const onDeposit = () => {
		if (amount > 0) { }
		else {
			return alerts.error(translate('alerts.error'), translate('deposit_card.enter_amount'));
		}
		if (amount < 60) {
			return alerts.error(translate('alerts.error'), translate('deposit_card.enter_60_lek'));
		}
		setLoading(true);
		apiFactory
			.post(`deposit-from-saved-card`, {
				amount: amount,
				card_id: props.user.default_card_id
			})
			.then(({ data }) => {
				setLoading(false);
				props.navigation.goBack();
				props.navigation.navigate(RouteNames.DepositSuccessScreen, { isTransfer: false, balance: data.balance, amount: amount })
			})
			.catch((error) => {
				setLoading(false);
				
				const message = error.message || translate('generic_error');
				alerts.error(translate('alerts.error'), message);
			})
	};

	return (
		<View style={styles.container}>
			<Header1
				style={styles.header}
				title={translate('deposit_card.title')}
				left={<View />}
				right={<AppText style={styles.cancel}>{translate('cancel')}</AppText>}
				onRight={() => {
					props.navigation.goBack();
				}}
			/>
			<View style={[Theme.styles.col_center, { width: '100%' }]}>
				<AppText style={styles.enterAmountTxt}>{translate('deposit_card.enter_amount')}</AppText>
				<View style={[Theme.styles.row_center, { width: '100%', marginTop: 8 }]}>
					<CurrencyInput
						value={amount}
						onChangeValue={setAmount}
						placeholder='0L'
						placeholderTextColor={Theme.colors.black}
						underlineColorAndroid='transparent'
						style={[styles.amountInput]}
						suffix="L"
						delimiter=','
						precision={0}
						onChangeText={(formattedValue) => {
							
						}}
					/>
				</View>
			</View>
			<KeyboardAwareScrollView style={[{ flex: 1, width: '100%', marginTop: 15, paddingHorizontal: 20 }]} keyboardShouldPersistTaps='never'>
				<View style={[Theme.styles.col_center, { width: '100%' }]}>
					{
						cards.map((item, index) =>
							<CardItem
								key={index}
								data={item}
								editable={false}
								checked={props.user.default_card_id == item.id}
								onSelect={changePrimary}
							/>
						)
					}
					<DotBorderButton
						title={translate('payment_method.add_new_card')}
						style={{ width: 200, marginTop: (cards.length == 0 ? 60 : 0) }}
						onPress={() => {
							props.navigation.navigate(RouteNames.NewCardScreen)
						}}
					/>
					<View style={{ height: 30, }} />
				</View>
			</KeyboardAwareScrollView>
			<View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 40 }}>
				<MainBtn
					disabled={
						loading || props.user.default_card_id == null
					}
					loading={loading}
					title={translate('deposit_card.deposit')}
					onPress={onDeposit}
				/>
			</View>
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
	header: { height: 80, justifyContent: 'flex-end', paddingHorizontal: 20 },
	cancel: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },
	marginB20: { marginBottom: 20 },
	sectionView: { width: '100%', alignItems: 'flex-start', marginTop: 30, },
	enterAmountTxt: { marginTop: 5, fontSize: 16, color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold },
	amountInput: { fontSize: 40, fontFamily: Theme.fonts.bold, color: Theme.colors.black },
});

const mapStateToProps = ({ app }) => ({
	user: app.user,
});

export default connect(mapStateToProps, {
	updateProfileDetails,
})(DepositCardScreen);
