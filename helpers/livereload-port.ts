import net from 'net';

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
 * Resolve the first free port within the LiveReload range.
 *
 * @throws {Error} - When every port within the range is in use.
 *
 * @return {Promise<number>}
 */
export async function getLiveReloadPort(): Promise<number> {
	const lastPort = LIVERELOAD_PORT_START + LIVERELOAD_PORT_RANGE - 1;
	for ( let port = LIVERELOAD_PORT_START; port <= lastPort; port++ ) {
		if ( await isPortFree( port ) ) {
			return port;
		}
	}
	throw new Error( `Unable to start LiveReload: all ${LIVERELOAD_PORT_RANGE} ports (${LIVERELOAD_PORT_START}-${lastPort}) are in use.` );
}
