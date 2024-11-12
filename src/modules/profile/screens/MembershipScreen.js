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
import { isEmpty } from '../../../common/services/utility';
import { getLoggedInUser } from '../../../store/actions/auth';
// svgs
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AppText, DotBorderButton } from '../../../common/components';
import Svg_subscrebe1 from '../../../common/assets/svgs/profile/subscribe_icon1.svg'
import Svg_subscrebe2 from '../../../common/assets/svgs/profile/subscribe_icon2.svg'
import Svg_subscrebe3 from '../../../common/assets/svgs/profile/subscribe_icon3.svg'
import ImgLogoplus from '../../../common/assets/images/logo_plus.png'
import { MEMBERSHIP_PLANS } from '../../../config/constants';

const MembershipScreen = (props) => {
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState('');
	const [message, setMessage] = useState('');

	useEffect(() => {
	}, [])

	const title = useMemo(() => {
		if (props.language == 'en' && !isEmpty(props.membershipSetting.membership_title_en)) {
			return props.membershipSetting.membership_title_en;
		}
		else if (props.language == 'sq' && !isEmpty(props.membershipSetting.membership_title)) {
			return props.membershipSetting.membership_title;
		}
		if (props.language == 'it' && !isEmpty(props.membershipSetting.membership_title_it)) {
			return props.membershipSetting.membership_title_it;
		}
		return translate('Snapfood+');
	}, [props.membershipSetting.membership_title, props.membershipSetting.membership_title_en, 
		props.membershipSetting.membership_title_it, props.language])

	const info1 = useMemo(() => {
		if (props.language == 'en' && !isEmpty(props.membershipSetting.membership_info1_en)) {
			return props.membershipSetting.membership_info1_en;
		}
		else if (props.language == 'sq' && !isEmpty(props.membershipSetting.membership_info1)) {
			return props.membershipSetting.membership_info1;
		}
		else if (props.language == 'it' && !isEmpty(props.membershipSetting.membership_info1_it)) {
			return props.membershipSetting.membership_info1_it;
		}
		return translate('membership.info1');
	}, [props.membershipSetting.membership_info1_en, props.membershipSetting.membership_info1, 
		props.membershipSetting.membership_info1_it, props.language])

	const info2 = useMemo(() => {
		if (props.language == 'en' && !isEmpty(props.membershipSetting.membership_info2_en)) {
			return props.membershipSetting.membership_info2_en;
		}
		else if (props.language == 'sq' && !isEmpty(props.membershipSetting.membership_info2)) {
			return props.membershipSetting.membership_info2;
		}
		else if (props.language == 'it' && !isEmpty(props.membershipSetting.membership_info2_it)) {
			return props.membershipSetting.membership_info2_it;
		}
		return translate('membership.info2');
	}, [props.membershipSetting.membership_info2_en, props.membershipSetting.membership_info2, 
		props.membershipSetting.membership_info2_it, props.language])

	const info3 = useMemo(() => {
		if (props.language == 'en' && !isEmpty(props.membershipSetting.membership_info3_en)) {
			return props.membershipSetting.membership_info3_en;
		}
		else if (props.language == 'sq' && !isEmpty(props.membershipSetting.membership_info3)) {
			return props.membershipSetting.membership_info3;
		}
		else if (props.language == 'it' && !isEmpty(props.membershipSetting.membership_info3_it)) {
			return props.membershipSetting.membership_info3_it;
		}
		return translate('membership.info3');
	}, [props.membershipSetting.membership_info3_en, props.membershipSetting.membership_info3, 
		props.membershipSetting.membership_info3_it, props.language])

	const block_title = useMemo(() => {
		if (props.user.has_membership == 1) {
			if (props.user.membership_type == MEMBERSHIP_PLANS.monthly) {
				return translate('membership.monthly_plan');
			}
			else if (props.user.membership_type == MEMBERSHIP_PLANS.yearly) {
				return translate('membership.yearly_plan');
			}
		}
		else {
			if (props.language == 'en' && !isEmpty(props.membershipSetting.membership_block_title_en)) {
				return props.membershipSetting.membership_block_title_en;
			}
			else if (props.language == 'sq' && !isEmpty(props.membershipSetting.membership_block_title)) {
				return props.membershipSetting.membership_block_title;
			}
			else if (props.language == 'it' && !isEmpty(props.membershipSetting.membership_block_title_it)) {
				return props.membershipSetting.membership_block_title_it;
			}
		}
		return null;
	}, [props.membershipSetting.membership_block_title_en, props.membershipSetting.membership_block_title, 
		props.membershipSetting.membership_block_title_it, props.language,
	props.user.has_membership, props.user.membership_type])

	const block_desc = useMemo(() => {
		if (props.user.has_membership == 1) {
			if (props.user.membership_type == MEMBERSHIP_PLANS.monthly) {
				return translate('membership.you_are_on_monthly_plan').replace('#', props.membershipSetting.monthly_value);
			}
			else if (props.user.membership_type == MEMBERSHIP_PLANS.yearly) {
				return translate('membership.you_are_on_yearly_plan').replace('#', props.membershipSetting.yearly_value);
			}
		}
		else {
			if (props.language == 'en' && !isEmpty(props.membershipSetting.membership_block_desc_en)) {
				return props.membershipSetting.membership_block_desc_en;
			}
			else if (props.language == 'sq' && !isEmpty(props.membershipSetting.membership_block_desc)) {
				return props.membershipSetting.membership_block_desc;
			}
			else if (props.language == 'it' && !isEmpty(props.membershipSetting.membership_block_desc_it)) {
				return props.membershipSetting.membership_block_desc_it;
			}
		}
		return null;
	}, [props.membershipSetting.membership_block_desc_en, props.membershipSetting.membership_block_desc, 
		props.membershipSetting.membership_block_desc_it, props.language,
	props.user.has_membership, props.user.membership_type, props.membershipSetting.monthly_value, props.membershipSetting.yearly_value
	])

	const extra_desc = useMemo(() => {
		if (props.language == 'en' && !isEmpty(props.membershipSetting.membership_extra_desc_en)) {
			return props.membershipSetting.membership_extra_desc_en;
		}
		else if (props.language == 'sq' && !isEmpty(props.membershipSetting.membership_extra_desc)) {
			return props.membershipSetting.membership_extra_desc;
		}
		else if (props.language == 'it' && !isEmpty(props.membershipSetting.membership_extra_desc_it)) {
			return props.membershipSetting.membership_extra_desc_it;
		}
		return null;
	}, [props.membershipSetting.membership_extra_desc_en, props.membershipSetting.membership_extra_desc, 
		props.membershipSetting.membership_extra_desc_it, props.language])

	const badge = useMemo(() => {
		if (props.language == 'en' && !isEmpty(props.membershipSetting.member_badge_en)) {
			return props.membershipSetting.member_badge_en;
		}
		else if (props.language == 'sq' && !isEmpty(props.membershipSetting.member_badge)) {
			return props.membershipSetting.member_badge;
		}
		else if (props.language == 'it' && !isEmpty(props.membershipSetting.member_badge_it)) {
			return props.membershipSetting.member_badge_it;
		}
		return translate('membership.member');
	}, [props.membershipSetting.member_badge, props.membershipSetting.member_badge_en, 
		props.membershipSetting.member_badge_it, props.language])

	const price_info = useMemo(() => {
		if (props.user.has_membership == 1) {
			if (props.user.membership_type == MEMBERSHIP_PLANS.monthly) {
				return `${props.membershipSetting.monthly_value} lekë/${translate('membership.month')}`
			}
			else if (props.user.membership_type == MEMBERSHIP_PLANS.yearly) {
				return `${props.membershipSetting.yearly_value} lekë/${translate('membership.year')}`
			}
		}
		return `${props.membershipSetting.monthly_value} lekë/${translate('membership.month')}`
	}, [
		props.user.has_membership, props.user.membership_type, props.membershipSetting.monthly_value, props.membershipSetting.yearly_value
	])

	const onCancel = () => {
		setLoading(true);
		apiFactory
			.post(`cancel-membership`)
			.then(
				({ data }) => {
					setLoading(false);
					props.getLoggedInUser();
					alerts.info(null, translate('membership.success_cancel_subscription'))
				},
				(error) => {
					setLoading(false);
					
					const message = error.message || translate('generic_error');
					alerts.error(translate('alerts.error'), message);
				}
			);
	};

	const onSubscribe = () => {
		props.navigation.navigate(RouteNames.MembershipInfoScreen)
	}

	return (
		<View style={styles.container}>
			<Header1
				style={styles.header}
				left={<AntDesign name='close' size={24} color={Theme.colors.gray7} />}
				onLeft={() => {
					props.navigation.goBack();
				}}
			/>
			<KeyboardAwareScrollView style={[{ flex: 1, width: '100%', }]} keyboardShouldPersistTaps='handled'>
				<View style={[{ width: '100%', paddingHorizontal: 20, paddingBottom: 20 }]}>
					<View style={[Theme.styles.row_center]}>
						<AppText style={[styles.logoTxt, { flex: 1 }]}>{title}</AppText>
						{props.user.has_membership == 1 ?
							<View style={[Theme.styles.col_center, styles.badge]}><AppText style={styles.badgeTxt}>{badge}</AppText></View>
							: <View />
						}
					</View>
					<AppText style={styles.priceTxt}>{price_info}</AppText>
					<View style={[Theme.styles.row_center, styles.descItem]}>
						<Svg_subscrebe1 />
						<AppText style={styles.descTxt}>{info1}</AppText>
					</View>
					<View style={[Theme.styles.row_center, styles.descItem]}>
						<Svg_subscrebe2 />
						<AppText style={styles.descTxt}>{info2}</AppText>
					</View>
					<View style={[Theme.styles.row_center, styles.descItem]}>
						<Svg_subscrebe3 />
						<AppText style={styles.descTxt}>{info3}</AppText>
					</View>
				</View>
				<View style={[Theme.styles.col_center, styles.infoBlock]}>
					<FastImage source={ImgLogoplus} style={styles.logoImg} resizeMode={'contain'} />
					<AppText style={styles.infoTitle}>{block_title}</AppText>
					<AppText style={styles.infoDesc}>{block_desc}</AppText>
				</View>
				<View style={[Theme.styles.col_center, styles.faqBlock]}>
					<TouchableOpacity style={[Theme.styles.flex_between, styles.faqBtn]}
						onPress={() => { props.navigation.navigate(RouteNames.MembershipFaqs) }}>
						<AppText style={styles.faqBtnTxt}>{translate('membership.faq')}</AppText>
						<Feather name="chevron-right" size={20} color={Theme.colors.text} />
					</TouchableOpacity>
					<AppText style={styles.faqDesc}>{extra_desc}</AppText>
				</View>
				<View style={{ height: 40 }} />
			</KeyboardAwareScrollView >
			<View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 40 }}>
				<MainBtn
					loading={loading}
					style={props.user.has_membership == 1 ? { backgroundColor: Theme.colors.red1 } : {}}
					title={props.user.has_membership == 1 ? translate('membership.cancel_subscribe') : translate('membership.subscribe_now')}
					onPress={props.user.has_membership == 1 ? () => {
						alerts.confirmation(translate('membership.confirm_cancel_subscribe'), translate('membership.confirm_cancel_subscribe_message'),)
							.then(() => { onCancel() })
					} : onSubscribe}
				/>
			</View>
		</View >
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		backgroundColor: Theme.colors.white,
	},
	header: { height: 80, justifyContent: 'flex-end', marginBottom: 0, paddingHorizontal: 20 },
	logoTxt: { fontSize: 32, lineHeight: 38, fontFamily: Theme.fonts.bold, color: Theme.colors.black },
	badge: { paddingVertical: 5, paddingHorizontal: 20, borderRadius: 30, backgroundColor: '#F55A004D' },
	badgeTxt: { fontSize: 16, lineHeight: 19, color: Theme.colors.red1, fontFamily: Theme.fonts.medium },
	priceTxt: { marginTop: 5, fontSize: 18, lineHeight: 22, color: '#3E4958', fontFamily: Theme.fonts.bold },
	descItem: { width: '100%', marginTop: 20 },
	descTxt: { flex: 1, marginLeft: 12, fontSize: 17, lineHeight: 22, fontFamily: Theme.fonts.medium, color: Theme.colors.black },
	infoBlock: { padding: 20, width: '100%', borderTopWidth: 1, borderTopColor: '#cccccc', borderBottomWidth: 1, borderBottomColor: '#cccccc' },
	logoImg: { width: 52, height: 52 },
	infoTitle: { textAlign: 'center', fontSize: 19, lineHeight: 23, fontFamily: Theme.fonts.semiBold, color: Theme.colors.black },
	infoDesc: { marginTop: 8, textAlign: 'center', fontSize: 17, lineHeight: 20, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7 },
	faqBlock: { padding: 20, width: '100%' },
	faqBtn: { width: '100%', backgroundColor: Theme.colors.gray8, borderRadius: 12, paddingVertical: 18, paddingHorizontal: 20 },
	faqBtnTxt: { fontSize: 17, lineHeight: 20, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	faqDesc: { marginTop: 20, fontSize: 16, lineHeight: 19, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7 }
});

const mapStateToProps = ({ app }) => ({
	user: app.user || {},
	language: app.language,
	membershipSetting: app.membershipSetting || {},
});

export default connect(mapStateToProps, {
	getLoggedInUser
})(MembershipScreen);
