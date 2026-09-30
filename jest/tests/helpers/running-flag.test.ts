import fs from 'fs';
import os from 'os';
import path from 'path';
import {createRunningFlag} from '../../../helpers/running-flag';

const TEMP_DIR = path.join( os.tmpdir(), 'running-flag-test-' + process.pid );
const FLAG_PATH = path.join( TEMP_DIR, 'dist', '.running' );
const SIGNALS: NodeJS.Signals[] = [ 'SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK' ];

let existingExitListeners: NodeJS.ExitListener[];
let existingSignalListeners: Map<NodeJS.Signals, NodeJS.SignalsListener[]>;
let mockExit: jest.SpyInstance;
let mockKill: jest.SpyInstance;


function processError( code: string ): NodeJS.ErrnoException {
	return Object.assign( new Error( code ), {code} );
}


function addedExitListeners(): NodeJS.ExitListener[] {
	return process.listeners( 'exit' ).filter( listener => ! existingExitListeners.includes( listener ) );
}


function addedSignalListeners( signal: NodeJS.Signals ): NodeJS.SignalsListener[] {
	const existing = existingSignalListeners.get( signal ) ?? [];
	return process.listeners( signal ).filter( listener => ! existing.includes( listener ) );
}


beforeEach( () => {
	jest.useFakeTimers();
	fs.rmSync( TEMP_DIR, {recursive: true, force: true} );
	existingExitListeners = process.listeners( 'exit' );
	existingSignalListeners = new Map( SIGNALS.map( signal => [ signal, process.listeners( signal ) ] ) );
	mockExit = jest.spyOn( process, 'exit' ).mockImplementation( ( () => undefined ) as () => never );
	mockKill = jest.spyOn( process, 'kill' ).mockImplementation( () => true );
} );

afterEach( () => {
	addedExitListeners().forEach( listener => process.removeListener( 'exit', listener ) );
	SIGNALS.forEach( signal => {
		addedSignalListeners( signal ).forEach( listener => process.removeListener( signal, listener ) );
	} );
	jest.clearAllTimers();
	jest.restoreAllMocks();
	jest.useRealTimers();
	fs.rmSync( TEMP_DIR, {recursive: true, force: true} );
} );


describe( 'createRunningFlag', () => {
	it( 'creates running flag and missing dist directory', () => {
		expect( fs.existsSync( TEMP_DIR ) ).toBe( false );

		createRunningFlag( FLAG_PATH, 35730 );

		expect( fs.existsSync( FLAG_PATH ) ).toBe( true );
	} );


	it( 'writes pid and port to running flag', () => {
		createRunningFlag( FLAG_PATH, 35730 );

		expect( JSON.parse( fs.readFileSync( FLAG_PATH, 'utf8' ) ) ).toEqual( {
			pid: process.pid,
			port: 35730,
			started: expect.any( String ),
		} );
	} );


	it( 'keeps process running after creation', () => {
		createRunningFlag( FLAG_PATH, 35730 );

		expect( mockExit ).not.toHaveBeenCalled();
	} );


	it.each( SIGNALS.map( signal => ( {signal} ) ) )( 'exits process on $signal', ( {signal} ) => {
		createRunningFlag( FLAG_PATH, 35730 );

		addedSignalListeners( signal ).forEach( listener => listener( signal ) );

		expect( mockExit ).toHaveBeenCalledTimes( 1 );
	} );


	it( 'removes running flag on process exit', () => {
		createRunningFlag( FLAG_PATH, 35730 );
		expect( fs.existsSync( FLAG_PATH ) ).toBe( true );

		addedExitListeners().forEach( listener => listener( 0 ) );

		expect( fs.existsSync( FLAG_PATH ) ).toBe( false );
	} );


	it( 'ignores already removed running flag on process exit', () => {
		createRunningFlag( FLAG_PATH, 35730 );
		fs.unlinkSync( FLAG_PATH );

		expect( () => addedExitListeners().forEach( listener => listener( 0 ) ) ).not.toThrow();
	} );


	it( 'exits process when parent process is gone', () => {
		mockKill.mockImplementation( () => {
			throw processError( 'ESRCH' );
		} );
		createRunningFlag( FLAG_PATH, 35730 );

		jest.advanceTimersByTime( 3_000 );

		expect( mockExit ).toHaveBeenCalledTimes( 1 );
	} );


	it( 'waits 3 seconds before first parent check', () => {
		createRunningFlag( FLAG_PATH, 35730 );

		jest.advanceTimersByTime( 2_999 );
		expect( mockKill ).not.toHaveBeenCalled();

		jest.advanceTimersByTime( 1 );
		expect( mockKill ).toHaveBeenCalledTimes( 1 );
	} );


	it( 'keeps running while parent process is alive', () => {
		createRunningFlag( FLAG_PATH, 35730 );

		jest.advanceTimersByTime( 9_000 );

		expect( mockKill ).toHaveBeenCalledTimes( 3 );
		expect( mockExit ).not.toHaveBeenCalled();
	} );


	it( 'keeps running when parent process exists without signal permission', () => {
		mockKill.mockImplementation( () => {
			throw processError( 'EPERM' );
		} );
		createRunningFlag( FLAG_PATH, 35730 );

		jest.advanceTimersByTime( 3_000 );

		expect( mockKill ).toHaveBeenCalledTimes( 1 );
		expect( mockExit ).not.toHaveBeenCalled();
	} );


	it( 'probes parent process without sending a real signal', () => {
		createRunningFlag( FLAG_PATH, 35730 );

		jest.advanceTimersByTime( 6_000 );

		expect( mockKill.mock.calls ).toEqual( [
			[ process.ppid, 0 ],
			[ process.ppid, 0 ],
		] );
	} );


	it( 'removes running flag on cleanup', () => {
		const cleanup = createRunningFlag( FLAG_PATH, 35730 );
		expect( fs.existsSync( FLAG_PATH ) ).toBe( true );

		cleanup();

		expect( fs.existsSync( FLAG_PATH ) ).toBe( false );
	} );


	it( 'removes exit listener on cleanup', () => {
		const cleanup = createRunningFlag( FLAG_PATH, 35730 );
		expect( addedExitListeners() ).toHaveLength( 1 );

		cleanup();

		expect( addedExitListeners() ).toHaveLength( 0 );
	} );


	it.each( SIGNALS.map( signal => ( {signal} ) ) )( 'removes $signal listener on cleanup', ( {signal} ) => {
		const cleanup = createRunningFlag( FLAG_PATH, 35730 );
		expect( addedSignalListeners( signal ) ).toHaveLength( 1 );

		cleanup();

		expect( addedSignalListeners( signal ) ).toHaveLength( 0 );
	} );


	it( 'stops watching parent process on cleanup', () => {
		mockKill.mockImplementation( () => {
			throw processError( 'ESRCH' );
		} );
		const cleanup = createRunningFlag( FLAG_PATH, 35730 );

		cleanup();
		jest.advanceTimersByTime( 9_000 );

		expect( mockKill ).not.toHaveBeenCalled();
		expect( mockExit ).not.toHaveBeenCalled();
	} );
} );
