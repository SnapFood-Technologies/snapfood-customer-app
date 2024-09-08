import React from 'react';
import { TouchableOpacity, Image, View } from 'react-native';
import styles from '../styles/styles';
import Star from "react-native-vector-icons/FontAwesome"
import FastImage from 'react-native-fast-image';
import AppText from '../../../common/components/AppText';

const CategoryItem = ({ item, onPress }) => {

  let foodItems = "";
  let i = 1;
  let finalRate = "0.0";

  let rate = Math.round((item.rating_interval / 2) * 10) / 10;
  if (rate === 0 ||  rate === 1 || rate === 2 || rate === 3 || rate === 4 || rate === 5) {
    finalRate = rate + '.0';
  }
  else {
    finalRate = rate;
  }

  item && item.food_categories && item.food_categories.forEach(element => {
    if (i < item.food_categories.length) {
      foodItems = foodItems + element.title_en + ", ";
      i = i + 1;
    }
    else {
      foodItems = foodItems + element.title_en;
      i = i + 1;
    }
  });

  return (
    <TouchableOpacity style={[styles.cat]} onPress={onPress}>
      {item.profile_thumbnail_path && (
        <View style={styles.catImageContainer}>
          <FastImage
            source={{ uri: "https://snapfood.al/" + item.profile_thumbnail_path }}
            style={[styles.ItemImage]}
          />
        </View>)}
      <View style={[styles.catTitleContainer, { marginLeft: -12 }]}>
        <AppText style={styles.catTitle}>{item.title}</AppText>
        <AppText style={styles.items}>{foodItems}</AppText>
        <View style={{ flexDirection: "row", alignItems: 'center' }}>
          <Star name="star" size={13} color={'orange'} />
          <AppText style={[styles.rate, { fontWeight: 'bold', }]}>
            {finalRate}</AppText>
          {item.total_ratings === 0 ? (
            <AppText style={styles.rate}>{"(" + item.total_ratings + ")"}</AppText>
          ) : (
            <AppText style={styles.rate}>{"(" + item.total_ratings + "+)"}</AppText>
          )}
          <AppText style={styles.items}> {item.min_pickup_time} - {item.maximum_delivery_time} min</AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryItem;
