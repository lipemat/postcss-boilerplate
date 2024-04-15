let mockBrotliFiles = false;

// Change the result of the getPackageConfig function.
jest.mock( '../../../helpers/package-config.ts', () => ( {
	...jest.requireActual( '../../../helpers/package-config.ts' ),
	getPackageConfig: () => ( {
		...jest.requireActual( '../../../helpers/package-config.ts' ),
		brotliFiles: mockBrotliFiles,
	} ),
} ) );

jest.mock( '../../../helpers/run-task', () => ( {
	run: jest.fn(),
} ) );


describe( 'Test the dist script', () => {
	beforeEach( () => {
		jest.resetModules();
	} );

	it( 'should compile the /pcss/* files to .min.css', () => {
		delete require.cache[ require.resolve( '../../../scripts/dist' ) ];
		require( '../../../scripts/dist' );
		const {run} = require( '../../../helpers/run-task' );
		expect( run ).toHaveBeenCalledWith( 'postcss:min' );
		expect( run ).toHaveBeenCalledWith( 'caching:writeModules:production' );

		expect( run ).toHaveBeenCalledWith( 'postcss:toCSS' );
		expect( run ).toHaveBeenCalledWith( 'caching:writeModules:development' );
		expect( run ).not.toHaveBeenCalledWith( 'compress:brotli' );
	} );

	it( 'should compress the CSS files to .br files', () => {
		mockBrotliFiles = true;
		require( '../../../scripts/dist' );
		const {run} = require( '../../../helpers/run-task' );

		expect( run ).toHaveBeenCalledWith( 'compress:brotli' );
	} );
} );
