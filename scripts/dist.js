process.env.NODE_ENV = 'production';
const runner = require( '../helpers/run-task' );

/**
 * Compile the /pcss/* files to .min.css
 * The main point of this script is to generate the minified
 * css file for production.
 *
 * @type {string}
 */
runner.run( 'postcss:min' );
runner.run( 'revision' );

/**
 * Compile the /pcss/* files to .css
 * Allows for switching to .css on production and not having the
 * site fall apart.
 *
 * @type {string}
 */
process.env.NODE_ENV = 'develop';
delete require.cache[ require.resolve( '../config/postcss' ) ];
runner.run( 'postcss:toCSS' );
