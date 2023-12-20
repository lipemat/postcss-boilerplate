import {getPackageConfig} from './package-config';
import path from 'path';
import fse from 'fs-extra';
import type {Environment} from './config';
import {EnumModules} from './enum-modules';

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
		const filePath = path.relative( getPackageConfig().theme_path, cssFileName ).replace( /\\/g, '/' ) + '/';
		// Exclude global pcss directory.
		if ( 'pcss' === filePath.substring( 0, 4 ) ) {
			return;
		}

		const jsonModules = new JsonModules(
			filePath,
			path.basename( cssFileName, '.css' ),
			json
		);

		if ( getPackageConfig().combinedJson ) {
			jsonModules.combinedJson( env );

			if ( getPackageConfig().cssEnums ) {
				const enums = new EnumModules( filePath, json );
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
export class JsonModules {
	private readonly json: Object;
	private readonly cssName: string;
	private filePath: string;

	private static content: Object = {
		production: {},
		development: {},
	};

	constructor( directory: string, cssName: string, json: Object ) {
		this.filePath = directory;
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
		JsonModules.content[ env ][ this.filePath.replace( this.cssName + '/', '' ) + this.cssName ] = this.json;
		fse.outputJsonSync( combined, JsonModules.content[ env ] );
	}

	/**
	 * Generate a .json file for each module in a separate
	 * file, which matches the location of the origin module.
	 *
	 * @note Here for backwards compatibility. Not really using this anymore.
	 */
	moduleFile( env: Environment ) {
		const jsonFileName = getPackageConfig().theme_path.replace( /\\/g, '/' ) + getModulesFolder( env ) + this.filePath.replace( this.cssName + '/', '' ) + this.cssName + '.json';
		fse.outputJsonSync( jsonFileName, this.json );
	}

	/**
	 * Reset the content of the JSON module file between
	 * runs during the `start` task.
	 *
	 * Prevents removed CSS classes and files from remaining between runs.
	 */
	static _resetContent() {
		JsonModules.content = {
			production: {},
			development: {},
		};
	}
}
