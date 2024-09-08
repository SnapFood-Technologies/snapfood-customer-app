import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styles from '../../../modules/search/styles/resultsStyles';
import AppText from '../../../common/components/AppText';
import { translate } from '../../../common/services/translate';
import Svg_img from '../../../common/assets/svgs/empty/no_fav_vendors.svg';

const NoFavs = ({ isVendor, style, onRemoveFiltersPressed }) => {
    return (
      <View style={[styles.nores, style]}> 
          <Svg_img />
          <AppText style={[styles.description, {marginTop: 16}]}>{isVendor == true ? translate('account.no_vendor_fav') : translate('account.no_item_fav')}</AppText>
          <AppText style={[styles.description, {marginBottom : 50}]}>{isVendor == true ? translate('account.no_vendor_fav_desc') : translate('account.no_item_fav_desc')}</AppText>
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

export default NoFavs;
