import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Counter from '../../../common/components/buttons/counter';
import Theme from '../../../theme';
import PriceLabel from '../../../common/components/vendors/PriceLabel';
import Svg_delete from '../../../common/assets/svgs/ic_delete.svg'

const CartItem = ({ data, free = false, onPlus, onMinus, onDelete, style }) => {
    const optionTotalPrice = useMemo(() => {
        let price = 0;
        (data.options || []).forEach((option) => {
            price = price + parseInt(option.price)
        })
        return price;
    }, [data.options])
    
    return <View style={[Theme.styles.row_center, styles.container, style]}>
        <View style={[Theme.styles.col_center, styles.infoView]}>
            <Text style={[styles.title]}>{data.title}</Text>
            <PriceLabel
                price={parseInt(data.price) + optionTotalPrice}
                discount_price={data.discount_price}
                style={{ justifyContent: 'flex-start', }}
                priceStyle={{
                    ...styles.price,
                    textDecorationLine: (free == true ? 'line-through' : 'none')
                }}
                discountStyle={{ fontSize: 15 }}
            />
            <View style={{ height: 4 }} />
            {
                (data.options || []).map((option, index) =>
                    <View key={index} style={[Theme.styles.row_center, { width: '100%', }]}>
                        <Text style={[styles.optionTxt]}>{option.title}</Text>
                    </View>
                )
            }
        </View>
        {
            free != true ?
                <>
                    <TouchableOpacity style={{ marginRight: 15 }} onPress={onDelete ? () => onDelete(data) : () => { }} >
                        <Svg_delete />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <Counter value={data.quantity}
                        onPlus={() => onPlus(data)}
                        onMinus={() => {
                            if (data.quantity > 1) {
                                onMinus(data)
                            }
                            else {
                                onDelete(data)
                            }
                        }}
                        btnSize={18}
                        value_style={{ fontSize: 15, paddingBottom: 1 }}
                        style={{
                            backgroundColor: Theme.colors.gray8,
                            width: 90,
                            height: 40,
                            marginLeft: 6,
                        }}
                    />
                </>
                :
                <Text style={{ fontSize: 15, paddingBottom: 1, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold }}>{data.quantity}</Text>
        }
    </View>;
};

const styles = StyleSheet.create({
    container: { width: '100%', },
    divider: { width: 1, height: 15, backgroundColor: Theme.colors.gray6 },
    qty: { marginLeft: 12, marginRight: 12, fontSize: 16, color: Theme.colors.red1, fontFamily: Theme.fonts.semiBold, },
    title: { marginTop: 8, fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.bold, },
    price: { fontSize: 17, color: Theme.colors.red1, fontFamily: Theme.fonts.bold, },
    infoView: { flex: 1, alignItems: 'stretch', justifyContent: 'flex-start', marginLeft: 12, marginRight: 12 },
    optionTxt: { flex: 1, fontSize: 15, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
    optionPrice: { fontSize: 15, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
})
export default CartItem;
