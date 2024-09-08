import React from 'react';
import {TouchableOpacity, StyleSheet, Text, View} from 'react-native';
import AppText from './AppText';
import Theme from '../../theme';

const AppBadge = ({value, style,...otherProps}) => {
    return (
		<TouchableOpacity style={[Theme.styles.col_center, { ...styles.container, ...style }]} {...otherProps}>
			<AppText style={styles.txt}>{value}</AppText>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
    container: {
        width: 19,
        height: 19,
        borderRadius: 10,
        backgroundColor: Theme.colors.cyan2,
    },
    txt :{ fontFamily: Theme.fonts.semiBold, fontSize : 8, color: Theme.colors.white}
});

export default AppBadge;
