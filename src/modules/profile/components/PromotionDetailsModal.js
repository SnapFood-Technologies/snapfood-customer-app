import React from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from '../../../common/components/AppText';
import Theme from '../../../theme';
import { appMoment, translate } from '../../../common/services/translate';

const { width, height } = Dimensions.get('window');
const WIDTH = width - 20;
const MODAL_HEIGHT = height * 0.85;

class PromotionDetailsModal extends React.PureComponent {
	render() {
		const { isActive, promotion, setRef, onClose } = this.props;
		const isCoupon = promotion.type === 'coupon';

		return (
			<RBSheet
				hasScrollView={true}
				onClose={() => {
					if (onClose) {
						onClose();
					}
				}}
				height={100}
				closeOnDragDown={true}
				duration={300}
				customStyles={{
					container: styles.modalContainer,
				}}
				ref={(ref) => {
					this.modal = ref;
					setRef(ref);
				}}
			>
				<ScrollView>
					<View
						style={[styles.contentContainer]}
						onLayout={(event) =>
							this.modal.setHeight(Math.min(event.nativeEvent.layout.height + 25, MODAL_HEIGHT))
						}
					>
						<AppText style={styles.title}>{promotion.title}</AppText>
						<AppText style={styles.header}>{translate('promotions.details')}</AppText>
						<AppText style={styles.description}>{promotion.description}</AppText>
						{promotion.active_vendors && (
							<View>
								<AppText style={styles.header}>{translate('promotions.vendors')}</AppText>
								{promotion['promotion_details']['all_vendors'] ? (
									<AppText>{translate('promotions.all_vendors')}</AppText>
								) : (
									<AppText>{promotion.active_vendors.map((x) => x.title).join(', ')}</AppText>
								)}
							</View>
						)}
						{!isActive && promotion.vendors && (
							<View>
								<AppText style={styles.header}>{translate('promotions.used_vendors')}</AppText>
								<AppText>{promotion.vendors.map((x) => x.title).join(', ')}</AppText>
							</View>
						)}
						{!isCoupon && isActive && !!promotion['promotion_details'] && (
							<View>
								<AppText style={styles.header}>
									{translate('promotions.when_can_be_used.title')}
								</AppText>
								<AppText style={styles.expiration}>
									{translate(
										`promotions.when_can_be_used.${promotion['promotion_details']['appliance']}`
									)}
								</AppText>
							</View>
						)}
						{isCoupon && isActive && !!promotion['promotion_details'] && (
							<View>
								<AppText style={styles.header}>
									{translate('promotions.how_many_times_can_be_used.title')}
								</AppText>
								<AppText style={styles.expiration}>
									{translate(
										promotion['promotion_details']['appliance'] === 0
											? `promotions.how_many_times_can_be_used.${promotion['promotion_details']['appliance']}`
											: promotion['promotion_details']['appliance'] === 1
											? `promotions.how_many_times_can_be_used.once`
											: `promotions.how_many_times_can_be_used.more_then_once`,
										{
											times: promotion['promotion_details']['appliance'],
										}
									)}
								</AppText>
							</View>
						)}
						<AppText style={styles.header}>{translate('promotions.expiration')}</AppText>
						<AppText style={styles.expiration}>
							{appMoment(promotion['end_time']).format('DD MMMM YYYY')}
						</AppText>
						<TouchableOpacity onPress={() => this.modal.close()} style={styles.action}>
							<AppText style={styles.actionText}>OK</AppText>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</RBSheet>
		);
	}
}

const styles = StyleSheet.create({
	modalContainer: {
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		alignItems: 'center',
	},
	contentContainer: {
		padding: 10,
		width: WIDTH,
	},
	title: {
		fontSize: 21,
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Bold',
	},
	header: {
		fontSize: 16,
		marginTop: 15,
		marginBottom: 5,
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-SemiBold',
	},
	description: {
		fontSize: 14,
		color: Theme.colors.text,
		fontFamily: 'SanFranciscoDisplay-Medium',
	},
	expiration: {
		fontSize: 14,
		color: Theme.colors.text,
		fontFamily: 'SanFranciscoDisplay-Medium',
	},
	action: {
		borderRadius: 3,
		marginTop: 10,
		marginBottom: 15,
		backgroundColor: Theme.colors.cyan2,
		paddingVertical: 10,
	},
	actionText: {
		color: Theme.colors.white,
		textAlign: 'center',
	},
});

export default PromotionDetailsModal;
