// app
angular
	.module('MyApp', ['ngMaterial', 'ngMdWidgetEngine'])
	.config(function($mdThemingProvider, $mdIconProvider){
		$mdThemingProvider.definePalette('aswat', {
			'50': '#faeef5',
			'100': '#e9b3d2',
			'200': '#dc87b8',
			'300': '#cc5097',
			'400': '#c53988',
			'500': '#ad3278',
			'600': '#952b68',
			'700': '#7d2457',
			'800': '#661d47',
			'900': '#4e1736',
			'A100': '#faeef5',
			'A200': '#e9b3d2',
			'A400': '#c53988',
			'A700': '#7d2457',
			'contrastDefaultColor': 'light',
			'contrastDarkColors': '50 100 200 A100 A200'
		});

		$mdThemingProvider.theme('default').primaryPalette('aswat');
	});