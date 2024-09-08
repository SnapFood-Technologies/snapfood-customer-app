import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Foundation from 'react-native-vector-icons/Foundation';
import Theme from '../../../theme';
import { translate } from '../../../common/services/translate';
import AppTooltip from '../../../common/components/AppTooltip';

const ProfileGalleryItem = ({title, tooltip_title, tooltip_desc, icon, btn, onPress }) => {
    return <View style={[Theme.styles.col_center, styles.itemView,]}>
        <View style={[Theme.styles.row_center,]} >
            <Text style={[styles.title,]}>{title ?? translate('account.gallery')}</Text>
            <AppTooltip
                title={tooltip_title ?? translate('tooltip.gallery_title')}
                description={tooltip_desc ?? translate('tooltip.gallery_desc')}
                placement={'top'}
                anchor={
                    <View style={[Theme.styles.row_center, styles.optionBtn]} >
                        <Foundation name='info' size={20} color={Theme.colors.gray7} />
                        <Text style={[styles.optionTxt, { marginLeft: 4 }]}>{translate('account.options')}</Text>
                    </View>
                }
            />
        </View>
        <TouchableOpacity style={[Theme.styles.row_center, styles.btn]} onPress={onPress} >
            <Feather name={icon ?? 'camera'} color={Theme.colors.cyan2} size={24} />
            <Text style={[styles.itemTxt, { flex: 1, marginHorizontal: 9 }]}>{btn ?? translate('account.add_gallery')}</Text>
            <Feather name='chevron-right' color={Theme.colors.gray7} size={18} />
        </TouchableOpacity>
    </View>
};

const styles = StyleSheet.create({
    itemView: { width: '100%', padding: 15, marginBottom: 20, backgroundColor: Theme.colors.gray8, borderRadius: 15, },
    title: { flex: 1, fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
    optionBtn: { paddingHorizontal: 8, paddingVertical: 5, backgroundColor: Theme.colors.white, borderRadius: 20 },
    optionTxt: { fontSize: 15, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    itemTxt: { fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    btn: { marginTop: 6, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#B4B4CD', backgroundColor: Theme.colors.white }
})

export default ProfileGalleryItem;
