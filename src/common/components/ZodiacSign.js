import React from 'react';
// svgs 
import Svg_aquarius from '../assets/svgs/zodiac/aquarius.svg';
import Svg_aries from '../assets/svgs/zodiac/aries.svg';
import Svg_cancer from '../assets/svgs/zodiac/cancer.svg';
import Svg_capricorn from '../assets/svgs/zodiac/capricorn.svg';
import Svg_gemini from '../assets/svgs/zodiac/gemini.svg';
import Svg_leo from '../assets/svgs/zodiac/leo.svg';
import Svg_libra from '../assets/svgs/zodiac/libra.svg';
import Svg_pisces from '../assets/svgs/zodiac/pisces.svg';
import Svg_sagittarius from '../assets/svgs/zodiac/sagittarius.svg';
import Svg_scorpio from '../assets/svgs/zodiac/scorpio.svg';
import Svg_virgo from '../assets/svgs/zodiac/virgo.svg';
import Svg_taurus from '../assets/svgs/zodiac/taurus.svg';

export const findZodiacSign = (date) => {
	const days = [21, 20, 21, 21, 22, 22, 23, 24, 24, 24, 23, 22];
	const signs = ["aquarius", "pisces", "aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn"];
	const sign_icons = [
		<Svg_aquarius />, <Svg_pisces />, <Svg_aries />, <Svg_taurus />, <Svg_gemini />, <Svg_cancer />,
		<Svg_leo />, <Svg_virgo />, <Svg_libra />, <Svg_scorpio />, <Svg_sagittarius />, <Svg_capricorn />,
	];
	let month = date.getMonth();
	let day = date.getDate();
	if(month == 0 && day <= 20){
	   month = 11;
	}else if(day < days[month]){
	   month--;
	};
  
	return sign_icons[month];
	// return signs[month];
};