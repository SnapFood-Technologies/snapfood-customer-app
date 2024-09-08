import React, {PureComponent} from 'react';
import {View} from 'react-native';
import Theme from '../../theme';

class AppLine extends PureComponent {

    render () {
        return <View style={{
            borderBottomColor: this.props.color || Theme.colors.text,
            borderBottomWidth: 1,
            ...this.props.style,
        }}
        />;
    }

}

export default AppLine;
