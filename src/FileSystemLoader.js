import CSSModulesLoader from 'css-modules-loader-core/lib/file-system-loader';
import path from 'path';
import fs from 'fs';

/**
 * Extension of css-modules-loader-core/lib/file-system-loader which
 * fixes paths on windows.
 *
 * We replace the method in question with the working version,
 * yet leave the rest of the class and module intact.
 *
 * We specify this class via config/postcss.js so we no longer need the forked version of the module.
 *
 * @link https://github.com/lipemat/css-modules-loader-core/commit/b710b1e6a3310cb379c0a215aad9f61ce2f127a8
 *
 * @since 2.2.0
 */
export default class FileSystemLoader extends CSSModulesLoader {

    fetch( _newPath, relativeTo, _trace ) {
        let newPath = _newPath.replace( /^["']|["']$/g, '' ),
            trace = _trace || String.fromCharCode( this.importNr ++ );
        return new Promise( ( resolve, reject ) => {
        	// If the Drive letter was doubled up on Windows by the postcss parser.
	        if (relativeTo.substring(0, 3) === relativeTo.substring(3, 6)) {
		        relativeTo = relativeTo.substring(3);
	        }
            let relativeDir = path.dirname( relativeTo ),
                rootRelativePath = path.resolve( relativeDir, newPath ),
                fileRelativePath = path.resolve( relativeDir, newPath );

            // if the path is not relative or absolute, try to resolve it in node_modules
            if ( newPath[ 0 ] !== '.' && newPath[ 0 ] !== '/' && ( newPath[ 1 ] !== ':' || newPath[ 2 ] !== '\\' ) ) {
                try {
                    fileRelativePath = require.resolve( newPath );
                } catch ( e ) {
                }
            }

            const tokens = this.tokensByFile[ fileRelativePath ];
            if ( tokens ) {
                return resolve( tokens );
            }

            fs.readFile( fileRelativePath, 'utf-8', ( err, source ) => {
                if ( err ) {
                    reject( err );
                }
                this.core.load( source, rootRelativePath, trace, this.fetch.bind( this ) )
                    .then( ( {injectableSource, exportTokens} ) => {
                        this.sources[ fileRelativePath ] = injectableSource;
                        this.traces[ trace ] = fileRelativePath;
                        this.tokensByFile[ fileRelativePath ] = exportTokens;
                        resolve( exportTokens );
                    }, reject )
            } )
        } )
    }
}
