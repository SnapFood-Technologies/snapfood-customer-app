import React, {PureComponent} from 'react';
import {StyleSheet, View} from 'react-native';
import Theme from '../../theme';
import AppText from './AppText';

class SectionContainer extends PureComponent {

    render () {
        const {title} = this.props;

        return <View style={styles.container}>
            {
                title && <AppText style={styles.text}>{title}</AppText>
            }
            <View style={styles.childrenContainer}>
                {
                    this.props.children
                }
            </View>
        </View>;
    }

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Theme.colors.darkerBackground,
    },
    text: {
        height: Theme.icons.base,
        lineHeight: Theme.icons.base,
        marginLeft: Theme.icons.tiny,
        textTransform: 'uppercase',
        color: Theme.colors.gray1,
    },
    childrenContainer: {
        backgroundColor: Theme.colors.white,
    },
});

export default SectionContainer;
