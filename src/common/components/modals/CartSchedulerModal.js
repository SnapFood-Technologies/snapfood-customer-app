
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Platform
} from 'react-native';
import moment from 'moment';
import { height } from 'react-native-dimension';
import Modal from 'react-native-modal';
import Foundation from 'react-native-vector-icons/Foundation';
import Picker from '@gregfrench/react-native-wheel-picker';
var PickerItem = Picker.Item;
import { connect } from 'react-redux';
import Theme from "../../../theme";
import AppText from '../../../common/components/AppText';
import { translate } from '../../../common/services/translate';
import { setDeliveryInfoCart } from '../../../store/actions/shop';
import { MainBtn } from '..';
import { isEmpty, convertTimeString2Hours } from '../../../common/services/utility';


const CartSchedulerModal = (props) => {
    const { showModal, isReorder, onClose } = props;
    const [visible, SetVisible] = useState(showModal)

    const dates = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [selectedDate, setSelectedDate] = useState(null);

    const [selectedTimeIndex, setSelectedTimeIndex] = useState(-1);

    const [availPickupDays, setAvailPickupDays] = useState([]);

    useEffect(() => {
        SetVisible(showModal)
    }, [showModal])

    useEffect(() => {
        if (props.vendorData.vendor_opening_days != null) {
            let days = [];
            for (let j = 0; j < props.vendorData.vendor_opening_days.length; j++) {
                const openDay = props.vendorData.vendor_opening_days[j];
                const _index = days.findIndex(d => d.week_day == openDay.week_day);
                let _times = [];
                if (_index != -1) {
                    _times = days[_index].times ? [...days[_index].times] : [];
                }

                const time_open = convertTimeString2Hours(openDay.time_open);
                const time_close = convertTimeString2Hours(openDay.time_close);

                for (let k = time_open; k <= time_close; k = k + 0.5) {
                    let _time = `${Math.floor(k)}:00`;
                    if ((k - Math.floor(k)) >= 0.5) {
                        _time = `${Math.floor(k)}:30`;
                    }

                    if (parseInt(_time.split(':')[0]) < 10) {
                        _time = '0' + _time;
                    }

                    if (_times.findIndex(t => t == _time) == -1) {
                        _times.push(_time);
                    }
                }

                if (_times.length > 0) {
                    if (_index != -1) {
                        days[_index].times = _times;
                    }
                    else {
                        days.push({
                            week_day: openDay.week_day,
                            times: _times
                        });
                    }
                }
            }

            let availDays = [];
            for (let ii = 0; ii < 7; ii++) {
                let _date = moment(new Date()).add(ii, 'days').toDate();
                let foundIndex = days.findIndex(d => d.week_day == ((_date.getDay() - 1) < 0 ? (_date.getDay() + 6) : (_date.getDay() - 1)).toString());
                if (foundIndex != -1) {
                    if (ii == 0) { // today
                        let tmpData = days[foundIndex];

                        let today_weekday = tmpData.week_day;
                        let today_available_times = [];
                        if (tmpData.times != null && tmpData.times.length > 0) {
                            for (let tt = 0; tt < tmpData.times.length; tt++) {
                                let now_hours = new Date().getHours() + new Date().getMinutes() / 60;
                                const time_hours = convertTimeString2Hours(tmpData.times[tt]);

                                if (time_hours >= (now_hours + 0.5)) {
                                    today_available_times.push(tmpData.times[tt]);
                                }
                            }
                        }

                        if (today_available_times.length > 0) {
                            availDays.push({
                                week_day: today_weekday,
                                times: today_available_times,
                                date: moment(_date).format('YYYY-MM-DD'),
                                day: 'Today',
                            });
                        }
                    }
                    else {
                        availDays.push({
                            ...days[foundIndex],
                            date: moment(_date).format('YYYY-MM-DD'),
                            day: (ii == 1 ? 'Tomorrow' : dates[_date.getDay()]),
                        });
                    }
                }
            }

            if (availDays.length > 0) {
                setAvailPickupDays(availDays);
            }
        }
    }, [props.vendorData.id]);

    useEffect(() => {
        if (availPickupDays.length > 0 && availPickupDays[0].times && availPickupDays[0].times.length > 0) {
            let date_index = 0;
            let time_index = 0;
            if (props.delivery_info.schedule_time != null) {
                let tmp = props.delivery_info.schedule_time.split(' ');
                if (tmp.length > 1) {
                    let tmpDateIndex = availPickupDays.findIndex(d => d.date == tmp[0]);
                    if (tmpDateIndex != -1) {
                        date_index = tmpDateIndex;
                        console.log('date_index ', date_index, tmp[1])
                        if (availPickupDays[tmpDateIndex].times != null) {
                            let tmpTimeIndex = availPickupDays[tmpDateIndex].times.findIndex(t => t + ':00' == tmp[1]);
                            if (tmpTimeIndex != -1) {
                                console.log('time_index ', tmpTimeIndex)
                                time_index = tmpTimeIndex;
                            }
                        }
                    }
                }
            }
            setSelectedDate(availPickupDays[date_index]);
            setSelectedTimeIndex(time_index);
        }
    }, [availPickupDays, props.delivery_info.schedule_time]);


    const onChangeDay = (_date) => {
        setSelectedDate(_date);
    };

    const onConfirm = () => {

        if (selectedTimeIndex == -1 || selectedTimeIndex >= selectedDate.times.length) {
            return;
        }
        let _date = selectedDate.date;
        let _time = selectedDate.times[selectedTimeIndex];
        if (isEmpty(_date) || isEmpty(_time)) {
            return;
        }

        console.log('confirm ', _date, _time)
        props.setDeliveryInfoCart({
            schedule_time: `${_date} ${_time}:00`
        });
        onClose();
    };

    return <Modal
        isVisible={visible}
        backdropOpacity={0.33}
        onSwipeComplete={() => onClose()}
        onBackdropPress={() => onClose()}
        swipeDirection={null}
        style={{ justifyContent: 'flex-end', margin: 0 }}
    >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            {
                isReorder == true && <View style={{ height: 56 }} />
            }
            {
                (availPickupDays.length > 0 && selectedDate != null && selectedDate.times != null && selectedTimeIndex != -1) &&
                <View style={[Theme.styles.col_center_start, { marginTop: 5 }]}>
                    <View style={[Theme.styles.row_center, styles.pickup]}>
                        <Picker
                            style={{ width: '50%', height: 160, backgroundColor: Theme.colors.white }}
                            lineColor={Theme.colors.white}
                            selectedValue={availPickupDays.findIndex((i) => i.date == selectedDate.date)}
                            itemStyle={styles.wheelItemTxt}
                            itemSpace={32}
                            onValueChange={(index) => {
                                onChangeDay(availPickupDays[index]);
                            }}
                        >
                            {availPickupDays.map((item, i) => (
                                <PickerItem label={translate(item.day)} value={i} key={i} />
                            ))}
                        </Picker>
                        <Picker
                            style={{ width: '50%', height: 160, backgroundColor: Theme.colors.white }}
                            lineColor={Theme.colors.white}
                            selectedValue={selectedTimeIndex}
                            itemStyle={styles.wheelItemTxt}
                            itemSpace={32}
                            textColor={'#000'}
                            onValueChange={(index) => {
                                setSelectedTimeIndex(index)
                            }}
                        >
                            {selectedDate.times.map((value, i) => (
                                <PickerItem label={value} value={i} key={i} />
                            ))}
                        </Picker>
                        {Platform.OS == 'android' && (
                            <View
                                style={{
                                    width: '100%',
                                    height: 1,
                                    position: 'absolute',
                                    top: 60,
                                    backgroundColor: Theme.colors.gray9,
                                }}
                            ></View>
                        )}
                        {Platform.OS == 'android' && (
                            <View
                                style={{
                                    width: '100%',
                                    height: 1,
                                    position: 'absolute',
                                    top: 100,
                                    backgroundColor: Theme.colors.gray9,
                                }}
                            ></View>
                        )}
                    </View>
                </View>
            }
            <View style={styles.headerView}>
                {
                    isReorder == true &&
                    <View style={[styles.reOrderView]}>
                        <Foundation name='info' size={20} color={Theme.colors.red1} />
                        <AppText style={styles.reOrderTxt}>{translate('cart.schedule_reorder_desc')}</AppText>
                    </View>
                }
                <AppText style={styles.title}>{translate('cart.schedule_order')}</AppText>
            </View>
            <View style={{ flex: 1, }} />
            <MainBtn title={translate('confirm')} style={{ width: '100%' }} onPress={onConfirm} />
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    modalContent: {
        width: '100%',
        paddingBottom: 30,
        paddingHorizontal: 20,
        backgroundColor: Theme.colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    headerView: {
        position: 'absolute',
        top: 0,
        width: '100%',
        paddingTop: 20,
        backgroundColor: Theme.colors.white,
    },
    title: {
        textAlign: 'left',
        width: '100%',
        color: Theme.colors.text,
        fontFamily: Theme.fonts.bold,
        fontSize: 18,
    },
    pickup: { width: '100%', height: 160, zIndex: 0 },
    wheelItemTxt: { fontSize: 16, fontFamily: Theme.fonts.semiBold, fontWeight: '900', color: '#000' },
    reOrderView: { marginBottom: 10, flexDirection: 'row', width: '100%' },
    reOrderTxt: { marginLeft: 8, fontSize: 16, lineHeight: 21, color: Theme.colors.text },
});

const mapStateToProps = ({ app, shop }) => ({
    user: app.user,
    addresses: app.addresses,
    delivery_info: shop.delivery_info,
    vendorData: shop.vendorData || {},
});

export default connect(mapStateToProps, {
    setDeliveryInfoCart,
})(React.memo(CartSchedulerModal));
