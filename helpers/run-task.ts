import grunt from 'grunt';
import {EnumModules} from './enum-modules';
import {JsonModules} from './get-json';

export function resetLocalCache() {
	EnumModules._resetContent();
	JsonModules._resetContent();
}


/**
 * Run a grunt task by name.
 */
export function run( taskName: string ) {
	grunt.task.init = function() {
	};
	require( '../Gruntfile' )( grunt );
	grunt.tasks( taskName );

	// Reset the local cache between watch runs during the `start` command.
	grunt.event.on( 'watch', resetLocalCache );
}

export default {
	run,
};
