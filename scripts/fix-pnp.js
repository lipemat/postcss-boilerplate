#!/usr/bin/env node

/**
 * When using PNP loose mode, we get warnings for every module
 * we access which is not strictly declared.
 *
 * There is no built in way in Yarn to disable the warnings.
 * This script modifies the generate .pnp.js file to suppress
 * all loose module warnings unless the environmental variable
 * it set to display all warnings.
 *
 * @usage "scripts": {
    "postinstall": "lipemat-postcss-boilerplate fix-pnp"
  },
 *
 */

const fs = require( 'fs' );
const PNP_FILE = './.pnp.js';

fs.readFile( PNP_FILE, 'utf8', ( err, data ) => {
	if ( err ) {
		return console.log( err );
	}

	const result = data.replace( /if \(reference != null\) {/, '// # Warnings suppressed via @lipemat/postcss-boilerplate/fix-pnp script. \n' +
		'if (! alwaysWarnOnFallback && reference != null) { \n' +
					'dependencyReference = reference; \n' +
		'} else if (alwaysWarnOnFallback && reference != null) {' );

	fs.writeFile( PNP_FILE, result, 'utf8', err => {
		if ( err ) {
			return console.log( err );
		}
	} );
} );

console.log( 'The .pnp.js file has been adjusted to no longer display warnings for loose modules.' )
