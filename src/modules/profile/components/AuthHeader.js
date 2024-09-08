import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import FontelloIcon from '../../../common/components/FontelloIcon';
import styles from '../screens/styles';
import Theme from '../../../theme';

const AuthHeader = ({onPress}) => {
    return <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onPress}>
            <FontelloIcon size={Theme.icons.base} icon={'left-open'} color={Theme.colors.white}/>
        </TouchableOpacity>
    </View>;
};

export default AuthHeader;
