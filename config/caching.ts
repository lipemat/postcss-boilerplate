import {EnumModules, getEnumFilePath} from '../helpers/enum-modules';
import {JsonModules} from '../helpers/get-json';
import tinylr from 'tiny-lr';


type Config = {
	reset: {}
	reload: {}
}

let lastCssClasses: string[] = [];

export const config: Config = {
	reset: {},
	reload: {},
};


/**
 * Use the same interface as the grunt watch task
 * to trigger a reload.
 *
 * @link https://github.com/gruntjs/grunt-contrib-watch?tab=readme-ov-file#rolling-your-own-live-reload
 */
function triggerReload() {
	tinylr.changed( getEnumFilePath( 'development' ), () => {
		console.log( 'CSS Modules updated' );
	} );
}

/**
 * Cache management for Enums and JSON
 *
 * `caching:reset` - Reset the content of the Enums and JSON files.
 * `caching:reload` - Reload the browser if a CSS modules classname changes.
 *
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
export default function cachingTask<K extends keyof Config>( task: K, data: Config[K] ) {
	if ( 'reset' === task ) {
		EnumModules._resetContent();
		JsonModules._resetContent();
	}

	if ( 'reload' === task ) {
		if ( lastCssClasses.sort().toString() === EnumModules.getCssClasses().sort().toString() ) {
			return;
		}
		lastCssClasses = EnumModules.getCssClasses();
		triggerReload();
	}
}
