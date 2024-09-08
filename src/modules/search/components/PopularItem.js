import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import styles from '../styles/styles';
import AppText from '../../../common/components/AppText';
import Theme from '../../../theme'; 

const PopularItem = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={[Theme.styles.col_center, styles.popularItem]} onPress={onPress}> 
      <AppText style={styles.popularTitle}>{title}</AppText>
    </TouchableOpacity>
  );
};

export default PopularItem;