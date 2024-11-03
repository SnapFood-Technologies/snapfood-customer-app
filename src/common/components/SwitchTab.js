import React, { useEffect, useState, memo, Component } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Theme from '../../theme';
import AppText from './AppText';
import { translate } from '../../common/services/translate'; 

const btnHeight = 37;
 
const SwitchTab = ({ items, curitem, useFirstItem = true, style, onSelect, active_style, inactive_style, activetxt_style, inactivetxt_style }) => {

    const [curTtem, setCurItem] = useState((curitem == null && useFirstItem) ? items[0] : curitem)
    useEffect(()=>{
        setCurItem((curitem == null && useFirstItem) ? items[0] : curitem)
    }, [curitem, useFirstItem])

    return <View style={[Theme.styles.row_center, styles.container, style]}>
        {
            items.map((item, index) =>
                <TouchableOpacity key={index} onPress={() => {
                    setCurItem(item)
                    onSelect(item)
                }}
                    style={[
                        Theme.styles.row_center, styles.btn, { backgroundColor: item == curTtem ? '#E0FBFB' : Theme.colors.white },
                        item == curTtem ? active_style : inactive_style
                    ]}>
                    <AppText style={item == curTtem ? [styles.activeTxt, activetxt_style] : [styles.inactiveTxt, inactivetxt_style]}>{translate(item)}</AppText>
                     
                </TouchableOpacity>
            )
        }
    </View>;
};

const styles = StyleSheet.create({
    container: { height: btnHeight, },
    btn: { flex: 1, height: btnHeight, marginLeft: 8, marginRight: 8, borderRadius: 12, },
    activeTxt: { fontSize: 18, lineHeight: 18,  flex: 1, textAlign: 'center', color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold, },
    inactiveTxt: { fontSize: 18, lineHeight: 18, flex: 1, textAlign: 'center', color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
    pickup_icon: { height: btnHeight, width: btnHeight, borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.cyan2, },
})

function arePropsEqual(prevProps, nextProps) {
    let isEqual = true;
    if (prevProps.items.length != nextProps.items.length || nextProps.items.filter((x) => prevProps.items.indexOf(x) === -1).length > 0) {
        isEqual = false;
    } 
    if (prevProps.curitem != nextProps.curitem) {
        isEqual = false;
    }
    // 
    return isEqual;
}

export default React.memo(SwitchTab, arePropsEqual);
