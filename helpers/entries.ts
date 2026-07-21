import {existsSync} from 'fs';
import {relative, resolve} from 'path';
import {getPackageConfig} from '@lipemat/js-boilerplate-shared/helpers/package-config.js';
import {getConfig} from './config';
import {addTrailingSlash} from '@lipemat/js-helpers';

type Entries = {
	min: Record<string, string>;
	toCSS: Record<string, string>;
};

export function getDistFolder(): string {
	const config = getPackageConfig();
	return addTrailingSlash( relative( process.cwd(), resolve( config.theme_path, config.css_folder ) ) );
}


/**
 * Entry points to be loaded by Grunt.
 *
 * Checks each provided file for existing and includes if it does.
 *
 * @see config/postcss-entries.js
 */
export function getEntries(): Entries {
	const matches = {
		min: {},
		toCSS: {},
	};
	const config = getPackageConfig();
	const entries = getConfig( 'postcss-entries' );
	const themePath = addTrailingSlash( config.theme_path );

	Object.values( entries ).forEach( possibleFile => {
		const filePath = themePath + 'pcss/' + possibleFile;
		if ( existsSync( resolve( filePath + '.pcss' ) ) ) {
			matches.toCSS[ getDistFolder() + possibleFile + '.css' ] = themePath + `pcss/${possibleFile}.pcss`;
			matches.min[ getDistFolder() + possibleFile + '.min.css' ] = themePath + `pcss/${possibleFile}.pcss`;
		}
	} );
	return matches;
}
