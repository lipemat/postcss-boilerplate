import browserslist = require('browserslist');

const {getDefaultBrowsersList, getBrowsersList} = require( '../../helpers/config' );

afterEach( () => {
	delete process.env.BROWSERSLIST;
} );

describe( 'config', () => {
	test( 'getDefaultBrowsersList', () => {
		const expectedBrowsers = [ ...require( '@wordpress/browserslist-config' ) ];
		expectedBrowsers.push( 'not and_uc 15.5' );

		expect( getDefaultBrowsersList() ).toEqual( expectedBrowsers );
		expect( getDefaultBrowsersList() ).toEqual( getBrowsersList() );

		process.env.BROWSERSLIST = 'chrome 71';
		expect( getDefaultBrowsersList() ).toEqual( false );
	} );

	test( 'getBrowsersList', () => {
		const expectedBrowsers = [ ...require( '@wordpress/browserslist-config' ) ];
		expectedBrowsers.push( 'not and_uc 15.5' );

		expect( getBrowsersList() ).toEqual( expectedBrowsers );
		expect( getBrowsersList() ).toEqual( getDefaultBrowsersList() );


		// @notice If this fails, we can probably remove the override in favor of default wp.
		const wpDefaultBrowsers = browserslist( require( '@wordpress/browserslist-config' ), {
			env: 'production'
		} );
		expect( wpDefaultBrowsers.includes( 'and_uc 15.5' ) ).toBe( true );
		expect( browserslist( getBrowsersList() ).includes( 'and_uc 15.5' ) ).toBe( false );

		process.env.BROWSERSLIST = 'chrome 71';
		expect( getBrowsersList() ).toEqual( [ 'chrome 71' ] );
	} );
} );
