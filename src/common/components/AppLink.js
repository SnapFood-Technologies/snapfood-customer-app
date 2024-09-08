import React, {PureComponent} from 'react';
import {TouchableOpacity} from 'react-native';
import Theme from '../../theme';
import AppText from './AppText';

class AppLink extends PureComponent {

    render () {
        const {style, containerStyle, onPress, disabled} = this.props;
        const containerStyles = [containerStyle];
        const linkStyles = {...style};
        if (disabled) {
            containerStyles.push(Theme.styles.disabledAppButton);
        }

        return <TouchableOpacity style={containerStyles}
                                 activeOpacity={0.75}
                                 onPress={onPress}
                                 {...this.props}>
            <AppText style={linkStyles}>{this.props.children}</AppText>
        </TouchableOpacity>;
    }

}

export default AppLink;
