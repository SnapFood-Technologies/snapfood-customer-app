import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styles from '../../../modules/search/styles/resultsStyles'; 
import AppText from '../../../common/components/AppText';
import { translate } from '../../../common/services/translate';
import Svg_img from '../../../common/assets/svgs/empty/no_payment_methods.svg';

const NoPaymentMethods = ({ onRemoveFiltersPressed }) => {
    return (
      <View style={styles.nores}> 
          <Svg_img />
          <AppText style={[styles.description, {marginTop: 16}]}>{translate('payment_method.empty_desc')}</AppText> 
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

export default NoPaymentMethods;
