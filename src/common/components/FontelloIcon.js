import React from 'react';
import { Animated } from 'react-native';
import { createIconSetFromFontello } from 'react-native-vector-icons';
import fontelloConfig from '../../config/fontello/config.json';
import Theme from '../../theme';

const Icon = createIconSetFromFontello(fontelloConfig);
const AnimatedIcon = Animated.createAnimatedComponent(Icon);
class FontelloIcon extends React.PureComponent {
    render() {
        let { icon, size, color, style } = this.props;
        if (!size) {
            size = 80;
        }
        if (!color) {
            color = Theme.colors.primary;
        }

        return <AnimatedIcon style={[style, { color: color }]} name={icon} size={size} />;
    }
}

export default FontelloIcon;
