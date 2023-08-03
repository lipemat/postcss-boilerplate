const packageConfig = require( './package-config' );
import path from 'path';
import browserslist from 'browserslist';


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
export function getConfig( fileName: string ) {
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
 * - Fallback to WordPress defaults except for "> 1%".
 */
export function getBrowsersList() {
	const projectBrowsersList = browserslist();
	if ( browserslist( browserslist.defaults ) === projectBrowsersList ) {
		const wp = [ ...require( '@wordpress/browserslist-config' ) ];
		wp.push( 'not and_uc 15.5' );
		return wp;
	}
	return projectBrowsersList;
}

/**
 * If browserslist is not specified, we fall back to WordPress defaults.
 *
 * Return false if a browserslist is specified in the current project.
 *
 * @deprecated Use getBrowsersList() instead.
 *
 * @link https://github.com/browserslist/browserslist#config-file
 *
 * @return {false | string[]}
 */
export const getDefaultBrowsersList = () => {
	if ( browserslist( browserslist.defaults ) === browserslist() ) {
		const wp = [ ...require( '@wordpress/browserslist-config' ) ];
		wp.push( 'not and_uc 15.5' );
		return wp;
	}
	return false;
};
