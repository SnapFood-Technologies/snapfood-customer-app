import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux'
import { translate } from '../../../common/services/translate';
import apiFactory from '../../../common/services/apiFactory';
import Theme from '../../../theme';
import SwitchTab from '../../../common/components/SwitchTab';
import Header1 from '../../../common/components/Header1';
import InvitationHistItem from '../components/InvitationHistItem';
import NoFriends from '../../chat/components/NoFriends';
import RouteNames from '../../../routes/names';
import MainButton from '../../../common/components/buttons/main_button';
import Feather from 'react-native-vector-icons/Feather'

const InvitationHistScreen = (props) => {
	const active_only = props.route?.params?.active == true;

	const _isMounted = useRef(true);

	const [opType, setOpType] = useState('Sent')
	const [sents, setSents] = useState([])
	const [receiveds, setReceiveds] = useState([])

	const [isLoadingSent, setLoadingSent] = useState(null)
	const [isLoadingReceived, setLoadingReceived] = useState(null)

	useEffect(() => {
		_isMounted.current = true
		getSentInvitations()
		getReceivedInvitations()
		return () => {
			
			_isMounted.current = false;
		};
	}, [])

	const getSentInvitations = async () => {
		setLoadingSent(true)
		apiFactory.get('/invite-earn/get-invitation_hist?sent=1' + (active_only ? '&active=1' : ''))
			.then(({ data }) => {
				if (_isMounted.current == true) {
					setSents(data.invitations || [])
					setLoadingSent(false)
				}
			})
			.catch(err => {
				if (_isMounted.current == true) {
					setLoadingSent(false)
					
				}
			});
	};

	const getReceivedInvitations = async () => {
		setLoadingReceived(true)
		apiFactory.get('/invite-earn/get-invitation_hist?sent=0' + (active_only ? '&active=1' : ''))
			.then(({ data }) => {
				if (_isMounted.current == true) {
					setReceiveds(data.invitations || [])
					setLoadingReceived(false)
				}
			})
			.catch(err => {
				if (_isMounted.current == true) {
					setLoadingReceived(false)
					
				}
			});
	};

	const _renderOperationTabs = () => {
		return <View style={[Theme.styles.row_center, styles.operationTab]}>
			<SwitchTab
				items={['Sent', 'Received']}
				curitem={opType}
				style={{ width: '100%', paddingLeft: 0, paddingRight: 0 }}
				onSelect={(item) => setOpType(item)}
			/>
		</View>
	}

	return (
		<View style={[Theme.styles.col_center_start, { flex: 1, backgroundColor: Theme.colors.white }]}>
			<Header1
				style={{ marginTop: 10, marginBottom: 10, paddingHorizontal: 20 }}
				onLeft={() => { props.navigation.goBack() }}
				title={active_only ? translate('invitation_earn.active_earninvitations') : translate('invitation_earn.invitation_hist')}
				onRight={() => props.navigation.navigate(RouteNames.EarnScreen, { fromPush: false })}
				right={<Feather name='plus' color={Theme.colors.text} size={24} />}
			/>
			<View style={{ width: '100%', paddingHorizontal: 20, }}>
				{_renderOperationTabs()}
			</View>
			<ScrollView style={styles.scrollview}>
				<View style={{ height: 20, }} />
				{
					(opType == 'Sent' ? sents : receiveds).map((item, index) =>
						<InvitationHistItem key={index} data={item} is_received={opType == 'Received'} style={{ width: '100%', marginBottom: 12, }} onSelect={() => {
							props.navigation.navigate(RouteNames.InvitationDetailsScreen, { invitation_id: item.id })
						}} />
					)
				}
				<View style={{ height: 40, }} />
				{
					((opType == 'Sent' && sents.length == 0 && isLoadingSent == false) || (opType != 'Sent' && receiveds.length == 0 && isLoadingReceived == false)) &&
					<View style={Theme.styles.col_center_start}>
						<NoFriends title={translate('social.no_invitations')} desc={opType == 'Sent' ? translate('social.no_sent_invitations') : translate('social.no_received_invitations')} />
						{opType == 'Sent' && (
							<MainButton
							title={translate('Earn')}
							style={{ width : '80%', marginTop: 25, paddingHorizontal: 20, }}
							onPress={() => {
								props.navigation.navigate(RouteNames.EarnScreen, { fromPush: false })
							}}
						/>
						)}
					</View>
				}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	searchView: { width: '100%', paddingHorizontal: 20, marginTop: 48, },
	operationTab: { height: 62, width: '100%', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F6F6F9' },
	subjectTitle: { fontSize: 17, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	divider: { width: '100%', height: 1, backgroundColor: '#F6F6F9' },
	scrollview: { flex: 1, width: '100%', paddingHorizontal: 20, backgroundColor: Theme.colors.white },
	categList: { marginTop: 16, },
	scrollviewHider: { width: '100%', marginTop: -12, height: 15, backgroundColor: Theme.colors.white },

})


const mapStateToProps = ({ app }) => ({
});

export default connect(mapStateToProps, {
})(InvitationHistScreen);