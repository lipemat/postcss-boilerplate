/**
 * Get all configurations for package.json of the project running this.
 */
const path = require( 'path' );
const fs = require( 'fs' );
const workingDirectory = fs.realpathSync( process.cwd() );

let packageConfig = require( path.resolve( workingDirectory, 'package.json' ) );
packageConfig.workingDirectory = workingDirectory;
packageConfig.theme_path = packageConfig.theme_path || "../wp-content/themes/core/";
packageConfig.root = packageConfig.root || "../";
// Could be set to "" which would always test false.
if ( ! packageConfig.hasOwnProperty( 'css_folder' ) ) {
	packageConfig.css_folder = "css/";
}
packageConfig.file_name = packageConfig.file_name || "front-end";
packageConfig.regenerate_revision = packageConfig.regenerate_revision || false;

try {
	let localConfig = require( path.resolve( workingDirectory, './local-config.json' ) );
	packageConfig = { ...packageConfig, ...localConfig }
} catch ( e ) {
}

module.exports = packageConfig;
