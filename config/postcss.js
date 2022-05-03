const config = require( '../helpers/package-config' );
const postcssPresetEnv = require( 'postcss-preset-env' );
const FileSystemLoader = require( '../lib/FileSystemLoader' );
const {generateScopedName} = require( '../helpers/css-classnames' );
const fs = require( 'fs' );
const path = require( 'path' );
const {getDefaultBrowsersList} = require( '../helpers/config' );

const modulesFolder = 'production' === process.env.NODE_ENV ? '_css-modules-json/min/' : '_css-modules-json/';
const presetEnv = {};
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
	if ( 'production' === process.env.NODE_ENV) {
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
					Loader: FileSystemLoader.default,
					globalModulePaths: [
						new RegExp( '.*?' + config.theme_path.replace( /\//g, '\\\\' ) + 'pcss', 'i' ),
						new RegExp( '.*?' + config.theme_path + 'pcss', 'i' ),
					],
					/**
					 * Custom output of CSS modules JSON file to specified location
					 * Also excludes json files from the global pcss files
					 */
					getJSON( cssFileName, json ) {
						const path = require( 'path' );
						const fse = require( 'fs-extra' );
						const directory = path.relative( config.theme_path, cssFileName ).replace( /\\/g, '/' ) + '/';
						// Exclude global pcss directory.
						if ( 'pcss' === directory.substring( 0, 4 ) ) {
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
