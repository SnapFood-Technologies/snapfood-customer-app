import React from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, View, Text, ScrollView, Image } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { translate } from '../../../common/services/translate';
import alerts from '../../../common/services/alerts';
import apiFactory from '../../../common/services/apiFactory';
import BackButton from "../../../common/components/buttons/back_button";
import TransBtn from '../../../common/components/buttons/trans_button';
import Theme from '../../../theme';
import Config from '../../../config';
import RouteNames from '../../../routes/names';
import RiderAvatar from '../components/RiderAvatar';
import RiderReviewItem from '../components/RiderReviewItem';
import AppText from '../../../common/components/AppText';
import CommentInput from '../../orders/components/CommentInput';

class CourierScreen extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            riderData: {},
            feedbacks: [],
            rating: 0,
            comment: '',
            loading: false,
        };
    }

    componentDidMount() {
        this._isMounted = true

        this.getRiderDetail(this.props.route.params.rider_id)
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    getRiderDetail = async (rider_id) => {
        apiFactory.get(`users/riders/${rider_id}`).then(({ data }) => {
            if (this._isMounted == true) {
                let rating = 0;
                if (data['reviews'] && data['reviews'].length > 0) {
                    data['reviews'].map(r => {
                        rating = rating + r.rating;
                    })
                    rating = rating / data['reviews'].length;
                }
                this.setState({
                    riderData: data['rider'],
                    feedbacks: data['reviews'] || [],
                    comment: data['feedback']?.feedback || '',
                    rating: rating.toFixed(1)
                });
            }
        },
            (error) => {
                console.log('getRiderDetail ', error)
                const message = error.message || translate('generic_error');
                console.log(message);
            });
    }

    addFeedback = async () => {
        if (this.state.comment.trim() == '') { return; }
        this.setState({ loading: true })
        apiFactory.post(`users/riders/add-feedback`, {
            rider_id: this.state.riderData.id,
            feedback: this.state.comment
        }).then(({ data }) => {
            if (this._isMounted == true) {
                this.setState({
                    loading: false
                });
                alerts.info('', translate('rider_profile.feedback_success')).then((res) => {
                    // this.props.navigation.goBack();
                });
            }
        },
            (error) => {
                this.setState({ loading: true })
                console.log(error);
                const message = error.message || translate('generic_error');
                alerts.error(translate('alerts.error'), message);
                if (this._isMounted == true) {
                    this.setState({
                        loading: false
                    });
                }
            });
    }


    renderTitleBar() {
        return (
            <View style={styles.titleContainer}>
                <BackButton iconCenter={true} onPress={() => {
                    this.props.navigation.goBack();
                }} />
                <View style={{ flex: 1 }}>
                </View>
            </View>
        );
    }

    renderRating() {
        return (
            <View style={[Theme.styles.col_center, styles.ratingContainer]}>
                <AppText style={styles.ratingValue}>{this.state.rating}</AppText>
                <AppText style={styles.rating}>{translate('rider_profile.rating')}</AppText>
            </View>
        );
    }

    renderFeedbacks() {
        return (
            <View style={[Theme.styles.col_center, styles.feedbacks]}>
                <AppText style={styles.subjectTitle}>{translate('rider_profile.user_feedback')}</AppText>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ width: '100%', height: 94 }}>
                    {
                        this.state.feedbacks.map((feedback, index) =>
                            <RiderReviewItem key={index} id={feedback.id} data={feedback} />
                        )
                    }
                </ScrollView>
            </View>
        );
    }

    renderAddfeedback() {
        return (
            <View style={[Theme.styles.col_center, styles.addFeedbackContainer]}>
                <AppText style={styles.subjectTitle}>{translate('rider_profile.add_feedback')}</AppText>
                <CommentInput
                    placeholder={translate('rider_profile.add_your_feedback')}
                    comments={this.state.comment}
                    height={120}
                    onChangeText={(text) => {
                        this.setState({ comment: text })
                    }}
                />
                <TransBtn
                    style={{ marginTop: 40 }}
                    disabled={this.state.loading}
                    loading={this.state.loading}
                    btnTxtColor={Theme.colors.black}
                    title={translate('rider_profile.report_issue')}
                    onPress={this.addFeedback}
                />
            </View>
        );
    }

    render() {
        if (this.state.riderData.id == null) {
            return null;
        }
        return (
            <KeyboardAwareScrollView
                style={[{ flex: 1 }, { backgroundColor: '#ffffff' }]}
                extraScrollHeight={65}
                enableOnAndroid={true}
                keyboardShouldPersistTaps='handled'
            >
                <View style={[Theme.styles.col_center, { flex: 1, width: '100%', paddingHorizontal: 20 }]}>
                    {this.renderTitleBar()}
                    <RiderAvatar
                        rider_id={this.state.riderData.id}
                        data={this.state.riderData}
                    />
                    {this.renderRating()}
                    {this.renderFeedbacks()}
                    {this.renderAddfeedback()}
                </View>
            </KeyboardAwareScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: Theme.colors.white,
    },
    titleContainer: {
        width: '100%',
        marginTop: 50,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
    },
    ratingContainer: { marginTop: 16, width: '100%', paddingVertical: 16, borderBottomWidth: 1, borderTopWidth: 1, borderColor: Theme.colors.gray9, },
    ratingValue: { fontSize: 22, lineHeight: 27, fontFamily: Theme.fonts.bold, color: Theme.colors.cyan2 },
    rating: { marginTop: 15, fontSize: 14, lineHeight: 17, fontFamily: Theme.fonts.semiBold, color: '#575966' },
    divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9 },
    subjectTitle: { width: '100%', textAlign: 'left', marginVertical: 16, fontSize: 16, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
    addFeedbackContainer: { marginTop: 16, width: '100%', borderTopWidth: 1, borderColor: Theme.colors.gray9, },
    feedbacks: { width: '100%' },
});

const mapStateToProps = ({ app, chat }) => ({
    user: app.user,
});

export default connect(
    mapStateToProps,
    {},
)(withNavigation(CourierScreen));
