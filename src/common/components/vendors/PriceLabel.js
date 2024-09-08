import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Theme from "../../../theme";

const PriceLabel = ({ id, price, discount_price, style, priceStyle, discountStyle }) => {
  if (price == null) { return null; }

  const getPrice = () => {
    if (discount_price != null && parseInt(discount_price) > 0) {
      return parseInt(price - discount_price);
    }
    return price;
  }

  const getOldPrice = () => {
    if (discount_price != null && parseInt(discount_price) > 0) {
      return price;
    }
    return null;
  }

  return (
    <View style={[Theme.styles.row_center, style]}>
      <Text style={[styles.priceTxt, priceStyle]}>
        {getPrice() >= 0 ? parseInt(getPrice()) : 0} L
      </Text>
      {
        getOldPrice() != null &&
        <Text style={[styles.discountTxt, discountStyle]}>
          {getOldPrice()} L
        </Text>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  priceTxt: { fontSize: 19, color: Theme.colors.text, fontFamily: Theme.fonts.bold, },
  discountTxt: { marginLeft: 8, fontSize: 16, color: Theme.colors.gray7, fontFamily: Theme.fonts.semiBold, textDecorationLine: 'line-through', textDecorationColor: Theme.colors.gray7 },
});

function arePropsEqual(prevProps, nextProps) {
  return prevProps.id == nextProps.id && prevProps.price == nextProps.price && prevProps.discount_price == nextProps.discount_price;
}

export default React.memo(PriceLabel, arePropsEqual);
