import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import Theme from '../../../theme';
import Dropdown from '../../home/components/Dropdown';
import AppText from '../../../common/components/AppText';
import Header1 from '../../../common/components/Header1';
import { translate } from '../../../common/services/translate';
import CommentInput from '../../orders/components/CommentInput';
const { width } = Dimensions.get('window');
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import { MainBtn } from '../../../common/components';
import StudentVerifyImgUploader from '../components/StudentVerifyImgUploader';
import { STUDENT_VERIFY_STATUS } from '../../../config/constants';
import { isEmpty } from '../../../common/services/utility';
import { goActiveScreenFromPush } from '../../../store/actions/app';
import moment from 'moment';
import Modal from 'react-native-modal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DatePicker from 'react-native-date-picker';

const StudentVerifyScreen = (props) => {
	const [photo, setPhoto] = useState({});
	const [loading, setLoading] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [verifyData, setData] = useState(null);
	const [isDateModal, ShowDateModal] = useState(false);
	const [expireDate, setExpireDate] = useState(null);

	useEffect(() => {
		props.goActiveScreenFromPush({
			isGeneralStudentVerifyVisible: false
		});
		loadData();
		const focusListener = props.navigation.addListener('focus', () => {
			loadData();
		});

		return focusListener;
	}, [props.navigation])

	const loadData = () => {
		apiFactory
			.get(`promotions/student-verification`)
			.then(
				({ data }) => {
					setLoaded(true);
					setData(data.data);
					setExpireDate(data.data?.expire_date == null ? null : moment(data.data?.expire_date).toDate())
				},
				(error) => {
					setLoaded(true);
					
				}
			);
	}

	const submit = () => {
		if (photo?.data == null) return;
		setLoading(true);
		apiFactory
			.post(`promotions/student-verification`, {
				image: photo?.data,
				expire_date: (expireDate == null ? null : moment(expireDate).format('YYYY-MM-DD'))
			})
			.then(
				({ data }) => {
					setLoading(false);
					setData(data.data);
				},
				(error) => {
					setLoading(false);
					
					const message = error.message || translate('generic_error');
					alerts.error(translate('alerts.error'), message);
				}
			);
	}

	const canChange = useMemo(() => {
		return verifyData?.status != STUDENT_VERIFY_STATUS.verified && verifyData?.status != STUDENT_VERIFY_STATUS.pending;
	}, [verifyData])

	const title = useMemo(() => {
		if (props.language == 'sq' && !isEmpty(props.studentVerifySettings?.main_title)) {
			return props.studentVerifySettings?.main_title;
		}
		else if (props.language == 'en' && !isEmpty(props.studentVerifySettings?.main_title_en)) {
			return props.studentVerifySettings?.main_title_en;
		}
		else if (props.language == 'it' && !isEmpty(props.studentVerifySettings?.main_title_it)) {
			return props.studentVerifySettings?.main_title_it;
		}
		return translate('student_verify.title');
	}, [props.studentVerifySettings?.main_title, props.studentVerifySettings?.main_title_en,
	props.studentVerifySettings?.main_title_it, props.language])

	const pending_description = useMemo(() => {
		if (props.language == 'sq' && !isEmpty(props.studentVerifySettings?.pending_description)) {
			return props.studentVerifySettings?.pending_description;
		}
		else if (props.language == 'en' && !isEmpty(props.studentVerifySettings?.pending_description_en)) {
			return props.studentVerifySettings?.pending_description_en;
		}
		else if (props.language == 'it' && !isEmpty(props.studentVerifySettings?.pending_description_it)) {
			return props.studentVerifySettings?.pending_description_it;
		}
		return translate('student_verify.pending');
	}, [props.studentVerifySettings?.pending_description, props.studentVerifySettings?.pending_description_en,
	props.studentVerifySettings?.pending_description_it, props.language])

	const verified_description = useMemo(() => {
		if (props.language == 'sq' && !isEmpty(props.studentVerifySettings?.verified_description)) {
			return props.studentVerifySettings?.verified_description;
		}
		else if (props.language == 'en' && !isEmpty(props.studentVerifySettings?.verified_description_en)) {
			return props.studentVerifySettings?.verified_description_en;
		}
		else if (props.language == 'it' && !isEmpty(props.studentVerifySettings?.verified_description_it)) {
			return props.studentVerifySettings?.verified_description_it;
		}
		return translate('student_verify.verified');
	}, [props.studentVerifySettings?.verified_description, props.studentVerifySettings?.verified_description_en,
	props.studentVerifySettings?.verified_description_it, props.language])

	const rejected_description = useMemo(() => {
		if (props.language == 'sq' && !isEmpty(props.studentVerifySettings?.rejected_description)) {
			return props.studentVerifySettings?.rejected_description;
		}
		else if (props.language == 'en' && !isEmpty(props.studentVerifySettings?.rejected_description_en)) {
			return props.studentVerifySettings?.rejected_description_en;
		}
		else if (props.language == 'it' && !isEmpty(props.studentVerifySettings?.rejected_description_it)) {
			return props.studentVerifySettings?.rejected_description_it;
		}
		return translate('student_verify.rejected');
	}, [props.studentVerifySettings?.rejected_description, props.studentVerifySettings?.rejected_description_en,
	props.studentVerifySettings?.rejected_description_it, props.language])

	const expired_description = useMemo(() => {
		if (props.language == 'sq' && !isEmpty(props.studentVerifySettings?.expired_description)) {
			return props.studentVerifySettings?.expired_description;
		}
		else if (props.language == 'en' && !isEmpty(props.studentVerifySettings?.expired_description_en)) {
			return props.studentVerifySettings?.expired_description_en;
		}
		else if (props.language == 'it' && !isEmpty(props.studentVerifySettings?.expired_description_it)) {
			return props.studentVerifySettings?.expired_description_it;
		}
		return translate('student_verify.expired');
	}, [props.studentVerifySettings?.expired_description, props.studentVerifySettings?.expired_description_en,
	props.studentVerifySettings?.expired_description_it, props.language])

	const description = useMemo(() => {
		if (props.language == 'sq' && !isEmpty(props.studentVerifySettings?.description)) {
			return props.studentVerifySettings?.description;
		}
		else if (props.language == 'en' && !isEmpty(props.studentVerifySettings?.description_en)) {
			return props.studentVerifySettings?.description_en;
		}
		else if (props.language == 'it' && !isEmpty(props.studentVerifySettings?.description_it)) {
			return props.studentVerifySettings?.description_it;
		}
		return translate('student_verify.description');
	}, [props.studentVerifySettings?.description, props.studentVerifySettings?.description_en,
	props.studentVerifySettings?.description_it, props.language])

	const renderDatepickerModal = () => {
		if (Platform.OS == 'android') {
			return (
				<DateTimePickerModal
					isVisible={isDateModal}
					mode='date'
					onConfirm={(date) => {
						if (date) {
							setExpireDate(date);
							ShowDateModal(false);
						}
					}}
					onCancel={() => ShowDateModal(false)}
					style={Theme.styles.col_center}
					minimumDate={new Date()}
					date={expireDate == null ? new Date() : expireDate}
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
						<Text style={styles.modalTitle}>{translate('student_verify.expire_date_subject')}</Text>
						<DatePicker
							mode='date'
							minimumDate={new Date()}
							date={expireDate == null ? new Date() : expireDate}
							onDateChange={setExpireDate}
						/>
					</View>
				</Modal>
			);
		}
	};

	return (
		<View style={[Theme.styles.background, { padding: 0 }]}>
			<Spinner visible={loading} />
			<Header1
				style={{ marginTop: 10, paddingHorizontal: 20, marginBottom: 0 }}
				onLeft={() => props.navigation.goBack()}
				title={title}
			/>
			<KeyboardAwareScrollView
				style={[{ flex: 1, width: '100%', paddingHorizontal: 20 }]}
				keyboardShouldPersistTaps='handled'
				scrollIndicatorInsets={{ right: 1 }}>
				{
					verifyData?.status == STUDENT_VERIFY_STATUS.pending ?
						<View style={[Theme.styles.row_center_start, styles.msgBlock]}>
							<AppText style={[styles.description, { color: Theme.colors.red1 }]}>
								{pending_description}
							</AppText>
						</View>
						:
						verifyData?.status == STUDENT_VERIFY_STATUS.verified ?
							<View style={[Theme.styles.row_center_start, styles.msgBlock]}>
								<AppText style={[styles.description, { color: '#1dd890' }]}>
									{verified_description}
								</AppText>
							</View>
							:
							verifyData?.status == STUDENT_VERIFY_STATUS.rejected ?
								<View style={[Theme.styles.row_center_start, styles.msgBlock]}>
									<AppText style={[styles.description, { color: Theme.colors.red }]}>
										{rejected_description}
									</AppText>
								</View>
								:
								verifyData?.status == STUDENT_VERIFY_STATUS.expired ?
									<View style={[Theme.styles.row_center_start, styles.msgBlock]}>
										<AppText style={[styles.description, { color: Theme.colors.red }]}>
											{expired_description}
										</AppText>
									</View>
									:
									loaded &&
									<View style={[Theme.styles.row_center_start, styles.msgBlock]}>
										<AppText style={styles.description}>
											{description}
										</AppText>
									</View>
				}
				<Text style={[styles.subjectTitle]}>{translate('student_verify.verify_image_subject')}</Text>
				<StudentVerifyImgUploader
					photo={photo?.data != null ? photo : { path: verifyData?.photo }}
					setPhoto={setPhoto}
					canChange={canChange}
				/>
				<Text style={[styles.subjectTitle, {marginTop: 20}]}>{translate('student_verify.expire_date_subject')}</Text>
				<TouchableOpacity disabled={!canChange} onPress={() => ShowDateModal(true)} style={styles.dateView}>
					<Text
						style={[
							styles.dateTxt,
							{ color: expireDate == null ? '#DFDFDF' : Theme.colors.text },
						]}
					>
						{expireDate == null
							? 'DD/MM/YYYY'
							: moment(expireDate).format('DD/MM/YYYY')}
					</Text>
				</TouchableOpacity>
				{
					canChange &&
					<View style={[Theme.styles.col_center, styles.bottom]}>
						<MainBtn
							style={{ width: '100%' }}
							disabled={photo?.data == null}
							title={translate('student_verify.button')}
							onPress={submit}
						/>
					</View>
				}
			</KeyboardAwareScrollView>
			{renderDatepickerModal()}
		</View>
	);
};
const styles = StyleSheet.create({
	msgBlock: { width: '100%', padding: 15, marginTop: 20, marginBottom: 30, borderRadius: 12, backgroundColor: Theme.colors.gray9 },
	subjectTitle: { marginBottom: 12, fontSize: 20, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	description: {
		fontSize: 18,
		lineHeight: 22,
		fontFamily: Theme.fonts.medium,
		color: Theme.colors.text,
	},
	bottom: { width: '100%', marginBottom: 30, marginTop: 30 },
	dateView: {
		width: '100%',
		marginBottom: 12,
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
	dateTxt: {
		fontSize: 16,
		fontFamily: Theme.fonts.medium,
		flex: 1,
		marginLeft: 4,
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
	language: app.language,
	studentVerifySettings: app.studentVerifySettings
});

export default connect(mapStateToProps, {
	goActiveScreenFromPush
})(StudentVerifyScreen);