import {type Environment, getConfig} from './helpers/config';
import type {GruntExposed} from './helpers/run-task';
import caching from './config/caching';

export default function( grunt: GruntExposed ) {
	grunt.task.init = () => {
	};
	/**
	 * Start up config by reading from package.json.
	 *
	 */
	grunt.initConfig( {
		pkg: require( './helpers/package-config' ),
		caching: getConfig( 'caching' ).config,
		compress: getConfig( 'compress' ),
		postcss: getConfig( 'postcss' ),
		watch: getConfig( 'watch' ),
		stylelint: getConfig( 'stylelint' ),
	} );

	grunt.loadNpmTasks( '@lodder/grunt-postcss' );
	grunt.loadNpmTasks( 'grunt-contrib-compress' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-stylelint' );


	grunt.registerMultiTask( 'caching', 'Cache management for Enums and JSON', function( env: Environment | undefined ) {
		caching( this.target as 'reset' | 'reload' | 'writeModules', env );
	} );

	return grunt;
}
