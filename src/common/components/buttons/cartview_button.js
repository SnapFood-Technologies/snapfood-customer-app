import React, { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import Theme from '../../../theme'
import { translate } from '../../../common/services/translate'
import { calculateCartTotal } from '../../services/utility';

const CartViewButton = ({ onPress, cartItems = [], style, diabled }) => {
    const totalPrice = useMemo(() => calculateCartTotal(cartItems), [cartItems])

    return (
        <View style={[Theme.styles.col_center, { width: '100%', paddingHorizontal: 20, }, style]}>
            <View style={styles.anchor} />
            <TouchableOpacity disabled={diabled == true} activeOpacity={0.8} style={[Theme.styles.row_center, styles.container,]} onPress={onPress}>
                <View style={[Theme.styles.col_center_start, { alignItems: 'flex-start' }]}>
                    <Text style={styles.descTxt}>{translate('cart.total')}</Text>
                    <Text style={styles.btnTxt}>{parseInt(totalPrice)} L</Text>
                </View>
                <View style={Theme.styles.flex_1} />
                <View style={[Theme.styles.row_center,]}>
                    <Text style={styles.btnTxt}>{translate('cart.view_cart')}</Text>
                    <View style={[Theme.styles.col_center, styles.badge]}>
                        <Text style={styles.badgeTxt}>{cartItems.length}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 50,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: Theme.colors.cyan2,
    },
    badge: { width: 22, height: 22, borderRadius: 11, backgroundColor: Theme.colors.white, },
    badgeTxt: { fontSize: 14, lineHeight: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },
    btnTxt: { marginRight: 8, fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white },
    descTxt: { fontSize: 10, fontFamily: Theme.fonts.medium, color: Theme.colors.white },
    anchor: { position: 'absolute', bottom: -1, right: 40, width: 18, height: 16, backgroundColor: Theme.colors.cyan2, transform: [{ rotate: '45deg' }] },
});

export default CartViewButton;
