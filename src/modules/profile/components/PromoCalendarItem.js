import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import moment from 'moment';
import 'moment/locale/sq';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import Config from '../../../config';
import React from 'react';
import { isEmpty } from '../../../common/services/utility';

const PromoCalendarItem = ({ data, language, onPress, style }) => {
    return <TouchableOpacity onPress={() => onPress()}
        style={[Theme.styles.row_center, styles.container, style]}>
        <View style={[Theme.styles.col_center, styles.activeDate]}>
            <Text style={styles.activeDayTxt}>{moment(data.active_date).format("DD")}</Text>
            <Text style={styles.activeMonthTxt}>{moment(data.active_date).format("MMMM")}</Text>
        </View>
        <View style={[Theme.styles.col_center, styles.infoView]}>
            <View style={[Theme.styles.row_center_end, { width: '100%' }]}>
                {
                    data.non_expired != 1 &&
                    <View style={[Theme.styles.row_center, styles.endTime]}>
                        <Feather name='calendar' color={Theme.colors.cyan2} size={14} />
                        <Text style={styles.endTimeTxt}>{translate('promotions.end')} {moment(data.end_time, "YYYY-MM-DD  hh:mm:ss").format('DD MMMM')}</Text>
                    </View>
                }
            </View>
            <Text style={[styles.title]}  >{(language == 'en' && !isEmpty(data.title_en)) ? data.title_en : data.title}</Text>
            <Text style={[styles.descTxt]} >{(language == 'en' && !isEmpty(data.description_en)) ? data.description_en : data.description}</Text>
        </View>
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    container: { width: '100%', borderRadius: 10, backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#D7D7D7', marginBottom: 20, },
    title: { width: '100%', fontSize: 20, lineHeight: 24, color: Theme.colors.text1, fontFamily: Theme.fonts.semiBold, },
    descTxt: { width: '100%', marginTop: 4, fontSize: 16, lineHeight: 19, color: '#97ADB6', fontFamily: Theme.fonts.medium, },
    endTime: { backgroundColor: '#50b7ed33', borderTopRightRadius: 10, borderBottomLeftRadius: 10, paddingHorizontal: 12, paddingVertical: 5, },
    endTimeTxt: { marginLeft: 8, fontSize: 14, lineHeight: 15, color: Theme.colors.cyan2, fontFamily: Theme.fonts.medium },
    activeDayTxt: { fontSize: 16, lineHeight: 21, color: Theme.colors.text1, fontFamily: Theme.fonts.semiBold },
    activeMonthTxt: { fontSize: 11, lineHeight: 14, color: Theme.colors.text1, fontFamily: Theme.fonts.medium },
    activeDate: { width: 70, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, },
    infoView: { flex: 1, borderTopRightRadius: 10, borderBottomRightRadius: 10, backgroundColor: '#fff', borderLeftWidth: 1, borderLeftColor: '#D7D7D7', paddingLeft: 12, paddingBottom: 12 },
})
export default PromoCalendarItem;
