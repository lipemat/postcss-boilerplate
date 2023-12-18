import grunt from 'grunt';

/**
 * Run a grunt task by name.
 */
export function run( taskName: string ) {
	grunt.task.init = function() {
	};
	require( '../Gruntfile' )( grunt );
	grunt.tasks( taskName );
}

export default {
	run,
};
