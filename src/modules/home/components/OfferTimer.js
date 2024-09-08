import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress'; 
import Theme from '../../../theme';
import { translate } from '../../../common/services/translate';
import { isEmpty } from '../../../common/services/utility';
import Svg_timer from '../../../common/assets/svgs/timer_icon.svg'; 

const CIRCLE_SIZE = 34;
const OfferTimer = ({ data, style }) => {
    if (data == null || isEmpty(data.string)) {
        return null;
    }
    return <TouchableOpacity activeOpacity={1}  style={[Theme.styles.row_center, styles.container, style]}>
        <View
            style={[
                Theme.styles.col_center,
                styles.progressCircle,
            ]}>
            <View
                style={[
                    Theme.styles.col_center,
                    styles.progressCircle,
                    { position: 'absolute', top: 0, left: 0, backgroundColor: '#FFF' }
                ]}>
                <Progress.Circle
                    size={CIRCLE_SIZE}
                    indeterminate={false}
                    progress={data.percent || 1.0}
                    animated={false}
                    thickness={2}
                    borderWidth={0}
                    borderColor={Theme.colors.white}
                    color={Theme.colors.text}
                    unfilledColor={Theme.colors.gray6}
                />
            </View>
            <Svg_timer style={styles.icon} width={CIRCLE_SIZE - 8} height={CIRCLE_SIZE - 8} />
        </View>
        <View style={{ marginLeft: 5 }}>
            <Text style={[styles.text, ]}>
                {translate('restaurant_details.expire_in')}{'\n'}{data.string}
            </Text>
        </View>
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    container: { height: 44, marginBottom: 6, borderRadius: 22, borderWidth: 1, borderColor: Theme.colors.text, paddingHorizontal: 5, paddingRight: 10 },
    progressCircle: { borderRadius: CIRCLE_SIZE / 2, width: CIRCLE_SIZE, height: CIRCLE_SIZE },
    text: { fontSize: 13, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
    closeBtn: { padding: 4, borderRadius: 15, backgroundColor: Theme.colors.cyan2, position: 'absolute', top: -4, right: -4 },
})

function arePropsEqual(prevProps, nextProps) {
    return prevProps.data?.string == nextProps.data?.string && prevProps.data?.percent == nextProps.data?.percent;
}
 
export default React.memo(OfferTimer, arePropsEqual); 
