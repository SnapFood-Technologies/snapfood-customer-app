import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Theme from '../../../theme';
import { translate } from '../../../common/services/translate';
  
const PastorderView = ({ onPress }) => {
    return <TouchableOpacity onPress={onPress ? onPress : () => { }} style={[Theme.styles.col_center_start, styles.container]}>
        <View style={[Theme.styles.row_center, { width: '100%', }]}>
            <Text style={[Theme.styles.flex_1, styles.subjectTitle]}>{translate('vendor_profile.my_past_orders')}</Text>
            <Feather name="chevron-right" size={22} color={Theme.colors.text} />
        </View>
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    container: { width: '100%', alignItems: 'flex-start', paddingTop: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F6F6F9' },
    subjectTitle: { fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
});

function arePropsEqual(prevProps, nextProps) {
    return true;
}

export default React.memo(PastorderView, arePropsEqual);
