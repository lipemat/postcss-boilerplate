const packageConfig = require( '../helpers/package-config' );
const minimist = require( 'minimist' );

// Command line arguments.
const flags = minimist( process.argv.slice( 2 ) );

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
			fix: ( flags.fix ?? true ) !== 'false',
		},
		src: [
			`${packageConfig.theme_path}js/src/**/*.{pcss,css}`,
			`${packageConfig.theme_path}pcss/**/*.{pcss,css}`,
			`${packageConfig.theme_path}template-parts/**/*.{pcss,css}`,
		],
	},
};
