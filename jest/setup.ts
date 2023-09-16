/**
 * Use our tests "theme" path as theme path for files
 * will be loaded from there when applicable.
 */
jest.mock( '../helpers/package-config.ts', () => ( {
	...jest.requireActual( '../helpers/package-config.ts' ),
	getPackageConfig: () => ( {
		...jest.requireActual( '../helpers/package-config.ts' ),
		// Point to our data directory for the theme_path.
		theme_path: 'jest/theme',
	} ),
} ) );
