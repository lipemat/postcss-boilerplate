import type {Environment} from './config';
import path from 'path';
import {getPackageConfig} from './package-config';
import ejs from 'ejs';
import fse from 'fs-extra';

function getCombinedName( env: Environment ): string {
	return 'production' === env ? 'module-enums.min.php' : 'module-enums.php';
}

/**
 * Get the top level folder from where the CSS is compiled.
 *
 * @example './css-root/dist/' => config.theme_path + 'css-root'
 */
export function getDistFolder() {
	const config = getPackageConfig();
	const directories = config.css_folder
		.split( '/' )
		.filter( ( part: string ) => '' !== part && '.' !== part );

	return path
		.resolve( config.theme_path + ( directories[ 0 ] ?? '' ) )
		.replace( /\\/g, '/' );
}


/**
 * Create a PHP file with an enum for each CSS module.
 *
 * Uses `ejs` to render the template.
 */
export class CssModuleEnums {
	private readonly json: Object;
	private readonly cssName: string;
	private readonly fullPath: string;


	constructor( fullPath: string, cssName: string, json: Object ) {
		this.fullPath = fullPath;
		this.cssName = cssName;
		this.json = json;
	}


	addModuleToEnum( env: Environment ) {
		const combined = ( getDistFolder() + '/' + getCombinedName( env ) ).replace( /\\/g, '/' );
		let content = '';
		try {
			content = fse.readFileSync( combined, 'utf-8' ) ?? '';
		} catch ( e ) {
		}
		if ( '' === content ) {
			content = fse.readFileSync( __dirname + '/templates/module-enum-header.ejs', 'utf-8' );
		}

		const template = fse.readFileSync( __dirname + '/templates/module-enum.ejs', 'utf-8' );
		content += ejs.render( template, {
			classMap: this.json,
			className: this.fullPath.replace( this.cssName + '.pcss/', '' ) + this.cssName,
		} );
		fse.outputFileSync( combined, content );
	}
}
