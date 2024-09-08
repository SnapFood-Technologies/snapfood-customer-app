import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, FlatList, Linking, Platform } from 'react-native';
import RNContacts from 'react-native-contacts';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { height } from 'react-native-dimension';
import { AppText } from '..';
import Theme from "../../../theme";
import { translate } from '../../../common/services/translate'
import UserListItem from '../../../modules/chat/components/UserListItem';

const PromoReceiversModal = ({ showModal, users = [], onClose }) => {
    const [visible, setVisible] = useState(showModal);

    useEffect(() => {
        setVisible(showModal);
    }, [showModal])

    return <Modal
        isVisible={visible}
        backdropOpacity={0.33}
        onSwipeComplete={() => onClose()}
        onBackdropPress={() => onClose()}
    >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <View style={[Theme.styles.row_center, styles.header]}>
                <AppText style={styles.modalTitle}>{translate('promotions.promo_retrievers')}</AppText>
                <TouchableOpacity onPress={onClose} style={[{ marginTop: 15, height: 35 }]}>
                    <AntDesign name={"close"} size={22} color={Theme.colors.gray5} />
                </TouchableOpacity>
            </View>
            <FlatList
                style={styles.listContainer}
                data={users}
                numColumns={1}
                keyExtractor={(item, index) => index.toString()}
                renderItem={item => {
                    return (
                        <UserListItem
                            full_name={item.item.username || item.item.full_name}
                            photo={item.item.photo}
                            type='none'
                            style={{ height: 50 }}
                            rightComp={<AppText>{item.item.shared_time}</AppText>}
                            onPress={() => {
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
    modalContent: { width: '100%', maxHeight: height(80), paddingHorizontal: 20, paddingBottom: 30, paddingTop: 12, backgroundColor: Theme.colors.white, borderRadius: 15, },
    modalTitle: { flex: 1, textAlign: 'center', fontSize: 20, lineHeight: 23, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    operationTab: { width: '100%', marginTop: 5 },
    listContainer: { width: '100%', maxHeight: height(60), marginTop: 20 },
    spaceCol: { height: 10 }
});

export default PromoReceiversModal;
