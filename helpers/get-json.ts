import {getPackageConfig} from '@lipemat/js-boilerplate-shared/helpers/package-config.js';
import path from 'path';
import fse from 'fs-extra';
import type {Environment} from './config';
import {EnumModules} from './enum-modules';

/**
 * Custom output of CSS modules JSON files.
 * The results are combined into a single `modules.json` file generated
 * in the `css_folder`.
 *
 * Excludes CSS modules from the global "pcss" directory.
 *
 * @link https://www.npmjs.com/package/postcss-modules#user-content-saving-exported-classes
 */
export function getJSON( env: Environment ) {
	return ( cssFileName: string, json: object ) => {
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


		jsonModules.combinedJson( env );

		if ( getPackageConfig().cssEnums ) {
			const enums = new EnumModules( filePath, json );
			enums.addModuleToEnum( env );
		}
	};
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
	private readonly json: object;
	private readonly cssName: string;
	private filePath: string;

	private static content: object = {
		production: {},
		development: {},
	};

	constructor( directory: string, cssName: string, json: object ) {
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
		JsonModules.content[ env ][ this.filePath.replace( this.cssName + '/', '' ) + this.cssName ] = this.json;
	}

	/**
	 * Flush the combined JSON file to disk.
	 */
	public static flushToDisk( env: Environment ) {
		const combined = ( getDistFolder() + '/' + getCombinedName( env ) ).replace( /\\/g, '/' );
		fse.outputJsonSync( combined, JsonModules.content[ env ] );
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
