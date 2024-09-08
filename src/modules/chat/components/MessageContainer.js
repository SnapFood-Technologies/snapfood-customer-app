import React from 'react';
import { View, Text, Clipboard } from 'react-native';
import { Avatar, Bubble, utils, SystemMessage, Message, MessageText } from 'react-native-gifted-chat';
import Theme from '../../../theme';
import MessageBubble from './MessageBubble';

export const renderMessage = (props) => (
  <Message
    {...props}
    containerStyle={{
      left: { backgroundColor: '#fff' },
      right: { backgroundColor: '#fff' },
    }}
    imageStyle={{
      left: { marginBottom: 22 },
      right: { marginBottom: 22 },
    }}
    textStyle={{ fontSize: 13 }}
  />
);

export const renderBubble = (props, isGroup, onLongPress, onPressMsg, onDoublePress, onShowGalleryMsgs, onLikeChange, onPopupPress, onCopyPress) => {

  return <MessageBubble
    {...props}
    isGroup={isGroup}
    // renderTime={() => <Text>Time</Text>}
    // renderTicks={() => <Text>Ticks</Text>} 
    containerStyle={{
      left: { paddingLeft: 12, marginTop: 8, },
      right: { paddingRight: 12, marginTop: 8, },
    }}
    bottomContainerStyle={{
      left: { display: 'none' },
      right: { display: 'none' },
    }}
    tickStyle={{}}
    // usernameStyle={{ color: 'tomato', fontWeight: '100' }}
    containerToNextStyle={{
      left: {},
      right: {},
    }}
    containerToPreviousStyle={{
      left: {},
      right: {},
    }}
    onPressMsg={onPressMsg}
    onDoublePress={onDoublePress}
    onLongPress={onLongPress}
    onShowGalleryMsgs={onShowGalleryMsgs}
    onLikeChange={onLikeChange}
    onPopupPress={onPopupPress}
    onCopyPress={onCopyPress}
  />
};

export const renderSystemMessage = (props, onConfirmDelivery) => {
  if (props.currentMessage != null && props.currentMessage.system == true && props.currentMessage.confirm_order_msg == true) {
    return (
      <View style={[Theme.styles.col_center, { width: '100%', paddingHorizontal: 30, marginVertical: 10 }]}>
        <View style={[Theme.styles.col_center, { width: '100%', borderRadius: 12, padding: 16, backgroundColor: Theme.colors.gray8 }]}>
          <Text style={{ fontSize: 16, lineHeight: 20, color: Theme.colors.text, fontFamily: Theme.fonts.medium, textAlign: 'center' }}>
            {props.currentMessage.message}
          </Text>
          <Text onPress={onConfirmDelivery} style={{marginTop: 16, fontSize: 17, lineHeight: 20, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, textAlign: 'center', textDecorationLine: 'underline' }}>
            {props.currentMessage.button}
          </Text>
        </View>
      </View>
    );
  }
  if (props.currentMessage != null && props.currentMessage.system == true && props.currentMessage.order_help_blocked_msg == true) {
    return (
      <View style={[Theme.styles.col_center, { width: '100%', paddingHorizontal: 30, marginVertical: 10 }]}>
        <View style={[Theme.styles.col_center, { width: '100%', borderRadius: 12, padding: 16, backgroundColor: Theme.colors.gray8 }]}>
          <Text style={{ fontSize: 16, lineHeight: 20, color: Theme.colors.text, fontFamily: Theme.fonts.medium, textAlign: 'center' }}>
            {props.currentMessage.message}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <SystemMessage
      {...props}
      containerStyle={{ backgroundColor: 'transparent', paddingHorizontal: 20 }}
      wrapperStyle={{ backgroundColor: Theme.colors.red1, padding: props.currentMessage && props.currentMessage.text ? 14 : 0, borderRadius: 8 }}
      textStyle={{ color: Theme.colors.white, fontSize: 16, fontFamily: Theme.fonts.semiBold, }}
    />
  )
};

export const renderCustomView = (props) => {
  return <View></View>
}

export const renderAvatar = (props) => (
  <SystemMessage
    {...props}
    containerStyle={{ backgroundColor: 'transparent' }}
    wrapperStyle={{ borderWidth: 10, borderColor: 'white' }}
    textStyle={{ color: Theme.colors.gray4, fontFamily: Theme.fonts.medium, }}
  />
);