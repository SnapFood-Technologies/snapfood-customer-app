import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux'
import { translate } from '../../../common/services/translate';
import apiFactory from '../../../common/services/apiFactory';
import Theme from '../../../theme';
import Feather from 'react-native-vector-icons/Feather'
import Header1 from '../../../common/components/Header1';
import ReferralHistItem from '../components/ReferralHistItem';
import NoFriends from '../../chat/components/NoFriends';
import {
    goActiveScreenFromPush
} from '../../../store/actions/app';
import MainButton from '../../../common/components/buttons/main_button';
import RouteNames from '../../../routes/names';

const InvitationReferralsHistScreen = (props) => {
	const _isMounted = useRef(true);

	const [referrals, setReferrals] = useState([])
	const [isLoading, setLoading] = useState(null)

	useEffect(() => {
		props.goActiveScreenFromPush({
			isReferralVisible: false
		})
		_isMounted.current = true;
		getReferrals()
		return () => {
			_isMounted.current = false;
		};
	}, [])

	const getReferrals = async () => {
		setLoading(true)
		apiFactory.get('/invite-earn/get-refferal-hist')
			.then(({ data }) => {
				if (_isMounted.current == true) {
					setReferrals(data.refferals || [])
					setLoading(false)
				}
			})
			.catch(err => {
				if (_isMounted.current == true) {
					setLoading(false)
					console.log('err getReferrals ', err)
				}
			});
	};

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			<Header1
				style={{ marginBottom: 10, marginTop: 10, paddingHorizontal: 20 }}
				onLeft={() => { props.navigation.goBack() }}
				title={translate('invitation_earn.referrals_hist')}
				onRight={() => props.navigation.navigate(RouteNames.InviteScreen, { fromPush: false })}
				right={<Feather name='plus' color={Theme.colors.text} size={24} />}
			/>
			<ScrollView style={styles.scrollview}>
				{
					referrals.map((item, index) =>
						<ReferralHistItem key={index} data={item} style={{ width: '100%', marginBottom: 12, }} onSelect={() => { }} />
					)
				}
				<View style={{ height: 40, }} />
				{
					(referrals.length == 0 && isLoading == false) &&
					<View style={Theme.styles.col_center_start}>
						<NoFriends title={translate('social.no_invitations')} desc={translate('social.no_received_invitations')} />
						<MainButton
							title={translate('Invite')}
							style={{ width : '80%', marginTop: 25, paddingHorizontal: 20, }}
							onPress={() => {
								props.navigation.navigate(RouteNames.InviteScreen, { fromPush: false })
							}}
						/>
					</View>
					
				}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	scrollview: { flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: Theme.colors.white },
})


const mapStateToProps = ({ app }) => ({
});

export default connect(mapStateToProps, {
	goActiveScreenFromPush
})(InvitationReferralsHistScreen);