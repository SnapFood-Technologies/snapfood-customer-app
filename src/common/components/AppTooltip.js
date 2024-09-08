import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StatusBar, View, Text, StyleSheet, Platform } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import Foundation from 'react-native-vector-icons/Foundation';
import AppText from './AppText';
import { translate } from '../../common/services/translate';
import Theme from '../../theme';
import { isEmpty } from '../services/utility';

const AppTooltip = ({ anchor, title, description, content = null, placement = 'top', infoIconStyle, arrowStyle }) => {
    const [showTooltip, setToolTip] = useState(false);
    return (
        <Tooltip
            isVisible={showTooltip}
            backgroundColor={'transparent'}
            content={
                <View style={styles.tooltip}>
                    {!isEmpty(title) && <AppText style={styles.title}>{title}</AppText>}
                    {
                        content ? content :
                            <AppText style={styles.description}>{description}</AppText>
                    }
                    <TouchableOpacity onPress={() => setToolTip(false)}><AppText style={styles.dismiss}>{translate('tooltip.dismiss')}</AppText></TouchableOpacity>
                </View>
            }
            placement={placement}
            tooltipStyle={{ backgroundColor: 'transparent' }}
            topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
            contentStyle={{ elevation: 7, borderRadius: 16, }}
            arrowStyle={[{ elevation: 8, marginTop: -2, }, arrowStyle]}
            showChildInTooltip={false}
            disableShadow={false}
            onClose={() => setToolTip(false)}
        >
            <TouchableOpacity style={[Theme.styles.row_center, { "marginVertical": 8 }, infoIconStyle]} onPress={() => setToolTip(true)}>
                {anchor ? anchor : <Foundation name='info' size={20} color={Theme.colors.gray7} />}
            </TouchableOpacity>
        </Tooltip>
    )
};

const styles = StyleSheet.create({
    title: { fontSize: 17, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
    description: { fontSize: 16, lineHeight: 20, fontFamily: Theme.fonts.medium, color: Theme.colors.text, marginTop: 8 },
    dismiss: { fontSize: 15, fontFamily: Theme.fonts.medium, color: Theme.colors.red1, marginTop: 16, textAlign: 'center' },
    tooltip: { backgroundColor: '#fff', borderRadius: 20, padding: 16, },
})

function arePropsEqual(prevProps, nextProps) {
    return prevProps.title == nextProps.title && prevProps.description == nextProps.description && prevProps.id == nextProps.id;
}

export default React.memo(AppTooltip, arePropsEqual);
