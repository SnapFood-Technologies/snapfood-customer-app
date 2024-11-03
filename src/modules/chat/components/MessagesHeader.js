import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Feather from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import { width, height } from 'react-native-dimension';
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';
import Theme from "../../../theme";
import { isEmpty, getImageFullURL } from '../../../common/services/utility';
import { ROLE_CUSTOMER, SNAPFOOD_AVATAR } from '../../../config/constants';
// svgs
import Svg_call from '../../../common/assets/svgs/btn_call.svg'
import Svg_more from '../../../common/assets/svgs/btn_more.svg'
import Svg_delete from '../../../common/assets/svgs/msg/delete.svg'
import Svg_mute from '../../../common/assets/svgs/msg/mute.svg'
import Svg_details from '../../../common/assets/svgs/msg/groupdetails.svg'
import Svg_gallery from '../../../common/assets/svgs/msg/gallery.svg'
import Svg_exit from '../../../common/assets/svgs/msg/exit.svg'
import Svg_muted from '../../../common/assets/svgs/msg/muted.svg'
import { translate } from '../../../common/services/translate';

const MessagesHeader = ({ data, channel_id, user_id, style, isMuted, isOrderSupport, onPressName, onBack, onCall = () => { }, onDelete, onExit, onGroupDetails, onGallery }) => {
    const getMembers = () => {
        if (data == null) { return ''; }
        if (data.members == null) { return '' }
        let display_cnt = 2;
        if (isOrderSupport == true) {
            display_cnt = 3;
        }
        let member_names = ''
        var remaining_cnt = 0
        let other_members = data.members.filter(i => i.id != user_id)
        other_members.map((item, index) => {
            if (index < display_cnt) {
                member_names = member_names + (item.username || item.full_name) + (other_members.length == 1 || (index == (display_cnt - 1)) ? '' : ', ')
            }
            else {
                remaining_cnt = remaining_cnt + 1
            }
        })

        if (remaining_cnt > 0) {
            member_names = member_names + ', +' + remaining_cnt
        }
        return member_names
    }

    const getPhoto = () => {
        if (isOrderSupport == true) {
            return SNAPFOOD_AVATAR;
        }
        if (data == null) { return getImageFullURL('default') }
        if (data.channel_type != 'group') {
            if (user_id == data.creator.id) {
                return getImageFullURL(data.partner.photo);
            }
            else if (user_id == data.partner.id) {
                return getImageFullURL(data.creator.photo);
            }
        }
        else {
            return getImageFullURL(data.photo)
        }
        return getImageFullURL('default')
    }

    const getName = () => {
        if (isOrderSupport == true) {
            return translate('help.order_chat');
        }
        if (data == null) { return '' }
        if (data.channel_type == 'single') {
            let name = '';
            if (user_id == data.creator.id) {
                name = data.partner.username || data.partner.full_name
            }
            else if (user_id == data.partner.id) {
                name = data.creator.username || data.creator.full_name
            }

            if (name.length > 12) {
                return name.slice(0, 12) + '...';
            }
            return name;
        }
        else if (data.channel_type == 'admin_support') {
            let name = '';
            if (user_id == data.creator.id) {
                name = data.partner.username || data.partner.full_name
            }
            else if (user_id == data.partner.id) {
                name = data.creator.username || data.creator.full_name
            }
            return translate(name);
        }
        else {
            return data.full_name
        }
        return ''
    }

    const getDesc = () => {
        if (data == null) { return '' }
        if (data.channel_type == 'group') {
            return getMembers()
        }
        return ''
    }

    const canDelete = () => {
        if (data == null) { return false; }
        if (data.channel_type != 'group') {
            return true;
        }
        if (data.channel_type == 'group' && data.admin != null && data.admin.id == user_id) {
            return true;
        }
        return false;
    }

    const canExitGroup = () => {
        if (data == null) { return false; }
        if (data.channel_type == 'group' && data.users != null && data.users.findIndex(i => i == user_id) >= 0) {
            return true;
        }
        return false;
    }

    const canMute = () => {
        return false;
        if (data == null) { return false; }
        if (data.channel_type == 'single') {
            return true;
        }
        else if (data.channel_type != 'single' && data != null && data.users != null && data.users.findIndex(i => i == user_id) >= 0) {
            return true;
        }
        return false;
    }

    const canCall = () => {
        if (data == null) { return false; }
        if (data.channel_type == 'single') {
            if (user_id == data.creator.id && (data.partner.role == ROLE_CUSTOMER || data.partner.role == null)) {
                return true;
            }
            else if (user_id == data.partner.id && (data.creator.role == ROLE_CUSTOMER || data.creator.role == null)) {
                return true;
            }
        }
        return false;
    }

    

    return (
        // <LinearGradient
        //     start={{ x: 0.0, y: 0.25 }} end={{ x: 0.5, y: 1.0 }}
        //     locations={[0, 0.5, 0.6]}
        //     colors={['#4c669f', '#3b5998', '#192f6a']}
        //     style={[Theme.styles.row_center, styles.container]}>
        <View style={[Theme.styles.row_center, styles.container, style]}>
            <BlurView blurRadius={4} blurType='light' style={{ position: 'absolute', opacity: 1, top: 0, left: 0, width: width(100), height: 100 }} />
            <TouchableOpacity style={{ paddingHorizontal: 5, }} onPress={onBack ? onBack : () => { }}>
                <Feather name="chevron-left" size={24} color={Theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[Theme.styles.row_center, { flex: 1, justifyContent: 'flex-start', marginLeft: 15 }]} onPress={onPressName ? onPressName : () => { }}>
                <FastImage
                    style={styles.avatar}
                    source={{ uri: getPhoto() }}
                    resizeMode={FastImage.resizeMode.cover}
                />
                <View style={[Theme.styles.col_center, { flex: 1, paddingRight: 20, alignItems: 'flex-start' }]}>
                    <View style={[Theme.styles.row_center,]} >
                        <Text style={[
                            (data && data.channel_type != 'group' ? styles.name_single : style.name),
                            (data && data.channel_type == 'admin_support') && { fontSize: 18 },
                            { flex: 1 }
                        ]}
                            numberOfLines={1}
                        >{getName()}</Text>
                        {
                            isMuted && <Svg_muted />
                        }
                    </View>
                    <Text style={styles.desc}>{getDesc()}</Text>
                </View>
            </TouchableOpacity>
            {
                canCall() &&
                <TouchableOpacity style={{ marginRight: 15, }} onPress={() => onCall(true)}>
                    <Feather name="video" size={24} color={Theme.colors.text} />
                </TouchableOpacity>
            }
            {
                canCall() &&
                <TouchableOpacity style={{ marginRight: 15, }} onPress={() => onCall(false)}>
                    <Feather name="phone" size={22} color={Theme.colors.text} />
                </TouchableOpacity>
            }
            {
                isOrderSupport == true ? null :
                    <Menu>
                        <MenuTrigger>
                            <Svg_more width={32} height={32} />
                        </MenuTrigger>
                        <MenuOptions optionsContainerStyle={styles.popupContainer}>
                            {
                                canDelete() &&
                                <MenuOption onSelect={onDelete ? onDelete : () => { }}>
                                    <View style={[Theme.styles.row_center, styles.popupBtn, !canExitGroup() && { borderBottomWidth: 0 }]}>
                                        <Svg_delete />
                                        <Text style={styles.popupText}>{
                                            data.channel_type != 'group' ?
                                                translate('social.delete_confirm_yes') :
                                                translate('social.chat.delete_group')}</Text>
                                    </View>
                                </MenuOption>
                            }
                            {
                                data && data.channel_type == 'group' && <MenuOption onSelect={onGroupDetails ? onGroupDetails : () => { }} >
                                    <View style={[Theme.styles.row_center, styles.popupBtn]}>
                                        <Svg_details />
                                        <Text style={styles.popupText}>{translate('social.chat.group_details')}</Text>
                                    </View>
                                </MenuOption>
                            }
                            {/* <MenuOption onSelect={onGallery ? onGallery : () => { }}>
                        <View style={[Theme.styles.row_center, styles.popupBtn, data.channel_type == 'single' && { borderBottomWidth: 0 }]}>
                            <Svg_gallery />
                            <Text style={styles.popupText}>{translate('social.chat.view_media')}</Text>
                        </View>
                    </MenuOption> */}
                            {
                                canExitGroup() &&
                                <MenuOption onSelect={onExit ? onExit : () => { }}>
                                    <View style={[Theme.styles.row_center, styles.popupBtn, { borderBottomWidth: 0 }]}>
                                        <Svg_exit />
                                        <Text style={styles.popupText}>{translate('social.chat.exit_group')}</Text>
                                    </View>
                                </MenuOption>
                            }
                        </MenuOptions>
                    </Menu>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 48,
        height: 100,
        backgroundColor: '#ffffffdd'
    },
    avatar: { backgroundColor: '#fff', width: 30, height: 30, borderRadius: 15, marginRight: 10, },
    name: { marginRight: 7, backgroundColor: '#ffffff88', fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, marginBottom: 5, },
    name_single: { marginRight: 7, backgroundColor: '#ffffff88', fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, marginBottom: 5, marginTop: 14 },
    desc: { fontSize: 11, fontFamily: Theme.fonts.medium, color: Theme.colors.red1 },
    popupContainer: {
        width: 156,
        borderColor: '#E9E9F7',
        borderRadius: 12,
        backgroundColor: 'white',
        borderWidth: 2,
        paddingHorizontal: 2,
        marginTop: 40,
        elevation: 0,
        paddingTop: 6,
    },
    popupBtn: { paddingHorizontal: 5, paddingBottom: 12, borderColor: '#F6F6F9', borderBottomWidth: 1, },
    popupText: {
        flex: 1,
        marginLeft: 10,
        color: Theme.colors.text,
        fontSize: 17,
        fontFamily: Theme.fonts.semiBold
    },
});

function arePropsEqual(prevProps, nextProps) {
    if (prevProps.isMuted != nextProps.isMuted ||
        prevProps.user_id != nextProps.user_id ||
        prevProps.channel_id != nextProps.channel_id) {
        
        return false;
    }

    return true;
}

export default React.memo(MessagesHeader, arePropsEqual);
