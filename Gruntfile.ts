import {getConfig} from './helpers/config';
import type {GruntExposed} from './helpers/run-task';

export default function( grunt: GruntExposed ) {
	grunt.task.init = () => {
	};
	/**
	 * Start up config by reading from package.json.
	 *
	 */
	grunt.initConfig( {
		pkg: require( './helpers/package-config' ),
		compress: getConfig( 'compress' ),
		postcss: getConfig( 'postcss' ),
		watch: getConfig( 'watch' ),
		stylelint: getConfig( 'stylelint' ),
	} );

	grunt.loadNpmTasks( '@lodder/grunt-postcss' );
	grunt.loadNpmTasks( 'grunt-contrib-compress' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-stylelint' );

	/**
	 *
	 * Tasks are registered here. Starts with default,
	 * Run by simply running "grunt" in your cli.
	 * All other use grunt + task name.
	 */
	grunt.registerTask(
		'default', [
			'watch',
		] );

	return grunt;
}
