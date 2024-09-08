import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Theme from '../../../theme';
import { translate } from '../../../common/services/translate';

const ChooseFriendBtn = ({ friend, onSelect, onClear }) => {
    if (friend) {
        return (
            <View style={[Theme.styles.row_center, { paddingHorizontal: 15, paddingVertical: 8, }]}>
                <Text style={styles.name}>{friend.username || friend.full_name}</Text>
                <TouchableOpacity onPress={onClear ? onClear : () => { }} >
                    <AntDesign name="close" size={23} color={Theme.colors.gray7} />
                </TouchableOpacity>
            </View>
        )
    }

    return <TouchableOpacity onPress={onSelect ? onSelect : () => { }} style={[Theme.styles.col_center_start, styles.container]}>
        <Text style={styles.chooseBtn}>{translate('select_friend')}</Text>
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    container: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: Theme.colors.cyan2 },
    name: { fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, marginRight: 10 },
    chooseBtn: { fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2, },
});

export default ChooseFriendBtn;
