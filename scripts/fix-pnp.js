#!/usr/bin/env node

/**
 * When using PNP loose mode, we get warnings for every module
 * we access, not strictly declared.
 *
 * No built-in way in Yarn to disable the warnings.
 * This script modifies to generate .pnp.js file to suppress
 * all loose module warnings unless the environmental variable
 * it set to display all warnings.
 *
 * @usage "scripts": {
    "postinstall": "lipemat-postcss-boilerplate fix-pnp"
  },
 *
 */

const fs = require( 'fs' );

const PNP_FILES = [
	'./.pnp.js',
	'./.pnp.cjs',
];

PNP_FILES.forEach( PNP_FILE => {
	if ( fs.existsSync( PNP_FILE ) ) {
		fs.readFile( PNP_FILE, 'utf8', ( readError, data ) => {
			if ( readError ) {
				return console.log( readError );
			}

			const result = data.replace( /if \(reference != null\) {/, '// # Warnings suppressed via @lipemat/postcss-boilerplate/fix-pnp script. \n' +
				'if (! alwaysWarnOnFallback && reference != null) { \n' +
				'dependencyReference = reference; \n' +
				'} else if (alwaysWarnOnFallback && reference != null) {' );

			fs.writeFile( PNP_FILE, result, 'utf8', writeError => {
				if ( writeError ) {
					return console.log( writeError );
				}
				console.log( `The ${PNP_FILE} file has been adjusted to no longer display warnings for loose modules.` );
			} );
		} );
	}
} );
