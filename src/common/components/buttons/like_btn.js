import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppText from '../AppText';
import Theme from '../../../theme';

const LikeBtn = ({ onChange, checked, cnt, size, style, roundStyle }) => {
    return (
        <View style={[Theme.styles.col_center, {paddingTop: 16}, style]}>
            <TouchableOpacity
                style={[Theme.styles.col_center, styles.btn, roundStyle]}
                onPress={() => {
                    if (onChange) {
                        onChange(!checked);
                    }
                }}>
                <Ionicons name={checked == true ? 'heart' : 'heart-outline'} size={size || 20} color={checked == true ? Theme.colors.cyan2 : Theme.colors.gray7} />
            </TouchableOpacity>
            <AppText style={styles.cntTxt}>{cnt}</AppText>
        </View>

    );
};

const styles = StyleSheet.create({
    btn: {
        backgroundColor: Theme.colors.white, width: 28, height: 28, paddingTop: 2, borderRadius: 20,
        elevation: 2,
        shadowColor: Theme.colors.blackPrimary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    cntTxt: { marginTop: 4, fontSize: 12, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },
})
export default LikeBtn;
