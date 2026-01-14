import {getPackageConfig} from '@lipemat/js-boilerplate-shared/helpers/package-config.js';

export type PostcssEntries = { [ entry: string ]: string };

const entries: PostcssEntries = {
	main: getPackageConfig().mainCssFileName, // Default: "front-end".
	admin: 'admin',
	blocks: 'blocks',
};

/**
 * Entry points to be loaded by Grunt.
 *
 * Checks each provided file for exists and includes if it does.
 *
 * @see getEntries
 */
module.exports = entries;
