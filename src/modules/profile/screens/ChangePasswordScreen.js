import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import { extractErrorMessage, validatePassword } from '../../../common/services/utility';
import { changePassword } from '../../../store/actions/auth';
import { setTmpPassChanged } from '../../../store/actions/app';
import alerts from '../../../common/services/alerts';
import Header1 from '../../../common/components/Header1';
import MainBtn from '../../../common/components/buttons/main_button';
import AuthInput from '../../../common/components/AuthInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const ChangePasswordScreen = (props) => {
	const [loading, setLoading] = useState(false);
	const [curPass, setCurPass] = useState('');
	const [newPass, setNewPass] = useState('');
	const [confirmPass, setConfirmPass] = useState('');

	const onChangePass = () => {
		validatePassword(curPass, newPass, confirmPass).then(async () => {
			try {
				setLoading(true);
				props
					.changePassword(curPass, newPass)
					.then(() => {
						setLoading(false);
						props.setTmpPassChanged(true);
						props.navigation.goBack();
					})
					.catch((error) => {
						setLoading(false);
						alerts.error('Error', extractErrorMessage(error));
					});
			} catch (e) {
				setLoading(false);
				alerts.error('Error', extractErrorMessage(e));
			}
		});
	};

	return (
		<View style={styles.container}>
			<Header1
				style={{ marginTop: 10, marginBottom: 10, paddingHorizontal: 20 }}
				onLeft={() => {
					props.setTmpPassChanged(false);
					props.navigation.goBack();
				}}
				title={translate('account_change_pass.header_title')}
			/>
			<KeyboardAwareScrollView style={[{ flex: 1 }]} keyboardShouldPersistTaps='handled'>
				<View style={styles.formview}>
					<AuthInput
						placeholder={translate('account_change_pass.cur_password')}
						underlineColorAndroid={'transparent'}
						autoCapitalize={'none'}
						placeholderTextColor={'#DFDFDF'}
						onChangeText={(val) => setCurPass(val)}
						returnKeyType={'done'}
						value={curPass}
						secure={true}
						setRef={ref => ref && ref.setNativeProps({ style: { fontFamily: 'Yellix-Medium' } })} 
						hideEye={false}
						style={{ marginBottom: 20 }}
					/>
					<AuthInput
						placeholder={translate('account_change_pass.new_password')}
						underlineColorAndroid={'transparent'}
						autoCapitalize={'none'}
						placeholderTextColor={'#DFDFDF'}
						onChangeText={(val) => setNewPass(val)}
						returnKeyType={'done'}
						value={newPass}
						secure={true}
						setRef={ref => ref && ref.setNativeProps({ style: { fontFamily: 'Yellix-Medium' } })} 
						hideEye={false}
						style={{ marginBottom: 20 }}
					/>
					<AuthInput
						placeholder={translate('account_change_pass.re_type_password')}
						underlineColorAndroid={'transparent'}
						autoCapitalize={'none'}
						placeholderTextColor={'#DFDFDF'}
						onChangeText={(val) => setConfirmPass(val)}
						returnKeyType={'done'}
						value={confirmPass}
						secure={true}
						setRef={ref => ref && ref.setNativeProps({ style: { fontFamily: 'Yellix-Medium' } })} 
						hideEye={false}
						style={{ marginBottom: 20 }}
					/>
				</View>
			</KeyboardAwareScrollView>

			<View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 40 }}>
				<MainBtn
					disabled={loading}
					loading={loading}
					title={translate('account_change_pass.header_title')}
					onPress={() => {
						onChangePass();
					}}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Theme.colors.white,
	},
	formview: {
		flex: 1,
		// marginTop: 10,
		paddingHorizontal: 20,
	},
});

function mapStateToProps({ app }) {
	return {
		user: app.user,
		language: app.language,
	};
}

export default connect(mapStateToProps, {
	changePassword,
	setTmpPassChanged,
})(ChangePasswordScreen);
