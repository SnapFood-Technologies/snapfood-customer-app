import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Platform } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Modal from 'react-native-modal';
import { connect } from 'react-redux';
import { AppText, MainBtn } from '..';
import Theme from "../../../theme";
import { translate } from '../../../common/services/translate'
import { ScrollView } from 'react-native-gesture-handler';
import { height } from 'react-native-dimension';

const ReportTagsModal = ({ selectedTag, tags = [], showModal, onSelect, onClose }) => {
    const [visible, SetVisible] = useState(showModal)

    useEffect(() => {
        SetVisible(showModal)
    }, [showModal])

    return <Modal
        isVisible={visible}
        backdropOpacity={0.33}
        onSwipeComplete={() => onClose()}
        onBackdropPress={() => onClose()}
        swipeDirection={['down']}
        style={{ justifyContent: 'flex-end', margin: 0 }}
    >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <View style={[Theme.styles.row_center, { marginBottom: 20, width: '100%', paddingHorizontal: 20, }]}>
                <AppText style={styles.modalTitle}>{translate('report.choose_type_problem')}</AppText>
                <TouchableOpacity style={{ marginLeft: 8, position: 'absolute', right: 20, top: 0 }} onPress={onClose}>
                    <AntDesign name='close' size={24} color={Theme.colors.gray7} />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollview}>
                {
                    tags.map((tag, index) =>
                        <>
                            <TouchableOpacity
                                key={index}
                                onPress={() => onSelect(tag)}
                                style={[Theme.styles.row_center, { width: '100%', marginBottom: 16, paddingTop: 16 }]}
                            >
                                <Text style={[styles.langtxt, (selectedTag != null && selectedTag.id == tag.id) && { color: Theme.colors.cyan2 }]}>{tag.title}</Text>
                                <View style={{ flex: 1 }} />
                                {
                                    (selectedTag != null && selectedTag.id == tag.id) &&
                                    <AntDesign name='check' size={24} color={Theme.colors.cyan2} />
                                }
                            </TouchableOpacity>
                            {
                                (index < tags.length - 1) && <View  key={index + 'key'} style={styles.divider} />
                            }
                        </>
                    )
                }
                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    modalContent: { width: '100%', paddingBottom: 30, paddingTop: 30, backgroundColor: Theme.colors.white, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
    modalTitle: { fontSize: 20, lineHeight: 23, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    header: { width: '100%' },
    scrollview: { maxHeight: height(42), width: '100%', paddingHorizontal: 20, },
    langtxt: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
    divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray6 },
});

export default ReportTagsModal