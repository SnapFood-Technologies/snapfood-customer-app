import React from 'react';
import { View, Text } from 'react-native';
import { translate } from '../../services/translate';
import Theme from "../../../theme";
import Svg_discount from '../../../common/assets/svgs/vendor/discount.svg';

const DiscountLabel = ({ price, discount_price }) => {
  if (price == null || discount_price == null || discount_price == 0 || price == 0) { return null; }
  let value = parseInt((discount_price * 100) / price);
  return (
    <View style={[Theme.styles.row_center]}>
      <Svg_discount />
      <Text style={{ marginLeft: 7, fontSize: 14, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 }}>{value}%{translate('promotions.off')}</Text>
    </View>
  );
};

function arePropsEqual(prevProps, nextProps) {
  return prevProps.price == nextProps.price && prevProps.discount_price == nextProps.discount_price;
}

export default React.memo(DiscountLabel, arePropsEqual);
