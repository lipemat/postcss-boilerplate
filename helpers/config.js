const packageConfig = require( './package-config' );
const path = require( 'path' );
const browserslist = require( 'browserslist' );


/**
 * Get a config for our /config directory merged with any
 * matching configuration from the project directory.
 *
 * For instance if we have a file named config/babel.config.js in our project
 * we will merge the contents with our config/babel.config.js in favor of whatever
 * is specified with the project's file.
 *
 * @param {String} fileName
 * @returns {object}
 */
function getConfig( fileName ) {
	let config = require( '../config/' + fileName );
	try {
		const localConfig = require( path.resolve( packageConfig.workingDirectory + '/config', fileName ) );
		if ( 'function' === typeof localConfig ) {
			config = {...config, ...localConfig( config )};
		} else {
			config = {...config, ...localConfig};
		}
	} catch ( e ) {
	}
	return config;
}

/**
 * Get the browserslist from the current project.
 *
 * - If specified using standard browserslist config, we will use that.
 *
 *  @link https://github.com/browserslist/browserslist#config-file
 */
function getBrowsersList() {
	const projectBrowsersList = browserslist();
	if ( browserslist( browserslist.defaults ) === projectBrowsersList ) {
		return require( '@wordpress/browserslist-config' );
	}
	return projectBrowsersList;
}


/**
 * If browserslist is not specified, we fall back to WordPress defaults.
 *
 * - Return the default browserslist if the current project does not specify one.
 * - Return false if a browserslist is specified.
 *
 * Used in cases where we can fall back to standard browserslist config if the project
 * has not specified one.
 *
 * @deprecated
 *
 * @link https://github.com/browserslist/browserslist#config-file
 */
const getDefaultBrowsersList = () => {
	if ( browserslist( browserslist.defaults ) === browserslist() ) {
		return require( '@wordpress/browserslist-config' );
	}
	return false;
};

module.exports = {
	getBrowsersList,
	getDefaultBrowsersList,
	getConfig,
};
