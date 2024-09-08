import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, FlatList, Linking, Platform } from 'react-native';
import RNContacts from 'react-native-contacts';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { connect } from 'react-redux';
import { height } from 'react-native-dimension';
import { AppText } from '..';
import Theme from "../../../theme";
import { translate } from '../../../common/services/translate'
import UserListItem from '../../../modules/chat/components/UserListItem';
import { MainBtn } from '..';
import { setOrderFor } from '../../../store/actions/shop';

const OrderFriendsModal = (props) => {
    const [visible, setVisible] = useState(props.showModal);
    const [selectedFriend, setSelectedFriend] = useState(null);

    useEffect(() => {
        setVisible(props.showModal);
    }, [props.showModal])
  
    const onClose = () => {
        props.onClose();
    }

    const onSelectFriend = () => {
        if (selectedFriend == null) { return }
        props.onSelectFriend(selectedFriend);
    }

    return <Modal
        isVisible={visible}
        backdropOpacity={0.33}
        onSwipeComplete={() => onClose()}
        onBackdropPress={() => onClose()}
    >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <View style={[Theme.styles.row_center, styles.header]}>
                <AppText style={styles.modalTitle}>{translate('Friends')}</AppText>
                <TouchableOpacity onPress={onClose} style={[{ marginTop: 15, height: 35 }]}>
                    <AntDesign name={"close"} size={22} color={Theme.colors.gray5} />
                </TouchableOpacity>
            </View>
            <FlatList
                style={styles.listContainer}
                data={props.friends}
                numColumns={1}
                keyExtractor={(item, index) => index.toString()}
                renderItem={item => {
                    return (
                        <UserListItem
                            full_name={item.item.username || item.item.full_name}
                            photo={item.item.photo}
                            checked={selectedFriend != null && selectedFriend.id == item.item.id}
                            type='checkbox'
                            style={{ height: 50 }}
                            onPress={() => {
                                setSelectedFriend(item.item)
                            }}
                        />
                    );
                }}
                ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
            />
            <MainBtn
                disabled={selectedFriend == null}
                style={{ width: '100%', marginTop: 20 }}
                title={translate('select_friend')}
                onPress={onSelectFriend}
            />
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
    user: app.user,
});

export default connect(mapStateToProps, {
    setOrderFor
})(OrderFriendsModal);
