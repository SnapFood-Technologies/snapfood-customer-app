import React, { PureComponent } from 'react';
import { View } from 'react-native';

class LabelContainer extends PureComponent {

  state = {
    value: 0,
  };

  setValue = value => {
    this.setState({ value });
  }

  render() {
    const { renderContent, ...restProps } = this.props;
    const { value } = this.state;
    return (
      <View {...restProps}>
        {renderContent(value)}
      </View>
    );
  }
}

export default LabelContainer;
