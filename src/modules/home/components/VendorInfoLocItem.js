import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Theme from '../../../theme';
import React from 'react';
import moment from 'moment';
import { translate } from '../../../common/services/translate';

const VendorInfoLocItem = ({ data, onSelect, style }) => {

    const getNextOpenDay = (opening_days, today_weekday) => {
        let nextIndex = opening_days.findIndex((item) => (item.open == 1 && item.week_day > today_weekday));
        if (nextIndex == -1) {
            nextIndex = opening_days.findIndex((item) => (item.open == 1 && item.week_day <= today_weekday));
        }
        if (nextIndex != -1) {
            return opening_days[nextIndex];
        }
        return null;
    }

    const getOpeningTime = () => {
        let current_time = moment(new Date());
        let today = new Date().getDay();
        today = (today == 0 ? 6 : (today - 1)).toString();

        if (data.is_open != 1 && data.can_schedule == 1) {
            if (data.vendor_opening_days != null) {
                let foundIndex = data.vendor_opening_days.findIndex((item) => (item.open == 1 && item.week_day == today))
                if (foundIndex != -1) {
                    let open_time = moment(data.vendor_opening_days[foundIndex].time_open, 'HH:mm:ss');
                    let close_time = moment(data.vendor_opening_days[foundIndex].time_close, 'HH:mm:ss');
                    if (current_time.isSameOrAfter(close_time)) {  // today is closed
                        let nextOpenDay = getNextOpenDay(data.vendor_opening_days, today);
                        if (nextOpenDay) {
                            return translate('vendor_profile.closed') + '! ' +
                                translate('vendor_profile.open_on') + ' ' + translate(nextOpenDay.title_en + '_info') + ' ' +
                                translate('vendor_profile.at') + ' ' + moment(nextOpenDay.time_open, 'HH:mm:ss').format('H:mm a') + ' - ' +
                                translate('vendor_profile_info.schedule_order_info');
                        }
                    }

                    if (current_time.isSameOrBefore(open_time)) {
                        return translate('vendor_profile.closed') + '! ' + translate('vendor_profile.open_at') + ' ' + open_time.format('H:mm a') + ' - ' + translate('vendor_profile_info.schedule_order_info');
                    }
                }
            }
            return translate('vendor_profile.closed_but_can_schedule');
        }
        else if (data.is_open != 1 && data.can_schedule != 1) {
            if (data.vendor_opening_days != null) {
                let foundIndex = data.vendor_opening_days.findIndex((item) => (item.open == 1 && item.week_day == today))
                if (foundIndex != -1) {   // if today has open time and close time
                    let open_time = moment(data.vendor_opening_days[foundIndex].time_open, 'HH:mm:ss');
                    let close_time = moment(data.vendor_opening_days[foundIndex].time_close, 'HH:mm:ss');

                    console.log('--------------------------- ', data.is_open, current_time.format('HH:mm:ss'), open_time.format('HH:mm:ss'), close_time.format('HH:mm:ss'))
                    if (current_time.isSameOrBefore(open_time)) {
                        return translate('vendor_profile.closed') + '! ' + translate('vendor_profile.open_at') + ' ' + open_time.format('H:mm a');
                    }

                    if (current_time.isSameOrAfter(close_time)) {  // today is closed
                        let nextOpenDay = getNextOpenDay(data.vendor_opening_days, today);
                        if (nextOpenDay) {
                            return translate('vendor_profile.closed') + '! ' + translate('vendor_profile.open_on') + ' ' + translate(nextOpenDay.title_en + '_info') + ' ' + translate('vendor_profile.at') + ' ' + moment(nextOpenDay.time_open, 'HH:mm:ss').format('H:mm a')
                        }
                    }
                }
                else { // today is not opened at all
                    let nextOpenDay = getNextOpenDay(data.vendor_opening_days, today);
                    if (nextOpenDay) {
                        return translate('vendor_profile.closed') + '! ' + translate('vendor_profile.open_on') + ' ' + translate(nextOpenDay.title_en + '_info') + ' ' + translate('vendor_profile.at') + ' ' + moment(nextOpenDay.time_open, 'HH:mm:ss').format('H:mm a')
                    }
                }
            }
            return translate('vendor_profile.closed') + '!';
        }
        else {
            let tm_str = translate('vendor_profile.open_at') + ' ';
            if (data.vendor_opening_days != null) {
                let today = new Date().getDay().toString()
                let foundIndex = data.vendor_opening_days.findIndex((item) => item.week_day == today)
                if (foundIndex != -1) {
                    tm_str = tm_str + moment(data.vendor_opening_days[foundIndex].time_open, 'HH:mm:ss').format('H:mm a')
                    tm_str = tm_str + ' - ' + translate('vendor_profile.close_at') + moment(data.vendor_opening_days[foundIndex].time_close, 'HH:mm:ss').format('H:mm a')
                }
            }
            return tm_str;
        }
    }

    return <View
        style={[Theme.styles.col_center, styles.container, style]}>
        <View style={[Theme.styles.row_center_start, { width: '100%' }]}>
            <Entypo name="location-pin" size={24} color={Theme.colors.text} />
            <Text style={[styles.title]}>{data.address}</Text>
            <TouchableOpacity onPress={() => {
                onSelect(parseFloat(data.latitude), parseFloat(data.longitude))
            }}>
                <Text style={styles.date_limit}>{translate('vendor_profile.view_on_map')}</Text>
            </TouchableOpacity>
        </View>
        <View style={[Theme.styles.row_center_start, { width: '100%', marginTop: 10 }]}>
            <AntDesign name="clockcircle" size={16} color={Theme.colors.text} style={{ marginLeft: 4, marginRight: 4 }} />
            <Text style={[styles.title]}>{getOpeningTime()}</Text>
        </View>
    </View>;
};

const styles = StyleSheet.create({
    container: { width: '100%', marginBottom: 12, justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 15, backgroundColor: '#FAFAFC', padding: 12, },
    title: { flex: 1, marginRight: 10, fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium, marginLeft: 4 },
    date_limit: { fontSize: 15, fontFamily: Theme.fonts.medium, color: '#F55A00', marginBottom: 3 },
})

function arePropsEqual(prevProps, nextProps) {
    if (prevProps.vendor_id != nextProps.vendor_id) {
        return false;
    }
    return true;
}

export default React.memo(VendorInfoLocItem, arePropsEqual);
