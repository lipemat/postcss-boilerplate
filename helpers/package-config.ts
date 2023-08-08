import path from 'path';
import fs from 'fs';

/**
 * Get all configurations for package.json of the project running this.
 */
const workingDirectory = fs.realpathSync( process.cwd() );

let packageConfig = require( path.resolve( workingDirectory, 'package.json' ) );
packageConfig.brotliFiles ||= false;
packageConfig.workingDirectory = workingDirectory;
packageConfig.theme_path ||= './';
// Could be set to "" which would always test false.
if ( ! Boolean( packageConfig.hasOwnProperty( 'css_folder' ) ) ) {
	packageConfig.css_folder = 'css/';
}
packageConfig.combinedJson ||= false;
packageConfig.file_name ||= 'front-end';
packageConfig.shortCssClasses ||= false;

try {
	const localConfig = require( path.resolve( workingDirectory, './local-config.json' ) );
	packageConfig = {...packageConfig, ...localConfig};
} catch ( e ) {
}

/**
 * Helper function to get the results of `packageConfig`.
 *
 * - Allows mocking the results of `packageConfig` for testing.
 * - Allows getting the config through a callback instead of an import.
 *
 * @since 4.6.0
 */
export function getPackageConfig() {
	return packageConfig;
}

packageConfig.getPackageConfig = getPackageConfig;

// Leaving old export structure for backwards compatibility.
// @todo Remove in favor of default export in version 5.
module.exports = packageConfig;
