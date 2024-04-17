import {EnumModules, getEnumFilePath} from '../helpers/enum-modules';
import {JsonModules} from '../helpers/get-json';
import tinylr from 'tiny-lr';
import type {Environment} from '../helpers/config';
import {getPackageConfig} from '../helpers/package-config';


export type CachingGruntTasks = {
	reset: {}
	reload: {}
	writeModules: {}
}

let lastCssClasses: string[] = [];

export const config: CachingGruntTasks = {
	reset: {},
	reload: {},
	writeModules: {},
};

function isEnvironment( env: string | undefined ): env is Environment {
	return 'development' === env || 'production' === env;
}

/**
 * Use the same interface as the grunt watch task
 * to trigger a reload.
 *
 * @link https://github.com/gruntjs/grunt-contrib-watch?tab=readme-ov-file#rolling-your-own-live-reload
 */
function triggerReload() {
	tinylr.changed( getEnumFilePath( 'development' ), () => {
		console.log( 'CSS Modules updated, reloading browser.' );
	} );
}

/**
 * Cache management for Enums and JSON
 *
 * `caching:reset` - Reset the content of the Enums and JSON files.
 * `caching:reload` - Reload the browser if a CSS modules classname changes.
 * `caching:writeModules` - Write contents if JSON or PHP Enums for CSS modules.
 *
 */
export default function cachingTask<K extends keyof CachingGruntTasks>( task: K, env: Environment | undefined ) {
	if ( 'reset' === task ) {
		EnumModules._resetContent();
		JsonModules._resetContent();
	}

	if ( 'reload' === task && getPackageConfig().cssEnums ) {
		if ( lastCssClasses.sort().toString() === EnumModules.getCssClasses().sort().toString() ) {
			return;
		}
		lastCssClasses = EnumModules.getCssClasses();
		triggerReload();
	}

	if ( 'writeModules' === task && isEnvironment( env ) && getPackageConfig().combinedJson ) {
		JsonModules.flushToDisk( env );
		if ( getPackageConfig().cssEnums ) {
			EnumModules.flushToDisk( env );
		}
	}
}
