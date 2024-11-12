import { useEffect, useRef } from 'react';
import { setAllChannels, setChannelsLoading, setNewInvites } from '../../../store/actions/chat';
import FireStore from '../../../common/services/firebase';
import { connect } from 'react-redux';
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';

let channel_collection = FireStore.collection('channels');

const ChatListener = (props) => {
	const { setAllChannels, setChannelsLoading, setNewInvites, userId, activeRoute } = props;
	const chatchannel_unlistener = useRef(null);
	const mounted = useRef(false);

	const stopLoading = () => setChannelsLoading(false);

	setChannels = (snapshots) => {
		let channels = [];
		snapshots.forEach((doc) => channels.push(doc.data()));
		setAllChannels(channels);
		stopLoading();
	};

	const getChatChannelsListner = () => {
		if (chatchannel_unlistener?.current) chatchannel_unlistener.current();

		if (userId) {
			setChannelsLoading(true);
			chatchannel_unlistener.current = channel_collection
				.where('users', 'array-contains', userId)
				.orderBy('last_msg.createdAt', 'desc')
				.onSnapshot(setChannels, stopLoading);
		}
	};

	const getNewInvites = async () => {
		apiFactory.get(`users/invitations?seen=0`).then(
			({ data }) => {
				const res_invitations = data['invitations'];
				if (mounted?.current) setNewInvites(res_invitations);
			},
			(error) => {
				// const message = error.message || translate('generic_error');
				// alerts.error(translate('alerts.error'), message);
			}
		);
	};

	// const onUnMount = () => {
	// 	if (chatchannel_unlistener?.current) chatchannel_unlistener.current();
	// };

	// const onMount = () => {
	// 	mounted.current = true;
	// 	getChatChannelsListner();
	// 	getNewInvites();
	// 	return onUnMount;
	// };

	// useEffect(onMount, []);
	// useEffect(getNewInvites, [activeRoute]);
	// useEffect(getChatChannelsListner, [userId]);

	useEffect(() => {
		getNewInvites();
	}, [activeRoute]);


	useEffect(() => {
		getChatChannelsListner();
	}, [userId]);

	useEffect(() => {
		mounted.current = true;
		getChatChannelsListner();
		getNewInvites();

		return () => {
			if (chatchannel_unlistener?.current) chatchannel_unlistener.current();
		};
	}, []);

	return null;
};

const mapStateToProps = ({ app }) => ({ userId: app.user.id, activeRoute: app.activeRoute });

export default connect(mapStateToProps, { setAllChannels, setChannelsLoading, setNewInvites })(ChatListener);
