const config = require( '../helpers/package-config' );
const postcssPresetEnv = require( 'postcss-preset-env' );
const FileSystemLoader = require( '../lib/FileSystemLoader' );
const genericNames = require( "generic-names" );
const fs = require( 'fs' );
const path = require( 'path' );
const {getDefaultBrowsersList} = require( '../helpers/config' );

const modulesFolder = 'production' === process.env.NODE_ENV ? '_css-modules-json/min/' : '_css-modules-json/';
const presetEnv = {};

/**
 * If browserslist is not specified, we fallback to WordPress defaults.
 *
 * @link https://github.com/csstools/postcss-preset-env#browsers
 */
if ( getDefaultBrowsersList() ) {
	presetEnv.browsers = getDefaultBrowsersList();
}

/**
 * PostCSS Modules uses Generic Names as is to generate CSS class
 * names as is. Generic Names prepends an extra `_` in front of
 * any class, which starts with a number.
 * Instead, we follow what CSS Loader for Webpack removes the leading
 * numbers before slicing the result to the correct length.
 * We always get a 5 digit class name with no leading number
 * nor superfluous underscore.
 *
 * @link https://github.com/webpack-contrib/css-loader/blob/71d317e8797972d135e616470e3d9d89abd0d829/src/utils.js#L390
 * @link https://github.com/madyankin/postcss-modules/blob/7d5965d4df201ef301421a5e35805d1b47f3c914/src/index.js#L23
 * @link https://github.com/css-modules/generic-names/blob/71e74af6538425ada4dab5b63019402aaa66f871/index.js#L27
 */
const getGenericName = genericNames( '[contenthash:base64:10]' );
const generateScopedName = function ( localName, filepath ) {
	const fullName = getGenericName( localName, filepath );
	return fullName
		// Replace any underscores or dashes.
		.replace( /[_-]+/g, "" )
		// Replace all leading digits.
		.replace( /^\d+/, "" )
		.slice( 0, 5 );
};


const compileOptions = {
	map: true,
	processors: [
		require( 'postcss-import' )( {
			extension: 'pcss',
			plugins: [
				require( 'postcss-modules' )( {
					generateScopedName: 'production' === process.env.NODE_ENV ? generateScopedName : 'Ⓜ[name]__[local]__[contenthash:base64:2]',
					Loader: FileSystemLoader.default,
					globalModulePaths: [
						new RegExp( '.*?' + config.theme_path.replace( /\//g, '\\\\' ) + 'pcss', 'i' ),
						new RegExp( '.*?' + config.theme_path + 'pcss', 'i' ),
					],
					/**
					 * Custom output of CSS modules JSON file to specified location.
					 * Also excludes json files from the global pcss files.
					 */
					getJSON( cssFileName, json ) {
						const path = require( 'path' );
						const fse = require( 'fs-extra' );
						const directory = path.relative( config.theme_path, cssFileName ).replace( /\\/g, '/' ) + '/';
						// Exclude global pcss directory.
						if ( 'pcss' === directory.substr( 0, 4 ) ) {
							return;
						}
						const cssName = path.basename( cssFileName, '.css' );
						const jsonFileName = config.theme_path.replace( /\\/g, '/' ) + modulesFolder + directory.replace( cssName + '/', '' ) + cssName + '.json';

						/**
						 * We use the Sync method here to fix issues where JSON is not
						 * being generated.
						 */
						fse.outputJsonSync( jsonFileName, json );
					},
				} ),
			],
		} ),
		require( 'postcss-custom-media' ),
		require( 'postcss-nested' ),
		postcssPresetEnv( presetEnv ),
		require( 'postcss-color-mod-function' ),
		require( '@lipemat/css-mqpacker' ),
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
		files: {
			'<%= pkg.theme_path %><%= pkg.css_folder %><%= pkg.file_name %>.css': '<%= pkg.theme_path %>pcss/<%= pkg.file_name %>.pcss',
		},
	},

	min: {
		options: minOptions,
		files: {
			'<%= pkg.theme_path %><%= pkg.css_folder %><%= pkg.file_name %>.min.css': '<%= pkg.theme_path %>pcss/<%= pkg.file_name %>.pcss',
		},
	},
};

// Loads an admin.pcss file if it exists @since 2.4.0
if ( fs.existsSync( path.resolve( config.theme_path + 'pcss', 'admin.pcss' ) ) ) {
	gruntTasks.toCSS.files[ '<%= pkg.theme_path %><%= pkg.css_folder %>admin.css' ] = '<%= pkg.theme_path %>pcss/admin.pcss';
	gruntTasks.min.files[ '<%= pkg.theme_path %><%= pkg.css_folder %>admin.min.css' ] = '<%= pkg.theme_path %>pcss/admin.pcss';
}


module.exports = gruntTasks;
