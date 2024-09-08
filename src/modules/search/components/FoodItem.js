import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import styles from '../styles/styles';
import FastImage from 'react-native-fast-image';
import AppText from '../../../common/components/AppText';

const CategoryItem = ({ item, onPress }) => {

  return (
    <TouchableOpacity style={[styles.cat1, { paddingVertical: 1 }]} onPress={onPress}>
      <View style={styles.catTitleContainer}>
        <AppText style={styles.catTitle}> {item.title}</AppText>
        {item.description ? (
          <AppText style={styles.items}> {item.description}</AppText>
        ) : null}
        <AppText style={[styles.rate, { color: "#50B7ED" }]}>{parseInt(item.price)} L</AppText>
      </View>
      {item.image_path ? (
        <View style={styles.catImageContainer}>
          <FastImage
            source={{ uri: "https://snapfood.al/" + item.image_path }}
            style={styles.ItemImage1}
          />
        </View>) : null}
    </TouchableOpacity>
  );
};

export default CategoryItem;
