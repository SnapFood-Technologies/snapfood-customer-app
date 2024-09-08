import React from 'react';
import { View, StatusBar, SafeAreaView } from 'react-native'; 
import useStatusBarHeight from '../../../../../common/components/useStatusBarHeight';


const MyStatusBar = ({ backgroundColor, ...props }) => {
	const statusHeight = useStatusBarHeight();
    return (
	<View style={[{height:statusHeight}, { backgroundColor }]}>
		<SafeAreaView>
			<StatusBar translucent backgroundColor={backgroundColor}  {...props} />
		</SafeAreaView>
	</View>
)
    }

const DarkStatusBar = () => {
    return (
		<View style={{ width :'100%'}}>
			<MyStatusBar backgroundColor='#000' barStyle='light-content' />
		</View>
	);
};

export default DarkStatusBar;
