import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styles from '../../../modules/search/styles/resultsStyles';
import FastImage from 'react-native-fast-image';
import Feather from 'react-native-vector-icons/Feather'
import AppText from '../AppText';
import MainBtn from "../../../common/components/buttons/main_button";
import { translate } from '../../services/translate';
import Svg_img from '../../assets/svgs/empty/no_orders.svg';
import Theme from '../../../theme';

const NoOrders = ({ isCurrent, hasActivePromo = false, style, onBtnPressed = () => { }, onPromoBtnPressed = () => { } }) => {
  return (
    <View style={[styles.nores, style]}>
      <Svg_img />
      <AppText style={[styles.description, { marginTop: 16 }]}>{isCurrent == true ? translate('orders.no_recent_orders') : translate('orders.no_past_orders')}</AppText>
      <AppText style={styles.description}>{isCurrent == true ? translate('orders.no_recent_orders_message') : translate('orders.no_past_orders_message')}</AppText>
      {!!onBtnPressed && (
        <MainBtn
          title={translate('orders.order_now')}
          style={{ width: '80%', marginTop: 30, padding: 10 }}
          onPress={onBtnPressed}
        />
      )}
      {
        isCurrent && hasActivePromo &&
        <TouchableOpacity style={[Theme.styles.row_center, { width: '90%', marginTop: 30, marginBottom: 20 }]}
          onPress={onPromoBtnPressed}
        >
          <Feather name='calendar' color={Theme.colors.cyan2} size={24} />
          <AppText style={{ marginLeft: 8, fontSize: 18, lineHeight: 26, color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold }}>{translate('orders.go_calendar_promotion')}</AppText>
        </TouchableOpacity>
      }
    </View>
  );
};

export default NoOrders;
