import React, { useMemo, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import Theme from '../../../theme';
import { isEmpty, getFirstChar } from '../../../common/services/utility';

const calculate = (contacts) => {
	const CatHeight = 28;
	const ItemHeight = 66;
	let data = {};
	let key = '';
	let offset = 0;
	for (let i = 0; i < contacts.length; i++) {
		if (i == 0 ||
			(
				getFirstChar((contacts[i].username || contacts[i].full_name)) !=
				getFirstChar((contacts[i - 1].username || contacts[i - 1].full_name))
			)
		) {
			key = getFirstChar((contacts[i].username || contacts[i].full_name));
			data[key] = offset;

			offset = offset + CatHeight;
		}
		offset = offset + ItemHeight
	}
	return data;
}


const CharIndexer = ({ contacts, onScroll }) => {
	const data = useMemo(() => calculate(contacts), [contacts]);
	console.log('CharIndexer ', data);
	return (
		Object.keys(data).map(key =>
		<TouchableOpacity key={"CharIndexer_"+ key} style={[Theme.styles.col_center, styles.container]} onPress={() => {
			onScroll(data[key]);
		}}>
			<Text key={key} style={styles.name}>{key}</Text>
		</TouchableOpacity>
		)
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 2,
	},
	name: {
		fontSize: 13,
		color: Theme.colors.cyan2,
		fontFamily: Theme.fonts.semiBold,
		textAlignVertical: 'center',
		marginTop: 4,
	},
});

export default CharIndexer;
