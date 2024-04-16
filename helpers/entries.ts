import {existsSync} from 'fs';
import {resolve} from 'path';
import {getPackageConfig} from './package-config';
import {getConfig} from './config';

const config = getPackageConfig();
const entries = getConfig( 'postcss-entries' );


type Entries = {
	min: Record<string, string>;
	toCSS: Record<string, string>;
};

/**
 * Entry points to be loaded by Grunt.
 *
 * Checks each provided file for exists and includes if it does.
 *
 * @see config/postcss-entries.js
 */
export function getEntries(): Entries {
	const matches = {
		min: {},
		toCSS: {},
	};

	Object.values( entries ).forEach( possibleFile => {
		const filePath = config.theme_path + 'pcss/' + possibleFile;
		if ( existsSync( resolve( filePath + '.pcss' ) ) ) {
			matches.toCSS[ config.css_folder + possibleFile + '.css' ] = config.theme_path + `pcss/${possibleFile}.pcss`;
			matches.min[ config.css_folder + possibleFile + '.min.css' ] = config.theme_path + `pcss/${possibleFile}.pcss`;
		}
	} );
	return matches;
}
