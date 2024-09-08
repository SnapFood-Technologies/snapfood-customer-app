import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import styles from '../styles/styles';
import AppText from '../../../common/components/AppText';
import Theme from '../../../theme';
import AntDesign from "react-native-vector-icons/AntDesign"

const FoodItem = ({ title, cat, onPress, onRemove}) => {
  return (
    <TouchableOpacity style={styles.cat} onPress={onPress}> 
      <View style={styles.catTitleContainer}>
        <AppText style={styles.catTitle}>{title}</AppText>
      </View>
      <TouchableOpacity onPress={()=>onRemove(title)}>
        <AntDesign name={"close"} size={18} color={Theme.colors.gray5} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default FoodItem;