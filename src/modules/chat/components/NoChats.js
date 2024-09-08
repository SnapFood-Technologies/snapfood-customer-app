import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styles from '../../../modules/search/styles/resultsStyles';
import Theme from '../../../theme';
import AppText from '../../../common/components/AppText';
import { translate } from '../../../common/services/translate';
import Svg_img from '../../../common/assets/svgs/empty/no_chat.svg';
import Svg_add_chat from '../../../common/assets/svgs/empty/add_chat.svg';

const NoChats = ({ onRemoveFiltersPressed }) => {
  return (
    <View style={[styles.nores, {marginTop: 80}]}>
      <Svg_img />
      <AppText style={[styles.description, { marginTop: 32 }]}>{translate('chat.no_chat_history')}</AppText>
      <AppText style={[styles.description, { marginTop: 16 }]}>{translate('chat.no_chat_history_desc1')}</AppText>
      <View style={[Theme.styles.row_center,]}>
        <AppText style={[styles.description, {paddingHorizontal : 0}]}>{translate('chat.no_chat_history_desc2')}</AppText>
        <Svg_add_chat style={{marginLeft: 6, marignRight: 2, width : 15, height: 15,}}/>
        <AppText style={[styles.description, {paddingHorizontal : 0}]}>{translate('chat.no_chat_history_desc3')}</AppText>
      </View>

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

export default NoChats;
