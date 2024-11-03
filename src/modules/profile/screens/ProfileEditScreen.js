import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import Modal from 'react-native-modal';
import Feather from 'react-native-vector-icons/Feather';
import { width } from 'react-native-dimension';
import DatePicker from 'react-native-date-picker';
import AppTooltip from '../../../common/components/AppTooltip';
import GenderSelect from '../../../common/components/GenderSelect';
import { updateProfileDetails } from '../../../store/actions/auth';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import { trimPhoneNumber, validateUserData } from '../../../common/services/utility';
import { updateChannelUserInfo } from '../../../common/services/chat';
import Theme from '../../../theme';
import AuthInput from '../../../common/components/AuthInput';
import Header1 from '../../../common/components/Header1';
import moment from 'moment';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Config from '../../../config';
import ImageUploader from '../../../common/components/ImageUploader';
import RouteNames from '../../../routes/names';
import CommentInput from '../../orders/components/CommentInput';
import { getDefaultPhonePlaceholder } from '../../../common/services/user';

const ProfileEditScreen = (props) => {
	const [isLoading, ShowLoading] = useState(false);
	const [isDateModal, ShowDateModal] = useState(false);
	const [photo, setPhoto] = useState(null);
	const [full_name, setFullName] = useState(props.user.full_name);
	const [username, setUsername] = useState(props.user.username);
	const [phone, setPhone] = useState(props.user.phone);
	const [email, setEmail] = useState(props.user.email);
	const [gender, setGender] = useState(props.user.sex);
	const [birthday, setBirthday] = useState(
		props.user.birthdate == null ? null : moment(props.user.birthdate).toDate()
	);
	const [bio_text, setBioText] = useState(props.user.bio_text || '');


	useEffect(() => { }, []);

	
	const onSave = async () => {
		validateUserData({ full_name, email, phone, password: '', pass2: '' }, false).then(async () => {
			try {
				ShowLoading(true);
				const updated_user = await props.updateProfileDetails({
					full_name,
					email,
					phone: trimPhoneNumber(phone),
					gender: gender === '' ? null : gender,
					username,
					birthday: birthday == null ? null : moment(birthday).format('YYYY-MM-DD'),
					photo: photo == null ? null : photo.data,
					bio_text,
				});

				
				await updateChannelUserInfo(updated_user);

				ShowLoading(false);
				alerts.info('', translate('account_details.profile_update_success')).then((res) => {
					props.navigation.goBack();
				});
			} catch (error) {
				ShowLoading(false);
				
				const message = error.message || translate('checkout.something_is_wrong');
				alerts.error(translate('alerts.error'), translate(message));
			}
		});
	};

	const renderDatepickerModal = () => {
		if (Config.isAndroid) {
			return (
				<DateTimePickerModal
					isVisible={isDateModal}
					mode='date'
					onConfirm={(date) => {
						if (date) {
							setBirthday(date);
							ShowDateModal(false);
						}
					}}
					onCancel={() => ShowDateModal(false)}
					style={Theme.styles.col_center}
					date={birthday == null ? new Date() : birthday}
					textColor={Theme.colors.primary}
					isDarkModeEnabled={false}
				/>
			);
		} else {
			return (
				<Modal
					isVisible={isDateModal}
					backdropOpacity={0.33}
					onSwipeComplete={() => ShowDateModal(false)}
					onBackdropPress={() => ShowDateModal(false)}
					swipeDirection={['down']}
					style={{ justifyContent: 'flex-end', margin: 0 }}
				>
					<View style={[Theme.styles.col_center, styles.modalContent]}>
						<Text style={styles.modalTitle}>{translate('account.update_birthday')}</Text>
						<DatePicker
							mode='date'
							date={birthday == null ? new Date() : birthday}
							onDateChange={setBirthday}
						/>
					</View>
				</Modal>
			);
		}
	};

	return (
		<View style={styles.container}>
			<Spinner visible={isLoading} />
			<Header1
				onLeft={() => {
					props.navigation.goBack();
				}}
				onRight={onSave}
				right={<Text style={styles.applyBtn}>{translate('save')}</Text>}
				style={{ paddingHorizontal: 20, marginBottom: 0 }}
				title={''}
			/>
			<View style={styles.formView}>
				<KeyboardAwareScrollView
					style={[{ flex: 1, width: '100%', paddingHorizontal: 20, }]}
					extraScrollHeight={25}
					keyboardShouldPersistTaps='handled'
				>
					<ImageUploader photo={photo || props.user.photo} setPhoto={setPhoto} fullUrl={!photo}
						hasImageBtn={props.systemSettings.enable_profile_gallery == 1}
						onPressImageBtn={() => {
							props.navigation.navigate(RouteNames.GalleryScreen);
						}}
					/>
					<View style={[Theme.styles.row_center, { marginTop: 25, marginBottom: 12, width: '100%' }]}>
						<AuthInput
							placeholder={translate('auth_register.full_name') + ' (*)'}
							underlineColorAndroid={'transparent'}
							keyboardType={'default'}
							placeholderTextColor={'#DFDFDF'}
							selectionColor={Theme.colors.cyan2}
							onChangeText={(full_name) => setFullName(full_name)}
							returnKeyType={'next'}
							autoCapitalize={'none'}
							value={full_name}
							secure={false}
							style={{ flex: 1, marginRight: 15 }}
						/>
						<AppTooltip
							title={translate('tooltip.full_name_required')}
							description={translate('tooltip.full_name_required_description')}
						/>
					</View>
					<View style={[Theme.styles.row_center, { marginBottom: 12, width: '100%' }]}>
						<AuthInput
							placeholder={translate('auth_login.username')}
							underlineColorAndroid={'transparent'}
							keyboardType={'default'}
							placeholderTextColor={'#DFDFDF'}
							selectionColor={Theme.colors.cyan2}
							onChangeText={(username) => setUsername(username)}
							returnKeyType={'next'}
							autoCapitalize={'none'}
							value={username}
							secure={false}
							style={{ flex: 1, marginRight: 15 }}
						/>
						<AppTooltip
							title={translate('tooltip.username_required')}
							description={translate('tooltip.username_required_description')}
						/>
					</View>
					<View style={[Theme.styles.row_center, { marginBottom: 12, width: '100%' }]}>
						<GenderSelect
							placeholder={translate('gender')}
							list_items={['gender', 'male', 'female']}
							item_height={50}
							value={gender}
							style={{ width: width(100) - 40 }}
							onChange={(value) => {
								setGender(value);
							}}
						/>
					</View>
					<AuthInput
						placeholder={translate(getDefaultPhonePlaceholder())}
						underlineColorAndroid={'transparent'}
						keyboardType={'phone-pad'}
						placeholderTextColor={'#DFDFDF'}
						selectionColor={Theme.colors.cyan2}
						onChangeText={(phone) => setPhone(phone)}
						// onSubmitEditing={() => this.onEmailDone()}
						returnKeyType={'next'}
						autoCapitalize={'none'}
						value={phone}
						secure={false}
						style={{ marginBottom: 12 }}
					/>
					<AuthInput
						placeholder={translate('auth_login.email_address')}
						underlineColorAndroid={'transparent'}
						keyboardType={'email-address'}
						placeholderTextColor={'#DFDFDF'}
						selectionColor={Theme.colors.cyan2}
						onChangeText={(email) => setEmail(email)}
						// onSubmitEditing={() => this.onEmailDone()}
						returnKeyType={'next'}
						autoCapitalize={'none'}
						value={email}
						secure={false}
						style={{ marginBottom: 12 }}
					/>
					<View style={[Theme.styles.row_center, { marginBottom: 12, width: '100%' }]}>
						<TouchableOpacity onPress={() => ShowDateModal(true)} style={{ flex: 1, marginRight: 15 }}>
							<View style={[styles.birthdayView]}>
								<Text
									style={[
										styles.birthdayTxt,
										{ color: birthday == null ? '#DFDFDF' : Theme.colors.text },
									]}
								>
									{birthday == null
										? 'Birth Date (DD/MM/YYYY)'
										: moment(birthday).format('DD/MM/YYYY')}
								</Text>
							</View>
						</TouchableOpacity>
						<AppTooltip
							title={translate('tooltip.birthday_required')}
							description={translate('tooltip.birthday_required_description')}
						/>
					</View>
					<View style={[Theme.styles.row_center, { marginBottom: 12, width: '100%' }]}>
						<CommentInput
							placeholder={translate('account_details.bio_text_placeholder')}
							comments={bio_text}
							height={160}
							style={{ flex: 1, marginRight: 12 }}
							onChangeText={(v) => {
								if (v.length <= 100) {
									setBioText(v)
								}
							}}
							textStyle={{ fontSize: 16 }}
						/>
						<View style={{ height: '100%' }}>
							<AppTooltip
								title={translate('tooltip.bio_title')}
								description={translate('tooltip.bio_description')}
							/>
							<TouchableOpacity onPress={() => { props.navigation.navigate(RouteNames.BioSettingScreen); }}>
								<Feather name='settings' color={Theme.colors.gray7} size={20} />
							</TouchableOpacity>
						</View>
					</View>
					<View style={{ height: 20 }}></View>
				</KeyboardAwareScrollView>
			</View>
			{renderDatepickerModal()}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		paddingTop: 20,
		backgroundColor: Theme.colors.white,
	},
	header: {
		width: '100%',
		height: 78,
		elevation: 6,
		paddingBottom: 8,
		marginBottom: 24,
		alignItems: 'flex-end',
		flexDirection: 'row',
	},
	formView: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '100%',
	},
	applyBtn: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },

	birthdayView: {
		flexDirection: 'row',
		borderWidth: 1,
		borderColor: '#E9E9F7',
		borderRadius: 12,
		height: 50,
		paddingLeft: 12,
		paddingRight: 12,
		justifyContent: 'center',
		alignContent: 'center',
		alignItems: 'center',
	},
	birthdayTxt: {
		fontSize: 16,
		fontFamily: Theme.fonts.medium,
		flex: 1,
		marginLeft: 4,
	},
	photoView: {
		height: 100,
		width: 100,
		borderWidth: 1,
		borderColor: Theme.colors.gray9,
		borderRadius: 50,
		backgroundColor: '#E8D7D0',
	},
	avatarImg: { width: 100, height: 100, borderRadius: 50 },
	photoEdit: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: Theme.colors.cyan2,
		position: 'absolute',
		top: 8,
		right: 8,
	},
	modalContent: {
		width: '100%',
		paddingHorizontal: 20,
		paddingBottom: 30,
		paddingTop: 20,
		backgroundColor: Theme.colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	modalTitle: {
		width: '100%',
		textAlign: 'center',
		fontSize: 18,
		fontFamily: Theme.fonts.bold,
		color: Theme.colors.text,
		marginBottom: 12,
	},
});

const mapStateToProps = ({ app }) => ({
	user: app.user,
	home_orders_filter: app.home_orders_filter,
	systemSettings: app.systemSettings || {}
});

export default connect(mapStateToProps, {
	updateProfileDetails,
})(ProfileEditScreen);
