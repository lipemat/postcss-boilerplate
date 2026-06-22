process.env.NODE_ENV = 'development';

import path from 'path';
import fse from 'fs-extra';
import startRunner from '../helpers/run-task';
import {getLiveReloadPort} from '../helpers/livereload-port';
import {getDistFolder} from '../helpers/enum-modules';

( async () => {
	process.env.LIPEMAT_LIVERELOAD_PORT = String( await getLiveReloadPort() );

	/**
	 * Create a `.running` file within the CSS dist folder, which only
	 * exists while this script is running.
	 *
	 * Read by PHP to point the LiveReload script at this worktree's port.
	 */
	const runningFile = path.resolve( getDistFolder( 'production' ), '.running' );
	fse.outputFileSync( runningFile, JSON.stringify( {
		pid: process.pid,
		port: Number( process.env.LIPEMAT_LIVERELOAD_PORT ),
		started: new Date().toISOString(),
	} ) );
	process.on( 'exit', () => {
		fse.removeSync( runningFile );
	} );

	startRunner.run( 'watch' );
} )();
