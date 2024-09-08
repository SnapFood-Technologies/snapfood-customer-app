import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { width } from 'react-native-dimension';
import { connect } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign'
import FastImage from 'react-native-fast-image';
import Feather from 'react-native-vector-icons/Feather';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import MainBtn from '../../../common/components/buttons/main_button';
import AuthInput from '../../../common/components/AuthInput';
import Header1 from '../../../common/components/Header1';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import RouteNames from '../../../routes/names';
import { MEMBERSHIP_PLANS } from '../../../config/constants';
import { isEmpty } from '../../../common/services/utility';
import { setTmpPickedMembershipPlan } from '../../../store/actions/app'
// svgs
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AppText, DotBorderButton, RadioBtn } from '../../../common/components';
import ImgLogoplus from '../../../common/assets/images/logo_plus.png'

const ChangeMembershipPlan = (props) => {
	const [loading, setLoading] = useState(false);
	const [plan, setPlan] = useState(props.tmpPickedMembershipPlan || MEMBERSHIP_PLANS.monthly);

	useEffect(() => {
	}, [])

	const title = useMemo(() => {
		if (props.language == 'en' && !isEmpty(props.membershipSetting.membership_title_en)) {
			return props.membershipSetting.membership_title_en;
		}
		else if (props.language == 'sq' && !isEmpty(props.membershipSetting.membership_title)) {
			return props.membershipSetting.membership_title;
		}
		else if (props.language == 'it' && !isEmpty(props.membershipSetting.membership_title_it)) {
			return props.membershipSetting.membership_title_it;
		}
		return translate('Snapfood+');
	}, [props.membershipSetting.membership_title, props.membershipSetting.membership_title_en, 
		props.membershipSetting.membership_title_it, props.language])


	const onProceed = () => {
		props.setTmpPickedMembershipPlan(plan);
		props.navigation.goBack();
	};


	return (
		<View style={styles.container}>
			<Header1
				style={styles.header}
				title={translate('membership.change_plan')}
				left={<AntDesign name='close' size={24} color={Theme.colors.gray7} />}
				onLeft={() => {
					props.navigation.goBack();
				}}
			/>
			<KeyboardAwareScrollView style={[{ flex: 1, width: '100%', paddingHorizontal: 20 }]} keyboardShouldPersistTaps='handled'>
				<View style={[Theme.styles.flex_between]}>
					<AppText style={styles.logoTxt}>{title}</AppText>
					<FastImage source={ImgLogoplus} style={styles.logoImg} resizeMode={'contain'} />
				</View>
				<TouchableOpacity style={[Theme.styles.row_center, styles.planItem]} onPress={() => setPlan(MEMBERSHIP_PLANS.monthly)}>
					<View style={{ flex: 1 }}>
						<AppText style={styles.planItemTxt}>{translate('membership.monthly')}</AppText>
						<AppText style={styles.priceTxt}>{props.membershipSetting.monthly_value} lekë/{translate('membership.month')}</AppText>
					</View>
					<RadioBtn checked={plan == MEMBERSHIP_PLANS.monthly} onPress={() => setPlan(MEMBERSHIP_PLANS.monthly)} />
				</TouchableOpacity>
				<TouchableOpacity style={[Theme.styles.row_center, styles.planItem]} onPress={() => setPlan(MEMBERSHIP_PLANS.yearly)}>
					<View style={{ flex: 1 }}>
						<AppText style={styles.planItemTxt}>{translate('membership.yearly')}</AppText>
						<AppText style={styles.priceTxt}>{props.membershipSetting.yearly_value} lekë/{translate('membership.year')}</AppText>
					</View>
					<RadioBtn checked={plan == MEMBERSHIP_PLANS.yearly} onPress={() => setPlan(MEMBERSHIP_PLANS.yearly)} />
				</TouchableOpacity>
			</KeyboardAwareScrollView>
			<View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 40 }}>
				<MainBtn
					loading={loading}
					title={translate('proceed')}
					onPress={onProceed}
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
	logoTxt: { fontSize: 24, lineHeight: 29, fontFamily: Theme.fonts.bold, color: Theme.colors.black },
	logoImg: { width: 52, height: 52 },
	planItemTxt: { fontSize: 18, lineHeight: 22, fontFamily: Theme.fonts.semiBold, color: Theme.colors.black },
	priceTxt: { marginTop: 3, fontSize: 16, lineHeight: 19, color: Theme.colors.gray7, fontFamily: Theme.fonts.medium },
	planItem: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 18, width: '100%', borderWidth: 1, borderColor: '#E9E9F7', borderRadius: 12 },
});

const mapStateToProps = ({ app }) => ({
	user: app.user || {},
	language: app.language,
	tmpPickedMembershipPlan: app.tmpPickedMembershipPlan || MEMBERSHIP_PLANS.monthly,
	membershipSetting: app.membershipSetting || {},
});

export default connect(mapStateToProps, {
	setTmpPickedMembershipPlan
})(ChangeMembershipPlan);
