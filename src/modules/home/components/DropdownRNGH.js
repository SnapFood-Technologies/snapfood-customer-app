import React, { useState, useRef } from 'react';
import { TouchableOpacity, Platform,StatusBar, View, Text, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import ModalDropdown from './ModalDropdown';
import Theme from '../../../theme';
import { translate } from '../../../common/services/translate';

const DropdownRNGH = ({ list_items, value, style, item_height, onChange }) => {
 
    return <ModalDropdown
        onSelect={(v)=>{ 
            if (onChange != null) {
                onChange(list_items[v])
            }
        }}
        options={list_items}
        defaultValue={value || list_items[0]} 
        style={{height: item_height}}
        dropdownStyle={[styles.dropdownStyle,  style, { marginTop: Platform.OS === 'android' ? -StatusBar.currentHeight : 0,  height: list_items.length * item_height + 10 , }]}
        renderRow = {(option, index, isSelected,) => 
            <View style={[Theme.styles.row_center, {backgroundColor: '#fff', height: item_height, justifyContent: 'flex-start'}]}>
                <Text style={[styles.text, !isSelected && { color: Theme.colors.gray7}]}>{translate(list_items[index])}</Text>
            </View>
        }
        renderSeparator={(index) => 
            <View style={styles.divider}/>
        }
    >
        <View style={[Theme.styles.row_center, styles.container, style]}>
            <Text style={styles.text}>{translate(value)}</Text>
            <Feather name="chevron-down" size={20} color={Theme.colors.cyan2} style={{ marginLeft: 8 }} />
        </View>
    </ModalDropdown>
    
};

const styles = StyleSheet.create({
    container: { height: 40, justifyContent: 'space-between', paddingLeft: 12, paddingRight: 12, borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.gray6 },
    text: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
    divider : { width: '100%', height: 1, backgroundColor: Theme.colors.gray9},
    dropdownStyle : { elevation: 4,  marginTop: 0, borderRadius: 12, paddingHorizontal: 10,}, 
})
export default DropdownRNGH;
