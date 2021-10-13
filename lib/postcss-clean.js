'use strict';

/**
 * Mimic the postcss-clean plugin.
 *
 * Override due to the plugin using version 4 of clean-css which
 * has issues with PostCSS 7 and results in inconstant CSS.
 *
 * This may potentially be removed in favor of using that plugin again if
 * they change the version of PostCSS to 7 and Clean CSS to 5.
 * We've already tested using those versions and it works, just need the
 * maintainer to bump the versions.
 * Decided to use this `lib` instead of maintaining another fork.
 *
 * @link https://www.npmjs.com/package/postcss-clean
 *
 */
const postcss = require( 'postcss' );
const CleanCss = require( 'clean-css' );

const initializer = ( opts = {} ) => {
	const cleancss = new CleanCss( opts );

	return ( css, res ) => {
		return new Promise( ( resolve, reject ) => {
			cleancss.minify( css.toString(), ( err, min ) => {
				if ( err ) {
					return reject( new Error( err.join( '\n' ) ) );
				}

				for ( const w of min.warnings ) {
					res.warn( w );
				}

				res.root = postcss.parse( min.styles );
				resolve();
			} );
		} );
	};
};

module.exports = postcss.plugin( 'clean', initializer );
