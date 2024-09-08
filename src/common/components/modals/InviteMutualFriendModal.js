import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, FlatList, Linking, Platform } from 'react-native';
import RNContacts from 'react-native-contacts';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { connect } from 'react-redux';
import { height } from 'react-native-dimension';
import { AppText } from '..';
import { KEYS, setStorageKey } from '../../services/storage';
import Theme from "../../../theme";
import { translate } from '../../../common/services/translate'
import { setShowMutualFriendInviteModal } from '../../../store/actions/app';
import UserListItem from '../../../modules/chat/components/UserListItem';
import SwitchTab from '../../../common/components/SwitchTab';
import AppTooltip from '../../../common/components/AppTooltip';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../services/alerts';

const InviteMutualFriendModal = (props) => {
    const [mutualSnapfooders, setSnapfooders] = useState(props.invite_mutual_friends);

    useEffect(() => {
        setSnapfooders(props.invite_mutual_friends)
    }, [props.invite_mutual_friends])

    const onClose = () => {
        props.setShowMutualFriendInviteModal(false);
    }

    const onSendInvitation = async (item) => {
        apiFactory
            .post(`users/friends/update`, {
                user_id: props.user.id,
                friend_id: item.id,
                status: 'invited',
            })
            .then(
                (res) => {
                    // alerts.info(null, translate('social.inviteMutualFriendSuccess'))
                    let tmpCpy = mutualSnapfooders.slice(0);
                    let foundIndex = tmpCpy.findIndex(p => p.id == item.id);
                    if (foundIndex != -1) {
                        tmpCpy[foundIndex].invite_status = 'invited';

                        setSnapfooders(tmpCpy);
                    }
                },
                (error) => {
                    const message = error.message || translate('generic_error');
                    alerts.error(translate('alerts.error'), message);
                }
            );
    };

    return <Modal
        isVisible={props.show_invite_mutual_friend_modal == true && props.invite_mutual_friends.length > 0}
        backdropOpacity={0.33}
        onSwipeComplete={() => onClose()}
        onBackdropPress={() => onClose()}
    >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <View style={[Theme.styles.row_center, styles.header]}>
                <AppTooltip
                    title={translate('social.inviteMutualFriendTooltipTitle')}
                    description={translate('social.inviteMutualFriendTooltipMessage')}
                    placement={'bottom'}
                    arrowStyle={{ marginBottom: -2, left: 20, marginLeft: 12 }}
                />
                <AppText style={styles.modalTitle}>{translate('social.inviteFriends')}</AppText>
                <TouchableOpacity onPress={onClose} style={[{ marginTop: 15, height: 35 }]}>
                    <AntDesign name={"close"} size={22} color={Theme.colors.gray5} />
                </TouchableOpacity>
            </View>
            <FlatList
                style={styles.listContainer}
                data={mutualSnapfooders}
                numColumns={1}
                keyExtractor={(item, index) => index.toString()}
                renderItem={item => {
                    return (
                        <UserListItem
                            full_name={item.item.username || item.item.full_name}
                            phoneNumber={
                                `${item.item.mutual_friend_count} ` +
                                (item.item.mutual_friend_count == 1 ? translate('social.mutual_friend_one') : translate('social.mutual_friend_many'))
                            }
                            photo={item.item.photo}
                            invite_status={item.item.invite_status}
                            type='mutual_snapfooder'
                            style={{ height: 50 }}
                            onPress={() => {
                                onClose()
                                setTimeout(()=>{
                                    props.onGoDetail(item.item);
                                }, 400)
                            }}
                            onRightBtnPress={() => {
                                if (item.item.invite_status != 'invited') {
                                    onSendInvitation(item.item)
                                }
                            }}
                        />
                    );
                }}
                ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
            />
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    header: { width: '100%' },
    modalContent: { width: '100%', maxHeight: 500, paddingHorizontal: 20, paddingBottom: 30, paddingTop: 12, backgroundColor: Theme.colors.white, borderRadius: 15, },
    modalTitle: { flex: 1, textAlign: 'center', fontSize: 20, lineHeight: 23, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    listContainer: { width: '100%', maxHeight: height(60), marginTop: 20 },
    spaceCol: { height: 10 }
});

const mapStateToProps = ({ app }) => ({
    user: app.user,
    show_invite_mutual_friend_modal: app.show_invite_mutual_friend_modal ?? false,
    invite_mutual_friends: app.invite_mutual_friends ?? [],
});

export default connect(mapStateToProps, {
    setShowMutualFriendInviteModal
})(InviteMutualFriendModal);
