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
import { setShowInviteFriendModal } from '../../../store/actions/app';
import UserListItem from '../../../modules/chat/components/UserListItem';
import SwitchTab from '../../../common/components/SwitchTab';
import AppTooltip from '../../../common/components/AppTooltip';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../services/alerts';

const InviteContactsFriendModal = (props) => {
    const [visible, setVisible] = useState(false);
    const [showContacts, setShowContacts] = useState(false);
    const [opType, setOpType] = useState('Contacts');

    const [contacts, setContacts] = useState([]);
    const [snapfooders, setSnapfooders] = useState([]);

    useEffect(() => {
        if (props.show_invite_contacts_friend_modal == true) {
            loadData();
        }
        else {
            setVisible(false);
        }
    }, [props.show_invite_contacts_friend_modal])

    const loadData = async () => {
        let has_contacts = await loadContactsData();
        let has_snapfooders = await loadSnapfooders();

        if (!has_contacts && !has_snapfooders) {
            onClose();
        }
        else {
            setVisible(true);
        }
    }

    const loadContactsData = async () => {
        try {
            let contactData = [];
            const res = await RNContacts.checkPermission();
            if (res == 'authorized') {
                let contactsList = await RNContacts.getAll();
                contactsList = contactsList.slice(0, 100);
                let fined_contacts = contactsList.map((c) => ({
                    recordID: c.recordID,
                    givenName: c.givenName,
                    familyName: c.familyName,
                    full_name: c.givenName + ' ' + c.familyName,
                    phoneNumbers: c.phoneNumbers,
                }));

                let res = await apiFactory.post(`users/check-contacts-issign`, {
                    contacts: [],
                    contact_list: fined_contacts,
                });

                if (res.data) {
                    contactsList = res.data.data || [];

                    for (let i = 0; i < contactsList.length; i++) {
                        if (contactsList[i].phoneNumbers.length > 0 && (contactsList[i].phoneNumbers[0].isSigned != 1)) {
                            contactData.push(contactsList[i]);
                        }
                    }
                }
            }

            if (contactData.length > 0) {
                // pickup 20 random
                var newContactData = [];

                for (var i = 0; i < Math.min(20, contactData.length); i++) {
                    var idx = Math.floor(Math.random() * contactData.length);
                    newContactData.push(contactData[idx]);
                    contactData.splice(idx, 1);
                }

                setContacts(newContactData);
                setShowContacts(true);

                return true;
            }
            else {
                setShowContacts(false);
                return false;
            }

        } catch (e) {
            
            return false;
        }
    }

    const loadSnapfooders = async () => {
        try {
            let res = await apiFactory.get(`/users/random-snapfooders?count=20`);

            // 
            if (res.data && res.data.snapfooders && res.data.snapfooders.length > 0) {
                setSnapfooders(res.data.snapfooders);
                return true;
            }
            else {
                return false;
            }
        } catch (e) {
            
            return false;
        }
    };

    const onClose = () => {
        props.setShowInviteFriendModal(false);
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
                    let tmpCpy = snapfooders.slice(0);
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

    const onCancelInvitation = async (item) => {
        apiFactory
            .post(`users/friends/remove`, {
                user_id: props.user.id,
                friend_id: item.id,
            })
            .then(
                (res) => {
                    let tmpCpy = snapfooders.slice(0);
                    let foundIndex = tmpCpy.findIndex(p => p.id == item.id);
                    if (foundIndex != -1) {
                        tmpCpy[foundIndex].invite_status = '';
                        setSnapfooders(tmpCpy);
                    }
                },
                (error) => {
                    const message = error.message || translate('generic_error');
                    alerts.error(translate('alerts.error'), message);
                }
            );
    };

    const sendInvitationContact = (phoneData) => {
        let bodyTxt = `Akoma nuk je bërë pjesë e komunitetit? Mua më gjen në Snapfood së bashku me shumë të tjerë. Për të shkarkuar aplikacionin, kliko: https://snapfood.al/download-app`;
        if (props.language == 'en') {
            bodyTxt = `You’re not part of the community yet? You can find me and so many others on Snapfood. Click to download the app: https://snapfood.al/download-app`;
        }
        const url = `sms:${phoneData.number}${Platform.OS === 'ios' ? '&' : '?'
            }body=${bodyTxt}`;
        Linking.openURL(url);
    }

    

    return <Modal
        isVisible={visible}
        backdropOpacity={0.33}
        onSwipeComplete={() => onClose()}
        onBackdropPress={() => onClose()}
    >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <View style={[Theme.styles.row_center, styles.header]}>
                {
                    showContacts ?
                        <AppTooltip
                            title={translate('social.inviteContacts')}
                            description={translate('ask_contacts.description')}
                            placement={'bottom'}
                            arrowStyle={{ marginBottom: -2, left: 20, marginLeft: 12 }}
                        />
                        :
                        <AppTooltip
                            title={translate('social.inviteContacts')}
                            description={translate('ask_contacts.description')}
                            placement={'bottom'}
                            arrowStyle={{ marginBottom: -2, left: 20, marginLeft: 12 }}
                        />
                }
                <AppText style={styles.modalTitle}>{showContacts ? translate('social.inviteContacts') : translate('social.inviteContacts')}</AppText>
                <TouchableOpacity onPress={onClose} style={[{ marginTop: 15, height: 35 }]}>
                    <AntDesign name={"close"} size={22} color={Theme.colors.gray5} />
                </TouchableOpacity>
            </View>
            {
                contacts.length > 0 && snapfooders.length > 0 &&
                <View style={[Theme.styles.row_center, styles.operationTab]}>
                    <SwitchTab
                        items={['Contacts', 'Snapfooders']}
                        curitem={opType}
                        style={{ width: '100%', paddingLeft: 0, paddingRight: 0 }}
                        onSelect={(item) => setOpType(item)}
                    />
                </View>
            }
            {
                (showContacts && opType == 'Contacts') ?
                    <FlatList
                        style={styles.listContainer}
                        data={contacts}
                        numColumns={1}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={item => {
                            return (
                                <UserListItem
                                    full_name={item.item.full_name}
                                    photo={null}
                                    phoneNumber={null}
                                    contact_phone={item.item.phoneNumbers.length > 0 ? item.item.phoneNumbers[0].number : null}
                                    invite_status={null}
                                    isSigned={null}
                                    isFriend={null}
                                    type={'contacts'}
                                    // style={{ height: 50 }}
                                    onPress={() => { }}
                                    onRightBtnPress={() => {
                                        if (item.item.phoneNumbers.length > 0) {
                                            sendInvitationContact(item.item.phoneNumbers[0]);
                                        }
                                    }}
                                />
                            );
                        }}
                        ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
                    />
                    :
                    <FlatList
                        style={styles.listContainer}
                        data={snapfooders}
                        numColumns={1}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={item => {
                            return (
                                <UserListItem
                                    full_name={item.item.username || item.item.full_name}
                                    photo={item.item.photo}
                                    invite_status={item.item.invite_status}
                                    type='snapfooder'
                                    // style={{ height: 50 }}
                                    onPress={() => { }}
                                    onRightBtnPress={
                                        item.item.invite_status == 'invited'
                                            ? () => onCancelInvitation(item.item)
                                            : () => onSendInvitation(item.item)
                                    }
                                />
                            );
                        }}
                        ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
                    />
            }
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    header: { width: '100%' },
    modalContent: { width: '100%', maxHeight: 500, paddingHorizontal: 20, paddingBottom: 30, paddingTop: 12, backgroundColor: Theme.colors.white, borderRadius: 15, },
    modalTitle: { flex: 1, textAlign: 'center', fontSize: 20, lineHeight: 23, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    operationTab: { width: '100%', marginTop: 5 },
    listContainer: { width: '100%', maxHeight: height(60), marginTop: 20 },
    spaceCol: { height: 10 }
});

const mapStateToProps = ({ app }) => ({
    language: app.language,
    user: app.user,
    show_invite_contacts_friend_modal: app.show_invite_contacts_friend_modal,
});

export default connect(mapStateToProps, {
    setShowInviteFriendModal
})(InviteContactsFriendModal);
