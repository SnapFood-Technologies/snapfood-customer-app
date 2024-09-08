import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Theme from "../../../theme";
import Svg_birthday from '../../assets/svgs/birthday.svg';
import Svg_chat from '../../assets/svgs/msg/chat.svg'
import { translate } from '../../services/translate';
import TransButton from '../buttons/trans_button';

const BirthdayModal = ({ showModal, full_name, isFriend, invite_status, onChat = () => { }, onInvite = () => { }, onClose = () => { } }) => {
    const [visible, SetVisible] = useState(showModal)
    useEffect(() => {
        SetVisible(showModal)
    }, [showModal])

    return <Modal
        isVisible={visible}
        backdropOpacity={0.33}
        onSwipeComplete={onClose}
        onBackdropPress={onClose}
        style={{ paddingHorizontal: 25 }}
    >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <View style={[Theme.styles.row_center, { width: '100%', justifyContent: 'flex-end' }]}>
                <TouchableOpacity style={{ marginLeft: 8 }} onPress={onClose}>
                    <AntDesign name='close' size={24} color={Theme.colors.gray7} />
                </TouchableOpacity>
            </View>
            <Svg_birthday width={192} height={122} />
            <Text style={styles.modalTitle}>{translate('social.their_birthday')}</Text>
            <Text style={styles.descTxt}>{translate('social.their_birthday_desc').replace('####', full_name)}</Text>
            <View style={[Theme.styles.row_center, { marginTop: 17, }]}>
                {
                    isFriend == true ?
                        <TouchableOpacity
                            style={[Theme.styles.row_center]}
                            activeOpacity={0.75}
                            onPress={onChat}>
                            <Svg_chat width={20} height={20} />
                            <Text style={styles.chatBtnTxt}>Chat</Text>
                        </TouchableOpacity>
                        :
                        (
                            invite_status == 'invited' ?
                                <Text style={styles.invitedTxt}>{translate('chat.already_invited')}</Text>
                                :
                                <TransButton
                                    btnTxtColor={Theme.colors.gray7}
                                    title={translate('chat.add_friend')}
                                    onPress={onInvite}
                                />
                        )
                }
            </View>
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    modalContent: { width: '100%', paddingHorizontal: 26, paddingTop: 16, paddingBottom: 25, backgroundColor: Theme.colors.white, borderRadius: 15, },
    modalTitle: { marginTop: 25, fontSize: 20, lineHeight: 27, fontFamily: Theme.fonts.bold, color: Theme.colors.text, },
    descTxt: { textAlign: 'center', marginTop: 10, fontSize: 14, lineHeight: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7 },
    chatBtnTxt: { color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold, fontSize: 16, marginLeft: 8 },
    invitedTxt: { marginTop: 10, fontSize: 16, lineHeight: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7 },
});

export default BirthdayModal;
