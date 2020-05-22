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
	 * which is run by simply running "grunt" in your cli.
	 * All other use grunt + taskname.
	 *
	 */
	grunt.registerTask(
		'default', [
			'watch'
		] );

	/**
	 * Bump the .revision file to the current timestamp.
	 *
	 * Useful when PWA is active because Chrome will get the old service worker
	 * cached resources unless we bump the revision.
	 *
	 * If not using PWA and using another form of .revision generation such as
	 * Beanstalk or a deploy script, it's probably better to disable this so you
	 * can match the git hash to the .revision file.
	 *
	 * May be enabed by adding "regenerate_revision":true to your package.json.
	 *
	 */
	grunt.registerTask( 'revision', function () {
		if ( grunt.config.get( 'pkg' ).regenerate_revision ) {
			grunt.file.write( grunt.config.get( 'pkg' ).root + '.revision', Date.now() );
		}
	} );

	return grunt;
};
