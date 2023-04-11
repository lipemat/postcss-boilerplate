/**
 * Get all configurations for package.json of the project running this.
 */
const path = require( 'path' );
const fs = require( 'fs' );
const workingDirectory = fs.realpathSync( process.cwd() );

let packageConfig = require( path.resolve( workingDirectory, 'package.json' ) );
packageConfig.workingDirectory = workingDirectory;
packageConfig.theme_path ||= "./";
// Could be set to "" which would always test false.
if ( ! packageConfig.hasOwnProperty( 'css_folder' ) ) {
	packageConfig.css_folder = "css/";
}
packageConfig.combinedJson ||= false;
packageConfig.file_name ||= "front-end";
packageConfig.shortCssClasses ||= false;

try {
	let localConfig = require( path.resolve( workingDirectory, './local-config.json' ) );
	packageConfig = { ...packageConfig, ...localConfig }
} catch ( e ) {
}

module.exports = packageConfig;
