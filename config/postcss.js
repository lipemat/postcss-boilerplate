const postcssPresetEnv = require( 'postcss-preset-env' );

const {getPackageConfig} = require( '../helpers/package-config' );
const {getGenerateScopeName} = require( '../helpers/css-classnames' );
const {getEntries} = require( '../helpers/entries' );
const {getBrowsersList, getExternalFiles} = require( '../helpers/config' );
const {getJSON} = require( '../helpers/get-json' );

const config = getPackageConfig();

/**
 * Base postcss-presets-env config.
 *
 */
const presetEnv = {
	browsers: getBrowsersList(),
	features: {},
};

// Get a list of included postcss plugins based no the browsers list.
const includedPlugins = postcssPresetEnv( presetEnv )
	.plugins
	.map( plugin => plugin.postcssPlugin );


if ( includedPlugins.includes( 'postcss-focus-visible' ) ) {
	presetEnv.features[ 'focus-visible-pseudo-class' ] = {
		/**
		 * Fixes `focus-visible` feature for CSS modules.
		 *
		 * Only needed if our browsers list includes non-supported browsers
		 * such as Safari 15.3 and below.
		 *
		 * Requires `focus-visible` polyfill to be loaded externally.
		 * Most will often need it site wide on pages, which do and don't use the JS app.
		 *
		 * @link https://unpkg.com/focus-visible@5.2.0/dist/focus-visible.min.js
		 */
		replaceWith: ':global(.focus-visible)',
	};
}


const compileOptions = {
	map: true,
	processors: [
		require( '@csstools/postcss-global-data' )( {
			files: getExternalFiles(),
		} ),
		require( 'postcss-import' )( {
			extension: 'pcss',
			plugins: [
				require( 'postcss-modules' )( {
					generateScopedName: getGenerateScopeName(),
					globalModulePaths: [
						new RegExp( '.*?' + config.theme_path.replace( /\//g, '\\\\' ) + 'pcss', 'i' ),
						new RegExp( '.*?' + config.theme_path + 'pcss', 'i' ),
					],
					getJSON,
				} ),
			],
			skipDuplicates: false,
		} ),
		require( 'postcss-custom-media' ),
		require( 'postcss-nested' ),
		postcssPresetEnv( presetEnv ),
		require( 'postcss-color-mod-function' ),
		require( '@lipemat/css-mqpacker' ),
		// Create a manifest for browser cache flushing.
		require( 'postcss-hash' )( {
			algorithm: 'md4',
			trim: 20,
			manifest: config.css_folder + '/manifest.json',
			name: ( {hash} ) => hash,
		} ),
	],
	parser: require( 'postcss-scss' ),
};

const minOptions = Object.assign( {}, compileOptions );
minOptions.map = false;
minOptions.processors = [ ...compileOptions.processors ];
minOptions.processors.push( require( '../lib/postcss-clean' )( {
	level: 2,
} ) );

// Add pretty output for development.
compileOptions.processors.push( require( '../lib/postcss-pretty' ) );

const gruntTasks = {
	toCSS: {
		options: compileOptions,
		files: getEntries().toCSS,
	},

	min: {
		options: minOptions,
		files: getEntries().min,
	},
};

module.exports = gruntTasks;
