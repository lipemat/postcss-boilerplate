const configHelper = require( './helpers/config' );

module.exports = function ( grunt ) {
	/**
	 * Start up config by reading from package.json.
	 *
	 */
	grunt.initConfig( {
		pkg: require( './helpers/package-config' ),
		postcss: configHelper.getConfig( 'postcss.js' ),
		watch: configHelper.getConfig( 'watch.js' ),
		stylelint: configHelper.getConfig( 'stylelint.js' )
	} );

	grunt.loadNpmTasks( 'grunt-postcss' );
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
			'watch'
		] );

	return grunt;
};
