import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import Theme from '../../../theme';

const Tag = ({text}) => {
    const [height, setHeight] = useState(0);

    const onLayoutHandle = (event) => {
        const {height} = event.nativeEvent.layout;
        setHeight(height);
    };

    return (
        <View onLayout={onLayoutHandle}
              style={[styles.container, {borderRadius: height / 2.5}, {backgroundColor: text ? Theme.colors.primary : 'transparent'}]}>
            <Text style={[styles.textStyle]}>{text}</Text>
        </View>
    );
};

Tag.propTypes = {
    containerStyle: PropTypes.object,
    badgeStyle: PropTypes.object,
    textStyle: Text.propTypes.style,
    value: PropTypes.node,
    onPress: PropTypes.func,
    Component: PropTypes.elementType,
    theme: PropTypes.object,
};

const styles = StyleSheet.create(
    {
        container: {
            backgroundColor: Theme.colors.primary,
            alignSelf: 'center',
            padding: 2,
            paddingHorizontal: 5,
        },
        textStyle: {
            color: Theme.colors.white,
            fontFamily: 'SanFranciscoDisplay-Semibold',
            fontSize: 15,
        },
    },
);

export default Tag;
