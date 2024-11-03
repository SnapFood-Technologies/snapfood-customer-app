import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import Header1 from '../../../common/components/Header1';
import FilterItem from '../../../common/components/FilterItem';
import { setProfileBlogFilter } from '../../../store/actions/app';

const BlogFilterScreen = (props) => {
	const [selected_catid, setCategoryId] = useState(props.profile_blog_filter.category_id);

	const applyFilter = () => {
		props.setProfileBlogFilter({ category_id: selected_catid });
		props.navigation.goBack();
	};

	return (
		<View style={styles.container}>
			<Header1
				style={{ paddingHorizontal: 20 }}
				onLeft={() => {
					props.navigation.goBack();
				}}
				onRight={() => applyFilter()}
				right={<Text style={styles.applyBtn}>{translate('search.apply')}</Text>}
				title={translate('search.filter')}
			/>
			<View style={styles.formView}>
				<ScrollView style={{ flex: 1, width: '100%', paddingHorizontal: 20 }}>
					<FilterItem
						item={{ name: translate('blog.all_topic'), type: 'checkbox' }}
						isChecked={selected_catid == null}
						onSelect={(data) => {
							setCategoryId(null);
						}}
					/>
					{props.blog_categories.map((item, index) => (
						<FilterItem
							key={index}
							item={{ name : (props.language == 'en' ? item.title : item.sq_title), type: 'checkbox' }}
							isChecked={selected_catid == item.id}
							onSelect={(data) => {
								
								setCategoryId(item.id);
							}}
						/>
					))}
					<View style={{ height: 20 }}></View>
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
		backgroundColor: Theme.colors.white,
		paddingTop: 20,
	},
	formView: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '100%',
	},
	applyBtn: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },
});

const mapStateToProps = ({ app }) => ({
	language : app.language,
	blog_categories: app.blog_categories || [],
	profile_blog_filter: app.profile_blog_filter,
});

export default connect(mapStateToProps, {
	setProfileBlogFilter,
})(BlogFilterScreen);
