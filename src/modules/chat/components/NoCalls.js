import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styles from '../../../modules/search/styles/resultsStyles';
import FastImage from 'react-native-fast-image';
import AppText from '../../../common/components/AppText';
import { translate } from '../../../common/services/translate';
import Svg_add_call from '../../../common/assets/svgs/empty/add_call.svg';
import Theme from '../../../theme';

const NoCalls = () => {
  return (
    <View style={[styles.nores, {marginTop: 80}]}>
    <AppText style={[styles.description, { marginTop: 32 }]}>{translate('chat.no_call_history_desc')}</AppText>
    <AppText style={[styles.description, { marginTop: 16 }]}>{translate('chat.no_call_history_desc1')}</AppText>
    <View style={[Theme.styles.row_center,]}>
      <AppText style={[styles.description, {paddingHorizontal : 0}]}>{translate('chat.no_call_history_desc2')}</AppText>
      <Svg_add_call style={{marginLeft: 6, marignRight: 2, width : 15, height: 15,}}/>
      <AppText style={[styles.description, {paddingHorizontal : 0}]}>{translate('chat.no_call_history_desc3')}</AppText>
    </View>
  </View>
  );
};

export default NoCalls;
