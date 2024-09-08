import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import moment from 'moment';
import AppText from '../../../common/components/AppText';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import { ucFirst } from '../../../common/services/utility';

const ReferralHistItem = ({ data, onSelect, style }) => {

    const getDate = () => {
        return moment(data.used_time, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD");
    }

    return <TouchableOpacity onPress={() => onSelect()}
        style={[Theme.styles.col_center, styles.container, style]}>
        <View style={[Theme.styles.flex_between]}>
            <AppText style={[styles.name]}  >{getDate()}</AppText>
            {data.user_earned_amount > 0 && (
                <AppText style={styles.date_limit}>{translate('invitation_earn.earned')} {data.user_earned_amount}L</AppText>
            )}
        </View>
        <View style={[Theme.styles.flex_between, { marginTop: 6 }]}>
            <AppText style={[styles.inviteCodeTxt]} >
                {translate('invitation_earn.code')} : <AppText style={{ fontFamily: Theme.fonts.semiBold }}>{data.referral_code}</AppText>
            </AppText>
        </View>
        <View style={[Theme.styles.flex_between, { marginTop: 6 }]}>
            {
                data.register &&
                <AppText style={[styles.name]}>
                    {translate('invitation_earn.registered_user')} : {ucFirst(data.register.username || data.register.full_name)}
                </AppText>
            }
            {
                data.is_used == 1 &&
                <AppText style={[styles.status, { color: Theme.colors.red1 }]}>
                    {translate(`invitation_earn.used`)}
                </AppText>
            }
        </View>
    </TouchableOpacity >
};

const styles = StyleSheet.create({
    container: { width: '100%', alignItems: 'flex-start', borderRadius: 15, backgroundColor: '#FAFAFC', padding: 12, paddingVertical: 16, marginBottom: 16, },
    name: { fontSize: 17, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
    inviteCodeTxt: { fontSize: 17, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
    status: { fontSize: 16, fontFamily: Theme.fonts.semiBold, },
    date_limit: { fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
})
export default ReferralHistItem;
