const fse = require( 'fs-extra' );
const path = require( 'path' );

const config = require( './package-config' );

const modulesFolder = 'production' === process.env.NODE_ENV ? '_css-modules-json/min/' : '_css-modules-json/';
const distFolder = path.resolve( config.theme_path + config.css_folder )
const combinedName = 'production' === process.env.NODE_ENV ? 'modules.min.json' : 'modules.json';

/**
 * Custom output of CSS modules JSON files to the `_css-modules-json` if not
 * using `combinedJson`. If using `combinedJson` the results are combined into a
 * single `modules.json` file generated in the `css_folder`.
 *
 * Excludes CSS modules from the global "pcss" directory.
 *
 * @link https://www.npmjs.com/package/postcss-modules#user-content-saving-exported-classes
 */
function getJSON( cssFileName, json ) {
	const directory = path.relative( config.theme_path, cssFileName ).replace( /\\/g, '/' ) + '/';
	// Exclude global pcss directory.
	if ( 'pcss' === directory.substring( 0, 4 ) ) {
		return;
	}

	const jsonModules = new JsonModules(
		directory,
		path.basename( cssFileName, '.css' ),
		json
	)
	if ( config.combinedJson ) {
		jsonModules.combinedJson();
	} else {
		jsonModules.moduleFile();
	}
}

/**
 * Generate the combined.json file as well as the individual
 * module files.
 *
 * @see getJSON
 */
class JsonModules {
	constructor( directory, cssName, json ) {
		this.directory = directory;
		this.cssName = cssName;
		this.json = json;
	}

	/**
	 * Generate a single combined.json file for use with
	 * reading once for every file.
	 *
	 * Faster reading via PHP.
	 */
	combinedJson() {
		const combined = distFolder + '/' + combinedName;
		let content = {};
		try {
			content = fse.readJsonSync( combined ) ?? {};
		} catch ( e ) {
		}
		content[ this.directory.replace( this.cssName + '/', '' ) + this.cssName ] = this.json;
		fse.outputJsonSync( combined, content );
	}

	/**
	 * Generate a .json file for each module in a separate
	 * file, which matches the location of the origin module.
	 *
	 * @legacy
	 *
	 */
	moduleFile() {
		const jsonFileName = config.theme_path.replace( /\\/g, '/' ) + modulesFolder + this.directory.replace( this.cssName + '/', '' ) + this.cssName + '.json';
		fse.outputJsonSync( jsonFileName, this.json );
	}
}


module.exports = {
	getJSON
}
