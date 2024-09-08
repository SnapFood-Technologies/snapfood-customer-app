import {Alert} from 'react-native';
import {translate} from './translate';

export default {
    confirmation: (title = translate('alerts.confirmation'), message, confirmText = translate('alerts.yes'), cancelText = translate('alerts.no')) => {
        return new Promise((resolve, reject) => {
            Alert.alert(
                title,
                message,
                [
                    {
                        text: cancelText,
                        onPress: reject,
                        style: 'cancel',
                    },
                    {
                        text: confirmText,
                        onPress: resolve,
                    },
                ],
                {cancelable: false},
            );
        });
    },
    info: (title = translate('alerts.confirmation'), message) => {
        return new Promise((resolve) => {
            Alert.alert(
                title,
                message,
                [
                    {
                        text: 'Ok',
                        onPress: resolve,
                    },
                ],
                {cancelable: false},
            );
        });
    },
    error: (title = translate('alerts.error'), message) => {
        Alert.alert(
            title,
            message,
            [
                {
                    text: 'Ok',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
            ],
            {cancelable: false},
        );
    },
};
