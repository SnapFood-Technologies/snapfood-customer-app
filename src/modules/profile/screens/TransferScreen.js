import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { width } from 'react-native-dimension';
import { connect } from 'react-redux';
import CurrencyInput from 'react-native-currency-input';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import MainBtn from '../../../common/components/buttons/main_button';
import AuthInput from '../../../common/components/AuthInput';
import Header1 from '../../../common/components/Header1';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import RouteNames from '../../../routes/names';
import { setBalanceTransferPickedUser } from '../../../store/actions/app';
// svgs
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AppText, DotBorderButton } from '../../../common/components';
import CommentInput from '../../orders/components/CommentInput';

const TransferScreen = (props) => {
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState('');
	const [message, setMessage] = useState('');

	useEffect(() => {
		props.setBalanceTransferPickedUser(null);
	}, [])

	const onTransfer = () => {
		if (amount > 0) { }
		else {
			return alerts.error(translate('alerts.error'), translate('transfer_balance.enter_amount'));
		}
		if (amount > props.user.cashback_amount) {
			return alerts.error(translate('alerts.error'), translate('transfer_balance.not_enough_balance'));
		}

		if (props.balanceTransferPickedUser == null) {
			return alerts.error(translate('alerts.error'), translate('transfer_balance.select_recipient'));
		}
		setLoading(true);
		apiFactory
			.post(`transfer-balance`, {
				amount: amount,
				recipient_id: props.balanceTransferPickedUser.id,
				comment: message
			})
			.then(
				({ data }) => {
					setLoading(false);
					props.navigation.goBack();
					props.navigation.navigate(RouteNames.DepositSuccessScreen, { isTransfer: true, balance: data.balance, amount: amount })
				},
				(error) => {
					setLoading(false);
					console.log('onTransfer error', error);
					const message = error.message || translate('generic_error');
					alerts.error(translate('alerts.error'), message);
				}
			);
	};

	return (
		<View style={styles.container}>
			<Header1
				style={styles.header}
				title={translate('transfer_balance.title')}
				left={<View />}
				right={<AppText style={styles.cancel}>{translate('cancel')}</AppText>}
				onRight={() => {
					props.navigation.goBack();
				}}
			/>
			<KeyboardAwareScrollView style={[{ flex: 1, width: '100%', paddingHorizontal: 20 }]} keyboardShouldPersistTaps='handled'>
				<View style={[Theme.styles.col_center, { width: '100%' }]}>
					<View style={[Theme.styles.col_center, { width: '100%' }]}>
						<AppText style={styles.enterAmountTxt}>{translate('transfer_balance.enter_amount')}</AppText>
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
									console.log(formattedValue); // $2,310.46
								}}
							/>
						</View>
					</View>
					<AppText style={[styles.enterAmountTxt, { marginTop: 40, marginBottom: 20 }]}>{translate('transfer_balance.recipient')}</AppText>
					<DotBorderButton
						style={{ width: '100%' }}
						title={props.balanceTransferPickedUser == null ? translate('transfer_balance.select_recipient') :
							(props.balanceTransferPickedUser.username || props.balanceTransferPickedUser.full_name)
						}
						onPress={() => {
							props.navigation.navigate(RouteNames.PickFriendsScreen)
						}}
					/>
					<CommentInput
						placeholder={translate('transfer_balance.transfer_msg')}
						comments={message}
						height={120}
						onChangeText={(text) => {
							setMessage(text);
						}}
						style={{ marginVertical: 20 }}
					/>
				</View>
			</KeyboardAwareScrollView>
			<View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 40 }}>
				<MainBtn
					loading={loading}
					title={translate('transfer_balance.transfer')}
					onPress={onTransfer}
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
	enterAmountTxt: { marginTop: 15, fontSize: 16, color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold },
	amountInput: { fontSize: 40, fontFamily: Theme.fonts.bold, color: Theme.colors.black },
});

const mapStateToProps = ({ app }) => ({
	user: app.user || {},
	balanceTransferPickedUser: app.balanceTransferPickedUser
});

export default connect(mapStateToProps, {
	setBalanceTransferPickedUser
})(TransferScreen);
