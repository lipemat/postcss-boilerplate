process.env.NODE_ENV = 'development';

import path from 'path';
import startRunner from '../helpers/run-task';
import {getLiveReloadPort} from '../helpers/livereload-port';
import {getDistFolder} from '../helpers/enum-modules';
import {createRunningFlag} from '@lipemat/js-boilerplate-shared/helpers/running-flag.js';

( async () => {
	const port = await getLiveReloadPort();
	process.env.LIPEMAT_LIVERELOAD_PORT = String( port );

	/**
	 * Create a `.running` file within the CSS dist folder, which only
	 * exists while this script is running.
	 *
	 * Read by PHP to point the LiveReload script at this worktree's port.
	 */
	createRunningFlag( path.resolve( getDistFolder( 'production' ), '.running' ), JSON.stringify( {
		pid: process.pid,
		port,
		started: new Date().toISOString(),
	} ) );

	startRunner.run( 'watch' );
} )();
