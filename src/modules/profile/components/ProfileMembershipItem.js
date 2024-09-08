import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import Theme from '../../../theme';
import { translate } from '../../../common/services/translate';
import ImgLogoplus from '../../../common/assets/images/logo_plus.png'
import { isEmpty } from '../../../common/services/utility';

const ProfileMembershipItem = (props) => {
    if (props.systemSettings.enable_membership != 1) {
        return null;
    }

    const title = useMemo(() => {
        if (props.language == 'en' && !isEmpty(props.membershipSetting.profile_block_title_en)) {
            return props.membershipSetting.profile_block_title_en;
        }
        else if (props.language == 'sq' && !isEmpty(props.membershipSetting.profile_block_title)) {
            return props.membershipSetting.profile_block_title;
        }
        else if (props.language == 'it' && !isEmpty(props.membershipSetting.profile_block_title_it)) {
            return props.membershipSetting.profile_block_title_it;
        }
        return translate('Snapfood+');
    }, [props.membershipSetting.profile_block_title, props.membershipSetting.profile_block_title_en,
    props.membershipSetting.profile_block_title_it, props.language])

    const desc = useMemo(() => {
        if (props.language == 'en' && !isEmpty(props.membershipSetting.profile_block_desc_en)) {
            return props.membershipSetting.profile_block_desc_en;
        }
        else if (props.language == 'sq' && !isEmpty(props.membershipSetting.profile_block_desc)) {
            return props.membershipSetting.profile_block_desc;
        }
        else if (props.language == 'it' && !isEmpty(props.membershipSetting.profile_block_desc_it)) {
            return props.membershipSetting.profile_block_desc_it;
        }
        return null;
    }, [props.membershipSetting.profile_block_desc, props.membershipSetting.profile_block_desc_en,
    props.membershipSetting.profile_block_desc_it, props.language])

    const badge = useMemo(() => {
        if (props.language == 'en' && !isEmpty(props.membershipSetting.member_badge_en)) {
            return props.membershipSetting.member_badge_en;
        }
        else if (props.language == 'sq' && !isEmpty(props.membershipSetting.member_badge)) {
            return props.membershipSetting.member_badge;
        }
        else if (props.language == 'it' && !isEmpty(props.membershipSetting.member_badge_it)) {
            return props.membershipSetting.member_badge_it;
        }
        return translate('membership.member');
    }, [props.membershipSetting.member_badge, props.membershipSetting.member_badge_en,
    props.membershipSetting.member_badge_it, props.language])

    return <TouchableOpacity style={[Theme.styles.row_center, styles.itemView]} onPress={props.onPress} >
        <FastImage source={ImgLogoplus} style={styles.logoImg} resizeMode={'contain'} />
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
            <Text style={[styles.title]}>{title}</Text>
            <Text style={[styles.desc]}>{desc}</Text>
        </View>
        <Feather name='chevron-right' color={Theme.colors.gray7} size={18} />
        {
            props.user.has_membership == 1 &&
            <Text style={[styles.badge]}>{badge}</Text>
        }
    </TouchableOpacity>
};

const styles = StyleSheet.create({
    itemView: { marginTop: 20, padding: 12, borderRadius: 15, borderWidth: 1, borderColor: '#B4B4CD', backgroundColor: Theme.colors.white },
    title: { fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
    desc: { marginTop: 6, fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    badge: { position: 'absolute', top: 12, right: 12, fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.red1 },
    logoImg: { width: 52, height: 52 }
})

const mapStateToProps = ({ app }) => ({
    user: app.user,
    language: app.language,
    membershipSetting: app.membershipSetting || {},
    systemSettings: app.systemSettings || {}
});

export default connect(mapStateToProps, {
})(ProfileMembershipItem);
