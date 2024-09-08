import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Theme from '../../theme';
import CheckBox from '../../common/components/buttons/checkbox';
import RadioBtn from '../../common/components/buttons/radiobtn';

const FilterItem = ({ item, isChecked, style, onSelect }) => {
     
    return (
        <TouchableOpacity onPress={()=>onSelect(item)} style={[Theme.styles.row_center, styles.listItem, style]}>
            <Text style={[Theme.styles.flex_1, styles.item_txt]}>{item.name || item.title}</Text>
            <View style={Theme.styles.row_center}>
                {
                    item.type == 'list' && <Feather name="chevron-right" size={22} color={Theme.colors.text} />
                }
                {
                    item.type == 'checkbox' && <CheckBox onPress={()=>onSelect(item)} checked={isChecked} />
                }
                {
                    item.type == 'radio' && <RadioBtn onPress={()=>onSelect(item)} checked={isChecked} />
                }
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    listItem: { height: 54, width: '100%', marginBottom: 12, borderRadius: 15, paddingLeft: 16, paddingRight: 16, backgroundColor: '#FAFAFC' },
    item_txt: { fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
})

export default FilterItem;
