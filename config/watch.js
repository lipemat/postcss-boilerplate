const packageConfig = require( '../helpers/package-config' );
const fs = require( "fs" );
let livereload = true;
// Load local certificates for https if available.
if ( 'object' === typeof ( packageConfig.certificates ) ) {
	livereload =  {
		cert: fs.readFileSync( packageConfig.certificates.cert ),
		key: fs.readFileSync( packageConfig.certificates.key ),
	}
}

module.exports = {
	postcss: {
		files: [
			'<%= pkg.theme_path %>pcss/**/*.{pcss,css}',
			'<%= pkg.theme_path %>template-parts/**/*.{pcss,css}'
		],
		tasks: [
			'postcss:toCSS'
		],
		options: {
			spawn: false,
			livereload: false
		}
	},

	php: {
		files: ['<%= pkg.theme_path %>**/*.php'],
		options: {
			livereload,
		}
	},
};
