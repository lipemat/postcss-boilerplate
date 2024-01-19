const fs = require( 'fs' );

const packageConfig = require( '../helpers/package-config' );

let livereload = true;
// Load local certificates for https if available.
if ( 'object' === typeof ( packageConfig.certificates ) && 'development' === process.env.NODE_ENV ) {
	livereload = {
		cert: fs.readFileSync( packageConfig.certificates.cert ),
		key: fs.readFileSync( packageConfig.certificates.key ),
	};
}

module.exports = {
	postcss: {
		files: [
			`${packageConfig.theme_path}pcss/**/*.{pcss,css}`,
			`${packageConfig.theme_path}template-parts/**/*.{pcss,css}`,
		],
		tasks: [
			'postcss:toCSS',
		],
		options: {
			spawn: false,
			livereload: false,
		},
	},

	php: {
		files: [
			`${packageConfig.theme_path}**/*.php`,
			`!${packageConfig.theme_path}css/**/*.php`,
		],
		options: {
			livereload,
		},
	},
};
