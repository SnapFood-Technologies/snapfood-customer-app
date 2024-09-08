import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Theme from '../../../theme';
import { RadioBtn, CheckBox } from '../../../common/components';
import { translate } from '../../../common/services/translate';

const ProductOptions = ({ options, type, isRequired = false, isMultiple = false, values = [], onSelect, style }) => {
    return (
        <View style={[Theme.styles.col_center_start, styles.container, style]}>
            <Text style={styles.subTitle}>
                {type == 'addition'
                    ? translate('restaurant_details.extras')
                    : translate('restaurant_details.options')}
                {
                    isRequired && <Text style={styles.required}>  ({translate('required')})</Text>
                }
            </Text>
            {options.map((item, index) => (
                <TouchableOpacity key={index} style={[Theme.styles.row_center, styles.optionItem]} onPress={() => onSelect(item)} >
                    {
                        isMultiple == true ?
                            <CheckBox checked={values.findIndex(v => v.id == item.id) != -1} onPress={() => onSelect(item)} />
                            :
                            <RadioBtn checked={values.findIndex(v => v.id == item.id) != -1} onPress={() => onSelect(item)} />
                    }
                    <Text style={[Theme.styles.flex_1, styles.optionTxt]}>{item.title}</Text>
                    {
                        item.price > 0 &&
                        <Text style={styles.optionTxt}>{item.price} L</Text>
                    }
                </TouchableOpacity>
            ))}
        </View>
    )
};

const styles = StyleSheet.create({
    container: { width: '100%', },
    subTitle: {
        width: '100%',
        textAlign: 'left',
        marginTop: 18,
        marginBottom: 4,
        fontSize: 17,
        fontFamily: Theme.fonts.semiBold,
        color: Theme.colors.text,
    },
    required: {fontSize: 14, fontFamily: Theme.fonts.medium, color: Theme.colors.red1 },
    optionItem: { height: 40, width: '100%' },
    optionTxt: { marginLeft: 10, fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
})
export default ProductOptions;
