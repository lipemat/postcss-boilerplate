const configHelper = require( './helpers/config' );

module.exports = function( grunt ) {
	/**
	 * Start up config by reading from package.json.
	 *
	 */
	grunt.initConfig( {
		pkg: require( './helpers/package-config' ),
		compress: configHelper.getConfig( 'compress' ),
		postcss: configHelper.getConfig( 'postcss' ),
		watch: configHelper.getConfig( 'watch' ),
		stylelint: configHelper.getConfig( 'stylelint' ),
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
};
