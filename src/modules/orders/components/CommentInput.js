import { TextInput, View, Text, StyleSheet } from 'react-native';
import Theme from '../../../theme';
import React, { useState } from 'react';
import { translate } from '../../../common/services/translate'
 

const CommentInput = ({ placeholder, comments, style, height = 80, onChangeText, textStyle }) => {
    const [comment_height, setCommentHeight] = useState(height)

    return <View style={[Theme.styles.col_center_start, styles.commentView, style]}>
        <TextInput
            multiline={true}
            value={comments}
            placeholder={placeholder ? placeholder : translate('cart.add_comment')}
            placeholderTextColor={Theme.colors.gray5}
            onChangeText={onChangeText ? onChangeText : (text) => { }}
            onContentSizeChange={(event) => {
                setCommentHeight(event.nativeEvent.contentSize.height)
            }}
            autoCapitalize={'none'}
            autoCorrect={false}
            style={[styles.commentInput, textStyle ,{ height: Math.max(height, comment_height) }]}
        />
    </View>
};

const styles = StyleSheet.create({
    commentView: { width: '100%', alignItems: 'flex-start', maxHeight: 300, },
    commentInput: {
        maxHeight: '100%', width: '100%', borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.gray6,
        textAlignVertical: 'top', padding: 15, paddingTop: 15, fontSize: 14, fontFamily: Theme.fonts.medium, color: Theme.colors.text,
    },
})
export default CommentInput;
