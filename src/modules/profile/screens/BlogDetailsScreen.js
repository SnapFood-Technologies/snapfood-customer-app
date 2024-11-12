import React from 'react';
import { BackHandler, Dimensions, ScrollView, Share, TouchableOpacity, View } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import { connect } from 'react-redux';
import { appMoment, getLanguage, translate } from '../../../common/services/translate';
import AppText from '../../../common/components/AppText';
import apiFactory from '../../../common/services/apiFactory';
import FastImage from 'react-native-fast-image';
import styles from '../styles/blog';
import HTML from 'react-native-render-html';
import { goActiveScreenFromPush } from '../../../store/actions/app';
import { isEmpty, openExternalUrl } from '../../../common/services/utility';
import BlockSpinner from '../../../common/components/BlockSpinner';
import Theme from '../../../theme';
import { RoundIconBtn } from '../../../common/components';
import Config from '../../../config';

const handleBackPress = (navigation) => {
	navigation.pop(1);
	return true;
};

class BlogDetailsScreen extends React.Component {
	_isMounted = true;
	constructor(props) {
		super(props);

		const blog = props.route.params.blog || {};

		this.state = {
			language: getLanguage(),
			blog,
		};
	}

	async componentDidMount() {
		this._isMounted = true;
		this.props.goActiveScreenFromPush({
			isBlogVisible: false,
		});
		const blog = await apiFactory.get(`blogs/${this.state.blog.id}`);
		if (blog.data.blog && this._isMounted == true) {
			this.setState({ blog: blog.data.blog });
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	onShare = async () => {
		const blog = this.props.route.params.blog || {};
		const url = `${Config.WEB_PAGE_URL}blogs/${blog['hash_id']}/${blog['slug']}`;
		const shareOptions = {
			title: 'Snapfood Blog',
			message: Platform.OS === 'android' ? url : '',
			url: url,
			subject: 'Link for Snapfood',
		};
		await Share.share(shareOptions);
	};

	parseStyles = (styles) => {
		const results = {
			width: Dimensions.get('screen').width,
			height: 200,
		};
		// if (styles) {
		// 	styles?.split(';').map((style) => {
		// 		const p = style.replace(' ', '').replace('px', '').split(':');
		// 		if (['height', 'width'].indexOf(p[0]) !== -1) {
		// 			results[p[0]] = parseInt(p[1]);
		// 		}
		// 	});
		// }
		const screenWidth = Dimensions.get('screen').width - 30;
		const diff = results.width / screenWidth;
		results.width = screenWidth;
		results.height = results.height / diff;
		return results;
	};

	parseTags = () => {
		return {
			img: (props) => {
				return (
					<FastImage
						key={props.src}
						source={{ uri: props.src }}
						resizeMode={FastImage.resizeMode.contain}
						style={this.parseStyles(props.style)}
					/>
				);
			},
		};
	};

	renderHeader = () => {
		return (
			<View style={[Theme.styles.row_center, styles.header]}>
				<RoundIconBtn
					style={styles.headerBtn}
					icon={<Feather name='chevron-left' size={22} color={Theme.colors.text} />}
					onPress={() => {
						this.props.navigation.goBack();
					}}
				/>
				<AppText style={[Theme.styles.headerTitle, { flex: 1, color: Theme.colors.white }]}>Blog</AppText>
				<View style={[Theme.styles.row_center_end]}>
					<RoundIconBtn
						style={styles.headerBtn}
						icon={<Entypo name='share' size={20} color={Theme.colors.text} />}
						onPress={this.onShare}
					/>
				</View>
			</View>
		);
	};

	render() {
		const { blog } = this.state;
		console.log('blog.content_en', blog.content_en);

		if (!blog.title) {
			return <BlockSpinner />;
		}

		return (
			<View style={{ flex: 1, backgroundColor: Theme.colors.white }}>
				<ScrollView style={{ flex: 1, width: '100%' }} showsVerticalScrollIndicator={false}>
					<View style={styles.detail_image}>
						<FastImage
							source={{ uri: `https://snapfoodal.imgix.net/${blog['image_cover']}` }}
							resizeMode={FastImage.resizeMode.cover}
							style={styles.detail_image}
						/>
						{this.renderHeader()}
					</View>
					<View style={{ width: '100%', paddingTop: 12, paddingBottom: 30, paddingHorizontal: 20 }}>
						<View style={styles.rowFlex}>
							<AppText style={styles.categoryDetails}>
								{blog.categories
									.map((x) => (this.props.language == 'en' ? x.title : x.sq_title))
									.join(', ')}
							</AppText>
							<AppText style={styles.date}>{appMoment(blog['created_at']).format('DD/MM/YYYY')}</AppText>
						</View>
						<AppText style={styles.titleDetails}>
							{this.props.language == 'en' && !isEmpty(blog.title_en) ? blog.title_en : blog.title}
						</AppText>
						<View style={styles.rowFlex}>
							<AppText style={styles.date}>{translate('blog.author')}:</AppText>
							<AppText style={styles.authorDetails}>{blog['author']}</AppText>
						</View>
						<View style={{ height: 8 }} />
						<HTML
							source={{
								html:
									this.props.language == 'en' && !isEmpty(blog.content_en)
										? blog.content_en
										: blog.content,
							}}
							// renderers={this.parseTags()}
							imagesMaxWidth={Dimensions.get('window').width}
							onLinkPress={(event, href) => openExternalUrl(href)}
							baseFontStyle={{ fontSize: 16 }}
						/>
					</View>
				</ScrollView>
			</View>
		);
	}
}

const mapStateToProps = ({ app }) => ({
	language: app.language,
});

export default connect(mapStateToProps, {
	goActiveScreenFromPush,
})(BlogDetailsScreen);
