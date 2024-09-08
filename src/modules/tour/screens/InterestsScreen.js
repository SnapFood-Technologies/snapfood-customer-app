import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, StatusBar, Text, ScrollView } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import alerts from '../../../common/services/alerts';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import Header1 from '../../../common/components/Header1';
import AppText from '../../../common/components/AppText';
import MainBtn from '../../../common/components/buttons/main_button';
import TransBtn from '../../../common/components/buttons/trans_button';
import { isEmpty } from '../../../common/services/utility';
import { setStorageKey, KEYS } from '../../../common/services/storage';
import apiFactory from '../../../common/services/apiFactory';
import InterestTag from '../../../common/components/social/InterestTag';
import { setAskedInterests, } from '../../../store/actions/app';

const InterestsScreen = (props) => {
	const [loading, setLoading] = useState(false);
	const [foodTags, setFoodTags] = useState([]);
	const [socialTags, setSocialTags] = useState([]);
	const [selected, setSelected] = useState([])

	useEffect(() => {
		loadInterests()
	}, [])

	const loadInterests = async () => {
		apiFactory.get(`interests`)
			.then(({ data }) => {
				const interests = data?.interests || [];
				setFoodTags(interests.filter(i => i.category == 'food'))
				setSocialTags(interests.filter(i => i.category == 'social'))
			})
			.catch(error => {

			})
	}

	const onSave = async () => {
		try {
			await setStorageKey(KEYS.INTERESTS, selected);
			onSkip();
		} catch (e) {
			console.log(e);
		}
	}

	const onSkip = async () => {
		try {
			await setStorageKey(KEYS.ASKED_INTERESTS, true);
		} catch (e) {
			console.log(e);
		}
		props.setAskedInterests(true);
	}

	const onPressTag = (tag) => {
		const cpy = selected.slice(0);
		const index = cpy.findIndex(s => s.id == tag.id);
		if (index != -1) {
			cpy.splice(index, 1);
		}
		else {
			cpy.push(tag);
		}
		setSelected(cpy);
	}

	return (
		<View style={[Theme.styles.background, { padding: 0, backgroundColor: '#ffffff' }]}>
			<Spinner visible={loading} />
			<View style={{ width: '100%', paddingHorizontal: 20, marginTop: 45, marginBottom: 12 }}>
				<AppText style={[Theme.styles.locationTitle, styles.title]}>
					{translate('interests.title')}
				</AppText>
				<AppText style={[Theme.styles.locationDescription, styles.description]}>
					{translate('interests.description')}
				</AppText>
			</View>
			<ScrollView style={styles.scrollview}>
				<AppText style={styles.subject}>{translate('interests.food')}</AppText>
				<View style={styles.tagWrapper}>
					{
						foodTags.map(t =>
							<InterestTag
								key={t.id}
								data={t}
								selected={selected?.findIndex(tag => tag.id == t.id) != -1}
								language={props.language}
								onPress={() => {
									onPressTag(t);
								}}
							/>)
					}
				</View>
				<AppText style={styles.subject}>{translate('interests.social')}</AppText>
				<View style={styles.tagWrapper}>
					{
						socialTags.map(t =>
							<InterestTag
								key={t.id}
								data={t}
								selected={selected?.findIndex(tag => tag.id == t.id) != -1}
								language={props.language}
								onPress={() => {
									onPressTag(t);
								}}
							/>)
					}
				</View>
				<View style={{ height: 20 }} />
			</ScrollView>
			<View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 12 }}>
				<MainBtn
					title={translate('interests.continue')}
					disabled={selected.length == 0}
					onPress={() => onSave()}
				/>
				<TransBtn
					style={{ marginTop: 10, }}
					title={translate('interests.skip')}
					onPress={onSkip}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	title: { fontSize: 22, lineHeight: 32, margin: 0, width: '100%', textAlign: 'left' },
	description: {marginTop: 8, fontSize: 18, lineHeight: 24, width: '100%', marginLeft: 0, color: Theme.colors.gray7, textAlign: 'left' },
	subject: {marginTop: 15, fontSize: 19, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, width: '100%' },
	scrollview: { width: '100%', flex: 1, paddingHorizontal: 20 },
	tagWrapper: { flexDirection: 'row', width: '100%', flexWrap: 'wrap' }
});

function mapStateToProps({ app }) {
	return {
		language: app.language
	};
}

export default connect(mapStateToProps, {
	setAskedInterests
})(InterestsScreen);
