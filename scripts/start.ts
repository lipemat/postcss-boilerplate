process.env.NODE_ENV = 'development';

import path from 'path';
import startRunner from '../helpers/run-task';
import {getLiveReloadPort} from '../helpers/livereload-port';
import {getDistFolder} from '../helpers/enum-modules';
import {createRunningFlag} from '../helpers/running-flag';

( async () => {
	const port = await getLiveReloadPort();
	process.env.LIPEMAT_LIVERELOAD_PORT = String( port );

	/**
	 * Create a `.running` file within the CSS dist folder, which only
	 * exists while this script is running.
	 *
	 * Read by PHP to point the LiveReload script at this worktree's port.
	 */
	createRunningFlag( path.resolve( getDistFolder( 'production' ), '.running' ), port );

	startRunner.run( 'watch' );
} )();
