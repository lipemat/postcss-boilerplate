import fs from 'fs';
import path from 'path';
import browserslist from 'browserslist';

import {getPackageConfig} from './package-config';
import type {PostCSSGruntTasks} from '../config/postcss';
import type {CachingGruntTasks} from '../config/caching';
import type {CompressGruntTasks} from '../config/compress';
import type {PostcssEntries} from '../config/postcss-entries';
import type {WatchGruntTasks} from '../config/watch';
import type {StylelintGruntTasks} from '../config/stylelint';

export type Environment = 'production' | 'development';

type Configs = {
	'postcss-entries': PostcssEntries;
	'caching': {
		config: CachingGruntTasks
	};
	'compress': CompressGruntTasks;
	'postcss': PostCSSGruntTasks;
	'stylelint': StylelintGruntTasks;
	'watch': WatchGruntTasks;
};


/**
 * Get a config for our /config directory merged with any
 * matching configuration from the project directory.
 *
 * For instance if we have a file named config/babel.config.js in our project
 * we will merge the contents with our config/babel.config.js in favor of whatever
 * is specified with the project's file.
 */
export function getConfig<T extends keyof Configs>( fileName: T ): Configs[T] {
	let config = require( '../config/' + fileName );
	const packageConfig = getPackageConfig();
	try {
		const localConfig = require( path.resolve( packageConfig.workingDirectory + '/config', fileName ) );
		if ( 'function' === typeof localConfig ) {
			config = {...config, ...localConfig( config )};
		} else {
			config = {...config, ...localConfig};
		}
	} catch ( e ) {
		if ( 'MODULE_NOT_FOUND' !== e.code ) {
			console.error( e );
		}
	}
	return config;
}

/**
 * Get the browserslist from the current project.
 *
 * - If specified using standard browserslist config, we will use that.
 *
 *  @link https://github.com/browserslist/browserslist#config-file
 */
export function getBrowsersList(): readonly string[] {
	const projectBrowsersList = browserslist();
	if ( browserslist( browserslist.defaults ) === projectBrowsersList ) {
		const wp = [ ...require( '@wordpress/browserslist-config' ) ];
		return adjustBrowserslist( wp );
	}
	return projectBrowsersList;
}

/**
 * If browserslist is not specified, we fall back to WordPress defaults.
 *
 * Return false if a browserslist is specified in the current project.
 *
 * @deprecated Use getBrowsersList() instead.
 *
 * @link https://github.com/browserslist/browserslist#config-file
 *
 * @return {false | string[]}
 */
export const getDefaultBrowsersList = () => {
	if ( browserslist( browserslist.defaults ) === browserslist() ) {
		const wp = [ ...require( '@wordpress/browserslist-config' ) ];
		return adjustBrowserslist( wp );
	}
	return false;
};


/**
 * Provide CSS properties and media queries to all postcss plugins.
 *
 * If a media-queries files exist, automatically load them.
 * If CSS variables exist, automatically load them.
 *
 * 1. pcss/globals/variables.pcss
 * 3. pcss/globals/media-queries.pcss
 */
export function getExternalFiles(): string[] {
	const externalFiles: string[] = [];
	const packageConfig = getPackageConfig();

	[
		path.resolve( packageConfig.theme_path, 'pcss/globals/media-queries.pcss' ),
		path.resolve( packageConfig.theme_path, 'pcss/globals/variables.pcss' ),
	].forEach( possibleFile => {
		if ( fs.existsSync( possibleFile ) ) {
			externalFiles.push( possibleFile );
		}
	} );

	return externalFiles;
}


/**
 * Adjust the browserslist to include our defaults.
 */
export function adjustBrowserslist( browserRules: string[] ): string[] {
	//browserRules.push( 'not and_uc 15.5' );
	return browserRules;
}
