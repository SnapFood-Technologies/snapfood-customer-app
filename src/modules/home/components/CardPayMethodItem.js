import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import RadioBtn from '../../../common/components/buttons/radiobtn';
import { Pay_COD, Pay_Card, Pay_Apple, Pay_Paypal } from '../../../config/constants'


const CardPayMethodItem = ({ checked, cards, curCard, onPress, onPressCard, onAddCard, style }) => {
    return <TouchableOpacity activeOpacity={checked ? 1.0 : 0.7} onPress={onPress ? onPress : () => { }} style={[Theme.styles.col_center, styles.container, style]}>
        <View style={[Theme.styles.row_center, { width: '100%' }]}>
            <Text style={[styles.name, checked && { fontFamily: Theme.fonts.semiBold }]}>{translate(Pay_Card)}</Text>
            <View style={{ flex: 1 }} />
            <RadioBtn checked={checked} onPress={onPress ? onPress : () => { }}/>
        </View>
        {
            checked && <View style={[Theme.styles.col_center, { width: '100%' }]}>
                <View style={styles.divider} />
                {
                    (cards || []).map((item, index) =>
                        <TouchableOpacity
                            key={index} 
                            onPress={onPressCard ? () => onPressCard(item) : () => { }}
                        >
                            <View style={[Theme.styles.row_center, { width: '100%', paddingVertical: 6, }]}>
                                <Text style={[styles.card_number, (curCard != null && curCard.id == item.id) && { color: Theme.colors.text }]}>
                                    **** **** **** {item.card.last4}
                                </Text>
                                <View style={{ flex: 1 }} />
                                <RadioBtn btnType={1} onPress={onPressCard ? () => onPressCard(item) : () => { }} checked={curCard != null && curCard.id == item.id} />
                            </View>
                        </TouchableOpacity>
                    )
                }
                <View style={styles.divider} />
                <TouchableOpacity onPress={onAddCard ? onAddCard : () => { }}>
                    <Text style={styles.addcard_btn}>+ {translate('payment_method.add_new_card')}</Text>
                </TouchableOpacity>
            </View>
        }
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    container: { width: '100%', alignItems: 'flex-start', marginBottom: 16, borderRadius: 15, backgroundColor: Theme.colors.gray8, paddingVertical: 16, paddingHorizontal: 15, },
    name: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
    divider: { width: '100%', marginVertical: 16, height: 1, backgroundColor: Theme.colors.gray6, },
    addcard_btn: { fontSize: 16, color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold },
    card_number: { fontSize: 16, color: Theme.colors.gray7, fontFamily: Theme.fonts.medium, },
})
export default CardPayMethodItem;
