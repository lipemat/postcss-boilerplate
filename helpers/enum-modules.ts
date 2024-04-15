import type {Environment} from './config';
import path from 'path';
import {getPackageConfig} from './package-config';
import ejs from 'ejs';
import fse from 'fs-extra';

/**
 * - production: Get the dist folder from the package config.
 * - development: Get the top level folder from where the CSS is compiled.
 *
 * @example production: './css-root/dist/' => config.theme_path + 'css-root/dist'
 * @example development: './css-root/dist/' => config.theme_path + 'css-root'
 *
 * @param {Environment} env          - The node environment to get the dist folder for.
 * @param {boolean}     relativeOnly - Whether to return the path relative to `theme_path` or the full path.
 */
export function getDistFolder( env: Environment, relativeOnly: boolean = false ): string {
	const config = getPackageConfig();
	if ( 'production' === env ) {
		return path.resolve( config.theme_path + config.css_folder ).replace( /\\/g, '/' );
	}

	const directories = config.css_folder.split( '/' ).filter( ( part: string ) => '' !== part && '.' !== part );
	const relativePath = config.theme_path + ( directories[ 0 ] ?? '' );

	if ( relativeOnly ) {
		return relativePath;
	}
	return path.resolve( relativePath ).replace( /\\/g, '/' );
}

export function getEnumFilePath( env: Environment ): string {
	return ( getDistFolder( env ) + '/' + getCombinedName( env ) ).replace( /\\/g, '/' );
}


function getCombinedName( env: Environment ): string {
	return 'production' === env ? 'module-enums.min.inc' : 'module-enums.php';
}


function convertToCamelCase( cssClass: string ): string {
	const words = cssClass.split( '-' );
	for ( let i = 1; i < words.length; i++ ) {
		words[ i ] = words[ i ].charAt( 0 ).toUpperCase() + words[ i ].slice( 1 );
	}
	return words.join( '' );
}


/**
 * Create a PHP file with an enum for each CSS module.
 *
 * Uses `ejs` to render the template.
 */
export class EnumModules {
	private readonly json: Object;
	private readonly filePath: string;

	private static content: Object = {
		production: '',
		development: '',
	};

	private static cssClasses: string[] = [];

	private static template = '';

	constructor( filePath: string, json: Object ) {
		this.filePath = filePath;
		this.json = json;
		if ( '' === EnumModules.template ) {
			EnumModules.template = fse.readFileSync( __dirname + '/templates/module-enum.ejs', 'utf-8' );
		}
	}

	/**
	 * Add the module to the combined PHP enum file.
	 */
	addModuleToEnum( env: Environment ) {
		if ( '' === EnumModules.content[ env ] ) {
			EnumModules.content[ env ] = fse.readFileSync( __dirname + '/templates/module-enum-header.ejs', 'utf-8' );
		}

		EnumModules.cssClasses = EnumModules.cssClasses.concat( Object.values( this.json ) );

		EnumModules.content[ env ] += ejs.render( EnumModules.template, {
			classMap: this.getFormattedClassMap(),
			className: this.formatPHPClass( path.basename( this.filePath, '.pcss' ) ),
			nameSpace: 'CSS_Modules\\' + this.convertPathToEnum(),
		} );
	}


	/**
	 * Convert a file path to the name of a PHP enum.
	 */
	private convertPathToEnum(): string {
		const pathWithoutExtension = this.filePath.replace( '.pcss/', '' );
		const parts = pathWithoutExtension.split( '/' );
		parts.pop();
		return parts.map( this.formatPHPClass ).join( '\\' );
	}


	/**
	 * Convert a directory slug to a PHP class name.
	 *
	 * - Convert the first letter of each word to uppercase.
	 * - Replace hyphens with underscores.
	 */
	private formatPHPClass( directorySlug: string ): string {
		return directorySlug.split( '-' ).map( subWord => {
			return subWord.charAt( 0 ).toUpperCase() + subWord.slice( 1 );
		} ).join( '_' );
	}


	/**
	 * Get the JSON classmap with all keys converted to camelCase.
	 */
	private getFormattedClassMap(): Object {
		return Object.keys( this.json )
			.map( key => convertToCamelCase( key ) )
			.reduce( ( result, key, index ) => {
				result[ key ] = Object.values( this.json )[ index ];
				return result;
			}, {} );
	}

	/**
	 * Write the combined PHP enum file to disk.
	 */
	public static flushToDisk( env: Environment ) {
		const combined = getEnumFilePath( env );
		fse.outputFileSync( combined, EnumModules.content[ env ] );
	}

	/**
	 * Get a list of all CSS classes which have been added to the enums.
	 *
	 * Uses for comparison to see if the enums have changed and the browser
	 * needs to be reloaded.
	 */
	public static getCssClasses(): string[] {
		return EnumModules.cssClasses;
	}

	/**
	 * Reset the content of the combined PHP enum file between
	 * runs during the `start` task.
	 *
	 * Prevents enums from being duplicated.
	 */
	static _resetContent() {
		EnumModules.content = {
			production: '',
			development: '',
		};
		EnumModules.cssClasses = [];
	}
}
