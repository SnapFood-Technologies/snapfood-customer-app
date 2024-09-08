import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import moment from "moment";
import 'moment/locale/sq';
import Theme from '../../../theme';
import MainButton from '../../../common/components/buttons/main_button';
import TransButton from '../../../common/components/buttons/trans_button';
import { translate, getLanguage } from '../../../common/services/translate';
import Svg_coupon from '../../../common/assets/svgs/wallet/coupon.svg';
import { isEmpty } from '../../../common/services/utility';

const EarnedPromoItem = ({ data, language, onUse, onDetail }) => {
    return <View style={[Theme.styles.row_center, styles.container]}>
        <View style={[Theme.styles.col_center, styles.itemView,]}>
            <Text style={[styles.title,]}>{(language == 'en' && !isEmpty(data?.title_en)) ? data?.title_en : data?.title}</Text>
            <Text style={[styles.desc, { marginTop: 4 }]}>{translate('promotions.use_before')} {moment(data?.end_time, "YYYY-MM-DD hh:mm:ss").locale(getLanguage()).format('DD MMMM, HH:mm')}</Text>
            <Text style={[styles.desc, { marginTop: 4, marginBottom: 8 }]}>{(language == 'en' && !isEmpty(data?.description_en)) ? data?.description_en : data?.description}</Text>
            <View style={[Theme.styles.row_center,]} >
                <MainButton title={translate('promotions.use')} title_style={{ fontSize: 17, lineHeight: 19, fontFamily: Theme.fonts.semiBold, color: '#fff' }} style={{ width: 80, height: 34, marginRight: 12 }} onPress={onUse} />
                <TransButton title={translate('promotions.details')} fontSize={17} style={{ width: 80, }} onPress={onDetail} />
            </View>
        </View>
        <Svg_coupon />
    </View>
};

const styles = StyleSheet.create({
    container: { width: '100%', marginTop: 15, alignItems: 'flex-start', paddingVertical: 13, paddingHorizontal: 16, borderWidth: 1, borderColor: '#B6B6B6', borderStyle: 'dashed', borderRadius: 14, },
    itemView: { flex: 1, paddingRight: 15, alignItems: 'flex-start' },
    title: { width: '100%', fontSize: 20, lineHeight: 26, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
    desc: { width: '100%', fontSize: 17, lineHeight: 21, fontFamily: Theme.fonts.medium, color: '#616161' },
})

function arePropsEqual(prevProps, nextProps) {
    return prevProps.data?.id == nextProps.data?.id && prevProps.data?.language == nextProps.data?.language;
}

export default React.memo(EarnedPromoItem, arePropsEqual);
