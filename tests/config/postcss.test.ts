const browserslist = require( 'browserslist' );
const postcssPresetEnv = require( 'postcss-preset-env' );

const {getDefaultBrowsersList, getBrowsersList} = require( '../../helpers/config.js' );

afterEach( () => {
	delete process.env.BROWSERSLIST;
} );


describe( 'postcss.js', () => {
	test( 'PostCSS config', () => {
		/**
		 * @notice If the browserslist results change, the snapshot will need to be updated.
		 */
		const config = require( '../../config/postcss' );
		expect( config ).toMatchSnapshot( 'develop' );

		jest.resetModules();
		const config2 = require( '../../config/postcss' );
		expect( config2 ).toMatchSnapshot( 'production' );

	} );


	test( 'sourceMap', () => {
		const config = require( '../../config/postcss' );
		expect( config.toCSS.options.map ).toEqual( true );
		expect( config.min.options.map ).toEqual( false );
	} );


	test( 'Browserslist config', () => {
		const expectedBrowsers = [ ...require( '@wordpress/browserslist-config' ) ];
		expectedBrowsers.push( 'not and_uc 15.5' );
		const creator = ( browsers ) => {
			return postcssPresetEnv( {
				browsers,
				features: {
					'focus-visible-pseudo-class': {
						replaceWith: ':global(.focus-visible)',
					}
				}
			} );
		};

		const config = require( '../../config/postcss.js' );
		// We want to make sure no matter what postcss-custom-properties is not included
		// if a user did not provided a custom browserslist to override.
		expect( config.toCSS.options.processors[ 3 ].plugins.filter( ( plugin ) => {
			return plugin.postcssPlugin === 'postcss-custom-properties';
		} ).length ).toEqual( 0 );

		expect( JSON.stringify( config.toCSS.options.processors[ 3 ] ) )
			.toEqual( JSON.stringify( creator( expectedBrowsers ) ) );
		expect( JSON.stringify( config.min.options.processors[ 3 ] ) )
			.toEqual( JSON.stringify( creator( expectedBrowsers ) ) );

		jest.resetModules();
		// and_uc 15.5 requires postcss-custom-properties.
		process.env.BROWSERSLIST = 'and_uc 15.5';
		const config2 = require( '../../config/postcss' );
		expect( config2.toCSS.options.processors[ 3 ].plugins.filter( ( plugin ) => {
			return plugin.postcssPlugin === 'postcss-custom-properties';
		} ).length ).toEqual( 1 );
		expect( JSON.stringify( config2.toCSS.options.processors[ 3 ] ) )
			.toEqual( JSON.stringify( creator( [ 'and_uc 15.5' ] ) ) );
		expect( JSON.stringify( config2.min.options.processors[ 3 ] ) )
			.toEqual( JSON.stringify( creator( [ 'and_uc 15.5' ] ) ) );


		// @notice If this fails, we can probably remove the override in favor of default wp.
		jest.resetModules();
		const wpDefaultBrowsers = [ ...require( '@wordpress/browserslist-config' ) ];
		process.env.BROWSERSLIST = browserslist( wpDefaultBrowsers );
		const config3 = require( '../../config/postcss' );
		expect( config3.toCSS.options.processors[ 3 ].plugins.filter( ( plugin ) => {
			return plugin.postcssPlugin === 'postcss-custom-properties';
		} ).length ).toEqual( 1 );
	} );
} );
