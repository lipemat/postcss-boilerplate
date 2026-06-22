import net from 'net';
import {getLiveReloadPort, LIVERELOAD_PORT_RANGE, LIVERELOAD_PORT_START} from '../../../helpers/livereload-port';

/**
 * Occupy a real port so the resolver must skip it.
 *
 * @param {number} port - Port to occupy.
 *
 * @return {Promise<net.Server>}
 */
function occupyPort( port: number ): Promise<net.Server> {
	return new Promise( ( resolve, reject ) => {
		const server = net.createServer();
		server.on( 'error', reject );
		server.listen( {host: '0.0.0.0', port}, () => {
			resolve( server );
		} );
	} );
}

/**
 * Close an occupied port.
 *
 * @param {net.Server} server - Server to close.
 *
 * @return {Promise<void>}
 */
function releasePort( server: net.Server ): Promise<void> {
	return new Promise( resolve => {
		server.close( () => {
			resolve();
		} );
	} );
}

describe( 'livereload-port helper', () => {
	it( 'returns the first port when the range is free', async() => {
		expect( await getLiveReloadPort() ).toBe( LIVERELOAD_PORT_START );
	} );

	it( 'skips occupied ports and returns the next free one', async() => {
		const occupied = await occupyPort( LIVERELOAD_PORT_START );
		try {
			expect( await getLiveReloadPort() ).toBe( LIVERELOAD_PORT_START + 1 );
		} finally {
			await releasePort( occupied );
		}
	} );

	it( 'throws when every port in the range is in use', async() => {
		const servers: net.Server[] = [];
		try {
			for ( let port = LIVERELOAD_PORT_START; port < LIVERELOAD_PORT_START + LIVERELOAD_PORT_RANGE; port++ ) {
				servers.push( await occupyPort( port ) );
			}
			await expect( getLiveReloadPort() ).rejects.toThrow( /all 20 ports/ );
		} finally {
			await Promise.all( servers.map( releasePort ) );
		}
	} );
} );
