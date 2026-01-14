process.env.THEME_PATH = ( __dirname + '/theme/' ).replace( /\\/g, '/' );

/**
 * Use our tests "theme" path as theme path for files
 * will be loaded from there when applicable.
 */
jest.mock( '@lipemat/js-boilerplate-shared/helpers/package-config.js', () => ( {
	...jest.requireActual( '@lipemat/js-boilerplate-shared/helpers/package-config.js' ),
	getPackageConfig: () => ( {
		...jest.requireActual( '@lipemat/js-boilerplate-shared/helpers/package-config.js' ),
		// Point to our data directory for the theme_path.
		theme_path: 'jest/theme/',
	} ),
} ) );
