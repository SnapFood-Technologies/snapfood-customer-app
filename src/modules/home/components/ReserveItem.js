import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Theme from '../../../theme';


const ReserveItem = ({ data,  onEdit, onSelect,  style }) => {
    return <TouchableOpacity activeOpacity={1} onPress={onSelect ? onSelect : ()=>{}}  style={[Theme.styles.col_center, styles.container, style]}>
        <View style={[Theme.styles.row_center, { width: '100%' }]}>
            <Text style={styles.name}>{ data.username || data.full_name}</Text>
            <View style={{ flex: 1 }} />
            {/* <TouchableOpacity onPress={onEdit ? onEdit : () => { }} style={{ marginRight: 20 }}>
                <Text style={[styles.editBtn]}>Edit</Text>
            </TouchableOpacity>
            <RadioBtn 
                checked={true}
                // checked={data.favourite == 1} 
            /> */}
        </View>
        <Text style={[styles.phone, { marginBottom: 4 }]}>{data.phone}</Text>
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    container: { width: '100%', alignItems: 'flex-start', marginBottom: 16, borderRadius: 15, backgroundColor: Theme.colors.gray8, paddingVertical: 12, paddingHorizontal: 15, },
    editBtn: { fontSize: 12, color: Theme.colors.gray7, fontFamily: Theme.fonts.semiBold, },
    name: { marginVertical: 6, fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
    phone: { fontSize: 14, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
})
export default ReserveItem;
