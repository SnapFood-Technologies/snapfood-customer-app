import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import moment from 'moment';
import AppText from '../../../common/components/AppText';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import React from 'react';
import { ucFirst } from '../../../common/services/utility';

const InvitationHistItem = ({ data, is_received, onSelect, style }) => {
    const colors = { used: Theme.colors.red1, using : Theme.colors.red2, expired: Theme.colors.gray7, available: Theme.colors.cyan2 };
    const getName = () => {
        if (is_received) {
            return ucFirst(data.sender?.username || data.sender?.full_name);
        }
        return ucFirst(data.receiver?.username || data.receiver?.full_name);
    }

    const getDate = () => {
        return moment(data.invite_time, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD | hh:mm A");
    }

    const getStatus = () => {
        if (data.is_used == 1) {
            return 'used';
        } 
        else if (data.is_used == 2) {
            return 'using';
        }
        else if (data.is_expired == 1) {
            return 'expired';
        }
        return 'available';
    };

    return <TouchableOpacity onPress={() => onSelect()}
        style={[Theme.styles.col_center, styles.container, style]}>
        <View style={[Theme.styles.flex_between]}>
            <AppText style={[styles.name]}  >{getName()}</AppText>
            {is_received && data.status == 'available' && (
                <AppText style={styles.date_limit}>{data.remaining_time_to_use}</AppText>
            )}
        </View>
        <View style={[Theme.styles.flex_between, { marginTop: 6 }]}>
            {!is_received && data.is_used == 1 && data.used_rewards_amount != null && data.used_rewards_amount > 0 ? (
                <AppText style={[styles.inviteCodeTxt]} >
                    {translate('invitation_earn.your_earned')}
                    <AppText style={{ fontFamily: Theme.fonts.semiBold }}>{data.used_rewards_amount} L</AppText>
                </AppText>
            ) : (
                <AppText style={[styles.inviteCodeTxt]} >
                    {translate('invitation_earn.code')} : <AppText style={{ fontFamily: Theme.fonts.semiBold }}>{data.invite_code}</AppText>
                </AppText>
            )}
        </View>
        <View style={[Theme.styles.flex_between, { marginTop: 6 }]}>
            <AppText style={[styles.name]}  >{getDate()}</AppText>
            <AppText style={[styles.status, { color: colors[getStatus()] }]}>
                {is_received && getStatus() == 'available' && translate('invitation_earn.use_code')}
                {!is_received && getStatus() == 'available' && translate('invitation_earn.sent')}
                {getStatus() != 'available' && translate(`invitation_earn.${getStatus()}`)}
            </AppText>
        </View>
    </TouchableOpacity >
};

const styles = StyleSheet.create({
    container: { width: '100%', alignItems: 'flex-start', borderRadius: 15, backgroundColor: '#FAFAFC', padding: 12, paddingVertical: 16, marginBottom: 16, },
    name: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
    inviteCodeTxt: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
    status: { fontSize: 15, fontFamily: Theme.fonts.semiBold, },
    date_limit: { fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
})
export default InvitationHistItem;
