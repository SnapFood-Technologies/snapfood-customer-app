import React, { Component } from 'react';
import {
  Button,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import RtcEngine, {
  ChannelProfile,
  ClientRole,
  RtcEngineContext,
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode
} from 'react-native-agora';
import { width, height } from 'react-native-dimension';
import AppText from '../../../common/components/AppText'
import CallInfo from '../components/CallInfo';
import CallActionView from '../components/CallActionView';
import Config from '../../../config';
import Theme from '../../../theme';
import alerts from '../../../common/services/alerts';
import { startCall, getAgoraToken, updateCallChannelStatus, call_channel_collection, updateCallDuration } from '../../../common/services/call';
import { translate } from '../../../common/services/translate';
import { CALL_STATUS } from '../../../config/constants';
import { goActiveScreenFromPush } from '../../../store/actions/app';

class VideoCallScreen extends Component {
  _isMounted = false;
  _engine = null;
  _channelId = null;
  _joinedUsers = [];
  _currentStatus = null;
  _call_started_time = null;
  constructor(props) {
    super(props);
    this.state = {
      isVideoCall: props.route.params.isVideoCall || false,
      type: props.route.params.type, // 'incoming', 'outgoing'
      IncomingCallData: props.route.params.IncomingCallData || {},
      OutgoingCallReceiver: props.route.params.OutgoingCallReceiver || {},

      isVideoOff: false,
      isMuted: false,
      isSpeakerOn: false,

      channelId: null,
      isJoined: false,
      hide_RemoteView: false,
      remoteUid: [],
      myid: props.user.id,
      switchCamera: true,
      isLocalLarge: false,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    if (this.state.type == 'incoming') {
      this.props.goActiveScreenFromPush({
        isIncomingCall: false
      })

      const { IncomingCallData } = this.state;
      this.monitorPartnerStatus(IncomingCallData.channel_id);
    }

    if (this.state.type == 'outgoing') {
      this.initiateCall()
    }
  }

  UNSAFE_componentWillMount() {
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.props.route && this.props.route.params && prevProps.route && prevProps.route.params) {
      let this_type = this.props.route.params.type;
      let this_IncomingCallData = this.props.route.params.IncomingCallData || {};

      let prev_type = prevProps.route.params.type;
      let prev_IncomingCallData = prevProps.route.params.IncomingCallData || {};

      if (this_type == 'incoming' && prev_type == this_type) {
        if (this_IncomingCallData.channel_id != prev_IncomingCallData.channel_id) {

          if (this.partner_listener) {
            this.partner_listener()
          }
          try {
            await this._engine?.leaveChannel();
            await this._engine?.destroy();
          } catch (error) { }

          this.monitorPartnerStatus(this_IncomingCallData.channel_id);
          this.setState({
            isVideoCall: this.props.route.params.isVideoCall || false,
            type: this.props.route.params.type, // 'incoming', 'outgoing'
            IncomingCallData: this.props.route.params.IncomingCallData || {},
            OutgoingCallReceiver: this.props.route.params.OutgoingCallReceiver || {},
      
            isVideoOff: false,
            isMuted: false,
            isSpeakerOn: false,
      
            channelId: null,
            isJoined: false,
            hide_RemoteView: false,
            remoteUid: [],
            myid: this.props.user.id,
            switchCamera: true,
            isLocalLarge: false,
          })
          
        }
      }
    } 
	}

  componentWillUnmount() {
    this._isMounted = false;
    if (this.partner_listener) {
      this.partner_listener()
    }

    try {
      this._leaveChannel();
      this._engine?.destroy();
    } catch (error) {

    }
  }

  _initEngine = async () => {
    try {
      if (Platform.OS === 'android') {
        let permOk = false;
        if (this.state.isVideoCall) {
          const results = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.CAMERA,
          ]);
          if (results && results['android.permission.CAMERA'] == 'granted' && results['android.permission.RECORD_AUDIO'] == 'granted') {
            permOk = true;
          }
          else {
            alerts.error(translate('alerts.error'), translate('video_call.allow_camera_audio_perm'))
          }
        }
        else {
          const results = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          ]);
          if (results && results['android.permission.RECORD_AUDIO'] == 'granted') {
            permOk = true;
          }
          else {
            alerts.error(translate('alerts.error'), translate('video_call.allow_audio_perm'))
          }
        }

        if (permOk == false) {
          return false;
        }
      }

      this._engine = await RtcEngine.createWithContext(
        new RtcEngineContext(Config.AGORA_APP_ID)
      );
      this._addListeners();

      if (this.state.isVideoCall) {
        await this._engine.enableVideo();
        await this._engine.startPreview();
      }
      else {
        await this._engine.enableAudio();
        await this._engine.setEnableSpeakerphone(this.state.isSpeakerOn);
      }

      await this._engine.setChannelProfile(ChannelProfile.LiveBroadcasting);
      await this._engine.setClientRole(ClientRole.Broadcaster);

      return true;
    } catch (error) {
      console.log('_initEngine error ', error);
      return false;
    }
  };

  _addListeners = () => {
    this._engine?.addListener('Warning', (warningCode) => {
      console.info('Warning', warningCode);
    });
    this._engine?.addListener('Error', (errorCode) => {
      console.info('Error', errorCode);
      this.onError(errorCode);
    });
    this._engine?.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.info('JoinChannelSuccess', channel, uid, elapsed);
      if (this._isMounted) {
        this.setState({ isJoined: true });
      }

      const { type } = this.state;
      if (type == 'outgoing') {
        this.monitorPartnerStatus(this._channelId);
        this.monitorMissed();
      }

    });
    this._engine?.addListener('UserJoined', (uid, elapsed) => {
      console.info('UserJoined', uid, elapsed);
      if (this._isMounted) {
        this.setState({ remoteUid: [...this.state.remoteUid, uid] });
      }
      this._joinedUsers = [...this.state.remoteUid, uid];
      if (this._joinedUsers.length > 0) {
        updateCallChannelStatus(this._channelId, this.props.user.id, CALL_STATUS.joined);
        this._currentStatus = CALL_STATUS.joined;
        this._call_started_time = new Date().getTime();
      }
    });
    this._engine?.addListener('UserOffline', (uid, reason) => {
      console.info('UserOffline', uid, reason);
      let remainingUsers = this.state.remoteUid.filter((value) => value !== uid);
      if (this._isMounted) {
        this.setState({
          remoteUid: remainingUsers
        });
      }
      this._joinedUsers = remainingUsers;
      if (remainingUsers.length == 0) {
        this.endCall();
      }
    });
    this._engine?.addListener('LeaveChannel', (stats) => {
      console.info('LeaveChannel', stats);
      if (this._isMounted) {
        this.setState({ isJoined: false, remoteUid: [] });
      }
    });

    if (this.state.isVideoCall) {
      this._engine?.addListener('RemoteVideoStateChanged', (uid, state, reason, elapsed) => {
        console.info('RemoteVideoStateChanged', uid, state, reason, elapsed);

        if (this._isMounted) {
          if (state == 0 && reason == 5) // Stopped : RemoteMuted 
          {
            this.setState({ hide_RemoteView: true });
          }
          else {
            this.setState({ hide_RemoteView: false });
          }
        }
      });
    }
  };

  _joinChannel = async (channelId, token) => {
    this._channelId = channelId;
    if (this._isMounted == true) {
      this.setState({ channelId: channelId });
    }
    try {
      await this._engine?.joinChannel(
        token,
        channelId,
        null,
        this.props.user.id
      );
    } catch (error) {

    }
  };

  _leaveChannel = async () => {
    try {
      await this._engine?.leaveChannel();
    } catch (error) {
    }
  };

  _switchCamera = () => {
    const { switchCamera } = this.state;
    this._engine
      ?.switchCamera()
      .then(() => {
        this.setState({ switchCamera: !switchCamera });
      })
      .catch((err) => {
        console.warn('switchCamera', err);
      });
  };

  _onMute = () => {
    const { isMuted } = this.state;
    this._engine
      ?.muteLocalAudioStream(!isMuted)
      .then(() => {
        this.setState({ isMuted: !isMuted });
      })
      .catch((err) => {
        console.warn('mute Local Audio Stream', err);
      });
  }

  _onSpeakerOff = () => {
    const { isSpeakerOn } = this.state;
    this._engine
      ?.setEnableSpeakerphone(!isSpeakerOn)
      .then(() => {
        this.setState({ isSpeakerOn: !isSpeakerOn });
      })
      .catch((err) => {
        console.warn('mute Local Audio Stream', err);
      });
  }

  _onVideoOff = () => {
    const { isVideoOff } = this.state;
    this._engine
      ?.muteLocalVideoStream(!isVideoOff)
      .then(() => {
        this.setState({ isVideoOff: !isVideoOff });
      })
      .catch((err) => {
        console.warn('mute Local Video Stream', err);
      });
  }

  // outgoing
  initiateCall = async () => {
    const inititalSuccess = await this._initEngine();
    if (!inititalSuccess) {
      this.props.navigation.goBack();
      return;
    }
    let channelId = await startCall(this.props.user, this.state.OutgoingCallReceiver, this.state.isVideoCall);
    if (channelId) {
      this._currentStatus = CALL_STATUS.calling;
      getAgoraToken(channelId, this.props.user.id).then(({ data }) => {
        console.log('getAgoraToken ', channelId, data.token)
        this._joinChannel(channelId, data.token);
      })
        .catch(err => {
          this.onError(err);
        })
    }
    else {
      this.onError();
    }
  }

  cancelCall = async () => {
    if (this._channelId) {
      try {
        await this._engine?.leaveChannel();
        await this._engine?.destroy();
      } catch (error) { }
      updateCallChannelStatus(this._channelId, this.props.user.id, CALL_STATUS.canceled);
    }
    this.props.navigation.goBack();
  }

  // incoming
  acceptCall = async () => {
    const { IncomingCallData } = this.state;
    const inititalSuccess = await this._initEngine();
    if (!inititalSuccess) {
      this.props.navigation.goBack();
      return;
    }
    this._joinChannel(IncomingCallData.channel_id, IncomingCallData.agora_token);
  }

  rejectCall = async () => {
    const { IncomingCallData } = this.state;
    try {
      await this._engine?.leaveChannel();
      await this._engine?.destroy();
    } catch (error) { }
    updateCallChannelStatus(IncomingCallData.channel_id, this.props.user.id, CALL_STATUS.rejected);
    this.props.navigation.goBack();
  }

  // joined
  monitorPartnerStatus = (channel_id) => {
    if (channel_id == null || channel_id == '') { return; }

    const { type, OutgoingCallReceiver, IncomingCallData } = this.state;
    if ((type == 'outgoing' && OutgoingCallReceiver.id == null) ||
      (type == 'incoming' && IncomingCallData.caller_id == null)
    ) {
      return;
    }
    if (this.partner_listener) {
      this.partner_listener()
    }
    let partnerId = OutgoingCallReceiver.id;
    if (type == 'incoming') {
      partnerId = IncomingCallData.caller_id;
    }

    this.partner_listener = call_channel_collection.doc(channel_id)
      .onSnapshot((doc) => {
        if (doc.data()) {
          if (this._isMounted) {
            let user_status = doc.data().user_status || {};

            if (user_status[partnerId] == CALL_STATUS.rejected) {
              this.missedCall(1)
            }
            else if (user_status[partnerId] == CALL_STATUS.canceled) {
              this.missedCall(2)
            }
          }
        }
      },
        (error) => {
          console.log('partner_listener error', error)
        });
  }

  monitorMissed = () => {
    setTimeout(async () => {
      if (this.state.type == 'outgoing' && this._currentStatus == CALL_STATUS.calling && this._channelId && this._joinedUsers.length == 0) {
        if (this._isMounted) {
          this.missedCall(3)
        }
      }
    }, 60000) // 1 min : auto missed
  }

  missedCall = async (flag = 3) => {
    const { type, OutgoingCallReceiver, IncomingCallData } = this.state;
    let partner_name = '';
    if (type == 'incoming') {
      partner_name = IncomingCallData.caller_name
    }
    else {
      partner_name = OutgoingCallReceiver.username || OutgoingCallReceiver.full_name
    }

    let message = `${partner_name}`;
    if (flag == 1) { // declined
      message = message + translate('video_call.declined_call');
    }
    else if (flag == 2){ // cancelled
      message = message + translate('video_call.cancelled_call');
    }
    else { // missed
      message = message + translate('video_call.missed_call');
    }

    alerts.info('', message)
      .then((res) => {
      });

    if (this._channelId) {
      if (flag == 3) {
        updateCallChannelStatus(this._channelId, this.props.user.id, CALL_STATUS.missed);
      }
    }
    try {
      await this._engine?.leaveChannel();
      await this._engine?.destroy();
    } catch (error) { }
    this.props.navigation.goBack();
  }

  endCall = async () => {
    if (this._channelId) {
      if (this._call_started_time != null && this._call_started_time > 0) {
        let duration = new Date().getTime() - this._call_started_time;
        if (duration > 0) {
          await updateCallDuration(this._channelId, duration);
        }
      }

      updateCallChannelStatus(this._channelId, this.props.user.id, CALL_STATUS.ended);
      try {
        await this._engine?.leaveChannel();
        await this._engine?.destroy();
      } catch (error) { }
    }
    this.props.navigation.goBack();
  }

  onError = (err) => {
    console.log('on error : ', err);
    this.endCall();
    alerts.error(translate('alerts.error'), translate('video_call.something_is_wrong'))
  }

  getPartnerName = () => {
    const { type, IncomingCallData, OutgoingCallReceiver } = this.state;
    if (type == 'incoming') {
      return IncomingCallData.caller_name;
    }
    else {
      return OutgoingCallReceiver.username || OutgoingCallReceiver.full_name;
    }
  }

  getPartnerPhoto = () => {
    const { type, IncomingCallData, OutgoingCallReceiver } = this.state;
    if (type == 'incoming') {
      return IncomingCallData.caller_photo;
    }
    else {
      return OutgoingCallReceiver.photo;
    }
  }

  render() {
    const { type, isVideoCall, IncomingCallData, OutgoingCallReceiver, channelId, isJoined, remoteUid, switchCamera } = this.state;
    if (isJoined && remoteUid.length > 0) {
      if (isVideoCall) {
        return (
          <View style={styles.container}>
            {this._renderVideo()}
            <CallActionView
              type={'joined'}
              isMuted={this.state.isMuted}
              isVideoOff={this.state.isVideoOff}
              isCameraRear={!switchCamera}
              style={styles.float}
              endCall={this.endCall}
              onMute={this._onMute}
              onChangeCamera={this._switchCamera}
              onVideoOff={this._onVideoOff}
            />
          </View>
        );
      }
      return (
        <View style={styles.audioCallContainer}>
          <CallInfo type={'audio-joined'} full_name={this.getPartnerName()} photo={this.getPartnerPhoto()} />
          <CallActionView type={'audio-joined'}
            isMuted={this.state.isMuted}
            isSpeakerOn={this.state.isSpeakerOn}
            onMute={this._onMute}
            onSpeakerOff={this._onSpeakerOff}
            endCall={this.endCall} />
        </View>
      );
    }
    else {
      if (type == 'incoming') {
        return (
          <View style={[Theme.styles.col_center, styles.incomingContainer]}>
            <CallInfo type={type} isVideoCall={isVideoCall} full_name={this.getPartnerName()} photo={this.getPartnerPhoto()} />
            <CallActionView type={type} acceptCall={this.acceptCall} endCall={this.rejectCall} />
          </View>
        )
      }
      return (
        <View style={[Theme.styles.col_center, styles.incomingContainer]}>
          <CallInfo type={type} isVideoCall={isVideoCall} full_name={this.getPartnerName()} photo={this.getPartnerPhoto()} />
          <CallActionView type={type} endCall={this.cancelCall} />
        </View>
      )
    }
  }

  _renderVideo = () => {
    const { remoteUid, isJoined, isLocalLarge, type, hide_RemoteView } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          activeOpacity={1}
          style={[isLocalLarge ? styles.remote : styles.local, { backgroundColor: '#000' }]}
          onPress={() => {
            if (isLocalLarge) {
              this.setState({ isLocalLarge: !isLocalLarge })
            }
          }}
        >
          {
            !hide_RemoteView &&
            <RtcRemoteView.SurfaceView
              style={{ flex: 1, width: '100%', height: '100%' }}
              channelId={this.state.channelId}
              uid={remoteUid[0]}
              renderMode={isLocalLarge ? VideoRenderMode.Hidden : VideoRenderMode.Hidden}
              zOrderMediaOverlay={isLocalLarge ? true : false}
            />
          }
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          style={[isLocalLarge ? styles.local : styles.remote]}
          onPress={() => {
            if (!isLocalLarge) {
              this.setState({ isLocalLarge: !isLocalLarge })
            }
          }}
        >
          <RtcLocalView.SurfaceView
            style={{ flex: 1, width: '100%', height: '100%' }}
            channelId={this.state.channelId}
            renderMode={isLocalLarge ? VideoRenderMode.Hidden : VideoRenderMode.Hidden}
            zOrderMediaOverlay={isLocalLarge ? false : true}
          />
        </TouchableOpacity>
      </View>
    );
  };

}

const styles = StyleSheet.create({
  incomingContainer: { flex: 1, backgroundColor: Theme.colors.cyan2 },
  container: {
    flex: 1,
  },
  float: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    height: 120,
  },
  top: {
    width: '100%',
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
  },
  local: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width(100),
    height: height(100),
    zIndex: 1
  },
  remote: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 160,
    height: 160,
    zIndex: 10
  },
  audioCallContainer: {
    flex: 1, backgroundColor: '#50b7ed80'
  },
  audioCallInfo: { flex: 1, justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  audioCallName: {
    fontSize: 22, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white
  },
  audioCallTimer: { fontSize: 17, fontFamily: Theme.fonts.medium, color: Theme.colors.white },
});


const mapStateToProps = ({ app, chat }) => ({
  isLoggedIn: app.isLoggedIn,
  language: app.language,
  user: app.user,
});

export default connect(
  mapStateToProps,
  {
    goActiveScreenFromPush
  },
)(VideoCallScreen);