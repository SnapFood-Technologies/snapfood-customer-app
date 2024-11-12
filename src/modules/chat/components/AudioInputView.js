import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Platform, PermissionsAndroid, } from 'react-native';
import Feather from 'react-native-vector-icons/Feather'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Swiper from 'react-native-swiper' 
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import Theme from "../../../theme";
import {seconds2Time} from "../../../common/services/utility";
import Svg_send from '../../../common/assets/svgs/msg/send.svg'

export default AudioInputView = ({ onRemove, onSend }) => {

  const audioPath = AudioUtils.DocumentDirectoryPath + '/tmp.aac'; 
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [stoppedRecording, setStopped] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  
  const statusRef = useRef('cancel');

  const [currentTime, setTime] = useState(0);
  const curTimeRef = useRef(currentTime); 
  const setCurrentTime = time => {
    curTimeRef.current = time
    setTime(time)
  };
   
  useEffect(() => {
    AudioRecorder.requestAuthorization().then((isAuthorised) => {
      setHasPermission(isAuthorised);
      if (!isAuthorised) return;

      prepareRecordingPath(audioPath);

      AudioRecorder.onProgress = (data) => {
        setCurrentTime(Math.floor(data.currentTime)) 
      };

      AudioRecorder.onFinished = (data) => { 
        _finishRecording(data.status === "OK", data.audioFileURL, data.base64.length, data.base64);
        // Android callback comes in the form of a promise instead.
        // if (Platform.OS === 'ios') {
        //   _finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
        // }
      };

      _record();
    }); 

  }, [])

  const prepareRecordingPath = (audioPath) => {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "Low",
      AudioEncoding: "aac",
      AudioEncodingBitRate: 32000,
      IncludeBase64 : true
    });
  }

  const _finishRecording = (didSucceed, filePath, fileSize, base64) => {
    setFinished(didSucceed); 
    if(statusRef.current != 'cancel' && didSucceed == true) {
      
      onSend(curTimeRef.current, fileSize, base64)
    }
    if(statusRef.current == 'cancel') {
      onRemove()
    }
  }

  const _pause = async()=>{
    if (!recording) {
      console.warn('Can\'t pause, not recording!');
      return;
    }

    try {
      const filePath = await AudioRecorder.pauseRecording();
      setPaused(true); 
    }
    catch (error) {
      console.error(error);
    }
  }

  const _resume = async()=> {
    if (!paused) {
      console.warn('Can\'t resume, not paused!');
      return;
    }

    try {
      await AudioRecorder.resumeRecording();
      setPaused(false);  
    } catch (error) {
      console.error(error);
    }
  }

  const _stop = async()=> {
    if (!recording) {
      console.warn('Can\'t stop, not recording!');
      return;
    }

    setStopped(true);
    setRecording(false);
    setPaused(false); 

    try {
      const filePath = await AudioRecorder.stopRecording();

      // if (Platform.OS === 'android') {
      //   _finishRecording(true, filePath);
      // }
      return filePath;
    } catch (error) { 
      console.error(error);
    }
    return;
  }

  const _record = async()=>  {
    if (recording) {
      console.warn('Already recording!');
      return;
    }
 
    // if (!hasPermission) {
    //   console.warn('Can\'t record, no permission granted!');
    //   return;
    // }

    if(stoppedRecording){
      prepareRecordingPath(audioPath);
    }

    setRecording(true);
    setPaused(false); 

    try {
      const filePath = await AudioRecorder.startRecording();
    } catch (error) {
      console.error(error);
    }
  }
 
  const onPressCancel=async()=>{
    statusRef.current = 'cancel'; 
    let filePath = await _stop();  
  }

  const onPressSend= async()=>{ 
    statusRef.current = 'send'; 
    let filePath = await _stop(); 
  }

  return <View style={[Theme.styles.row_center, {
    width: '100%', height: 91, backgroundColor: Theme.colors.gray8,
    paddingHorizontal: 20,
    paddingVertical: 20,
  }]}>
    <Swiper onIndexChanged={(index) => {
      if (index == 1) {
        onPressCancel()
      }
    }} loop={false} index={0} showsPagination={false}>
      <View style={[Theme.styles.row_center, { flex: 1, alignItems: 'center' }]}>
        <MaterialIcons name="keyboard-voice" size={30} color={Theme.colors.red1} />
        <Text style={styles.elapsedtime}>{seconds2Time(currentTime)}</Text>
        <Text style={styles.cancelTxt}>Slide to cancel</Text>
        <Feather name="chevron-left" size={22} color={Theme.colors.cyan2} />
      </View>
      <View style={[Theme.styles.row_center, { flex: 1, }]}>
      </View>
    </Swiper>
    <TouchableOpacity style={{ marginLeft: 20 }} onPress={onPressSend}>
      <Svg_send />
    </TouchableOpacity>
  </View>
}

const styles = StyleSheet.create({
  elapsedtime: { marginLeft: 16, flex: 1, fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
  cancelTxt: { marginRight: 5, fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },
});
