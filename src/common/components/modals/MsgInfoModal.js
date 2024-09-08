import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Theme from '../../../theme';
import { isEmpty, getImageFullURL } from '../../../common/services/utility';
import { translate } from '../../services/translate';
import RouteNames from '../../../routes/names';

const MsgInfoModal = ({ showModal, onClose, channelData, message, user_id, navigation }) => {
    const [visible, SetVisible] = useState(showModal)
    const [users, setUsers] = useState([])
    const [totalLikes, setTotalLikes] = useState(0)

    useEffect(() => {
        SetVisible(showModal)
    }, [showModal])

    useEffect(() => {
        if (channelData && message && message.likes) {
            setTotalLikes(message.likes.length)
            if (channelData.channel_type == 'single') {
                let tmp = [];
                if (channelData.creator && message.likes.includes(channelData.creator.id)) {
                    tmp.push(channelData.creator);
                }
                if (channelData.partner && message.likes.includes(channelData.partner.id)) {
                    tmp.push(channelData.partner);
                }
                setUsers(tmp);
            }
            else {
                if (channelData.members && channelData.members.length > 0) {
                    let tmp = [];
                    for (let i = 0; i < channelData.members.length; i++) {
                        if (message.likes.includes(channelData.members[i].id)) {
                            tmp.push(channelData.members[i]);
                        }
                    }
                    setUsers(tmp);
                }
            }
        }
    }, [channelData, message])

    const onGoDetails = (user) => {
        if (navigation && user_id != user.id) {
            onClose()
            navigation.navigate(RouteNames.SnapfooderScreen, { user: user })
        }
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
            <Text style={styles.modalTitle}>{translate('social.chat.info')}</Text>
            <View style={[Theme.styles.row_center_start, { marginBottom: 20 }]}>
                <TouchableOpacity style={[Theme.styles.row_center, styles.total]}>
                    <Ionicons name={'heart'} size={20} color={Theme.colors.cyan2} />
                    <Text style={styles.totalLikes}>{totalLikes}</Text>
                </TouchableOpacity>
            </View>
            {
                users.map(user =>
                    <TouchableOpacity key={user.id} onPress={() => onGoDetails(user)} style={[Theme.styles.row_center, { width: '100%', marginBottom: 25 }]}>
                        <FastImage
                            style={styles.avatar}
                            source={{ uri: getImageFullURL(user.photo) }}
                            resizeMode={FastImage.resizeMode.cover}
                        />
                        <Text style={styles.name}>
                            {user.id == user_id ?
                                `${translate('you')} (${user.username || user.full_name})`
                                :
                                (user.username || user.full_name)
                            }
                        </Text>
                        <Ionicons name={'heart'} size={24} color={Theme.colors.cyan2} />
                    </TouchableOpacity>
                )
            }
        </View>
    </Modal>
};

const styles = StyleSheet.create({
    modalVendorContent: { width: '100%', minHeight: 280, paddingHorizontal: 20, paddingVertical: 20, backgroundColor: Theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    modalTitle: { width: '100%', marginBottom: 20, textAlign: 'center', fontSize: 18, lineHeight: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    total: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: Theme.colors.white, borderWidth: 1, borderColor: Theme.colors.cyan2 },
    totalLikes: { marginLeft: 5, fontSize: 15, lineHeight: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },
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


export default MsgInfoModal;