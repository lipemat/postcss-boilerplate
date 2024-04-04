// Change this variable during tests.
let mockWatch: false | string[] = false;

// Change the result of the getPackageConfig function, so we can change shortCssClasses.
jest.mock( '../../../helpers/package-config.ts', () => ( {
	...jest.requireActual( '../../../helpers/package-config.ts' ),
	getPackageConfig: () => {
		if ( false === mockWatch ) {
			return jest.requireActual( '../../../helpers/package-config.ts' );
		}
		return {
			...jest.requireActual( '../../../helpers/package-config.ts' ),
			// Change this variable during the test.
			watch: mockWatch,
		};
	},
} ) );

function getWatchConfig() {
	jest.resetModules();
	return require( '../../../config/watch.js' );
}

describe( 'Test watch files from package.json', () => {
	it( 'watch files from package.json', () => {

	} );

	it( 'matches snapshot', () => {
		expect( getWatchConfig() ).toMatchSnapshot();

		mockWatch = [ 'woocommerce', 'template-parts', 'pcss' ];
		expect( getWatchConfig() ).toMatchSnapshot();
	} );
} );
