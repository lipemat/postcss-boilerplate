const {getDefaultBrowsersList, getBrowsersList} = require( '../../helpers/config.js' );

afterEach( () => {
	delete process.env.BROWSERSLIST;
} );

describe( 'config', () => {
	test( 'getDefaultBrowsersList', () => {
		const wpBrowsers = require( '@wordpress/browserslist-config' );
		expect( getDefaultBrowsersList() ).toEqual( wpBrowsers );
		expect( getDefaultBrowsersList() ).toEqual( getBrowsersList() );

		process.env.BROWSERSLIST = 'chrome 71';
		expect( getDefaultBrowsersList() ).toEqual( false );
	} );

	test( 'getBrowsersList', () => {
		const wpBrowsers = require( '@wordpress/browserslist-config' );
		expect( getBrowsersList() ).toEqual( wpBrowsers );
		expect( getBrowsersList() ).toEqual( getDefaultBrowsersList() );

		process.env.BROWSERSLIST = 'chrome 71';
		expect( getBrowsersList() ).toEqual( [ 'chrome 71' ] );
	} );
} );
