const config = require( '../helpers/package-config' );

/**
 * Compress files using Brotli.
 *
 * Generates .br versions of the .min files if the package.json
 * has `brotliFiles` set to `true`.
 */
module.exports = {
	brotli: {
		options: {
			mode: 'brotli',
		},
		expand: true,
		cwd: config.css_folder,
		dest: config.css_folder,
		extDot: 'last',
		src: [ '**/*.min.css' ],
		ext: '.css.br'
	}
};
