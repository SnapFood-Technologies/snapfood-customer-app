import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import Octicons from 'react-native-vector-icons/Octicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { translate } from '../../common/services/translate';
import { isEmpty } from '../services/utility';
import Theme from '../../theme';

const AddressItem = ({ data, editable, isPrimary, user, edit_text, outOfDeliveryArea, showNotes, onSelect, onEdit, hideMoreBtn, onMore, textSize, style }) => {
    return <TouchableOpacity activeOpacity={1} onPress={onSelect ? onSelect : () => { }} style={[Theme.styles.col_center, styles.container, style]}>
        {
            editable != false && <View style={[Theme.styles.row_center, { width: '100%', marginBottom: 6, }]}>
                <View style={[styles.typeView]}>
                    <Text style={[styles.type, textSize && { fontSize: textSize }]}>{translate(data.address_type || 'Home')}</Text>
                </View>
                {data.favourite == 1 && <Text style={[styles.primarytxt, textSize && { fontSize: textSize }]}>{translate('primary')}</Text>}
                <View style={{ flex: 1 }} />
                {
                    isEmpty(edit_text) ?
                        <TouchableOpacity style={[Theme.styles.col_center, styles.btn]} onPress={onEdit ? onEdit : () => { }}>
                            <Octicons name='pencil' size={18} color={Theme.colors.text} />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity style={[Theme.styles.col_center]} onPress={onEdit ? onEdit : () => { }}>
                            <Text style={styles.editBtn}>{edit_text}</Text>
                        </TouchableOpacity>
                }

                {
                    data.favourite != 1 && hideMoreBtn != true &&
                    <TouchableOpacity style={[Theme.styles.col_center, styles.btn]} onPress={onMore ? onMore : () => { }}>
                        <Entypo name='dots-three-vertical' size={18} color={Theme.colors.text} />
                    </TouchableOpacity>
                }
            </View>
        }
        {/* <Text style={styles.name}>{data.full_name}</Text> */}
        <Text style={[styles.phone, textSize && { fontSize: textSize }, { marginBottom: 4 }]}>{user.phone}</Text>
        <Text style={[styles.phone, textSize && { fontSize: textSize },]}>{data.street} {data.city}, {data.country}</Text>
        {
            outOfDeliveryArea == true &&
            <Text style={styles.out_delivery_area_txt}>{translate('cart.out_of_range_address')}</Text>
        }
        {
            showNotes == true && data.notes != null && data.notes != '' &&
            <Text style={[styles.phone, { marginTop: 4, }, textSize && { fontSize: textSize },]}>{data.notes}</Text>
        }
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    container: { width: '100%', alignItems: 'flex-start', borderRadius: 15, backgroundColor: Theme.colors.gray8, paddingVertical: 12, paddingHorizontal: 15, },
    typeView: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, backgroundColor: '#50b7ed38' },
    type: { fontSize: 14, color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold, },
    editBtn: { fontSize: 16, color: Theme.colors.gray7, fontFamily: Theme.fonts.semiBold, },
    btn: { width: 28, height: 28, marginLeft: 2 },
    name: { marginBottom: 6, fontSize: 18, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
    phone: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
    primarytxt: { marginLeft: 8, fontSize: 16, color: Theme.colors.red1, fontFamily: Theme.fonts.bold, },
    out_delivery_area_txt: { marginTop: 4, width: '100%', textAlign: 'center', fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.danger },
})

function mapStateToProps({ app }) {
    return {
        user: app.user,
    };
}

export default connect(mapStateToProps, {
})(AddressItem);
