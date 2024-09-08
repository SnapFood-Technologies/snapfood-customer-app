import React, { PureComponent } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import Theme from '../../../theme';
import AppText from '../AppText';

class TransButton extends PureComponent {

    render() {
        const { style, title, btnTxtColor, fontSize, onPress, disabled, loading } = this.props;
        let buttonStyles = { ...Theme.styles.button, ...Theme.styles.transbtn, ...style };
        if (disabled) {
            buttonStyles = { ...buttonStyles, ...Theme.styles.disabledButton };
        }

        return <TouchableOpacity style={buttonStyles}
            activeOpacity={0.75}
            onPress={onPress}
            disabled={!!disabled || loading}>
            <AppText style={[Theme.styles.buttonText, { fontSize: fontSize ?? 18 }, { color: btnTxtColor ? btnTxtColor : Theme.colors.btnPrimary }]}>{title}</AppText>
        </TouchableOpacity>;
    }

}

export default TransButton;
