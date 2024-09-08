import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import moment from 'moment';
import AppText from '../../../common/components/AppText';
import Theme from '../../../theme';
import React, { useMemo } from 'react';
import { translate } from '../../../common/services/translate';

const DepositHistItem = ({ data, onPress, style }) => {
    const cardLast4Num = useMemo(() => {
        if (data.source) {
            return data.source.substr(data.source.length - 4);
        }
        return null;
    }, [data])
    const created_at = useMemo(() => {
        if (data.created_at) {
            return moment(data.created_at, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD | hh:mm A");
        }
        return null;
    }, [data])

    return <TouchableOpacity onPress={() => onPress()}
        style={[Theme.styles.col_center, styles.container, style]}>
        <View style={[Theme.styles.flex_between]}>
            <AppText style={[styles.name]}>**** **** **** {cardLast4Num}</AppText>
            <AppText style={[styles.priceTxt, (data.amount > 0) ? {color: Theme.colors.red2} : {color: Theme.colors.red1}]}>{parseInt(data.amount) > 0 ? '+' : ''} {parseInt(data.amount)} L</AppText>
        </View>
        <View style={[Theme.styles.flex_between]}>
            <AppText style={[styles.date]}>{created_at}</AppText>
            <AppText style={[styles.date]}>{translate('deposit_transfer_hist.transfered_from_card')}</AppText>
        </View>
    </TouchableOpacity >
};

const styles = StyleSheet.create({
    container: { width: '100%', alignItems: 'flex-start', borderRadius: 15, backgroundColor: '#FAFAFC', padding: 12, paddingVertical: 16, marginBottom: 16, },
    name: { fontSize: 16, color: Theme.colors.gray7, fontFamily: Theme.fonts.medium, },
    priceTxt: { fontSize: 16, fontFamily: Theme.fonts.medium, },
    date: { marginTop: 8, fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7, },
})
export default DepositHistItem;
