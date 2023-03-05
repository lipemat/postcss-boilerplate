const config = require( '../helpers/package-config' );

/**
 * Entry points to be loaded by Grunt.
 *
 * Checks each provided file for exists and includes if does.
 *
 * @see getEntries
 */
module.exports = {
	main: config.file_name, // Default: "front-end".
	admin: 'admin',
	blocks: 'blocks'
};
