import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styles from '../../../modules/search/styles/resultsStyles';
import FastImage from 'react-native-fast-image';
import AppText from '../AppText';
import { translate } from '../../services/translate';
import Theme from "../../../theme";

const NoPromotion = ({ title, description }) => {
  return (
    <View style={styles.nores}>
      <FastImage
        resizeMode={FastImage.resizeMode.contain}
        source={require('../../../common/assets/images/nopromo.png')}
        style={styles.image}
      />
      <AppText style={[Theme.styles.noData.noTitle, { marginTop: 16 }]}>
        {title}
      </AppText>
      <AppText style={[styles.description, { marginBottom: 16 }]}>
        {description}
      </AppText>
    </View>
  );
};

export default NoPromotion;
