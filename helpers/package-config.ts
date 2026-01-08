import path from 'path';
import fs from 'fs';

export type PackageConfig = {
	brotliFiles: boolean;
	certificates?: {
		cert: string;
		key: string;
	};
	combinedJson: boolean;
	cssEnums: boolean;
	css_folder: string;
	file_name: string;
	shortCssClasses: boolean | {
		js: boolean;
		pcss: boolean;
	};
	theme_path: string;
	pcssWatch: string[];
	workingDirectory: string;
};

/**
 * Get all configurations for package.json of the project running this.
 */
const workingDirectory = fs.realpathSync( process.cwd() ).replace( /\\/g, '/' );

let packageConfig: PackageConfig = require( path.resolve( workingDirectory, 'package.json' ) );
packageConfig.brotliFiles ||= true;
packageConfig.workingDirectory = workingDirectory;
packageConfig.theme_path ||= './';
// Could be set to "" which would always test false.
if ( ! Boolean( packageConfig.hasOwnProperty( 'css_folder' ) ) ) {
	packageConfig.css_folder = './css/dist/';
}
packageConfig.cssEnums ||= true;
packageConfig.combinedJson ||= true;
packageConfig.file_name ||= 'front-end';
packageConfig.shortCssClasses ||= true;
packageConfig.pcssWatch ||= [ 'pcss', 'template-parts' ];

try {
	const localConfig = require( path.resolve( workingDirectory, './local-config.json' ) );
	packageConfig = {...packageConfig, ...localConfig};
} catch {
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
