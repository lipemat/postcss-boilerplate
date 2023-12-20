import path from 'path';
import fs from 'fs';

/**
 * @todo In version 5 change default values.
 * 1. `css_folder` should be `./css/dist/` instead of `css/`.
 * 2. `combinedJson` should be `true` instead of `false`.
 * 3. `shortCssClasses` should be `true` instead of `false`.
 * 4. `brotliFiles` should be `true` instead of `false`.
 * 5. `cssEnums` should be `true` instead of `false`.
 *
 * Update the Readme.md file to reflect these changes.
 */
export type PackageConfig = {
	brotliFiles: boolean;
	combinedJson: boolean;
	cssEnums: boolean;
	css_folder: string;
	file_name: string;
	shortCssClasses: boolean;
	theme_path: string;
	workingDirectory: string;
};

/**
 * Get all configurations for package.json of the project running this.
 */
const workingDirectory = fs.realpathSync( process.cwd() ).replace( /\\/g, '/' );

let packageConfig: PackageConfig = require( path.resolve( workingDirectory, 'package.json' ) );
packageConfig.brotliFiles ||= false;
packageConfig.workingDirectory = workingDirectory;
packageConfig.theme_path ||= './';
// Could be set to "" which would always test false.
if ( ! Boolean( packageConfig.hasOwnProperty( 'css_folder' ) ) ) {
	packageConfig.css_folder = 'css/';
}
packageConfig.cssEnums ||= false;
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

// @ts-ignore
packageConfig.getPackageConfig = getPackageConfig;

// Leaving old export structure for backwards compatibility.
// @todo Remove in favor of default export in version 5.
module.exports = packageConfig;
