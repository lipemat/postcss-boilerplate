import fs from 'fs';
import path from 'path';

import {getPackageConfig} from '@lipemat/js-boilerplate-shared/helpers/package-config.js';
import type {PostCSSGruntTasks} from '../config/postcss';
import type {CachingGruntTasks} from '../config/caching';
import type {CompressGruntTasks} from '../config/compress';
import type {PostcssEntries} from '../config/postcss-entries';
import type {WatchGruntTasks} from '../config/watch';
import type {StylelintGruntTasks} from '../config/stylelint';
import {mergeWithLocalConfig} from '../../js-boilerplate-shared/helpers/config';

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
 * For instance, if we have a file named config/babel.config.js in our project
 * we will merge the contents with our config/babel.config.js in favor of whatever
 * is specified with the project's file.
 */
export function getConfig<T extends keyof Configs>( fileName: T ): Configs[T] {
	const config = require( '../config/' + fileName );

	return mergeWithLocalConfig<Configs[T]>( fileName, config );
}


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
