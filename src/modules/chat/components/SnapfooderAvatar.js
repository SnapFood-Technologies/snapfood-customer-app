import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import Theme from "../../../theme";
import { isEmpty, getImageFullURL } from '../../../common/services/utility';
import { translate } from '../../../common/services/translate';
import { findZodiacSign } from '../../../common/components/ZodiacSign';
import Svg_birthday from '../../../common/assets/svgs/ic_birthday.svg';

const SnapfooderAvatar = ({ full_name, photo, birthdate, country, onPressBirthday = () => { }, onPressPhoto = () => { } }) => {

    return (
        <View style={[Theme.styles.col_center, styles.avatarView]}>
            <TouchableOpacity style={[Theme.styles.col_center, styles.photoView]} onPress={onPressPhoto}>
                <FastImage
                    source={{ uri: getImageFullURL(photo) }}
                    style={styles.avatarImg}
                    resizeMode={FastImage.resizeMode.cover}
                />
            </TouchableOpacity>
            <View style={[Theme.styles.row_center, { marginTop: 10 }]}>
                <Text style={styles.name}>{full_name}</Text>
                {
                    !isEmpty(birthdate) &&
                    findZodiacSign(moment(birthdate).toDate())
                }
            </View>
            {
                !isEmpty(birthdate) && moment().format('DD-MM') == moment(birthdate).format('DD-MM') &&
                <TouchableOpacity style={[Theme.styles.row_center,]} onPress={onPressBirthday}>
                    <Svg_birthday width={15} height={15} />
                    <Text style={[styles.infoTxt, { paddingBottom: 6, marginLeft: 6 }]}>
                        {translate('social.their_birthday')} 🎉
                    </Text>
                </TouchableOpacity>
            }
            <Text style={styles.infoTxt}>{country}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    avatarView: { marginTop: 16, },
    photoView: { height: 100, width: 100, borderWidth: 1, borderColor: Theme.colors.gray9, borderRadius: 50, backgroundColor: '#E8D7D0' },
    avatarImg: { width: 100, height: 100, borderRadius: 50, },
    name: { marginRight: 4, fontSize: 17, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
    infoTxt: { marginTop: 6, fontSize: 14, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7 },
});

function arePropsEqual(prevProps, nextProps) {
    if (prevProps.full_name != nextProps.full_name ||
        prevProps.photo != nextProps.photo ||
        prevProps.birthdate != nextProps.birthdate ||
        prevProps.country != nextProps.country
    ) {
        console.log('SnapfooderAvatar item equal : ', false)
        return false;
    }
    return true;
}

export default React.memo(SnapfooderAvatar, arePropsEqual); 
