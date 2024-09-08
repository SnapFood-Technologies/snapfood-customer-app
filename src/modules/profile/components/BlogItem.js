import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import styles from '../styles/blog';
import FastImage from 'react-native-fast-image';
import Config from '../../../config'
import Theme from '../../../theme'
import { appMoment } from '../../../common/services/translate';
import { isEmpty } from '../../../common/services/utility';

const BlogItem = ({ item, language = 'sq', onPress }) => {

    return <TouchableOpacity style={[Theme.styles.col_center, styles.container]} onPress={onPress} activeOpacity={1}>
        <FastImage
            source={{ uri: Config.IMG_BASE_URL + `${item['image_cover']}` }}
            resizeMode={FastImage.resizeMode.cover}
            style={styles.image} />
        <View style={[Theme.styles.col_center_start, styles.content]}>
            {
                item.categories && <Text style={styles.category}>{item.categories.map(x => (language == 'en' ? x.title : x.sq_title)).join(', ')}</Text>
            }
            <Text style={styles.title} numberOfLines={2} ellipsizeMode={'tail'}>{(language == 'en' && !isEmpty(item.title_en)) ? item.title_en : item.title}</Text>
            <View style={[Theme.styles.row_center, { width: '100%', justifyContent: 'flex-start', }]}>
                <Text style={styles.author}>{item['author']}</Text>
                <View style={{ width: 1, height: 14, marginHorizontal: 5, backgroundColor: Theme.colors.gray5 }} />
                <Text style={styles.date}>
                    {/* {appMoment(item['created_at']).fromNow()} */}
                    {appMoment(item['created_at']).format('DD/MM/YYYY')}
                </Text>
            </View>
        </View>
    </TouchableOpacity>
};

export default BlogItem;
