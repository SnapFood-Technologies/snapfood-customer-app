import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewPropTypes, } from 'react-native';
import Theme from '../../../theme'; 

const styles = StyleSheet.create({
    container: {
        height: 44,
        justifyContent: 'flex-end',
    },
    text: {
        color: Theme.colors.cyan2,
        fontWeight: '600',
        fontSize: 17,
        backgroundColor: 'transparent',
        marginBottom: 12,
        marginLeft: 10,
        marginRight: 10,
    },
});
export default class MessageSend extends Component {
    render() {
        const { text, containerStyle, onSend, children, textStyle, label, alwaysShowSend, disabled, sendButtonProps, } = this.props;
        if (alwaysShowSend || (text && text.trim().length > 0)) {
            return (<TouchableOpacity testID='send' accessible accessibilityLabel='send' style={[styles.container, containerStyle]} onPress={() => {
                if (onSend) {
                    onSend({ text: text == null ? text : text.trim() }, true);
                }  
            }} accessibilityTraits='button' disabled={disabled} {...sendButtonProps}>
          <View>
            {children || <Text style={[styles.text, textStyle]}>{label}</Text>}
          </View>
        </TouchableOpacity>);
        }
        return <View />;
    }
}
MessageSend.defaultProps = {
    text: '',
    onSend: () => { },
    label: 'Send',
    containerStyle: {},
    textStyle: {},
    children: null,
    alwaysShowSend: false,
    disabled: false,
    sendButtonProps: null,
};
MessageSend.propTypes = {
    text: PropTypes.string,
    onSend: PropTypes.func,
    label: PropTypes.string,
    containerStyle: ViewPropTypes.style,
    textStyle: PropTypes.any,
    children: PropTypes.element,
    alwaysShowSend: PropTypes.bool,
    disabled: PropTypes.bool,
    sendButtonProps: PropTypes.object,
}; 