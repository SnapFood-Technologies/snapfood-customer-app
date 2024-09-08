import React, { memo, useState } from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity } from 'react-native';
import { default as EvilIcon } from 'react-native-vector-icons/EvilIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Theme from "../../../../theme";

const SearchBox = memo(({ fontSize, onChangeText, hint = 'Search' }) => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <View style={styles.container}>
            <EvilIcon name="search" size={24} color={Theme.colors.gray5} />
            <TextInput
                placeholder={hint}
                placeholderTextColor={Theme.colors.gray5}
                value={searchTerm}
                onChangeText={(val) => {
                    setSearchTerm(val);
                    onChangeText(val);
                }}
                autoCapitalize={'none'}
                autoCorrect={false}
                style={[styles.input, fontSize && {fontSize : fontSize}]}
            />
            {
                searchTerm !== '' &&
                <TouchableOpacity onPress={() => {
                    setSearchTerm('');
                    onChangeText('');
                }}>
                    <Entypo name={'circle-with-cross'} color={'#878E97'} size={18} />
                </TouchableOpacity>
            }
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
        height: 45,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E9E9F7',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10
    },
    input: {
        margin: 0,
        flex: 1,
        color: Theme.colors.text,
        fontSize: 16,
        fontFamily: Theme.fonts.medium,
        height: 40
    }
});

export default SearchBox;
