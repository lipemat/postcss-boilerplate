const packageConfig = require( './package-config' );
const path = require( 'path' );


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
		let localConfig = require( path.resolve( packageConfig.workingDirectory + '/config', fileName ) );
		config = {...config, ...localConfig};
	} catch ( e ) {
	}
	return config;
}

module.exports = {
	getConfig: getConfig
};
