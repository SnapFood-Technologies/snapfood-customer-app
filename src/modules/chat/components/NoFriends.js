import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styles from '../../../modules/search/styles/resultsStyles';
import FastImage from 'react-native-fast-image';
import AppText from '../../../common/components/AppText';
import { translate } from '../../../common/services/translate';
 
const NoFriends = ({ title, desc, onRemoveFiltersPressed }) => {
  return (
    <View style={[styles.nores, {marginTop: 60,}]}>
      <FastImage
        resizeMode={FastImage.resizeMode.contain}
        source={require('../../../common/assets/images/no_friend.png')}
        style={{height: 218, width: 175,}}
      />
      <AppText style={[styles.description, { marginTop: 32 }]}>{title}</AppText>
      <AppText style={[styles.description, ]}>{desc}</AppText> 
      {!!onRemoveFiltersPressed && (
        <TouchableOpacity
          onPress={onRemoveFiltersPressed}
          style={{ marginTop: 30, padding: 10 }}
          activeOpacity={0.7}
        >
          <AppText style={{ color: '#61C8D5', fontSize: 16 }}>
            {translate('search.clearAppliedFilters')}
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default NoFriends;
