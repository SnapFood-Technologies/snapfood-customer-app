import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
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
import ReportImageUploader from '../components/ReportImageUploader';
import ReportTagsModal from '../../../common/components/modals/ReportTagsModal';
import { isEmpty } from '../../../common/services/utility';

const ReportFeedbackScreen = (props) => {
	const [description, setDescription] = useState('');
	const [photo, setPhoto] = useState({});
	const [problemType, setProblemType] = useState(null);
	const [loading, setLoading] = useState(false);
	const [tags, setTags] = useState([]);

	const [isTagModal, openTagModal] = useState(false);

	useEffect(() => {
		loadProblemTags();
	}, [])

	const loadProblemTags = () => {
		apiFactory.get(`report/tags`)
			.then(({ data }) => {
				let alltags = data.tags || [];
				setTags(alltags);
				if (alltags.length > 0) {
					setProblemType({
						id: alltags[0].id,
						title: (props.language == 'en' ? alltags[0].tag_en : (props.language == 'it' ? alltags[0].tag_it : alltags[0].tag_sq))
					})
				}
			})
			.catch(err => {
				console.log('loadProblemTags ', err);
			});
	}

	const submit = () => {
		if (problemType?.id == null) return;
		if (description == null || description == '') {
			alerts.info('', translate('report.descriptionWarning'))
			return;
		}
		setLoading(true);
		apiFactory
			.post(`report/create`, {
				tag: problemType.title,
				comment: description,
				image: photo?.data
			})
			.then(
				(res) => {
					setLoading(false);
					alerts.info(translate('report.success_title'), translate('report.success')).then((res) => {
						props.navigation.goBack();
					});
				},
				(error) => {
					setLoading(false);
					console.log('onSubmit ', error);
					const message = error.message || translate('generic_error');
					alerts.error(translate('alerts.error'), message);
				}
			);
	}

	return (
		<View style={[Theme.styles.background, { padding: 0 }]}>
			<Spinner visible={loading} />
			<Header1
				style={{ marginTop: 10, paddingHorizontal: 20, marginBottom: 0 }}
				onLeft={() => props.navigation.goBack()}
				title={translate('report.title')}
			/>
			<KeyboardAwareScrollView
				style={[{ flex: 1, width: '100%' }]}
				keyboardShouldPersistTaps='handled'
				scrollIndicatorInsets={{ right: 1 }}>
				<View style={[Theme.styles.col_center, { width: '100%', paddingHorizontal: 20, paddingTop: 10 }]}>
					<AppText style={styles.description}>{translate('report.subtitle')}</AppText>
					<View style={{ height: 25, }} />
					<AppText style={styles.subDescription}>{translate('report.subSubtitle')}</AppText>
					<View style={{ height: 20 }} />
					<ReportImageUploader photo={photo} iconName='plus' setPhoto={setPhoto} />
					<TouchableOpacity style={[Theme.styles.row_center, styles.problemType]} onPress={() => openTagModal(true)}>
						{
							isEmpty(problemType?.title) ?
								<Text style={[styles.problemTypePlaceholder]}>{translate('report.typePlaceholder')}</Text>
								:
								<Text style={[styles.problemTypeTxt]}>{problemType?.title}</Text>
						}
						<Feather name='chevron-down' size={20} color={Theme.colors.cyan2} style={{ marginLeft: 8 }} />
					</TouchableOpacity>
					<CommentInput
						placeholder={translate('report.descriptionPlaceholder')}
						comments={description}
						height={220}
						style={{ marginTop: 30, width: '100%' }}
						onChangeText={setDescription}
						textStyle={{ fontSize: 16 }}
					/>
				</View>
			</KeyboardAwareScrollView>
			<View style={[Theme.styles.col_center, { width: '100%', marginBottom: 30, paddingHorizontal: 20 }]}>
				<MainBtn
					style={{ width: '100%' }}
					title={translate('report.report_issue')}
					onPress={submit}
				/>
			</View>
			{
				isTagModal &&
				<ReportTagsModal
					showModal={isTagModal}
					tags={tags.map(t => ({ id: t.id, title: (props.language == 'en' ? t.tag_en : (props.language == 'it' ? t.tag_it : t.tag_sq)) }))}
					selectedTag={problemType}
					onSelect={v => { setProblemType(v); openTagModal(false) }}
					onClose={() => openTagModal(false)}
				/>
			}
		</View>
	);
};
const styles = StyleSheet.create({
	description: {
		fontSize: 22,
		lineHeight: 24,
		fontFamily: Theme.fonts.medium,
		color: Theme.colors.text,
		textAlign: 'center'
	},
	subDescription: {
		fontSize: 18,
		lineHeight: 22,
		fontFamily: Theme.fonts.medium,
		color: Theme.colors.text,
		textAlign: 'center',
	},
	problemType: { width: '100%', height: 48, marginTop: 15, justifyContent: 'space-between', paddingLeft: 12, paddingRight: 12, borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.gray6 },
	problemTypeTxt: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
	problemTypePlaceholder: { fontSize: 16, color: Theme.colors.placeholder, fontFamily: Theme.fonts.medium, }
});

const mapStateToProps = ({ app }) => ({
	language: app.language,
});

export default connect(mapStateToProps, {
})(ReportFeedbackScreen);