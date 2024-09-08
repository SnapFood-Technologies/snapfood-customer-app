import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Switch } from 'react-native';
import { connect } from 'react-redux';
import { setAppLang, setTmpPassChanged, getSystemSettings, updateLanguage } from '../../../store/actions/app';
import { translate } from '../../../common/services/translate';
import { updateProfileDetails } from '../../../store/actions/auth';
import Theme from '../../../theme';
import RadioBtn from '../../../common/components/buttons/radiobtn';
import Header1 from '../../../common/components/Header1';
import RouteNames from '../../../routes/names';
import apiFactory from '../../../common/services/apiFactory';

const SettingScreen = (props) => {

	useEffect(() => {
		props.setTmpPassChanged(false);
		props.getSystemSettings();
	}, []);


	const changeAppLang = async (lang) => {
		await props.setAppLang(lang);
		updateLanguage();
	};

	const goChangePass = () => {
		props.navigation.navigate(RouteNames.ChangePasswordScreen);
	};

	const goDeleteAccount = () => {
		props.navigation.navigate(RouteNames.DeleteAccountScreen);
	};

	const onUpdateNoti = (data) => {
		props
			.updateProfileDetails(data)
			.then((res) => { })
			.catch((err) => {
				console.log('updateProfileDetails', err);
			});
	};

	const _renderLanguageSetting = () => {
		return (
			<View style={[Theme.styles.col_center_start, styles.language]}>
				<View style={[Theme.styles.row_center, { width: '100%', marginBottom: 16 }]}>
					<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>{translate('account.lang_label')}</Text>
				</View>
				{
					props.systemSettings.enable_english != 0 &&
					<TouchableOpacity
						onPress={() => changeAppLang('en')}
						style={[Theme.styles.row_center, { width: '100%', marginBottom: 16, }]}
					>
						<Text style={[styles.langtxt]}>{translate('account.english')}</Text>
						<View style={{ flex: 1 }} />
						<RadioBtn onPress={() => changeAppLang('en')} checked={props.language == 'en'} />
					</TouchableOpacity>
				}
				{
					props.systemSettings.enable_albanian == 1 &&
					<>
						<View style={styles.divider} />
						<TouchableOpacity
							onPress={() => changeAppLang('sq')}
							style={[Theme.styles.row_center, { width: '100%', paddingTop: 16, marginBottom: 16 }]}
						>
							<Text style={[styles.langtxt]}>{translate('account.albanian')}</Text>
							<View style={{ flex: 1 }} />
							<RadioBtn onPress={() => changeAppLang('sq')} checked={props.language == 'sq'} />
						</TouchableOpacity>
					</>
				}
				{
					props.systemSettings.enable_italian == 1 &&
					<>
						<View style={styles.divider} />
						<TouchableOpacity
							onPress={() => changeAppLang('it')}
							style={[Theme.styles.row_center, { width: '100%', paddingTop: 16, marginBottom: 16 }]}
						>
							<Text style={[styles.langtxt]}>{translate('account.italian')}</Text>
							<View style={{ flex: 1 }} />
							<RadioBtn onPress={() => changeAppLang('it')} checked={props.language == 'it'} />
						</TouchableOpacity>
					</>
				}
				{
					props.systemSettings.enable_greek == 1 &&
					<>
						<View style={styles.divider} />
						<TouchableOpacity
							onPress={() => changeAppLang('gr')}
							style={[Theme.styles.row_center, { width: '100%', paddingTop: 16 }]}
						>
							<Text style={[styles.langtxt]}>{translate('account.greek')}</Text>
							<View style={{ flex: 1 }} />
							<RadioBtn onPress={() => changeAppLang('gr')} checked={props.language == 'gr'} />
						</TouchableOpacity>
					</>
				}
			</View>
		);
	};

	const _renderStoryVisbilitySetting = () => {
		return (
			<View style={[Theme.styles.col_center_start, styles.language]}>
				<View style={[Theme.styles.row_center, { width: '100%', marginBottom: 16 }]}>
					<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>{translate('account.story_setting')}</Text>
				</View>
				<TouchableOpacity
					onPress={() => onUpdateNoti({ story_public: props.user.story_public == 1 ? 0 : 1 })}
					style={[Theme.styles.row_center, { width: '100%', marginBottom: 16, }]}
				>
					<View>
						<Text style={[styles.langtxt]}>{translate('account.story_public')}</Text>
						<Text style={[styles.setting_desc]}>{translate('account.story_public_desc')}</Text>
					</View>
					<View style={{ flex: 1 }} />
					<RadioBtn
						onPress={() => onUpdateNoti({ story_public: props.user.story_public == 1 ? 0 : 1 })}
						checked={props.user.story_public == 1}
					/>
				</TouchableOpacity>
				<View style={styles.divider} />
				<TouchableOpacity
					onPress={() => onUpdateNoti({ story_public: props.user.story_public == 1 ? 0 : 1 })}
					style={[Theme.styles.row_center, { width: '100%', paddingTop: 16, marginBottom: 16 }]}
				>
					<View>
						<Text style={[styles.langtxt]}>{translate('account.story_private')}</Text>
						<Text style={[styles.setting_desc]}>{translate('account.story_private_desc')}</Text>
					</View>
					<View style={{ flex: 1 }} />
					<RadioBtn
						onPress={() => onUpdateNoti({ story_public: props.user.story_public == 1 ? 0 : 1 })}
						checked={props.user.story_public == 0}
					/>
				</TouchableOpacity>
			</View>
		);
	};

	const NotiSetting = ({ item, value, onChange }) => {
		return (
			<View style={[Theme.styles.row_center, { width: '100%', paddingTop: 20 }]}>
				<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>{item}</Text>
				<Switch
					style={Platform.OS == 'ios' && { transform: [{ scaleX: 0.7 }, { scaleY: 0.65 }] }}
					trackColor={{ false: Theme.colors.gray5, true: '#C0EBEC' }}
					thumbColor={value ? Theme.colors.cyan2 : Theme.colors.gray7}
					ios_backgroundColor='#C0EBEC'
					onValueChange={onChange}
					value={value}
				/>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<Header1
				style={{ marginTop: 10, marginBottom: 0, paddingHorizontal: 20 }}
				onLeft={() => {
					props.navigation.goBack();
				}}
				title={translate('settings')}
			/>
			<View style={styles.formView}>
				<ScrollView style={{ flex: 1, width: '100%', paddingHorizontal: 20 }}>
					<View style={[Theme.styles.col_center, styles.sectionView]}>
						<NotiSetting
							item={translate('account.push_noti')}
							value={props.user.notifications == 1}
							onChange={() => onUpdateNoti({ push_notis: props.user.notifications == 1 ? 0 : 1 })}
						/>
						<NotiSetting
							item={translate('account.promo_noti')}
							value={props.user.promotions == 1}
							onChange={() => onUpdateNoti({ promo_notis: props.user.promotions == 1 ? 0 : 1 })}
						/>
						<NotiSetting
							item={translate('account.blog')}
							value={props.user.blog_notifications == 1}
							onChange={() => onUpdateNoti({ blog_notifications: props.user.blog_notifications == 1 ? 0 : 1 })}
						/>
						{/* <NotiSetting
							item={translate('account.email_noti')}
							value={props.user.email_notis == 1}
							onChange={() => onUpdateNoti({ email_notis: props.user.email_notis == 1 ? 0 : 1 })}
						/> */}
					</View>
					<View style={[Theme.styles.col_center, styles.sectionView, { marginTop: 16 }]}>
						{_renderLanguageSetting()}
					</View>
					{/* <View style={[Theme.styles.col_center, styles.sectionView, { marginTop: 16 }]}>
						{_renderStoryVisbilitySetting()}
					</View> */}
					<TouchableOpacity
						onPress={goChangePass}
						style={[Theme.styles.row_center, styles.itemView, { marginTop: 16 }]}
					>
						<Text style={[styles.itemTxt, Theme.styles.flex_1]}>
							{translate('account_change_pass.header_title')}
						</Text>
					</TouchableOpacity>
					{props.pass_changed && (
						<Text style={styles.notitxt}>{translate('account_change_pass.success')}</Text>
					)}
					<TouchableOpacity
						onPress={goDeleteAccount}
						style={[Theme.styles.row_center, styles.itemView, { marginTop: 16 }]}
					>
						<Text style={[styles.itemTxt, Theme.styles.flex_1]}>
							{translate('account.delete_account')}
						</Text>
					</TouchableOpacity>
				</ScrollView>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		// paddingVertical: 20,
		backgroundColor: '#ffffff',
	},
	formView: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '100%',
	},
	subjectTitle: { fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray6 },
	sectionView: {
		width: '100%',
		alignItems: 'flex-start',
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: Theme.colors.gray9,
	},
	langtxt: { fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
	setting_desc: { fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7 },
	language: { width: '100%', padding: 20, backgroundColor: Theme.colors.gray8, borderRadius: 15 },
	itemView: { padding: 20, backgroundColor: Theme.colors.gray8, borderRadius: 15 },
	itemTxt: { fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
	notitxt: {
		marginTop: 25,
		width: '100%',
		textAlign: 'center',
		fontSize: 14,
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.red1,
	},
});

const mapStateToProps = ({ app }) => ({
	user: app.user,
	language: app.language,
	pass_changed: app.pass_changed,
	systemSettings: app.systemSettings
});

export default connect(mapStateToProps, {
	setAppLang,
	updateProfileDetails,
	setTmpPassChanged,
	getSystemSettings
})(SettingScreen);
