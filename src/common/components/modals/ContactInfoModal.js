import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import Theme from '../../../theme';
import { translate } from '../../services/translate';
import UserListItem from '../../../modules/chat/components/UserListItem';

const ContactInfoModal = ({ showModal, data, onClose, onGoDetails, onRightBtnPress }) => {
    const [contactData, SetData] = useState(data)
    const [visible, SetVisible] = useState(showModal)

    useEffect(() => {
        SetVisible(showModal);
        SetData(data);
    }, [showModal])

    useEffect(() => {
        SetData(data);
    }, [data])

    if (!contactData) {
        return null;
    }
    return <Modal
        testID={'modal'}
        isVisible={visible}
        onBackdropPress={onClose}
        onSwipeComplete={onClose}
        backdropOpacity={0.33}
        swipeDirection={['down']}
        style={{ justifyContent: 'flex-end', margin: 0 }}>
        <View style={[styles.modalVendorContent]}>
            <Text style={styles.modalTitle}>{(contactData.givenName + ' ' + contactData.familyName)}</Text>
            {
                contactData.phoneNumbers.map((phone, index) =>
                    <UserListItem
                        key={index}
                        full_name={phone.number}
                        photo={phone.photo}
                        invite_status={phone.invite_status}
                        isSigned={phone.isSigned == 1}
                        isFriend={phone.isFriend == 1}
                        contact_phone={phone.number}
                        type={'contacts'}
                        style={{backgroundColor: Theme.colors.white, marginBottom: 6}}
                        onPress={() => {
                            if (phone.isSigned == 1) {
                                onGoDetails(phone)
                            }
                        }}
                        onRightBtnPress={() => onRightBtnPress(contactData, phone)}
                    />
                )
            }
        </View>
    </Modal>
};

const styles = StyleSheet.create({
    modalVendorContent: { width: '100%', minHeight: 280, paddingHorizontal: 12, paddingVertical: 20, backgroundColor: Theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    modalTitle: { width: '100%', marginBottom: 20, textAlign: 'center', fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    total: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: Theme.colors.white, borderWidth: 1, borderColor: Theme.colors.cyan2 },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 6,
        marginRight: 20,
    },
    name: {
        flex: 1,
        fontSize: 16,
        color: Theme.colors.text,
        fontFamily: Theme.fonts.semiBold,
    },
})


export default ContactInfoModal;