import { TouchableOpacity, View, Text, StyleSheet, TextInput, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Theme from '../../../theme';
import { width, height } from 'react-native-dimension';
import AppText from '../AppText';
import { translate } from '../../services/translate';
import { getImageFullURL } from '../../services/utility';

const StoryMentionModal = ({ showModal, all_friends = [], onClose }) => {
    const [visible, SetVisible] = useState(showModal)
    const [friends, setFriends] = useState([]);
    const [text, setText] = useState('');
    const [selected, setSelected] = useState(null);
    const _input = useRef(null);

    useEffect(() => {
        SetVisible(showModal)
        if (showModal) {
            setText('')
            setSelected(null)
            setTimeout(() => {
                _input.current?.focus()
            }, 600)
        }
    }, [showModal])

    const onSearchFriend = (v) => {
        setText(v);
        let filtered = all_friends.filter(item => (`${item.full_name}`.toLowerCase().includes(v.toLowerCase())));
        setFriends(filtered);
    }

    const onDone = () => {
        onClose(selected)
    }

    return <Modal
        statusBarTranslucent
        isVisible={visible}
        backdropOpacity={0.33}
        swipeDirection={['down']}
        style={{ margin: 0, width: width(100), height: height(100) }}>
        <View style={[Theme.styles.col_center, styles.container]}>
            <KeyboardAvoidingView
                style={{ width: '100%', flex: 1, justifyContent: 'flex-end' }}
                behavior='padding'
                keyboardVerticalOffset={Platform.OS == 'android' ? undefined : 30}
            >
                <View style={{ width: '100%', height: '100%' }}>
                    <View style={[Theme.styles.col_center, styles.mentionView, { flex: 1 }]}>
                        <View style={[Theme.styles.row_center, styles.inputView]}>
                            <AppText style={styles.mentionPrefix}>@</AppText>
                            <TextInput ref={_input} value={text} style={styles.input} onChangeText={onSearchFriend} />
                        </View>
                    </View>
                    <View style={{ width: '100%', height: 80 }}>
                        <ScrollView keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ height: 80 }} style={[{ paddingHorizontal: 20, width: '100%', }]} horizontal={true}>
                            {friends.map(((item, key) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[Theme.styles.col_center, styles.friendItem]}
                                    onPress={() => {
                                        setSelected(item);
                                        setText(item.full_name)
                                    }}
                                >
                                    <FastImage
                                        style={styles.avatar}
                                        source={{ uri: getImageFullURL(item.photo) }}
                                        resizeMode={FastImage.resizeMode.cover}
                                    />
                                    <Text style={styles.name}>{item.full_name}</Text>
                                </TouchableOpacity>
                            )))}
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
            <TouchableOpacity onPress={onDone} style={styles.closeBtn}>
                <AppText style={styles.closeBtnTxt}>{translate('story_metion.done')}</AppText>
            </TouchableOpacity>
        </View>
    </Modal>
};

const styles = StyleSheet.create({
    container: { flex: 1, width: width(100), height: height(100) },
    mentionView: { width: '100%', },
    inputView: { padding: 6, borderRadius: 8, backgroundColor: Theme.colors.white },
    input: { paddingVertical: 0, fontSize: 20, lineHeight: 24, color: Theme.colors.red1, fontFamily: Theme.fonts.semiBold },
    mentionPrefix: { fontSize: 20, lineHeight: 24, color: Theme.colors.red1, fontFamily: Theme.fonts.semiBold },
    friendItem: { marginRight: 20, height: 70 },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 25,
        backgroundColor: '#FAFAFC'
    },
    name: {
        fontSize: 17,
        lineHeight: 21,
        color: Theme.colors.white,
        fontFamily: Theme.fonts.semiBold,
    },
    closeBtn: { position: 'absolute', top: 40, right: 20 },
    closeBtnTxt: { fontSize: 17, lineHeight: 21, color: Theme.colors.white, fontFamily: Theme.fonts.semiBold },
})
export default StoryMentionModal;

