import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import moment from 'moment';
import Swipeout from 'react-native-swipeout';
import Entypo from 'react-native-vector-icons/Entypo';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import Config from '../../../config';
import AppTooltip from '../AppTooltip';
import { isEmpty, minutes2Days } from '../../services/utility';
import OfferTimer from '../../../modules/home/components/OfferTimer';

const VendorOfferItem = (props) => {
    const { data, style, onPress } = props

    const getTimeLimit = () => {
        if (data.non_expired == 1) {
            return null;
        }

        let start_time = data.start_time;
        let expire_time = data.end_time;
        if (data.vendor_type == 'random') {
            expire_time = data.expire_time;
        }
        if (isEmpty(expire_time)) {
            return null;
        }

        let total_hours = moment(expire_time, "YYYY-MM-DD  hh:mm:ss").diff(moment(start_time, "YYYY-MM-DD  hh:mm:ss"), 'minutes'); 
        let left_hours = moment(expire_time, "YYYY-MM-DD  hh:mm:ss").diff(moment(new Date()), 'minutes');
        let time = minutes2Days(left_hours);

        if (time.length > 2) {
            let has_day = false;
            let has_hours = false;
            let disp = '';
            if (time[0] > 0) {
                if (time[0] == 1) {
                    disp = time[0] + translate('invitation_earn.day') + ' ';
                }
                else {
                    disp = time[0] + translate('invitation_earn.days') + ' ';
                }

                has_day = true
            }

            if (time[1] > 0) {
                if (time[1] == 1) {
                    disp = disp + time[1] + translate('invitation_earn.hour') + ' ';
                }
                else {
                    disp = disp + time[1] + translate('invitation_earn.hours') + ' ';
                }

                has_hours = true;
            }

            if ((has_day == false || has_hours == false) && time[2] > 0) {
                if (time[2] == 1) {
                    disp = disp + time[2] + translate('invitation_earn.min') + ' ';
                }
                else {
                    disp = disp + time[2] + translate('invitation_earn.mins') + ' ';
                }
            }
            
            let percent = 0;
            if (left_hours >= 0 && total_hours > 0 && left_hours <= total_hours) {
                percent = (total_hours - left_hours) / total_hours;
            }
            
            return {
                percent : percent,
                string : disp
            };
        }
        return null;
    }


    const getItemDesc = () => {
        if (data.type == 'free_delivery') {
            return translate('search.free_delivery')
        }
        else if (data.type == 'percentage') {
            return (data.value != null && parseInt(data.value) >= 0) ? parseInt(data.value) + '%' : '0%'
        }
        else if (data.type == 'fixed') {
            return (data.value != null && parseInt(data.value) >= 0) ? parseInt(data.value) + ' L' : '0 L'
        }
        else if (data.type == 'item') {
            return (data.product ? data.product.title : '')
        }
        return ''
    }

    return <TouchableOpacity
        style={[
            Theme.styles.row_center, styles.container,
            { backgroundColor: '#FAFAFC' },
            style
        ]}
        onPress={onPress ? onPress : () => { }}
    >
        <View style={[ { flex: 1 }]}>
            <Text style={[styles.title,]} numberOfLines={1}>
                {data.code ? data.code : ((props.language == 'en' && !isEmpty(data.name_en)) ? data.name_en : data.name)}
            </Text>
            <Text style={[styles.descTxt, {flex: 1}]} numberOfLines={2}>{(props.language == 'en' && !isEmpty(data.description_en)) ? data.description_en : data.description}</Text>
            <Text style={[styles.priceTxt]}>{getItemDesc()}</Text>
        </View>
        <View style={[  { alignItems: 'flex-start'}]}>
            <OfferTimer data={getTimeLimit()}  />
            <View style={[Theme.styles.col_center_start, styles.imgView]}>
                <FastImage
                    source={{ uri: Config.IMG_BASE_URL + (data.product ? data.product.image_thumbnail_path : '') + `?w=200&h=200` }}
                    style={styles.img}
                    resizeMode={FastImage.resizeMode.cover}
                />
            </View>
        </View>
    </TouchableOpacity>
};

const styles = StyleSheet.create({
    container: { width: '100%', height: 125, marginBottom: 12, alignItems: 'flex-start', borderRadius: 15, padding: 12, marginRight: 16, },
    imgView: { marginRight: 12,  width:'100%', alignItems  : 'flex-end' },
    img: { width: 52, height: 52, borderRadius: 10, resizeMode: 'cover', },
    title: { marginRight: 12, fontSize: 17, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
    descTxt: { marginTop: 5, fontSize: 16, color: Theme.colors.gray7, fontFamily: Theme.fonts.medium, },
    priceTxt: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.bold, },
    date_limit: { fontSize: 15, fontFamily: Theme.fonts.semiBold, color: '#F55A00', marginBottom: 3 },
    unavailable: { fontSize: 15, fontFamily: Theme.fonts.semiBold, color: '#F55A00', },
    cartBorder: { borderTopLeftRadius: 4, borderBottomLeftRadius: 4, borderLeftWidth: 5, borderLeftColor: Theme.colors.cyan2, },
})

function arePropsEqual(prevProps, nextProps) {
    return prevProps.id == nextProps.id;
}

const mapStateToProps = ({ app, shop }) => ({
    language: app.language,
    isLoggedIn: app.isLoggedIn,
    cartItems: shop.items,
});
export default connect(mapStateToProps, {})(React.memo(VendorOfferItem, arePropsEqual));
