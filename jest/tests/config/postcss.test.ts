import {readFileSync} from 'fs';
import postcss, {Plugin} from 'postcss';
import {basename} from 'path';
import {adjustBrowserslist} from '../../../helpers/config';
import type {PostCSSGruntTasks} from '../../../config/postcss';

const browserslist = require( 'browserslist' );
const postcssPresetEnv = require( 'postcss-preset-env' );

export type Fixture = {
	input: string;
	output: string;
	basename: string;
	description: string;
}

const creator = ( browsers: string[], features = {} ) => {
	return postcssPresetEnv( {
		browsers,
		features: {...features},
	} );
};


function getPostCSSConfig(): PostCSSGruntTasks {
	// @ts-ignore
	let config: PostCSSGruntTasks = {};
	jest.isolateModules( () => {
		config = require( '../../../config/postcss' );
	} );
	return config;
}


function processPostCSS( input: string, min: boolean = false, file: string ): Promise<postcss.Result> {
	const config = getPostCSSConfig();
	const task = min ? 'min' : 'toCSS';
	const plugins = config[ task ].options.processors;

	// Prevent the manifest.json from being emitted.
	const hashIndex = plugins.findIndex( ( plugin: Plugin ) => {
		return plugin.postcssPlugin !== undefined && 'postcss-hash' === plugin.postcssPlugin;
	} );
	if ( hashIndex > -1 ) {
		plugins.splice( hashIndex, 1 );
	}

	return postcss( plugins ).process( input, {
		from: file,
		to: 'test.css',
		parser: config[ task ].options.parser,
	} );
}

function cleanCSS( css: string ): string {
	return css.replace( /undefined/g, '' ).trim();
}

function getBrowsersPlugin( plugins: Plugin[] ): { plugins: Plugin[] } {
	return plugins.find( plugin => 'postcss-preset-env' === plugin.postcssPlugin ) as unknown as {
		plugins: Plugin[]
	};
}

// Create a data provider for fixtures.
const fixtures: Fixture[] = require( 'glob' )
	.sync( 'jest/fixtures/{postcss,safari-15}/*.pcss' )
	.map( file => {
		return {
			basename: basename( file ),
			input: file,
			output: file.replace( '.pcss', '.css' ),
			description: file.replace( /\\/g, '/' ).replace( 'jest/fixtures/', '' ),
		};
	} );


afterEach( () => {
	delete process.env.BROWSERSLIST;
} );


describe( 'postcss.js', () => {
	test( 'PostCSS config', () => {
		/**
		 * @notice If the browserslist results change, the snapshot will need to be updated.
		 */
		const config = require( '../../../config/postcss' );
		expect( config ).toMatchSnapshot( 'develop' );
	} );


	test( 'sourceMap', () => {
		const config = require( '../../../config/postcss' );
		expect( config.toCSS.options.map ).toEqual( true );
		expect( config.min.options.map ).toEqual( false );
	} );


	test( 'Browserslist config', () => {
		const expectedBrowsers = adjustBrowserslist( [ ...require( '@wordpress/browserslist-config' ) ] );

		const config = getPostCSSConfig();
		// We want to make sure no matter what postcss-custom-properties is not included
		// if a user did not provided a custom browserslist to override.
		expect( getBrowsersPlugin( config.toCSS.options.processors ).plugins.filter( plugin => {
			return 'postcss-custom-properties' === plugin.postcssPlugin;
		} ).length ).toEqual( 0 );
		expect( getBrowsersPlugin( config.toCSS.options.processors ).plugins.filter( plugin => {
			return 'postcss-focus-visible' === plugin.postcssPlugin;
		} ).length ).toEqual( 0 );

		expect( JSON.stringify( getBrowsersPlugin( config.toCSS.options.processors ) ) )
			.toEqual( JSON.stringify( creator( expectedBrowsers ) ) );
		expect( JSON.stringify( getBrowsersPlugin( config.min.options.processors ) ) )
			.toEqual( JSON.stringify( creator( expectedBrowsers ) ) );

		// op_mini all requires postcss-custom-properties.
		process.env.BROWSERSLIST = 'op_mini all';
		const config2 = getPostCSSConfig();
		expect( getBrowsersPlugin( config2.toCSS.options.processors ).plugins.filter( plugin => {
			return 'postcss-custom-properties' === plugin.postcssPlugin;
		} ).length ).toEqual( 1 );
		expect( JSON.stringify( getBrowsersPlugin( config2.toCSS.options.processors ) ) )
			.toEqual( JSON.stringify( creator( [ 'op_mini all' ] ) ) );
		expect( JSON.stringify( getBrowsersPlugin( config2.min.options.processors ) ) )
			.toEqual( JSON.stringify( creator( [ 'op_mini all' ] ) ) );

		// Safari 15 requires postcss-focus-visible.
		process.env.BROWSERSLIST = 'safari 15';
		const config4 = getPostCSSConfig();
		expect( getBrowsersPlugin( config4.toCSS.options.processors ).plugins.filter( plugin => {
			return 'postcss-focus-visible' === plugin.postcssPlugin;
		} ).length ).toEqual( 1 );

		expect( JSON.stringify( getBrowsersPlugin( config4.toCSS.options.processors ) ) )
			.toEqual( JSON.stringify( creator( [ 'safari 15' ], {
				'focus-visible-pseudo-class': {
					replaceWith: ':global(.focus-visible)',
				},
			} ) ) );

		// @notice If this fails, we can probably remove the override from adjustBrowserslist and the toEqual to `0`.
		const wpDefaultBrowsers = [ ...require( '@wordpress/browserslist-config' ) ];
		process.env.BROWSERSLIST = browserslist( wpDefaultBrowsers );
		expect( getBrowsersPlugin( getPostCSSConfig().toCSS.options.processors ).plugins.filter( plugin => {
			return 'postcss-custom-properties' === plugin.postcssPlugin;
		} ).length ).toEqual( 1 );
	} );

	test.each( fixtures )( 'PostCSS fixtures ( $description )', async fixture => {
		if ( fixture.input.includes( 'safari-15' ) ) {
			process.env.BROWSERSLIST = 'safari 15';
		}

		const input = readFileSync( fixture.input, 'utf8' );
		let output = readFileSync( fixture.output.replace( '.css', '.raw.css' ), 'utf8' );
		let result = await processPostCSS( input, false, fixture.input );
		expect( cleanCSS( result.css ) ).toEqual( output.trim() );

		result = await processPostCSS( input, true, fixture.input );
		output = readFileSync( fixture.output.replace( '.css', '.raw.min.css' ), 'utf8' );
		expect( cleanCSS( result.css ) ).toEqual( output.trim() );
	} );
} );
