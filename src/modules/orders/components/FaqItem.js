import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import HTML from 'react-native-render-html';
import AppText from '../../../common/components/AppText';
import Theme from '../../../theme';

const FaqItem = ({ data, onSelect, style }) => {
	const [isOpened, setOpen] = useState(false);

	return <TouchableOpacity
		style={[Theme.styles.col_center, styles.itemView, style]}
		onPress={() => {
			setOpen(!isOpened)
			onSelect(!isOpened)
		}}
	>
		<AppText style={[styles.itemTxt]}>{data.question}</AppText>
		{
			isOpened &&
			<View style={{width: '100%'}}>
				<HTML
					html={data.answer}
					tagsStyles={{
						p: {
							marginTop: 12,
							fontSize : 16,
							lineHeight : 20,
							fontFamily: Theme.fonts.medium,
							color : Theme.colors.text
						}
					}}
				/>
			</View>
		}
	</TouchableOpacity>;
};

const styles = StyleSheet.create({
	itemView: { marginBottom: 15, width: '100%', padding: 18, backgroundColor: Theme.colors.gray8, borderRadius: 15, },
	itemTxt: { width: '100%', textAlign: 'left', fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
})

export default FaqItem;
