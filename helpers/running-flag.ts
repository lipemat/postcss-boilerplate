import fse from 'fs-extra';
import {isProcessAlive} from './livereload-port';

const PARENT_CHECK_INTERVAL = 3_000;

/**
 * SIGHUP fires when the terminal is closed (POSIX and Windows).
 * SIGBREAK fires on Ctrl+Break (Windows).
 */
const EXIT_SIGNALS: NodeJS.Signals[] = [ 'SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK' ];

/**
 * Signals do not emit `exit`, so convert them to a clean exit.
 */
function exit(): void {
	process.exit();
}

/**
 * Create a `.running` file, which only exists while this process is running.
 *
 * Removed when the process exits, receives a termination signal, or
 * the parent process (terminal) is gone.
 *
 * @param {string} runningFile - Path to the `.running` file.
 * @param {number} port        - LiveReload port.
 *
 * @return {() => void} - Remove the file and stop watching the process.
 */
export function createRunningFlag( runningFile: string, port: number ): () => void {
	fse.outputFileSync( runningFile, JSON.stringify( {
		pid: process.pid,
		port,
		started: new Date().toISOString(),
	} ) );

	// Parent may be killed without forwarding a signal (e.g. terminal force-closed).
	const parentPid = process.ppid;
	const parentWatcher = setInterval( () => {
		if ( ! isProcessAlive( parentPid ) ) {
			exit();
		}
	}, PARENT_CHECK_INTERVAL );
	parentWatcher.unref();

	function removeRunningFlag(): void {
		clearInterval( parentWatcher );
		process.off( 'exit', removeRunningFlag );
		EXIT_SIGNALS.forEach( signal => process.off( signal, exit ) );
		fse.removeSync( runningFile );
	}

	process.on( 'exit', removeRunningFlag );
	EXIT_SIGNALS.forEach( signal => process.on( signal, exit ) );

	return removeRunningFlag;
}
