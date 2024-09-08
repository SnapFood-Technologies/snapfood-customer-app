import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Switch } from 'react-native';
import { connect } from 'react-redux';
import { translate } from '../../../common/services/translate';
import { updateProfileDetails } from '../../../store/actions/auth';
import Theme from '../../../theme';
import RadioBtn from '../../../common/components/buttons/radiobtn';
import Header1 from '../../../common/components/Header1';

const InterestSettingScreen = (props) => {

	const onUpdateNoti = (data) => {
		props
			.updateProfileDetails(data)
			.then((res) => { })
			.catch((err) => {
				console.log('updateProfileDetails', err);
			});
	};

	return (
		<View style={styles.container}>
			<Header1
				style={{ marginTop: 10, marginBottom: 10, paddingHorizontal: 20 }}
				onLeft={() => {
					props.navigation.goBack();
				}}
				title={translate('interests.privacy')}
			/>
			<View style={styles.formView}>
				<ScrollView style={{ flex: 1, width: '100%', paddingHorizontal: 20 }}>
					<View style={[Theme.styles.col_center, styles.sectionView]}>
						<View style={[Theme.styles.col_center_start, styles.language]}>
							<View style={[Theme.styles.row_center, { width: '100%', marginBottom: 16 }]}>
								<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>{translate('interests.privacy')}</Text>
							</View>
							<TouchableOpacity
								onPress={() => onUpdateNoti({ interests_public: props.user.interests_public == 1 ? 0 : 1 })}
								style={[Theme.styles.row_center, { width: '100%', marginBottom: 16, }]}
							>
								<View>
									<Text style={[styles.langtxt]}>{translate('interests.public')}</Text>
									<Text style={[styles.setting_desc]}>{translate('interests.public_desc')}</Text>
								</View>
								<View style={{ flex: 1 }} />
								<RadioBtn
									onPress={() => onUpdateNoti({ interests_public: props.user.interests_public == 1 ? 0 : 1 })}
									checked={props.user.interests_public == 1}
								/>
							</TouchableOpacity>
							<View style={styles.divider} />
							<TouchableOpacity
								onPress={() => onUpdateNoti({ interests_public: props.user.interests_public == 1 ? 0 : 1 })}
								style={[Theme.styles.row_center, { width: '100%', paddingTop: 16, marginBottom: 16 }]}
							>
								<View>
									<Text style={[styles.langtxt]}>{translate('interests.private')}</Text>
									<Text style={[styles.setting_desc]}>{translate('interests.private_desc')}</Text>
								</View>
								<View style={{ flex: 1 }} />
								<RadioBtn
									onPress={() => onUpdateNoti({ interests_public: props.user.interests_public == 1 ? 0 : 1 })}
									checked={props.user.interests_public == 0}
								/>
							</TouchableOpacity>
						</View>
					</View>
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
});

export default connect(mapStateToProps, {
	updateProfileDetails,
})(InterestSettingScreen);
