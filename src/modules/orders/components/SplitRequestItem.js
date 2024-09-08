import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import moment from 'moment';
import AppText from '../../../common/components/AppText';
import Theme from '../../../theme';
import React, { useMemo } from 'react';
import { translate } from '../../../common/services/translate';

const SplitRequestItem = ({ data, onPress, style }) => {
    const created_at = useMemo(() => {
        if (data.created_at) {
            return moment(data.created_at, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD | hh:mm A");
        }
        return null;
    }, [data])

    return <TouchableOpacity onPress={() => onPress()}
        style={[Theme.styles.col_center, styles.container, style]}>
        <View style={[Theme.styles.flex_between]}>
            <AppText style={[styles.name]}><Text style={{ fontFamily: Theme.fonts.semiBold }}>{translate('splits_hist.orderer')}:</Text> {data?.split?.orderer_full_name}</AppText>
            <AppText style={[styles.name, { fontFamily: Theme.fonts.semiBold }]}>{data?.split?.vendor_title} </AppText>
        </View>
        <View style={[Theme.styles.flex_between, { marginTop: 12 }]}>
            <AppText style={[styles.priceTxt]}><Text style={{ fontFamily: Theme.fonts.semiBold }}>{translate('splits_hist.total_amount')}:</Text> {data.split?.total_amount} L</AppText>
            <View />
        </View>
        <View style={[Theme.styles.flex_between, { marginTop: 12 }]}>
            <AppText style={[styles.priceTxt]}><Text style={{ fontFamily: Theme.fonts.semiBold }}>{translate('splits_hist.your_split')}:</Text> {data.amount} L</AppText>
            <AppText style={[styles.date]}>{created_at}</AppText>
        </View>
    </TouchableOpacity >
};

const styles = StyleSheet.create({
    container: { width: '100%', alignItems: 'flex-start', borderRadius: 15, backgroundColor: '#FAFAFC', padding: 12, paddingVertical: 16, marginBottom: 16, },
    name: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
    priceTxt: { fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    date: { marginTop: 8, fontSize: 15, fontFamily: Theme.fonts.medium, color: Theme.colors.gray7, },
    status: { marginTop: 8, fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.red1, },
})
export default SplitRequestItem;
