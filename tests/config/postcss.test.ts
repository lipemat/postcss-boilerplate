const postcssPresetEnv = require( 'postcss-preset-env' );

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
		const creator = ( browsers ) => {
			return postcssPresetEnv( {
				browsers,
				features: {
					'focus-visible-pseudo-class': {
						replaceWith: ':global(.focus-visible)',
					}
				}
			} ).toString();
		};

		const config = require( '../../config/postcss' );
		const wpBrowsers = require( '@wordpress/browserslist-config' );
		expect( config.toCSS.options.processors[ 3 ].toString() ).toEqual( creator( wpBrowsers ) );
		expect( config.min.options.processors[ 3 ].toString() ).toEqual( creator( wpBrowsers ) );

		jest.resetModules();
		process.env.BROWSERSLIST = 'chrome 71';
		process.env.NODE_ENV = 'production';
		const config2 = require( '../../config/postcss' );
		expect( config2.toCSS.options.processors[ 3 ].toString() ).toEqual( creator( 'chrome 71' ) );
		expect( config2.min.options.processors[ 3 ].toString() ).toEqual( creator( 'chrome 71' ) );
	} );
} );
