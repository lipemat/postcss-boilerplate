const configHelper = require( './helpers/config' );

module.exports = function ( grunt ) {
	/**
	 * Start up config by reading from package.json.
	 *
	 */
	var config = {
		pkg: require( './helpers/package-config' )
	};

	grunt.registerTask( 'postcss', configHelper.getConfig( 'postcss.js' ) );
	grunt.registerTask( 'watch', configHelper.getConfig( 'watch.js' ) );
	grunt.registerTask( 'stylelint', configHelper.getConfig( 'stylelint.js' ) );

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
	 * Bump the .revision file to the latest
	 * Useful when PWA is active because Chrome will reload when developing via workspaces
	 * but reloading the page will get the old "Application" cached resources unless we
	 * bump the revision
	 */
	grunt.registerTask( 'revision', function () {
		grunt.file.write( config.pkg.root + '.revision', Date.now() );
	} );
};
