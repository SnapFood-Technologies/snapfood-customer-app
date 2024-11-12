import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native';
import moment from 'moment';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Picker from '@gregfrench/react-native-wheel-picker';
var PickerItem = Picker.Item;
import { connect } from 'react-redux';
import { saveAddress, getAddresses, setTmpLocationPicked } from '../../../store/actions/app';
import { setDeliveryInfoCart } from '../../../store/actions/shop';
import { translate } from '../../../common/services/translate';
import { getLanguage } from '../../../common/services/translate';
import { convertTimeString2Hours, isEmpty } from '../../../common/services/utility';
import Theme from '../../../theme';
import RouteNames from '../../../routes/names';
import { OrderType_Delivery, OrderType_Pickup, OrderType_Reserve, Order_Pickedup } from '../../../config/constants';
import DotBorderButton from '../../../common/components/buttons/dot_border_button';
import AuthInput from '../../../common/components/AuthInput';
import AddressItem from '../../../common/components/AddressItem';
import Dropdown from './Dropdown';
import CommentView from './CommentView';
import ReserveItem from './ReserveItem';
import { AppText } from '../../../common/components';
import CartScheduleTab from './CartScheduleTab';
import CartSchedulerModal from '../../../common/components/modals/CartSchedulerModal';
import AppTooltip from '../../../common/components/AppTooltip';


const CartDelivery = (props) => {
	const [isNoteEdit, setNoteEdit] = useState(false);

	const [selectedDate, setSelectedDate] = useState(null);
	const [selectedTime, setSelectedTime] = useState(null);

	const [isScheduleModal, setScheduleModal] = useState(false);

	const [selectedReserveDate, setSelectedReserveDate] = useState(null);
	const [selectedReserveTime, setSelectedReserveTime] = useState(null);


	const dates = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	const [order_methods, setOrderMethods] = useState([]);

	const [availReseveDays, setAvailReseveDays] = useState([]);
	const [availPickupDays, setAvailPickupDays] = useState([]);


	useEffect(() => {
		if (props.addresses != null && props.addresses.length > 0) {
			let comments = '';
			if (props.delivery_info.handover_method == OrderType_Delivery) {
				comments = props.addresses[0].notes;
			}
			props.setDeliveryInfoCart({
				address: props.addresses[0],
				comments: comments,
			});
		} else {
			props.setDeliveryInfoCart({
				address: {},
			});
		}
	}, [props.addresses]);

	useEffect(() => {
		if (props.vendorData.is_open != 1 && props.vendorData.can_schedule == 1 && isEmpty(props.delivery_info.schedule_time)) {
			props.setDeliveryInfoCart({
				is_schedule: 1,
				handover_method: OrderType_Delivery
			});
			setScheduleModal(true);
		}
	}, [props.vendorData.can_schedule, props.vendorData.is_open])

	useEffect(() => {
		if (props.vendorData.can_schedule == 1 && props.delivery_info.is_schedule == 1 && isEmpty(props.delivery_info.schedule_time)) {
			setScheduleModal(true);
		}
	}, [])

	useEffect(() => {
		if (props.vendorData.order_method != null) {
			const supported_order_methods = props.vendorData.order_method.split('-');

			let avail_order_methods = [];
			for (let i = 0; i < supported_order_methods.length; i++) {
				if (supported_order_methods[i] == OrderType_Delivery) {
					avail_order_methods.push(OrderType_Delivery);
				}
				else if (supported_order_methods[i] == OrderType_Reserve) {
					let days = [];
					for (let j = 0; j < props.vendorData.reservation_hours?.length; j++) {
						const reserveDay = props.vendorData.reservation_hours[j];
						const _index = days.findIndex(d => d.week_day == reserveDay.week_day);
						let _times = [];
						if (_index != -1) {
							_times = days[_index].times ? [...days[_index].times] : [];
						}

						const time_now = convertTimeString2Hours(moment(new Date()).format('H:m:s'));
						const time_open = convertTimeString2Hours(reserveDay.time_open);
						const time_close = convertTimeString2Hours(reserveDay.time_close);

						const isToday = reserveDay.week_day == ((new Date().getDay() - 1) < 0 ? (new Date().getDay() + 6) : (new Date().getDay() - 1)).toString();

						for (let k = (isToday ? Math.max(time_now, time_open) : time_open); k <= time_close; k = k + 0.5) {
							let _time = null;
							if (((k - Math.floor(k)) >= 0.5) && ((Math.floor(k) + 1) < time_close)) {
								_time = `${Math.floor(k) + 1}:00`;
							}
							else if (((k - Math.floor(k)) < 0.5) && ((Math.floor(k) + 0.5) < time_close)) {
								_time = `${Math.floor(k)}:30`;
							}
							if (_time != null && _times.findIndex(t => t == _time) == -1) {
								_times.push(_time);
							}
						}

						if (_times.length > 0) {
							if (_index != -1) {
								days[_index].times = _times;
							}
							else {
								days.push({
									week_day: reserveDay.week_day,
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
							availDays.push({
								...days[foundIndex],
								date: moment(_date).format('YYYY-MM-DD'),
								day: ii == 0 ? 'Today' : ii == 1 ? 'Tomorrow' : dates[_date.getDay()],
							});
						}
					}

					if (availDays.length > 0) {
						setAvailReseveDays(availDays);
						avail_order_methods.push(OrderType_Reserve);
					}
				}
				else if (supported_order_methods[i] == OrderType_Pickup) {
					const start_pickup = convertTimeString2Hours(props.vendorData.start_pickup);
					const end_pickup = convertTimeString2Hours(props.vendorData.end_pickup);

					let _times = [];
					for (let j = start_pickup; j <= end_pickup; j = j + 0.5) {
						let _time = `${Math.floor(j)}:00`;
						if ((j - Math.floor(j)) >= 0.5) {
							_time = `${Math.floor(j)}:30`;
						}
						if (_times.findIndex(t => t == _time) == -1) {
							_times.push(_time);
						}
					}

					let availDays = [];
					if (_times.length > 0) {
						for (let ii = 0; ii < 7; ii++) {
							let _date = moment(new Date()).add(ii, 'days').toDate();
							availDays.push({
								week_day: ii.toString(),
								times: _times,
								date: moment(_date).format('YYYY-MM-DD'),
								day: ii == 0 ? 'Today' : ii == 1 ? 'Tomorrow' : dates[_date.getDay()],
							});
						}
					}

					if (availDays.length > 0) {
						setAvailPickupDays(availDays);
						avail_order_methods.push(OrderType_Pickup);
					}
				}
			}

			if (avail_order_methods.length > 0) {
				setOrderMethods(avail_order_methods);
			}
		}

	}, [props.vendorData.id]);

	useEffect(() => {
		if (order_methods.length > 0) {
			
			if (order_methods.findIndex(i => i == props.delivery_info.handover_method) == -1) {
				props.setDeliveryInfoCart({
					handover_method: order_methods[0],
				});
			}
		}

	}, [order_methods])

	useEffect(() => {
		if (props.delivery_info.handover_method == OrderType_Reserve) {
			if (availReseveDays.length > 0 && availReseveDays[0].times && availReseveDays[0].times.length > 0) {

				setSelectedReserveDate(availReseveDays[0]);
				setSelectedReserveTime(availReseveDays[0].times[0]);
				props.setDeliveryInfoCart({
					pickup_date: availReseveDays[0].date,
					pickup_time: availReseveDays[0].times[0],
				});
			}
		}
		else if (props.delivery_info.handover_method == OrderType_Pickup) {
			if (availPickupDays.length > 0 && availPickupDays[0].times && availPickupDays[0].times.length > 0) {

				setSelectedDate(availPickupDays[0]);
				setSelectedTime(availPickupDays[0].times[0]);
				props.setDeliveryInfoCart({
					pickup_date: availPickupDays[0].date,
					pickup_time: availPickupDays[0].times[0],
				});
			}
		}

	}, [props.delivery_info.handover_method, availPickupDays, availReseveDays]);

	const _renderVendorInfo = () => {
		return (
			<View style={[Theme.styles.row_center, styles.vendorAddress]}>
				<View style={{ flex: 1 }}>
					<AppText style={[styles.vendorPhone]}>{props.vendorData.phone_number}</AppText>
					<AppText style={[styles.vendorAddressTxt]}>{props.vendorData.address}</AppText>
				</View>
				<TouchableOpacity onPress={() => {
					props.navigation.navigate(RouteNames.VendorLocationScreen, {
						address: { lat: props.vendorData.latitude, lng: props.vendorData.longitude },
						info: {
							title: props.vendorData.title,
							is_open: props.vendorData.is_open,
							logo: props.vendorData.logo_thumbnail_path,
							distance: (parseFloat(props.vendorData.distance) / 1000).toFixed(1),
						},
					});
				}}>
					<Text style={styles.see_on_map}>{translate('vendor_profile.view_on_map')}</Text>
				</TouchableOpacity>
			</View>
		)
	}

	const _renderScheduleInfo = () => {
		return (
			<View style={[Theme.styles.col_center, { marginBottom: 10 }]} >
				<CartScheduleTab
					curitem={props.delivery_info.is_schedule === 0 ? 'now' : 'schedule'}
					hide_now={
						props.vendorData.is_open != 1
					}
					onSelect={(item) => {
						if (item === 'schedule') {
							props.setDeliveryInfoCart({
								is_schedule: 1,
							});
							setScheduleModal(true);
						} else {
							props.setDeliveryInfoCart({
								is_schedule: 0,
								schedule_time: null
							});
						}
					}}
				/>
				{!isEmpty(props.delivery_info.schedule_time) && props.delivery_info.is_schedule === 1 && (
					<AppText style={[styles.scheduleTimelabel, props.vendorData.is_open != 1 && { marginLeft: 0 }]}  >
						{moment(props.delivery_info.schedule_time).locale(getLanguage()).format('dddd')}
						{' - '}
						{moment(props.delivery_info.schedule_time).format('h:mm A')}
					</AppText>
				)}
			</View>
		);
	};


	const _renderHandover = () => {
		if (props.delivery_info.handover_method == OrderType_Delivery && props.delivery_info.is_schedule == 1 &&
			props.vendorData.is_open != 1
		) {
			return null;
		}

		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView, { paddingVertical: 15 }]}>
				<View style={[Theme.styles.row_center, { width: '100%' }]}>
					<View style={[Theme.styles.row_center_start, { flex: 1 }]}>
						<Text style={[styles.subjectTitle, { marginRight: 8 }]}>
							{translate('vendor_profile.handover_method')}
						</Text>
						{props.delivery_info.handover_method == OrderType_Pickup &&
							<AppTooltip
								id='pickup-tooltip'
								title={translate('tooltip.cart_pickup_title')}
								description={translate('tooltip.cart_pickup_desc')}
								placement={'bottom'}
								arrowStyle={{ marginTop: 0, top: -12, }}
							/>
						}
						{props.delivery_info.handover_method == OrderType_Reserve &&
							<AppTooltip
								id='reserve-tooltip'
								title={translate('tooltip.cart_reserve_title')}
								description={translate('tooltip.cart_reserve_desc')}
								placement={'bottom'}
								arrowStyle={{ marginTop: 0, top: -12, }}
							/>
						}
					</View>
					<Dropdown
						list_items={order_methods}
						style={{ width: 155 }}
						item_height={40}
						value={props.delivery_info.handover_method}
						onChange={(method) => {
							let comments = '';
							if (method == OrderType_Delivery && props.delivery_info.address != null) {
								comments = props.delivery_info.address.notes;
							}
							props.setDeliveryInfoCart({
								handover_method: method,
								comments: comments,
								tip_rider: 0,
								is_schedule: 0,
								schedule_time: null
							});
						}}
					/>
				</View>
			</View>
		);
	};

	const _renderDeliveryInfo = () => {
		const onGoAddress = () => {
			props.navigation.navigate(RouteNames.AddressesScreen, { isFromCart: true });
		};
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView]}>
				<View style={[Theme.styles.row_center, { width: '100%', marginBottom: 8 }]}>
					<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>{translate('cart.delivery_info')}</Text>
				</View>
				{props.delivery_info.address != null && props.delivery_info.address.id != null ? (
					<AddressItem
						data={props.delivery_info.address}
						onEdit={onGoAddress}
						edit_text={translate('cart.change_address')}
						outOfDeliveryArea={props.outOfDeliveryArea == true}
						textSize={15}
					/>
				) : (
					<DotBorderButton
						title={translate('address_list.add_new_address')}
						style={{ width: '100%' }}
						onPress={onGoAddress}
					/>
				)}
				<TouchableOpacity onPress={() => setNoteEdit(!isNoteEdit)}>
					<View style={[Theme.styles.row_center, { marginTop: 8 }]}>
						<Text style={[styles.item_txt, { marginRight: 3 }]}>{translate('cart.delivery_note')}</Text>
						<FeatherIcon name='chevron-right' size={16} color={Theme.colors.text} />
					</View>
				</TouchableOpacity>
				<View style={{ width: '100%', paddingTop: 8 }}>
					{
						isNoteEdit == true ? (
							<CommentView
								hide_label={true}
								placeholder={translate('cart.delivery_note')}
								comments={props.delivery_info.comments}
								onChangeText={(text) => {
									props.setDeliveryInfoCart({
										comments: text,
									});
								}}
							/>
						) : null
						// <TouchableOpacity onPress={()=>setNoteEdit(!isNoteEdit)}>
						//     <Text style={[Theme.styles.flex_1, styles.delivery_note_txt]}>{props.delivery_info.comments}</Text>
						// </TouchableOpacity>
					}
				</View>
			</View>
		);
	};

	const _renderPickupInfo = () => {
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView]}>
				<View style={[Theme.styles.row_center, { width: '100%', marginBottom: 8 }]}>
					<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>{translate('cart.pickup_info')}</Text>
				</View>
				<View style={[Theme.styles.col_center, { width: '100%', backgroundColor: Theme.colors.white, zIndex: 1 }]}>
					{_renderVendorInfo()}
					<View style={{ width: '100%', marginTop: 12, paddingBottom: 20, zIndex: 1, backgroundColor: Theme.colors.white }}>
						<CommentView
							title={translate('cart.pickup_note')}
							placeholder={translate('cart.add_your_note')}
							comments={props.delivery_info.comments}
							onChangeText={(text) => {
								props.setDeliveryInfoCart({
									comments: text,
								});
							}}
						/>
					</View>
					<Text style={styles.notiTxt}>
						{translate('cart.pickup_after_30') + `${props.delivery_info.pickup_date} ${props.delivery_info.pickup_time}`}
					</Text>
				</View>
				{_renderPickupTime()}
			</View>
		);
	};

	const _renderReserveInfo = () => {
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView]}>
				<View style={[Theme.styles.row_center, { width: '100%', marginBottom: 16 }]}>
					<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>{translate('cart.reservation_info')}</Text>
				</View>
				<View style={[Theme.styles.col_center, { width: '100%', backgroundColor: Theme.colors.white, zIndex: 1 }]}>
					{_renderVendorInfo()}
					{_renderNumGuests()}
				</View>

				{_renderReserveTime()}
			</View>
		);
	};

	const _renderContactless = () => {
		return (
			<View style={[Theme.styles.col_center_start, styles.sectionView]}>
				<View style={[Theme.styles.row_center, { width: '100%' }]}>
					<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>
						{translate('cart.contactless_delivery')}
					</Text>
					<Switch
						style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.65 }] }}
						trackColor={{ false: '#C0EBEC', true: '#C0EBEC' }}
						thumbColor={props.delivery_info.contactless_delivery ? Theme.colors.cyan2 : '#C0EBEC'}
						ios_backgroundColor='#C0EBEC'
						onValueChange={() => {
							props.setDeliveryInfoCart({
								contactless_delivery: !props.delivery_info.contactless_delivery,
							});
						}}
						value={props.delivery_info.contactless_delivery == true}
					/>
				</View>
			</View>
		);
	};

	const _renderNumGuests = () => {
		return (
			<View style={[Theme.styles.row_center, { width: '100%', zIndex: 1, marginTop: 16, marginBottom: 10 }]}>
				<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>{translate('cart.num_guests')}</Text>
				<AuthInput
					style={{
						width: 122,
						height: 40,
						borderWidth: 1,
						borderColor: Theme.colors.gray6,
						backgroundColor: Theme.colors.white,
					}}
					placeholder=''
					textAlign='center'
					fontSize={15}
					keyboardType='number-pad'
					value={props.delivery_info.num_guests || ''}
					onChangeText={(text) => {
						props.setDeliveryInfoCart({
							num_guests: text,
						});
					}}
				/>
			</View>
		);
	};


	const _renderPickupTime = () => {
		const onChangeDay = (_date) => {
			setSelectedDate(_date);
			if (_date.times && _date.times.length > 0) {
				setSelectedTime(_date.times[0]);
			}

			props.setDeliveryInfoCart({
				pickup_date: _date.date,
			});
		};
		const onChangeTime = (_time) => {
			setSelectedTime(_time);
			props.setDeliveryInfoCart({
				pickup_time: _time,
			});
		};

		if (availPickupDays.length == 0 || selectedDate == null || selectedDate.times == null || selectedTime == null) { return null; }
		return (
			<View style={[Theme.styles.col_center_start,]}>
				<View style={[Theme.styles.row_center, { width: '100%', backgroundColor: Theme.colors.white, zIndex: 1 }]}>
					<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>
						{props.delivery_info.handover_method == OrderType_Pickup
							? translate('cart.custom_pickup')
							: translate('cart.date_time')}
					</Text>
				</View>
				<View style={[Theme.styles.row_center, styles.pickup, { marginTop: Platform.OS == 'ios' ? -80 : -60 }]}>
					<Picker
						style={{ width: '50%', height: 180, backgroundColor: Theme.colors.white }}
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
						style={{ width: '50%', height: 180, backgroundColor: Theme.colors.white }}
						lineColor={Theme.colors.white}
						selectedValue={selectedDate.times.findIndex((i) => i == selectedTime) == -1 ? 0 : selectedDate.times.findIndex((i) => i == selectedTime)}
						itemStyle={styles.wheelItemTxt}
						itemSpace={32}
						textColor={'#000'}
						onValueChange={(index) => {
							onChangeTime(selectedDate.times[index]);
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
								top: 40,
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
								top: 80,
								backgroundColor: Theme.colors.gray9,
							}}
						></View>
					)}
				</View>
			</View>
		);
	};

	const _renderReserveTime = () => {
		const onChangeDay = (_date) => {
			setSelectedReserveDate(_date);
			if (_date.times && _date.times.length > 0) {
				setSelectedReserveTime(_date.times[0]);
			}

			props.setDeliveryInfoCart({
				pickup_date: _date.date,
			});
		};
		const onChangeTime = (_time) => {
			setSelectedReserveTime(_time);
			props.setDeliveryInfoCart({
				pickup_time: _time,
			});
		};

		if (availReseveDays.length == 0 || selectedReserveDate == null || selectedReserveDate.times == null || selectedReserveTime == null) { return null; }
		return (
			<View style={[Theme.styles.col_center_start,]}>
				<View style={[Theme.styles.row_center, { width: '100%', backgroundColor: Theme.colors.white, zIndex: 1 }]}>
					<Text style={[Theme.styles.flex_1, styles.subjectTitle]}>
						{props.delivery_info.handover_method == OrderType_Pickup
							? translate('cart.custom_pickup')
							: translate('cart.date_time')}
					</Text>
				</View>
				<View style={[Theme.styles.row_center, styles.pickup, { marginTop: Platform.OS == 'ios' ? -80 : -60 }]}>
					<Picker
						style={{ width: '50%', height: 180, backgroundColor: Theme.colors.white }}
						lineColor={Theme.colors.white}
						selectedValue={availReseveDays.findIndex((i) => i.date == selectedReserveDate.date)}
						itemStyle={styles.wheelItemTxt}
						itemSpace={32}
						onValueChange={(index) => {
							onChangeDay(availReseveDays[index]);
						}}
					>
						{availReseveDays.map((item, i) => (
							<PickerItem label={translate(item.day)} value={i} key={i} />
						))}
					</Picker>
					<Picker
						style={{ width: '50%', height: 180, backgroundColor: Theme.colors.white }}
						lineColor={Theme.colors.white}
						selectedValue={selectedReserveDate.times.findIndex((i) => i == selectedReserveTime) == -1 ? 0 : selectedReserveDate.times.findIndex((i) => i == selectedReserveTime)}
						itemStyle={styles.wheelItemTxt}
						itemSpace={32}
						textColor={'#000'}
						onValueChange={(index) => {
							onChangeTime(selectedReserveDate.times[index]);
						}}
					>
						{selectedReserveDate.times.map((value, i) => (
							<PickerItem label={value} value={i} key={i} />
						))}
					</Picker>
					{Platform.OS == 'android' && (
						<View
							style={{
								width: '100%',
								height: 1,
								position: 'absolute',
								top: 40,
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
								top: 80,
								backgroundColor: Theme.colors.gray9,
							}}
						></View>
					)}
				</View>
			</View>
		);
	};

	return (
		<View style={{ flex: 1, width: '100%', paddingHorizontal: 20 }}>
			{props.delivery_info.handover_method == OrderType_Delivery &&
				props.vendorData.can_schedule == 1 &&
				_renderScheduleInfo()}
			{props.vendorData.order_method != 'Delivery' && order_methods.length > 0 && _renderHandover()}
			{props.delivery_info.handover_method == OrderType_Delivery && _renderDeliveryInfo()}
			{props.delivery_info.handover_method == OrderType_Pickup && _renderPickupInfo()}
			{props.delivery_info.handover_method == OrderType_Reserve && _renderReserveInfo()}
			<CartSchedulerModal
				showModal={isScheduleModal}
				isReorder={props.vendorData.is_open != 1 && props.vendorData.can_schedule == 1 && isEmpty(props.delivery_info.schedule_time) && props.isReorder}
				onClose={() => {
					setScheduleModal(false);
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		paddingVertical: 20,
		backgroundColor: '#ffffff',
	},
	formView: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '100%',
	},
	applyBtn: { fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },
	categ_view: { height: 47, width: '100%', paddingLeft: 20, borderTopWidth: 1, borderTopColor: '#F6F6F9' },
	categ_txt: { fontSize: 15, fontFamily: Theme.fonts.semiBold, color: '#AAA8BF' },
	listItem: {
		height: 54,
		width: '100%',
		marginBottom: 12,
		borderRadius: 15,
		paddingLeft: 16,
		paddingRight: 16,
		backgroundColor: '#FAFAFC',
	},
	item_txt: { fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },

	subjectTitle: { fontSize: 18, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
	divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9 },
	sectionView: {
		width: '100%',
		alignItems: 'flex-start',
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: Theme.colors.gray9,
		backgroundColor: Theme.colors.white
	},

	notiTxt: {
		marginBottom: 20,
		width: '100%',
		textAlign: 'center',
		fontSize: 15,
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.red1,
	},
	pickup: { width: '100%', height: 180, zIndex: 0 },
	wheelItemTxt: { fontSize: 17, fontFamily: Theme.fonts.semiBold, fontWeight: '900', color: '#000' },

	delivery_note_txt: { paddingHorizontal: 6, fontSize: 15, color: Theme.colors.text, fontFamily: Theme.fonts.medium },
	see_on_map: { fontSize: 15, fontFamily: Theme.fonts.medium, color: '#F55A00', marginBottom: 3 },
	vendorAddress: { zIndex: 1, width: '100%', alignItems: 'flex-start', borderRadius: 15, backgroundColor: Theme.colors.gray8, paddingVertical: 12, paddingHorizontal: 15, },
	vendorPhone: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
	vendorAddressTxt: { marginTop: 4, fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
	scheduleTimelabel: { marginLeft: 108, textAlign: 'center', marginTop: 4, fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, textDecorationLine: 'underline' }
});

const mapStateToProps = ({ app, shop }) => ({
	user: app.user,
	addresses: app.addresses,
	delivery_info: shop.delivery_info,
	vendorData: shop.vendorData || {},
});

export default connect(mapStateToProps, {
	saveAddress,
	getAddresses,
	setTmpLocationPicked,
	setDeliveryInfoCart,
})(CartDelivery);
