import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { usePrevious } from "./helpers/StateHelpers";
import FastImage from 'react-native-fast-image';
import Entypo from 'react-native-vector-icons/Entypo'
import { translate } from "../../../../../common/services/translate";

import DEFAULT_AVATAR from "./assets/images/no_avatar.png";
import Theme from "../../../../../theme";

const StoryCircleListItem = (props) => {

    const {
        item,
        unPressedBorderColor,
        pressedBorderColor,
        avatarSize,
        showText,
        textStyle,
        onAddPhoto
    } = props;

    // const [isPressed, setIsPressed] = useState(props?.item?.seen);

    // const prevSeen = usePrevious(props?.item?.seen);

    // useEffect(() => {
    //     setIsPressed(props?.item?.seen);
    // }, [props?.item?.seen]);

    const _handleItemPress = item => {
        const { handleStoryItemPress } = props;

        if (handleStoryItemPress) handleStoryItemPress(item);

        // setIsPressed(true);
    };

    const size = avatarSize ?? 72;

    // console.log('item.seen ', item.seen)
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => _handleItemPress(item)}
                style={[
                    styles.avatarWrapper,
                    {
                        height: size + 4,
                        width: size + 4,
                    },
                    item.seen != true
                        ? {
                            borderColor: unPressedBorderColor
                                ? unPressedBorderColor
                                : 'red'
                        }
                        : {
                            borderColor: pressedBorderColor
                                ? pressedBorderColor
                                : 'grey'
                        },
                    (item.stories == null || item.stories.length == 0) && {
                        borderColor: Theme.colors.white
                    }
                ]}
            >
                <Image
                    style={{
                        height: size,
                        width: size,
                        borderRadius: 100,
                    }}
                    source={{ uri: item.user_image }}
                    defaultSource={Platform.OS === 'ios' ? DEFAULT_AVATAR : null}
                />
                {
                    item.is_mine == true &&
                    <TouchableOpacity style={[Theme.styles.col_center, styles.plugBtn]}
                        onPress={onAddPhoto ? onAddPhoto : () => { }}
                    >
                        <Entypo name="plus" size={14} color={Theme.colors.white} />
                    </TouchableOpacity>
                }
            </TouchableOpacity>
            {showText &&
                <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                        width: size + 4,
                        ...styles.text,
                        ...textStyle,
                        color: (item.is_mine == true ? Theme.colors.gray7 : Theme.colors.text)
                    }}>{item.is_mine == true ? translate('social.your_story') : (item.user_name || item.user_fullname)}</Text>}
        </View>
    );
}

export default StoryCircleListItem;

const styles = StyleSheet.create({
    container: {
        marginVertical: 5,
        marginRight: 10
    },
    avatarWrapper: {
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        borderColor: 'red',
        borderRadius: 100,
        height: 76,
        width: 76
    },
    text: {
        marginTop: 3,
        textAlign: "center",
        alignItems: "center",
        fontSize: 14,
        fontFamily: Theme.fonts.semiBold
    },
    plugBtn: {
        width: 24, height: 24, borderWidth: 3, borderColor: Theme.colors.white, borderRadius: 12, backgroundColor: Theme.colors.cyan2,
        position: 'absolute', bottom: -2, right: -2
    }
});
