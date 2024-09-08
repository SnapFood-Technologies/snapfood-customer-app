import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Platform } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Modal from 'react-native-modal';
import { connect } from 'react-redux';
import { AppText, MainBtn } from '..';
import { KEYS, setStorageKey } from '../../services/storage';
import Theme from "../../../theme";
import { translate } from '../../../common/services/translate'
import { setShowWhereHeardFeedbackModal } from '../../../store/actions/app';
import CommentInput from '../../../modules/orders/components/CommentInput';
import RadioBtn from '../buttons/radiobtn';
import apiFactory from '../../../common/services/apiFactory';

const WhereHeardFeedbackModal = (props) => {
    const [comment, setComment] = useState('')
    const [selectedTag, setSelectedTag] = useState(null)

    useEffect(() => {
        if (props.feedback_where_tags && props.feedback_where_tags.length > 0) {
            setSelectedTag(props.feedback_where_tags[0]);
        }
    }, [props.feedback_where_tags])

    const onClose = () => {
        props.setShowWhereHeardFeedbackModal(false);
    }

    const onSubmit = () => {
        if (selectedTag == null) { return }
        props.setShowWhereHeardFeedbackModal(false);
        apiFactory
            .post(`feedback/add-feedback`, {
                tag: (props.language == 'en' ? selectedTag.tag_en : selectedTag.tag_sq),
                comment: comment,
            })
            .then(
                (res) => { },
                (error) => {
                    console.log('onSubmit ', error)
                }
            );
    }

    return <Modal
        isVisible={props.show_feedback_where_heard_modal == true}
        backdropOpacity={0.33}
        onSwipeComplete={() => onClose()}
        onBackdropPress={() => onClose()}
        swipeDirection={['down']}
        style={{ justifyContent: 'flex-end', margin: 0 }}
    >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <View style={[Theme.styles.row_center, { marginBottom: 20, width: '100%' }]}>
                <AppText style={styles.modalTitle}>{translate('feedback.where_heard')}</AppText>
                <TouchableOpacity style={{ marginLeft: 8, position: 'absolute', right: 0, top: 0 }} onPress={onClose}>
                    <AntDesign name='close' size={24} color={Theme.colors.gray7} />
                </TouchableOpacity>
            </View>
            {
                props.feedback_where_tags.map((tag, index) =>
                    <>
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedTag(tag)}
                            style={[Theme.styles.row_center, { width: '100%', marginBottom: 16, paddingTop: 16 }]}
                        >
                            <Text style={[styles.langtxt]}>{
                                props.language == 'en' ? tag.tag_en : (props.language == 'it' ? tag.tag_it : tag.tag_sq)
                            }</Text>
                            <View style={{ flex: 1 }} />
                            <RadioBtn onPress={() => setSelectedTag(tag)} checked={selectedTag != null && selectedTag.id == tag.id} />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                    </>
                )
            }
            <View style={{ height: 20 }} />
            <MainBtn disabled={selectedTag == null} title={translate('feedback.submit')} style={{ width: '100%', marginTop: 20 }} onPress={onSubmit} />
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    modalContent: { width: '100%', paddingHorizontal: 20, paddingBottom: 30, paddingTop: 30, backgroundColor: Theme.colors.white, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
    modalTitle: { fontSize: 20, lineHeight: 23, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    header: { width: '100%' },
    divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray6 },
});

const mapStateToProps = ({ app }) => ({
    language: app.language,
    show_feedback_where_heard_modal: app.show_feedback_where_heard_modal,
    feedback_where_tags: app.feedback_where_tags
});

export default connect(mapStateToProps, {
    setShowWhereHeardFeedbackModal
})(WhereHeardFeedbackModal);