import fs from 'fs';
import net from 'net';
import os from 'os';
import path from 'path';

/**
 * First port within the LiveReload range, and the default port.
 */
export const LIVERELOAD_PORT_START = 35729;

/**
 * Number of ports available to the LiveReload server.
 *
 * Capped to the maximum number of simultaneous PHP dev servers.
 */
export const LIVERELOAD_PORT_RANGE = 20;

const LIVERELOAD_HOST = '0.0.0.0';

/**
 * Shared directory used to reserve ports across all worktrees on this machine.
 *
 * The OS port probe only catches ports already bound by a live server. Two
 * worktrees starting in parallel can both probe the same free port before
 * either binds it, so a reservation file claims the port atomically.
 */
const RESERVATION_DIR = path.join( os.tmpdir(), 'lipemat-livereload' );

const reservedPorts = new Set<number>();
let cleanupRegistered = false;

/**
 * Check if a single port is free to bind to.
 *
 * @param {number} port - Port to check.
 *
 * @return {Promise<boolean>}
 */
function isPortFree( port: number ): Promise<boolean> {
	return new Promise( resolve => {
		const server = net.createServer();
		server.unref();
		server.on( 'error', () => {
			resolve( false );
		} );
		server.listen( {host: LIVERELOAD_HOST, port}, () => {
			server.close( () => {
				resolve( true );
			} );
		} );
	} );
}

/**
 * Is the process holding a reservation still running?
 *
 * @param {number} pid - Process ID to check.
 *
 * @return {boolean}
 */
function isProcessAlive( pid: number ): boolean {
	try {
		process.kill( pid, 0 );
		return true;
	} catch ( error ) {
		return 'EPERM' === ( error as NodeJS.ErrnoException ).code;
	}
}

function reservationFile( port: number ): string {
	return path.join( RESERVATION_DIR, `${port}.pid` );
}

function releasePort( port: number ): void {
	reservedPorts.delete( port );
	fs.rmSync( reservationFile( port ), {force: true} );
}

/**
 * Register a single set of process listeners which release every reserved
 * port when this process exits.
 */
function registerCleanup(): void {
	if ( cleanupRegistered ) {
		return;
	}
	cleanupRegistered = true;
	process.on( 'exit', () => {
		reservedPorts.forEach( port => fs.rmSync( reservationFile( port ), {force: true} ) );
	} );
	// Signals do not emit `exit`, so convert them to a clean exit.
	process.on( 'SIGINT', () => process.exit( 0 ) );
	process.on( 'SIGTERM', () => process.exit( 0 ) );
}

/**
 * Atomically reserve a port across every worktree on this machine.
 *
 * Reclaims the reservation if the owning process is no longer running.
 *
 * @param {number} port - Port to reserve.
 *
 * @return {boolean} - True when this process now owns the reservation.
 */
function reservePort( port: number ): boolean {
	fs.mkdirSync( RESERVATION_DIR, {recursive: true} );
	const file = reservationFile( port );
	try {
		const fd = fs.openSync( file, 'wx' );
		fs.writeSync( fd, String( process.pid ) );
		fs.closeSync( fd );
		reservedPorts.add( port );
		registerCleanup();
		return true;
	} catch ( error ) {
		if ( 'EEXIST' !== ( error as NodeJS.ErrnoException ).code ) {
			throw error;
		}
		const owner = Number( fs.readFileSync( file, 'utf8' ) );
		if ( Number.isNaN( owner ) || ! isProcessAlive( owner ) ) {
			fs.rmSync( file, {force: true} );
			return reservePort( port );
		}
		return false;
	}
}

/**
 * Resolve the first free port within the LiveReload range.
 *
 * Reserves the port for this process so parallel worktrees never select the
 * same port. The reservation is released automatically when this process exits.
 *
 * @throws {Error} - When every port within the range is in use.
 *
 * @return {Promise<number>}
 */
export async function getLiveReloadPort(): Promise<number> {
	const lastPort = LIVERELOAD_PORT_START + LIVERELOAD_PORT_RANGE - 1;
	for ( let port = LIVERELOAD_PORT_START; port <= lastPort; port++ ) {
		if ( ! reservePort( port ) ) {
			continue;
		}
		if ( await isPortFree( port ) ) {
			return port;
		}
		releasePort( port );
	}
	throw new Error( `Unable to start LiveReload: all ${LIVERELOAD_PORT_RANGE} ports (${LIVERELOAD_PORT_START}-${lastPort}) are in use.` );
}
