import React, {PureComponent} from 'react';
import {Text} from 'react-native';
import Theme from '../../theme';

class AppText extends PureComponent {

    render () {
        const {style, numberOfLines, ellipsizeMode} = this.props;

        return <Text style={[Theme.styles.appText, style]}
                     numberOfLines={numberOfLines}
                     ellipsizeMode={ellipsizeMode}
        >{this.props.children}</Text>;
    }

}

export default AppText;
