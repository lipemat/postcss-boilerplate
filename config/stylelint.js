const packageConfig = require( '../helpers/package-config' );

module.exports = {
	theme: {
		options: {
			cache: true,
			cacheStrategy: 'content',
			configFile: `${packageConfig.theme_path}.stylelintrc`,
			formatter: 'string',
			ignoreDisables: false,
			failOnError: true,
			outputFile: '',
			reportNeedlessDisables: false,
			syntax: '',
			fix: true,
		},
		src: [
			`${packageConfig.theme_path}js/src/**/*.{pcss,css}`,
			`${packageConfig.theme_path}pcss/**/*.{pcss,css}`,
			`${packageConfig.theme_path}template-parts/**/*.{pcss,css}`,
		],
	},
};
