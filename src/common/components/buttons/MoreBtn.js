import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import Svg_more from '../../../common/assets/svgs/btn_more.svg';

const MoreBtn = ({ options = [], onSelect = () => { } }) => {
    return (
        <Menu>
            <MenuTrigger>
                <View style={styles.moreContainer}>
                    <Svg_more width={42} height={42} />
                </View>
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={styles.popupContainer}>
                {
                    options.map((option, index) =>
                        <MenuOption onSelect={() => onSelect(option, index)} >
                            {
                                <View style={(index == (options.length - 1)) ? styles.popuplastItem : styles.popupItem}>
                                    <Text style={styles.popupText}>{option}</Text>
                                </View>
                            }
                        </MenuOption>
                    )
                }
            </MenuOptions>
        </Menu>
    );
};

const styles = StyleSheet.create({
    moreContainer: {
        width: 42,
        height: 42,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E9E9F7',
        alignItems: 'center',
        justifyContent: 'center'
    },
    moreIcon: {
        height: 20,
        width: 20
    },
    popupContainer: {
        width: 160,
        borderColor: '#E9E9F7',
        borderRadius: 12,
        backgroundColor: 'white',
        borderWidth: 2,
        paddingHorizontal: 2,
        marginTop: 50,
        elevation: 0
    },
    popupText: {
        color: Theme.colors.text,
        fontSize: 17,
        fontFamily: Theme.fonts.semiBold
    },
    popupItem: {
        padding: 5, paddingBottom: 12, alignItems: 'center', borderColor: '#F6F6F9', borderBottomWidth: 1, flexDirection: 'row'
    },
    popuplastItem: {
        paddingHorizontal: 5, paddingBottom: 8, flexDirection: 'row'
    }
})

export default MoreBtn;
