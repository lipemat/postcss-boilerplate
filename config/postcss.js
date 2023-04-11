const config = require( '../helpers/package-config' );
const postcssPresetEnv = require( 'postcss-preset-env' );
const FileSystemLoader = require( '../lib/FileSystemLoader' );
const {generateScopedName} = require( '../helpers/css-classnames' );
const {getEntries} = require( '../helpers/entries' );
const {getDefaultBrowsersList} = require( '../helpers/config' );
const {combinedJson, JsonModule, JsonModules, getJSON} = require( '../helpers/get-json' );
const path = require( 'path' );

const presetEnv = {
	features: {
		/**
		 * Fixes `focus-visible` feature for CSS modules (included by preset-env anywhere
		 * Safari is supported).
		 *
		 * Requires `focus-visible` polyfill to be loaded externally to support Safari.
		 *
		 * @link https://caniuse.com/css-focus-visible
		 *
		 * May be imported directly into the index.js for sites, which loads JS app
		 * on every page.
		 * @link https://github.com/WICG/focus-visible
		 *
		 * Most will often need it site wide on pages, which do and don't use the JS app.
		 * @link https://unpkg.com/focus-visible@5.2.0/dist/focus-visible.min.js
		 */
		'focus-visible-pseudo-class': {
			replaceWith: ':global(.focus-visible)',
		},
	},
};

/**
 * If browserslist is not specified, we fall back to WordPress defaults.
 *
 * @link https://github.com/csstools/postcss-preset-env#browsers
 */
if ( getDefaultBrowsersList() ) {
	presetEnv.browsers = getDefaultBrowsersList();
}

/**
 * Get the hash to generate the CSS module name, or
 * the `generateScopeName` for short CSS classes
 * if enabled.
 *
 */
const getGenerateScopeName = () => {
	if ( 'production' === process.env.NODE_ENV ) {
		// Use short CSS classes if enabled.
		if ( config.shortCssClasses ) {
			return generateScopedName;
		}
		// @todo If run into issues with class name conflicts @see b36fc5309 as a more robust alternative.
		return '[contenthash:base52:5]';
	}
	return 'Ⓜ[name]__[local]__[contenthash:base52:2]';
}


const compileOptions = {
	map: true,
	processors: [
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
			name: ( {hash} ) => hash
		} )
	],
	parser: require( 'postcss-scss' ),
};

const minOptions = Object.assign( {}, compileOptions );
minOptions.map = false;
minOptions.processors = [ ...compileOptions.processors ];
minOptions.processors.push( require( '../lib/postcss-clean' )( {
		level: 2,
	} )
);

const gruntTasks = {
	toCSS: {
		options: compileOptions,
		files: getEntries().toCSS
	},

	min: {
		options: minOptions,
		files: getEntries().min
	},
};

module.exports = gruntTasks;
