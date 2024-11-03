import React from 'react';
import { TouchableOpacity, Text, StatusBar, Platform, View, StyleSheet } from 'react-native';
import { width } from 'react-native-dimension';
import Entypo from 'react-native-vector-icons/Entypo';
import Tooltip from 'react-native-walkthrough-tooltip';
import FastImage from 'react-native-fast-image';
import { getImageFullURL, isEmpty } from '../../../common/services/utility';
import Theme from '../../../theme';
import { AppText, AppBadge, RoundIconBtn } from '../../../common/components';
import Switch from '../components/Switch';

const MIN_W = 386;
const HomeHeader = ({
	language,
	curTab,
	coordinates,
	isLoggedIn,
	cashback_amount,
	photo,
	locationTooltipMsg,
	onClearLocationTooltip,
	onLocationSetup,
	onGoWallet,
	onGoProfile,
	onTabChange,
}) => {
	return (
		<View style={[Theme.styles.row_center, styles.header, { marginTop: isLoggedIn ? 2 : 43 }]}>
			<Switch
				items={['Vendors', 'Grocery']}
				cur_item={curTab}
				btnWidth={125}
				textStyle={language == 'en' ? { fontSize: 20, lineHeight: 22 } : { fontSize: 20, lineHeight: 22 }}
				onSelect={(item) => {
					onTabChange(item);
				}}
			/>
			<View style={[Theme.styles.row_center_end, { flex: 1, alignItems: 'flex-end' }]}>
				<Tooltip
					isVisible={isEmpty(locationTooltipMsg) == false}
					backgroundColor={'transparent'}
					content={
						<View style={styles.tooltip}>
							<AppText
								style={{
									fontSize: 14,
									lineHeight: 22,
									fontFamily: Theme.fonts.semiBold,
									color: '#FFF',
								}}
							>
								{locationTooltipMsg}
							</AppText>
						</View>
					}
					placement={'bottom'}
					tooltipStyle={{ backgroundColor: 'transparent' }}
					topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
					contentStyle={{ backgroundColor: Theme.colors.cyan2 }}
					// arrowStyle={[{ elevation: 8, marginTop: -2, },]}
					showChildInTooltip={false}
					disableShadow={false}
					onClose={() => {
						onClearLocationTooltip();
					}}
				>
					<RoundIconBtn
						style={{ width: 42, height: 42 }}
						icon={<Entypo name='location-pin' size={26} color={Theme.colors.cyan2} />}
						onPress={() => onLocationSetup(coordinates)}
					/>
				</Tooltip>
				{isLoggedIn && width(100) >= MIN_W && (
					<View style={{ width: 48, height: 48, marginLeft: 10, justifyContent: 'flex-end' }}>
						<RoundIconBtn
							style={{ width: 42, height: 42 }}
							icon={<Entypo name='wallet' size={26} color={Theme.colors.cyan2} />}
							onPress={() => {
								onGoWallet();
							}}
						/>
						<AppBadge value={cashback_amount || 0} style={{ position: 'absolute', top: 0, right: 0 }} />
					</View>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	header: { height: 50, width: '100%', marginTop: 43, alignItems: 'flex-end' },
	profileBtn: { marginLeft: 10, marginBottom: 2 },
});

function arePropsEqual(prevProps, nextProps) {
	if (
		prevProps.isLoggedIn != nextProps.isLoggedIn ||
		prevProps.photo != nextProps.photo ||
		prevProps.curTab != nextProps.curTab ||
		prevProps.language != nextProps.language ||
		prevProps.cashback_amount != nextProps.cashback_amount ||
		prevProps.locationTooltipMsg != nextProps.locationTooltipMsg ||
		prevProps.coordinates.latitude != nextProps.coordinates.latitude ||
		prevProps.coordinates.longitude != nextProps.coordinates.longitude
	) {
		return false;
	}
	return true;
}

export default React.memo(HomeHeader, arePropsEqual);
