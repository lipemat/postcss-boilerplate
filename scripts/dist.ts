import runner from '../helpers/run-task';

import {getPackageConfig} from '../helpers/package-config';

process.env.NODE_ENV = 'production';
/**
 * Compile the /pcss/* files to .min.css
 * The main point of this script is to generate the minified
 * CSS file for production.
 */
runner.run( 'postcss:min' );

/**
 * Compile the /pcss/* files to .css
 * Allows for switching to .css on production and not having the
 * site fall apart.
 */
process.env.NODE_ENV = 'develop';
runner.run( 'postcss:toCSS' );

// Compress the CSS files to .br files.
if ( true === getPackageConfig().brotliFiles ) {
	runner.run( 'compress:brotli' );
}
