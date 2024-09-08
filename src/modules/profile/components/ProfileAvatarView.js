import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import { isEmpty, getImageFullURL } from '../../../common/services/utility';
import { findZodiacSign } from '../../../common/components/ZodiacSign';
import Theme from '../../../theme';
// svgs
import Svg_edit from '../../../common/assets/svgs/btn_edit.svg';
import Svg_birthday from '../../../common/assets/svgs/ic_birthday.svg';
import ImgLogoplus from '../../../common/assets/images/logo_plus.png'

const ProfileAvatarView = ({ photo, has_membership = false, full_name, username, birthdate, city, country, onEdit }) => {
    return <View style={[Theme.styles.col_center, styles.container]}>
        <View style={[Theme.styles.flex_between, { width: '100%' }]}>
            {
                has_membership ?
                    <FastImage source={ImgLogoplus} style={{ width: 52, height: 52, }} resizeMode={'contain'} />
                    :
                    <View />
            }
            <TouchableOpacity onPress={onEdit}>
                <Svg_edit width={45} height={45} />
            </TouchableOpacity>
        </View>
        <View style={[Theme.styles.col_center, styles.avatarView]}>
            <TouchableOpacity style={[Theme.styles.col_center, styles.photoView]} onPress={onEdit}>
                <FastImage
                    source={
                        (isEmpty(photo) || photo == 'x') ?
                            require('../../../common/assets/images/user-default.png')
                            :
                            { uri: getImageFullURL(photo) }
                    }
                    style={styles.avatarImg}
                    resizeMode={FastImage.resizeMode.cover}
                />
            </TouchableOpacity>
            <View style={[Theme.styles.row_center, { marginTop: 12 }]}>
                <Text style={styles.name}>{full_name}</Text>
                {
                    birthdate != null &&
                    findZodiacSign(moment(birthdate).toDate())
                }
            </View>
            {username != null && (
                <View style={[Theme.styles.row_center, { marginTop: 12 }]}>
                    <Text style={styles.username}>@{username}</Text>
                </View>
            )}
            {
                birthdate != null &&
                <View style={[Theme.styles.row_center,]}>
                    <Svg_birthday />
                    <Text style={[styles.infoTxt, { paddingBottom: 6, marginLeft: 6 }]}>
                        {moment(birthdate).format('D MMM, YYYY')} ({moment().diff(moment(birthdate), 'years')}y)
                    </Text>
                </View>
            }
            <Text style={styles.infoTxt}>{city}, {country}</Text>
        </View>
    </View>
};

const styles = StyleSheet.create({
    container: { flex: 1, width: '100%', },
    avatarView: { marginTop: 14, },
    photoView: { height: 120, width: 120, borderWidth: 1, borderColor: Theme.colors.gray9, borderRadius: 60, backgroundColor: '#E8D7D0' },
    avatarImg: { width: 120, height: 120, borderRadius: 60, },
    name: { marginRight: 4, paddingBottom: 4, fontSize: 19, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
    username: {
        marginTop: 0,
        marginBottom: 6,
        fontSize: 15,
        fontFamily: Theme.fonts.semiBold,
        color: Theme.colors.text
    },
    infoTxt: { marginTop: 6, fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7 },
})

function arePropsEqual(prevProps, nextProps) {
    if (prevProps.photo != nextProps.photo ||
        prevProps.full_name != nextProps.full_name ||
        prevProps.birthdate != nextProps.birthdate ||
        prevProps.city != nextProps.city ||
        prevProps.country != nextProps.country ||
        prevProps.has_membership != nextProps.has_membership
    ) {
        return false;
    }
    return true;
}

export default React.memo(ProfileAvatarView, arePropsEqual);
