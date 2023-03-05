const config = require( './package-config' );
const fs = require( 'fs' );
const path = require( 'path' );
const {getConfig} = require( './config' );

const entries = getConfig( 'postcss-entries.js' );


/**
 * Entry points to be loaded by Grunt.
 *
 * Checks each provided file for exists and includes if it does.
 *
 * @see config/postcss-entries.js
 */
function getEntries() {
	const matches = {
		min: {},
		toCSS: {}
	};

	Object.values( entries ).forEach( possibleFile => {
		const filePath = config.theme_path + 'pcss/' + possibleFile;
		if ( fs.existsSync( path.resolve( filePath + '.pcss' ) ) ) {
			matches.toCSS[ config.css_folder + possibleFile + '.css' ] = config.theme_path + `pcss/${possibleFile}.pcss`;
			matches.min[ config.css_folder + possibleFile + '.min.css' ] = config.theme_path + `pcss/${possibleFile}.pcss`;
		}
	} );
	return matches;
}

module.exports = {
	getEntries,
};
