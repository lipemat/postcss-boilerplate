let config = require("../helpers/package-config");
const FileSystemLoader = require( '../lib/FileSystemLoader' );
const modulesFolder = process.env.NODE_ENV === 'production' ? '_css-modules-json/min/' : '_css-modules-json/';
const fs = require( 'fs' );
const path = require( 'path' );

let compileOptions = {
	map: true,
	processors: [
		require('postcss-import')({
			extension: 'pcss',
			plugins : [
				require( 'postcss-modules' )( {
					generateScopedName : process.env.NODE_ENV === 'production' ? '[hash:base64:5]' : 'Ⓜ[name]__[local]__[hash:base64:1]',
					Loader: FileSystemLoader.default,
					globalModulePaths : [
						new RegExp( '.*?' + config.theme_path.replace( /\//g, '\\\\' ) + 'pcss', "i" ),
						new RegExp( '.*?' + config.theme_path + 'pcss', "i" ),
					],
					/**
					 * Custom output of css modules JSON file to specified location
					 * Also excludes json files from the global pcss files
					 */
					getJSON: function(cssFileName, json) {
						const path          = require('path');
						const fse = require('fs-extra');
						let directory = path.relative( config.theme_path, cssFileName ).replace( /\\/g, '/' ) + '/';
						//exclude global pcss
						if ( directory.substr(0,4) === 'pcss' ){
							return;
						}
						let cssName       = path.basename(cssFileName, '.css');
						let jsonFileName  = config.theme_path.replace( /\\/g, '/' ) + modulesFolder + directory.replace( cssName + '/','') + cssName + '.json';

						/**
						 * We use the Sync method here to fix issues where JSON is not
						 * being generated.
						 *
						 * @since 2019-01-22
						 */
						fse.outputJsonSync(jsonFileName, json);
					}
				} ),
			],
		}),
        require('postcss-custom-media'),
        require('postcss-nested'),
        //@link https://preset-env.cssdb.org/features
        //By default all stage 2 features work unless specified otherwise
        require('postcss-preset-env'),
        require('postcss-color-mod-function'),
        require('@lipemat/css-mqpacker'),
	],
	parser: require('postcss-scss'),
};

let minOptions = Object.assign({}, compileOptions);
minOptions.map = false;
minOptions.processors = [ ...compileOptions.processors ];
minOptions.processors.push( require( 'postcss-clean' )( {
		level: 2
	} )
);

let gruntTasks = {
	toCSS: {
		options: compileOptions,
		files: {
			'<%= pkg.theme_path %><%= pkg.css_folder %><%= pkg.file_name %>.css': '<%= pkg.theme_path %>pcss/<%= pkg.file_name %>.pcss'
		}
	},

	min: {
		options: minOptions,
		files: {
			'<%= pkg.theme_path %><%= pkg.css_folder %><%= pkg.file_name %>.min.css': '<%= pkg.theme_path %>pcss/<%= pkg.file_name %>.pcss'
		}
	}
};

// Loads an admin.js file if it exists @since 2.4.0
if ( fs.existsSync( path.resolve( config.theme_path + 'pcss', 'admin.pcss' ) ) ) {
	gruntTasks.toCSS.files[ '<%= pkg.theme_path %><%= pkg.css_folder %>admin.css' ] = '<%= pkg.theme_path %>pcss/admin.pcss';
	gruntTasks.min.files[ '<%= pkg.theme_path %><%= pkg.css_folder %>admin.min.css' ] = '<%= pkg.theme_path %>pcss/admin.pcss';
}


module.exports = gruntTasks;
