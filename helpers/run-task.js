/**
 * Run a grunt task by name.
 */
module.exports = {
	/**
	 *
	 * @param {string} $task_name
	 * @type function
	 */
	run : function( $task_name ) {
		const grunt = require( 'grunt' );

		grunt.task.init = function () {
		};

		require( '../Gruntfile' )( grunt );

		grunt.tasks( $task_name );
	}
};
