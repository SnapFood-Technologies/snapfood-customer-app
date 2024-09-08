import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styles from '../../../modules/search/styles/resultsStyles'; 
import AppText from '../../../common/components/AppText';
import { translate } from '../../../common/services/translate';
import Svg_img from '../../../common/assets/svgs/empty/no_cashback.svg';
import MainButton from '../../../common/components/buttons/main_button';

const NoCashback = ({ onRemoveFiltersPressed, onBtnPressed }) => {
    return (
      <View style={styles.nores}> 
          <Svg_img />
          <AppText style={[styles.description, {marginTop: 16}]}>{translate('wallet.empty_desc')}</AppText> 
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
          {!!onBtnPressed && (
              <MainButton
                title={translate('orders.order_now')}
                style={{ width : '80%', marginTop: 25, paddingHorizontal: 20, }}
                onPress={onBtnPressed}
              />
            )}
      </View>
    );
};

export default NoCashback;
