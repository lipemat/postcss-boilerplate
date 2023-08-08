'use strict';

/**
 * Mimic the postcss-clean plugin.
 *
 * Override due to the plugin using version 4 of clean-css, which
 * has issues with PostCSS 7/8 and results in inconstant CSS.
 *
 * This may potentially be removed in favor of using that plugin again if
 * they change the version of PostCSS to 8 and Clean CSS to 5.
 *
 * Decided to use this `lib` instead of maintaining another fork.
 *
 * @link https://www.npmjs.com/package/postcss-clean
 *
 */
const postcss = require( 'postcss' );
const CleanCss = require( 'clean-css' );

module.exports = ( opts = {} ) => {
	const clean = new CleanCss( opts );

	return {
		postcssPlugin: 'clean',
		OnceExit( css, {result} ) {
			return new Promise( ( resolve, reject ) => {
				clean.minify( css.toString(), ( err, min ) => {
					if ( err ) {
						return reject( new Error( err.join( '\n' ) ) );
					}

					if ( min.warnings.length > 0 ) {
						return reject( new Error( 'postcss-clean minify failed! \n' + min.warnings.join( '\n' ) ) );
					}

					result.root = postcss.parse( min.styles );
					resolve();
				} );
			} );
		},
	};
};

module.exports.postcss = true;
