import React from 'react';
import { Text, View, Platform, Alert, TouchableOpacity, } from 'react-native';
import Sound from 'react-native-sound';
// import { AudioRecorder } from 'react-native-audio';
import { width, height } from 'react-native-dimension'
import Theme from '../../../theme';
import Slider from "react-native-sliders";
import { seconds2Time } from '../../../common/services/utility';
// svgs
import Svg_play from '../../../common/assets/svgs/msg/play.svg';
import Svg_pause from '../../../common/assets/svgs/msg/pause.svg';
import Svg_play_gray from '../../../common/assets/svgs/msg/play_gray.svg';
import Svg_pause_gray from '../../../common/assets/svgs/msg/pause_gray.svg';

const MAX_CONTENT_WIDTH = width(100) - 130


export default class AudioMsgItem extends React.Component {

    constructor() {
        super();
        this.state = {
            playState: 'paused', //playing, paused
            playSeconds: 0,
            duration: 0
        }
        this.sliderEditing = false;
    }

    componentDidMount() { 
        // this.play();
        this.timeout = setInterval(() => {
            if (this.sound && this.sound.isLoaded() && this.state.playState == 'playing' && !this.sliderEditing) {
                this.sound.getCurrentTime((seconds, isPlaying) => {
                    this.setState({ playSeconds: seconds });
                })
            }
        }, 100);
    }
    componentWillUnmount() {
        if (this.sound) {
            this.sound.release();
            this.sound = null;
        }
        if (this.timeout) {
            clearInterval(this.timeout);
        }
    }

    onSliderEditStart = () => {
        this.sliderEditing = true;
    }
    onSliderEditEnd = () => {
        this.sliderEditing = false;
    }
    onSliderEditing = value => {
        if(value.constructor === Array) {
            value = value[0];
        }
        if (this.sound) {
            this.sound.setCurrentTime(value);
            this.setState({ playSeconds: value });
        }
    }

    play = async () => {
        if(this.props.audio.duration <= 0) { return }
        if (this.sound) {
            this.sound.play(this.playComplete);
            this.setState({ playState: 'playing' });
        } else {
            const filepath = this.props.audio.url;
            var dirpath = '';
            if (this.props.dirpath) {
                dirpath = this.props.dirpath;
            }
            console.log('[Play]', filepath);
            Sound.setCategory('Playback');
            this.sound = new Sound(filepath, null, (error) => {
                if (error) {
                    console.log('failed to load the sound', error);
                    // Alert.alert('Notice', 'audio file error. (Error code : 1)');
                    this.setState({ playState: 'paused' });
                } else {
                    this.setState({ playState: 'playing', duration: this.sound.getDuration() });
                    this.sound.play(this.playComplete);
                }
            });
        }
    }
    playComplete = (success) => {
        if (this.sound) {
            if (success) {
                console.log('successfully finished playing');
            } else {
                console.log('playback failed due to audio decoding errors');
                // Alert.alert('Notice', 'audio file error. (Error code : 2)');
            }
            this.setState({ playState: 'paused', playSeconds: 0 });
            this.sound.setCurrentTime(0);
        }
    }

    pause = () => {
        if (this.sound) {
            this.sound.pause();
        }

        this.setState({ playState: 'paused' });
    }

    jumpPrev15Seconds = () => { this.jumpSeconds(-15); }
    jumpNext15Seconds = () => { this.jumpSeconds(15); }
    jumpSeconds = (secsDelta) => {
        if (this.sound) {
            this.sound.getCurrentTime((secs, isPlaying) => {
                let nextSecs = secs + secsDelta;
                if (nextSecs < 0) nextSecs = 0;
                else if (nextSecs > this.state.duration) nextSecs = this.state.duration;
                this.sound.setCurrentTime(nextSecs);
                this.setState({ playSeconds: nextSecs });
            })
        }
    }

    render() {
        return (
            <View style={[Theme.styles.row_center, { width: MAX_CONTENT_WIDTH }]}>
                {this.state.playState == 'playing' &&
                    <TouchableOpacity onPress={this.pause}>
                        {this.props.position == 'left' ? <Svg_pause_gray /> : <Svg_pause /> }
                    </TouchableOpacity>
                }
                {this.state.playState == 'paused' &&
                    <TouchableOpacity onPress={this.play}> 
                        {this.props.position == 'left' ? <Svg_play_gray /> : <Svg_play /> }
                    </TouchableOpacity>
                }
                <View style={[Theme.styles.col_center, { flex: 1, marginLeft: 12, }]}>
                    <Slider
                        minimumValue={0}
                        maximumValue={this.props.audio.duration}
                        step={1}
                        value={this.state.playSeconds}
                        onValueChange={this.onSliderEditing}
                        onSlidingStart={this.onSliderEditStart}
                        onSlidingComplete={this.onSliderEditEnd}
                        trackStyle={{ backgroundColor: (this.props.position == 'left' ? Theme.colors.gray5 : Theme.colors.gray8), height: 2 }}
                        thumbStyle={{ width: 18, height: 18, borderRadius: 15, backgroundColor: Theme.colors.gray1 }}
                        style={{ width: '100%', marginHorizontal: 11 }}
                    />
                    <View style={[Theme.styles.row_center,]}>
                        <Text style={{ fontSize: 14, fontFamily: Theme.fonts.semiBold, color: (this.props.position == 'left' ? Theme.colors.gray1 : Theme.colors.white) }}>
                            {seconds2Time(this.state.playSeconds) + ' / '}
                        </Text>
                        <Text style={{ fontSize: 14, fontFamily: Theme.fonts.semiBold, color: (this.props.position == 'left' ? Theme.colors.gray1 : Theme.colors.white) }}>
                            {seconds2Time(this.props.audio.duration)}
                        </Text>
                    </View>
                </View>
            </View>
        )
    }
}