import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Dimensions, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import FontelloIcon from './FontelloIcon';
import Theme from '../../theme';
import {throttle} from 'throttle-debounce';
import {translate} from '../services/translate';
import Config from '../../config';
import AuthInput from '../../modules/profile/components/AuthInput';

const screenWidth = Dimensions.get('screen').width;

class AppSearch extends PureComponent {

    onChangeText = throttle(1000, (text) => {
        this.props.onChangeText(text);
    });

    render () {
        const {containerStyle, placeholder} = this.props;
        const containerStyles = [styles.container, containerStyle];
        return (
            <View style={containerStyles}>
                <FontelloIcon icon="search" size={Theme.icons.small} color={Theme.colors.placeholder}/>
                <TextInput style={styles.input}
                           placeholder={placeholder ? placeholder : translate('search_text')}
                           onChangeText={this.onChangeText}
                           autoCapitalize={'none'}
                           autoCorrect={false}
                           placeholderTextColor={Theme.colors.placeholder}
                />
                <TouchableOpacity style={{position: 'absolute', right: 10}}
                                  onPress={() => this.props.onActionClick()}>
                    <FontelloIcon icon='filter' size={Theme.icons.small}
                                  color={Theme.colors.placeholder}/>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: Config.isAndroid ? 5 : 10,
        backgroundColor: Theme.colors.backgroundTransparent3,
        borderRadius: 5,
    },
    input: {
        margin: 0,
        marginLeft: 5,
        width: screenWidth - 25 - (2 * Theme.icons.small),
    },
});

AppSearch.propTypes = {
    type: PropTypes.string,
    children: PropTypes.any,
    style: PropTypes.any,
};

AppSearch.defaultProps = {
    type: 'body',
};

export default AppSearch;
