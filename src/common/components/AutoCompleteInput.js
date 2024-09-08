import React, { useEffect, useState } from 'react';
import { TextInput, Text, View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import Autocomplete from 'react-native-autocomplete-input';
import Theme from '../../theme';
import { getTweakSearch } from '../services/utility';

const AutoCompleteInput = (props) => {
	const [visible, SetVisible] = useState(false);

	const renderSuggestionItem = ({ item }) => {
		let cur_value = getTweakSearch(props.value);
		if (item.keyword) {
			const splits = item.keyword.split(cur_value, 1);
			let pre = '';
			let tail = '';
			if (splits.length > 0) {
				pre = splits[0];
				tail = item.keyword.replace(pre + cur_value, '');
			}
			return (
				<TouchableOpacity
					style={[Theme.styles.row_center, styles.suggestedBtn]}
					onPress={() => {
						props.onSelectedText(item.keyword);
					}}
				>
					<Text numberOfLines={1} style={[styles.countTxt]}>
						{item.search_count}
					</Text>
					<Text style={styles.suggestedTxt}>
						{pre}
						<Text style={styles.itemHighlightedText}>{cur_value}</Text>
						{tail}
					</Text>
				</TouchableOpacity>
			);
		}
		return null;
	};

	return (
		<View style={[styles.view, props.style]}>
			<TouchableOpacity style={styles.searchIcon} onPress={() => SetVisible(!visible)}>
				<Feather name={'search'} size={18} color={Theme.colors.gray5} />
			</TouchableOpacity>
			<Autocomplete
				ref={props.setRef}
				{...props}
				inputContainerStyle={[
					styles.inputContainerStyle,
					props.style,
					{
						borderBottomLeftRadius: (props.data || []).length > 0 ? 0 : 12,
						borderBottomRightRadius: (props.data || []).length > 0 ? 0 : 12,
					},
				]}
				style={[
					{
						fontSize: props.fontSize ? props.fontSize : 16,
						fontFamily: props.fontFamily ? props.fontFamily : Theme.fonts.medium,
						marginLeft: !!props.icon ? Theme.sizes.xTiny : 0,
						flex: 1,
						color: Theme.colors.text,
					},
				]}
				placeholderTextColor={Theme.colors.gray5}
				listStyle={styles.listContainerStyle}
				listContainerStyle={[styles.listContainerStyle, { borderWidth: (props.data || []).length > 0 ? 1 : 0 }]}
				flatListProps={{
					style: Platform.OS == 'ios' ? styles.flatListProps : {borderWidth: 0},
					keyboardShouldPersistTaps: 'handled',
					keyExtractor: (_, idx) => idx,
					renderItem: renderSuggestionItem,
				}}
				onSubmitEditing={props.onSubmitEditing}
			/>
			{props.showClearBtn == true && (
				<TouchableOpacity
					style={styles.clearBtn}
					onPress={() => {
						props.onChangeText('');
					}}
				>
					<Icon name={'circle-with-cross'} color={'#878E97'} size={18} />
				</TouchableOpacity>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	searchIcon: { position: 'absolute', left: 10, top: 17 },
	clearBtn: { position: 'absolute', right: 10, top: 17, zIndex: 1 },
	view: {
		position: 'absolute',
		left: 20,
		top: 0,
		flexDirection: 'row',
		justifyContent: 'center',
		alignContent: 'center',
		alignItems: 'center',
	},
	inputContainerStyle: {
		// width: '100%',
		height: 50,
		borderWidth: 1,
		borderColor: '#E9E9F7',
		borderRadius: 12,
		paddingLeft: 30,
		flex: 1,
	},
	flatListProps: {
		borderWidth: 1,
		borderColor: '#E9E9F7',
		borderWidth: 1,
		paddingLeft: 12,
		borderBottomLeftRadius: 12,
		borderBottomRightRadius: 12,
	},
	listContainerStyle: {
		width: '100%',
		backgroundColor: '#fff',
		borderWidth: 1,
		borderBottomLeftRadius: 10,
		borderBottomRightRadius: 10,
		borderColor: Theme.colors.gray6,
	},
	listStyle: { width: '100%', backgroundColor: '#fff' },
	suggestedBtn: { width: '100%', justifyContent: 'flex-start', borderWidth: 0, paddingTop: 6, paddingBottom: 6 },
	countTxt: {
		fontSize: 13,
		textAlign: 'right',
		paddingRight: 10,
		lineHeight: 20,
		paddingTop: 1,
		fontFamily: Theme.fonts.regular,
		color: Theme.colors.text,
	},
	suggestedTxt: { fontSize: 17, lineHeight: 19, fontFamily: Theme.fonts.medium, color: Theme.colors.text },
	itemHighlightedText: { fontFamily: Theme.fonts.bold },
});
export default AutoCompleteInput;
