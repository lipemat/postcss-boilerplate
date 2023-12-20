import {getPackageConfig} from './package-config';
import path from 'path';
import fse from 'fs-extra';
import type {Environment} from './config';
import {CssModuleEnums} from './css-module-enums';

/**
 * Custom output of CSS modules JSON files to the `_css-modules-json` if not
 * using `combinedJson`. If using `combinedJson` the results are combined into a
 * single `modules.json` file generated in the `css_folder`.
 *
 * Excludes CSS modules from the global "pcss" directory.
 *
 * @link https://www.npmjs.com/package/postcss-modules#user-content-saving-exported-classes
 */
export function getJSON( env: Environment ) {
	return ( cssFileName: string, json: Object ) => {
		const directory = path.relative( getPackageConfig().theme_path, cssFileName ).replace( /\\/g, '/' ) + '/';
		// Exclude global pcss directory.
		if ( 'pcss' === directory.substring( 0, 4 ) ) {
			return;
		}

		const jsonModules = new JsonModules(
			directory,
			path.basename( cssFileName, '.css' ),
			json
		);

		if ( getPackageConfig().combinedJson ) {
			jsonModules.combinedJson( env );

			if ( getPackageConfig().cssEnums ) {
				const enums = new CssModuleEnums( directory, path.basename( cssFileName, '.pcss' ), json );
				enums.addModuleToEnum( env );
			}
		} else {
			jsonModules.moduleFile( env );
		}
	}
}


function getModulesFolder( env: Environment ): string {
	return 'production' === env ? '_css-modules-json/min/' : '_css-modules-json/';
}


function getCombinedName( env: Environment ): string {
	return 'production' === env ? 'modules.min.json' : 'modules.json';
}


function getDistFolder() {
	return path.resolve( getPackageConfig().theme_path + getPackageConfig().css_folder );
}

/**
 * Generate the combined.json file as well as the individual
 * module files.
 *
 * @see getJSON
 */
class JsonModules {
	private readonly json: Object;
	private readonly cssName: string;
	private directory: string;

	constructor( directory: string, cssName: string, json: Object ) {
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
	combinedJson( env: Environment ) {
		const combined = ( getDistFolder() + '/' + getCombinedName( env ) ).replace( /\\/g, '/' );
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
	 * @note Here for backwards compatibility. Not really using this anymore.
	 */
	moduleFile( env: Environment ) {
		const jsonFileName = getPackageConfig().theme_path.replace( /\\/g, '/' ) + getModulesFolder( env ) + this.directory.replace( this.cssName + '/', '' ) + this.cssName + '.json';
		fse.outputJsonSync( jsonFileName, this.json );
	}
}
