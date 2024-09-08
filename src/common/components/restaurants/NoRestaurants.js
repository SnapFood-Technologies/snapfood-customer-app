import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styles from '../../../modules/search/styles/resultsStyles';
import FastImage from 'react-native-fast-image';
import AppText from '../AppText';
import { translate } from '../../services/translate';
import Svg_img from '../../assets/svgs/empty/no_home.svg';

const NoRestaurants = ({ title, desc, style, onRemoveFiltersPressed }) => {
    return (
      <View style={[styles.nores, style]}> 
          <Svg_img />
          <AppText style={[styles.description, {marginTop: 16}]}>{title ? title : translate('soon_in_your_area')}</AppText>
          <AppText style={styles.description}>{desc ? desc : translate('soon_in_your_area_desc')}</AppText>
          {!!onRemoveFiltersPressed && (
            <TouchableOpacity
              onPress={onRemoveFiltersPressed}
              style={{ marginTop: 30, padding: 10 }}
              activeOpacity={0.7}
            >
                <AppText style={{ color: '#61C8D5', fontSize: 17 }}>
                  {translate('search.clearAppliedFilters')}
                </AppText>
            </TouchableOpacity>
          )}
      </View>
    );
};

export default NoRestaurants;
