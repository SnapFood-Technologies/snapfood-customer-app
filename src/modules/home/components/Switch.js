import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { translate } from '../../../common/services/translate';
import { AppText } from '../../../common/components';
import Theme from '../../../theme';

const btnHeight = 42;
const Switch = ({ cur_item, btnWidth = 100, items, textStyle, onSelect }) => {

    const [curItem, setCurItem] = useState(cur_item == null ? items[0] : cur_item)
    useEffect(() => {
        setCurItem(cur_item == null ? items[0] : cur_item)
    }, [cur_item])

    
    return <View style={[Theme.styles.row_center, styles.container, { width: items.length * btnWidth }]}>
        {
            items.map((item, index) =>
                <TouchableOpacity key={index} onPress={() => {
                    setCurItem(item);
                    onSelect(item);
                }} style={[Theme.styles.col_center, item == curItem ? styles.activeBtn : styles.inactiveBtn]}>
                    <AppText style={[item == curItem ? styles.activeTxt : styles.inactiveTxt, textStyle]}>{translate(item)}</AppText>
                </TouchableOpacity>
            )
        }
    </View>;
};

const styles = StyleSheet.create({
    container: { height: btnHeight, borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.gray6 },
    activeBtn: { flex: 1, height: btnHeight, borderRadius: 12, backgroundColor: Theme.colors.cyan2 },
    activeTxt: { fontSize: 18, color: Theme.colors.white, fontFamily: Theme.fonts.semiBold },
    inactiveBtn: { flex: 1, backgroundColor: Theme.colors.white },
    inactiveTxt: { fontSize: 18, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold },
})

function arePropsEqual(prevProps, nextProps) {
    let isEqual = true;
    if (prevProps.items.length != nextProps.items.length || nextProps.items.filter((x) => prevProps.items.indexOf(x) === -1).length > 0) {
        isEqual = false;
    }
    if (prevProps.cur_item != nextProps.cur_item) {
        isEqual = false;
    }
    return isEqual;
}

export default React.memo(Switch, arePropsEqual); 
