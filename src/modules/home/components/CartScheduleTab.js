import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg_now from '../../../common/assets/svgs/cart/now.svg';
import Svg_schedule from '../../../common/assets/svgs/cart/schedule.svg';
import Svg_now_active from '../../../common/assets/svgs/cart/now_active.svg';
import Svg_schedule_active from '../../../common/assets/svgs/cart/schedule_active.svg';
import Theme from '../../../theme';
import { AppText } from '../../../common/components';
import { translate } from '../../../common/services/translate';

const CartScheduleTab = ({ curitem, hide_now = false, onSelect }) => {
    const [curTtem, setCurItem] = useState(curitem == null ? (hide_now ? 'schedule' : 'now') : curitem);
    useEffect(() => {
        setCurItem(curitem == null ? (hide_now ? 'schedule' : 'now') : curitem);
    }, [curitem]);

    return (
        <View style={[Theme.styles.row_center, styles.container]}>
            {
                !hide_now &&
                <TouchableOpacity
                    onPress={() => {
                        setCurItem('now');
                        onSelect('now');
                    }}
                    style={[Theme.styles.row_center, curTtem === 'now' ? styles.activeBtn : styles.inactiveBtn]}>
                    {curTtem === 'now' ? <Svg_now_active /> : <Svg_now />}
                    <AppText style={[curTtem === 'now' ? styles.activeTxt : styles.inactiveTxt]}>
                        {translate('cart.now')}
                    </AppText>
                </TouchableOpacity>
            }
            <TouchableOpacity
                onPress={() => {
                    setCurItem('schedule');
                    onSelect('schedule');
                }}
                style={[Theme.styles.row_center, curTtem === 'schedule' ? styles.activeBtn : styles.inactiveBtn]}>
                {curTtem === 'schedule' ? <Svg_schedule_active /> : <Svg_schedule />}
                <AppText
                    style={[curTtem === 'schedule' ? styles.activeTxt : styles.inactiveTxt]}>
                    {translate('cart.schedule')}
                </AppText>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginTop: 10, width: 216, height: 40, borderRadius: 15, borderColor: Theme.colors.gray6, borderWidth: 1, backgroundColor: Theme.colors.white },
    activeBtn: { flex: 1, height: 40, borderRadius: 15, backgroundColor: Theme.colors.text },
    inactiveBtn: { flex: 1, height: 38, borderRadius: 15, backgroundColor: Theme.colors.white },
    activeTxt: { marginLeft: 6, fontSize: 14, color: Theme.colors.white, fontFamily: Theme.fonts.semiBold },
    inactiveTxt: { marginLeft: 6, fontSize: 14, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold },
});
export default React.memo(CartScheduleTab);
