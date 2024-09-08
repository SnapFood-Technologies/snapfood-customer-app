import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import Theme from '../../theme';

const BlockSpinner = ({style}) => {
    return (
        <View
            style={[
                {
                    flex: 1,
                    justifyContent: 'center',
                },
                style
            ]}>
            <ActivityIndicator size={Theme.icons.xLarge} color={Theme.colors.primary} />
        </View>
    );
};

export default BlockSpinner;
