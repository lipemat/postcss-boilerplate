import {existsSync} from 'fs';
import {resolve} from 'path';
import {getPackageConfig} from '@lipemat/js-boilerplate-shared/helpers/package-config.js';
import {getConfig} from './config';
import {addTrailingSlash} from '../../js-boilerplate-shared/helpers/string.js';


type Entries = {
	min: Record<string, string>;
	toCSS: Record<string, string>;
};

function getDistFolder(): string {
	return addTrailingSlash( resolve( getPackageConfig().theme_path, getPackageConfig().css_folder ) );
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

	Object.values( entries ).forEach( possibleFile => {
		const filePath = config.theme_path + 'pcss/' + possibleFile;
		if ( existsSync( resolve( filePath + '.pcss' ) ) ) {
			matches.toCSS[ getDistFolder() + possibleFile + '.css' ] = config.theme_path + `pcss/${possibleFile}.pcss`;
			matches.min[ getDistFolder() + possibleFile + '.min.css' ] = config.theme_path + `pcss/${possibleFile}.pcss`;
		}
	} );
	return matches;
}
