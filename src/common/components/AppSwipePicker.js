import React, { useRef, useState } from 'react';

import PropTypes from 'prop-types';

import { FlatList, Text, StyleSheet, View } from 'react-native'

// import LinearGradient from 'react-native-linear-gradient';

const ListItem = React.memo( ({ label, style, textStyle }) => (
	<View style={ style }>
		<Text style={textStyle}>{ label }</Text>
	</View>
) );

/**
 *
 * @param {Object} props
 *
 * @param {Array} props.items
 * @param {Function} props.onChange
 * @param {Number} [props.initialSelectedIndex]
 * @param {Number} [props.width]
 * @param {Number} [props.height]
 */
const AppSwipePicker = ( { items, onChange, initialSelectedIndex = null, width, height } ) => {
	const [curIndex, setIndex] = useState(initialSelectedIndex + 2)

	let itemHeight = 40;
	let listHeight = 200;

	if ( height ) {
		listHeight = height;
		itemHeight = listHeight / 5;
	}

	const styles = StyleSheet.create( {
		list: {
			height: listHeight,
			width: width
		},
		listItem: {
			height: itemHeight,
			alignItems: 'center',
			justifyContent: 'center',
			fontSize: 18
		},
		pickerGradient: {
			position: 'absolute',
			height: 2 * itemHeight,
			width: '100%'
		},
		topGradient: {
			top: 0,
		},
		bottomGradient: {
			bottom: 0
		}
	} );

	const flatList = useRef( null );

	let extendedItems = [
		{
			value: -11,
			label: ''
		},
		{
			value: -12,
			label: ''
		},
		...items,
		{
			value: -21,
			label: ''
		},
		{
			value: -22,
			label: ''
		} ];

	return (
		<View style={ styles.list } >
			<FlatList
				onMomentumScrollEnd={ ( event ) => {
					let index = Math.round( event.nativeEvent.contentOffset.y / itemHeight );
					onChange( { index, item: items[ index ] } );
					setIndex(index + 2)
				} }
				initialScrollIndex={ initialSelectedIndex }
				ref={ flatList }
				data={ extendedItems.map( item => ( {
					key: item.value.toString(),
					...item
				} ) ) }
				renderItem={ item => (
					<ListItem
						label={ item.item.label }
						style={ styles.listItem } 
						textStyle = {{fontSize: 18, color: curIndex == item.index ? '#4779F1' : '#cccccc'}}
						/>
				 ) }
				getItemLayout={ ( _, index ) => ( { length: itemHeight, offset: index * itemHeight, index } ) }
				snapToInterval={ itemHeight }
				ListEmptyComponent={ () => <Text>No Items</Text> }
			/>
			{/* <LinearGradient
				colors={ [
					'rgba( 255, 255, 255, 1 )',
					'rgba( 255, 255, 255, 0.9 )',
					'rgba( 255, 255, 255, 0.7 )',
					'rgba( 255, 255, 255, 0.5 )'
				] }
				style={ [ styles.pickerGradient, styles.topGradient ] }
				pointerEvents="none"
			/>
			<LinearGradient
				colors={ [
					'rgba( 255, 255, 255, 0.5 )',
					'rgba( 255, 255, 255, 0.7 )',
					'rgba( 255, 255, 255, 0.9 )',
					'rgba( 255, 255, 255, 1 )',
				] }
				style={ [ styles.pickerGradient, styles.bottomGradient ] }
				pointerEvents="none"
			/> */}
		</View>
	)
}

AppSwipePicker.propTypes = {
	items: PropTypes.arrayOf( PropTypes.shape( {
		value: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		label: PropTypes.string
	} ) ),
	onChange: PropTypes.func,
	initialSelectedIndex: PropTypes.number,
	height: PropTypes.number,
	width: PropTypes.number || PropTypes.string
}

export default AppSwipePicker;