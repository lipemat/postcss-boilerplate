import {getPackageConfig} from './package-config';

export const SHORT_ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
export const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const classes: {
	[ filename: string ]: {
		[ className: string ]: string
	}
} = {};

let counters = [ -1 ];

/**
 * Check if short CSS classes are enabled.
 *
 * Using a helper function to allow for future enhancements.
 *
 * @since 4.6.0
 */
export function usingShortCssClasses(): boolean {
	return Boolean( getPackageConfig().shortCssClasses );
}

/**
 * Reset all counters.
 *
 * @notice Mostly here for unit tests.
 */
export function resetCounters() {
	counters = [ -1 ];
}

/**
 * Get the next class is sequence based on:
 * 1. Single character from SHORT_ALPHABET (prevent conflicts with JS boilerplate).
 * 2. Incremented character from the `ALPHABET`.
 *      1. Used once require 2+ characters.
 *      2. Grows to 3+ characters as needed.
 *
 * @return {string}
 */
export function getNextClass() {
	const last = counters.length - 1;
	let totalLetters = ALPHABET.length - 1;

	// First level uses the SHORT_ALPHABET.
	if ( 0 === last ) {
		totalLetters = SHORT_ALPHABET.length - 1;
	}

	if ( counters[ last ] < totalLetters ) {
		counters[ last ]++;
	} else {
		incrementParent();
	}

	return counters.map( ( counter, i ) => {
		return 0 === i ? SHORT_ALPHABET[ counter ] : ALPHABET[ counter ];
	} ).join( '' );
}


/**
 * When we run out of characters on the current level:
 * 1. Increment the parent level.
 * 2. Reset current level and all child levels back to 0.
 *
 * If we are out of characters on the parent level or have
 * no parent level:
 * 1. Add a new child level.
 * 2. Reset all levels back to 0.
 *
 */
function incrementParent() {
	let parent = counters.length - 2;
	let totalLetters = ALPHABET.length - 1;

	while ( counters[ parent ] !== undefined ) {
		// First level uses the SHORT_ALPHABET.
		if ( 0 === parent ) {
			totalLetters = SHORT_ALPHABET.length - 1;
		}
		if ( counters[ parent ] < totalLetters ) {
			counters[ parent ]++;
			// Reset all child levels to 0.
			while ( counters[ parent + 1 ] !== undefined ) {
				counters[ parent + 1 ] = 0;
				parent++;
			}
			return;
		}
		parent--;
	}

	// Add a new level and reset all existing levels.
	counters.forEach( ( _, i ) => counters[ i ] = 0 );
	counters.push( 0 );
}

/**
 * Return a single character unique CSS class name based on
 * postcss-modules's `generateScopedName` callback.
 *
 * Tracks CSS classes per each file so duplicate uses of the
 * same class in a file receive the same result.
 *
 * @notice Only enabled if the `package.json` has `shortCssClasses` set to true.
 *
 * @link https://github.com/madyankin/postcss-modules#generating-scoped-names
 */
export const generateScopedName = ( localName: string, resourcePath: string ): string => {
	classes[ resourcePath ] ||= {};
	classes[ resourcePath ][ localName ] ||= getNextClass();
	return classes[ resourcePath ][ localName ];
};


/**
 * Get the hash to generate the CSS module name, or
 * the `generateScopeName` for short CSS classes
 * if enabled.
 *
 * @note If run into issues with class name conflicts @see b36fc5309 as a more robust alternative.
 */
export function getGenerateScopeName() {
	if ( 'production' === process.env.NODE_ENV ) {
		// Use short CSS classes if enabled.
		if ( usingShortCssClasses() ) {
			return generateScopedName;
		}
		return '[contenthash:base52:5]';
	}
	return 'Ⓜ[name]__[local]__[contenthash:base52:2]';
}
