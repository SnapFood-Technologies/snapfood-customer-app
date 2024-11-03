import React, { useEffect, useMemo, useState } from 'react';
import { connect, useSelector } from 'react-redux';
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
import GalleryMoreBtn from '../components/GalleryMoreBtn';
import RouteNames from '../../../routes/names';

const InterestsScreen = (props) => {
	const language = useSelector(state => state.app.language);
	const [loading, setLoading] = useState(false);
	const [foodTags, setFoodTags] = useState([]);
	const [socialTags, setSocialTags] = useState([]);
	const [selected, setSelected] = useState([])
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		loadInterests();
	}, [])

	const loadInterests = async () => {
		try {
			const { data } = await apiFactory.get(`interests`);
			const interests = data?.interests || [];
			setFoodTags(interests.filter(i => i.category == 'food'))
			setSocialTags(interests.filter(i => i.category == 'social'))
			setSelected(data?.selected_interests || []);
		} catch (error) {
		}
	}

	const onSave = async () => {
		
		apiFactory.post(`interests`, { interests: selected })
			.then(async ({ data }) => {
				setHasChanges(false);
				alerts.info('', translate('interests.save_success')).then((res) => {
                });
			})
			.catch(error => {
			});
	}

	const onPressTag = (tag) => {
		setHasChanges(true)
		const cpy = selected.slice(0);
		const index = cpy.findIndex(s => s == tag.id);
		if (index != -1) {
			cpy.splice(index, 1);
		}
		else {
			cpy.push(tag.id);
		}
		setSelected(cpy);
	}

	return (
		<View style={[Theme.styles.background, { padding: 0, backgroundColor: '#ffffff' }]}>
			<Spinner visible={loading} />
			<Header1
				style={{ marginTop: 20, paddingHorizontal: 20, marginBottom: 0 }}
				onLeft={() => props.navigation.goBack()}
				title={translate('account.preferences')}
				right={
					<GalleryMoreBtn
						onGallerySetting={() => {
							props.navigation.navigate(RouteNames.InterestSettingScreen)
						}}
					/>
				}
			/>
			<View style={{ width: '100%', paddingHorizontal: 20, marginTop: 12, marginBottom: 12 }}>
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
								selected={selected?.findIndex(s => s == t.id) != -1}
								language={language}
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
								selected={selected?.findIndex(s => s == t.id) != -1}
								language={language}
								onPress={() => {
									onPressTag(t);
								}}
							/>)
					}
				</View>
				<View style={{ height: 20 }} />
			</ScrollView>
			<View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 40  }}>
				<MainBtn
					title={translate('save')}
					disabled={!hasChanges}
					onPress={() => onSave()}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	title: { fontSize: 22, lineHeight: 24, margin: 0, width: '100%', textAlign: 'left' },
	description: { marginTop: 8, fontSize: 18, lineHeight: 21, width: '100%', marginLeft: 0, color: Theme.colors.gray7, textAlign: 'left' },
	subject: { marginTop: 15, fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, width: '100%' },
	scrollview: { width: '100%', flex: 1, paddingHorizontal: 20 },
	tagWrapper: { flexDirection: 'row', width: '100%', flexWrap: 'wrap' }
});

export default InterestsScreen;
