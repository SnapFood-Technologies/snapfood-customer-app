import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { translate } from '../../common/services/translate';
import Theme from '../../theme';
import RadioBtn from '../../common/components/buttons/radiobtn';


const CardItem = ({ data, editable = true, isPrimary, checked, onDelete, onSelect, style }) => {
    return <TouchableOpacity
        activeOpacity={1}
        onPress={onSelect ? () => onSelect(data) : () => { }}
        style={[Theme.styles.col_center, styles.container, checked && { borderColor: Theme.colors.cyan2 }, style]}>
        {
            editable == true &&
            <View style={[Theme.styles.row_center, { width: '100%', marginBottom: 12, }]}>
                <RadioBtn checked={checked} onPress={onSelect ? () => onSelect(data) : () => { }} />
                <Text style={[styles.primarytxt, checked && { color: Theme.colors.cyan2 }]}>{translate('primary')}</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={onDelete ? () => onDelete(data) : () => { }} style={{}}>
                    <Text style={[styles.editBtn]}>{translate('remove')}</Text>
                </TouchableOpacity>
            </View>
        }
        <Text style={styles.name}>{data.metadata != null ? data.metadata.name : ''}</Text>
        {
            data.card != null && <Text style={[styles.card,]}>**** **** **** {data.card.last4}</Text>
        }
        {
            data.card != null && <View style={[Theme.styles.row_center, { width: '100%', marginTop: 14 }]}>
                <Text style={styles.cvv}>{translate('card.expiry')}:    {data.card.exp_month + '/' + data.card.exp_year}</Text>
                <Text style={styles.cvv}>CVV:    {data.metadata != null ? data.metadata.cvc : ''}</Text>
            </View>
        }
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    container: { width: '100%', alignItems: 'flex-start', marginBottom: 16, borderWidth: 1, borderColor: Theme.colors.gray8, borderRadius: 15, backgroundColor: Theme.colors.gray8, paddingVertical: 12, paddingHorizontal: 15, },
    typeView: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, backgroundColor: '#50b7ed38' },
    type: { fontSize: 11, color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold, },
    editBtn: { fontSize: 15, color: Theme.colors.gray7, fontFamily: Theme.fonts.semiBold, },
    name: { marginBottom: 14, fontSize: 15, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
    card: { fontSize: 21, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
    primarytxt: { marginLeft: 8, fontSize: 15, color: Theme.colors.gray7, fontFamily: Theme.fonts.bold, },
    cvv: { flex: 1, fontSize: 15, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
})
export default CardItem;
