import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux'
import Theme from '../../../theme';
import RouteNames from '../../../routes/names';
import apiFactory from '../../../common/services/apiFactory';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import { updateProfileDetails } from '../../../store/actions/auth';
import MainBtn from '../../../common/components/buttons/main_button';
import Header1 from '../../../common/components/Header1';
import CardItem from '../../../common/components/CardItem';
import NoPaymentMethods from '../components/NoPaymentMethods';
import ConfirmModal from '../../../common/components/modals/ConfirmModal'

const PaymentMethodsScreen = (props) => {
	const goBackAfterSuccess = props.route?.params?.goBackAfterSuccess == true;
	const _isMounted = useRef(true);

	const [loading, setLoading] = useState(null);
	const [cards, setCards] = useState([])

	const [isConfirmModal, ShowConfirmModal] = useState(false);
	const [selectedCard, setSelectedCard] = useState(null);

	useEffect(() => {
		return () => {
			console.log("PaymentMethods screen unmount")
			_isMounted.current = false;
		};
	}, [])
	useEffect(() => {
		const focusListener = props.navigation.addListener('focus', () => {
			loadPaymentMethods()
		});

		return focusListener; // remove focus listener when it is unmounted
	}, [props.navigation]);

	const loadPaymentMethods = () => {
		setLoading(true);
		apiFactory.get(`stripe/payment-methods`)
			.then(({ data }) => {
				if (_isMounted.current == true) {
					setCards(data || []);
					setLoading(false);
				}
			},
				(error) => {
					if (_isMounted.current == true) {
						setLoading(false);
						console.log('load Payment Methods error', error)
					}
				});
	}

	const changePrimary = async (card) => {
		try {
			await props.updateProfileDetails({
				default_card_id: card.id
			})
			if (goBackAfterSuccess) {
				props.navigation.goBack()
			}
		}
		catch (error) {
			console.log('on changePrimary', error)
			alerts.error(translate('alerts.error'), translate('checkout.something_is_wrong'));
		}
	}

	const deleteCard = () => {
		if (selectedCard == null) { return; }
		ShowConfirmModal(false);
		apiFactory.delete(`stripe/payment-methods/${selectedCard.id}`)
			.then(({ data }) => {
				if (data.success == 1) {
					if (_isMounted.current == true) {
						loadPaymentMethods()
					}
				}
			},
				(error) => {
					if (_isMounted.current == true) {
						console.log('deleteCard error', error)
						const message = error.message || translate('generic_error');
						alerts.error(translate('alerts.error'), message);
					}
				});
	}

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			<Header1
				style={{ marginTop: 10, marginBottom: 10, paddingHorizontal: 20 }}
				onLeft={() => { props.navigation.goBack() }}
				title={translate('payment_method.title')}
			/>
			{
				(loading == false && cards.length == 0) ?
					<NoPaymentMethods />
					:
					<ScrollView style={styles.scrollview}>
						{
							cards.map((item, index) =>
								<CardItem
									key={index}
									data={item}
									checked={props.user.default_card_id == item.id}
									onSelect={changePrimary}
									onDelete={() => {
										ShowConfirmModal(true);
										setSelectedCard(item);
									}}
								/>
							)
						}
						<View style={{ height: 20, }} />
					</ScrollView>
			}
			<View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 40 }}>
				<MainBtn
					title={translate('payment_method.add_new_card')}
					onPress={() => {
						props.navigation.navigate(RouteNames.NewCardScreen)
					}}
				/>
			</View>
			<ConfirmModal showModal={isConfirmModal}
				title={translate('payment_method.confirm_del_card')}
				yes={translate('payment_method.confirm_del_card_yes')} no={translate('payment_method.confirm_del_card_no')}
				onYes={deleteCard}
				onClose={() => ShowConfirmModal(false)} />
		</View>
	);
}

const styles = StyleSheet.create({
	scrollview: { flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: Theme.colors.white },
	categList: { marginTop: 16, },
	scrollviewHider: { width: '100%', marginTop: -12, height: 15, backgroundColor: Theme.colors.white },
})


const mapStateToProps = ({ app }) => ({
	user: app.user,
});

export default connect(mapStateToProps, {
	updateProfileDetails,
})(PaymentMethodsScreen);
