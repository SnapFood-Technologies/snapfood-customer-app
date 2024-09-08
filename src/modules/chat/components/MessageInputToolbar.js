import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Keyboard, ViewPropTypes, ScrollView, } from 'react-native';
import { Composer, Send, Actions } from 'react-native-gifted-chat';
import AntDesign from 'react-native-vector-icons/AntDesign'
import FastImage from 'react-native-fast-image';
import Theme from '../../../theme';
import SupportMsgItem from '../../orders/components/SupportMsgItem';
// svgs
import Svg_rmvImg from '../../../common/assets/svgs/msg/remove_image.svg'

const styles = StyleSheet.create({
    container: {
        bottom: 0,
        left: 0,
        right: 0,
    },
    primary: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    accessory: {
        height: 44,
    },
    quote_name: { fontSize: 14, fontFamily: Theme.fonts.bold, color: Theme.colors.cyan2 },
    quote_text: { marginTop: 8, fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
    chatFooter: { width: '100%', height: 33, marginBottom: 12 },
});
export default class MessageInputToolbar extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            position: 'absolute'
        };
        this.keyboardWillShowListener = undefined;
        this.keyboardWillHideListener = undefined;
        this.keyboardWillShow = () => {
            if (this.state.position !== 'relative') {
                this.setState({
                    position: 'relative'
                });
            }
        };
        this.keyboardWillHide = () => {
            if (this.state.position !== 'absolute') {
                this.setState({
                    position: 'absolute'
                });
            }
        };
    }
    componentDidMount() {
        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
        this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
    }
    componentWillUnmount() {
        if (this.keyboardWillShowListener) {
            this.keyboardWillShowListener.remove();
        }
        if (this.keyboardWillHideListener) {
            this.keyboardWillHideListener.remove();
        }
    }
    renderActions() {
        const { containerStyle, ...props } = this.props;
        if (this.props.renderActions) {
            return this.props.renderActions(props);
        }
        else if (this.props.onPressActionButton) {
            return <Actions {...props} />;
        }
        return null;
    }
    renderSend() {
        if (this.props.renderSend) {
            return this.props.renderSend(this.props);
        }
        return <Send {...this.props} />;
    }
    renderComposer() {
        if (this.props.renderComposer) {
            return this.props.renderComposer(this.props);
        }
        return <Composer {...this.props} />;
    }
    renderAccessory() {
        if (this.props.renderAccessory) {
            return (<View style={[styles.accessory, this.props.accessoryStyle]}>
                {this.props.renderAccessory(this.props)}
            </View>);
        }
        return null;
    }

    getOffset = () => {
        if (this.state.position == 'relative') {
            let offset = 0;
            if (this.props.images != null && this.props.images?.length > 0) {
                offset = offset + 73;
            }
            if (this.props.quote_msg != null) {
                offset = offset + 55;
            }
            if (this.props.default_msgs != null && this.props.default_msgs.length > 0) {
                offset = offset + 55;
            }

            return offset;
        }
        return 0;
    }

    render() {
        return (<View style={[
            styles.container,
            this.props.containerStyle,
            { position: this.state.position, bottom: this.getOffset() }
        ]}>
            {
                this.props.quote_msg != null &&
                <View style={[Theme.styles.row_center, { alignItems: 'flex-start', marginBottom: 6, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: Theme.colors.cyan2 }]}>
                    <View style={[Theme.styles.col_center, { flex: 1, alignItems: 'flex-start', }]}>
                        <Text style={styles.quote_name}>{this.props.quote_msg.user.username || this.props.quote_msg.user.full_name}</Text>
                        <Text numberOfLines={1} style={styles.quote_text}>{this.props.quote_msg.text}</Text>
                    </View>
                    <TouchableOpacity style={{ marginLeft: 8 }} onPress={this.props.onCancelQuote ? this.props.onCancelQuote : () => { }}>
                        <AntDesign name='close' size={20} color={Theme.colors.text} />
                    </TouchableOpacity>
                </View>
            }
            {
                (this.props.images != null && this.props.images?.length > 0) &&
                <View style={[Theme.styles.row_center, { alignItems: 'flex-start', marginBottom: 6, }]}>
                    {
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={[{}]}>
                            {
                                this.props.images.map((img, index) =>
                                    <View key={index} style={{ width: 73, height: 73, marginRight: 12 }}>
                                        <FastImage
                                            style={[{
                                                marginTop: 5,
                                                width: 68,
                                                height: 68,
                                                borderRadius: 15,
                                                resizeMode: 'cover',
                                            }]}
                                            resizeMode={FastImage.resizeMode.cover}
                                            source={{ uri: img.path }}
                                        />
                                        <TouchableOpacity style={{ position: 'absolute', top: 0, right: 0, }} onPress={this.props.onRemoveImage ? () => this.props.onRemoveImage(img) : () => { }}>
                                            <Svg_rmvImg width={18} height={18} />
                                        </TouchableOpacity>
                                    </View>

                                )
                            }
                        </ScrollView>
                    }
                </View>
            }
            {
                this.props.quote_msg == null &&
                (this.props.images == null || this.props.images?.length == 0) &&
                (this.props.default_msgs != null && this.props.default_msgs.length > 0) &&
                <View style={[Theme.styles.row_center, styles.chatFooter]}>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={[{ width: '100%' }]}>
                        {
                            this.props.default_msgs.map((msg, index) =>
                                <SupportMsgItem key={index} msg={msg} onPress={() => {
                                    this.props.onPressDefaultMsg(msg);
                                }} />
                            )
                        }
                    </ScrollView>
                </View>
            }
            <View style={[styles.primary, this.props.primaryStyle]}>
                {this.renderActions()}
                {this.renderComposer()}
                {this.renderSend()}
            </View>
            {this.renderAccessory()}
        </View>);
    }
}
MessageInputToolbar.defaultProps = {
    renderAccessory: null,
    renderActions: null,
    renderSend: null,
    renderComposer: null,
    containerStyle: {},
    primaryStyle: {},
    accessoryStyle: {},
    onPressActionButton: () => { },
};
MessageInputToolbar.propTypes = {
    renderAccessory: PropTypes.func,
    renderActions: PropTypes.func,
    renderSend: PropTypes.func,
    renderComposer: PropTypes.func,
    onPressActionButton: PropTypes.func,
    containerStyle: ViewPropTypes.style,
    primaryStyle: ViewPropTypes.style,
    accessoryStyle: ViewPropTypes.style,
};