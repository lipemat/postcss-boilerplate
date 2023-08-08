process.env.NODE_ENV = 'production';
const runner = require( '../helpers/run-task' );
const config = require( '../helpers/package-config' );

/**
 * Compile the /pcss/* files to .min.css
 * The main point of this script is to generate the minified
 * CSS file for production.
 *
 * @type {string}
 */
runner.run( 'postcss:min' );

/**
 * Compile the /pcss/* files to .css
 * Allows for switching to .css on production and not having the
 * site fall apart.
 *
 * @notice Does not work correctly when using an unplugged,
 *         symbolic-linked package as the cache does not get cleared.
 *
 * @type {string}
 */
process.env.NODE_ENV = 'develop';
delete require.cache[ require.resolve( '../config/postcss' ) ];
delete require.cache[ require.resolve( '../helpers/get-json' ) ];
runner.run( 'postcss:toCSS' );

// Compress the CSS files to .br files.
if ( true === config.brotliFiles ) {
	runner.run( 'compress:brotli' );
}
