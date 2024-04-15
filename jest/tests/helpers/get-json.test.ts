import fse from 'fs-extra';
import {JsonModules} from '../../../helpers/get-json';

// Change this variable during tests.
let mockCombinedJson = false;
let mockJsonContents = {};

/**
 * To prevent: ReferenceError: Cannot access 'mockCombinedJson' before initialization
 */
function getJSON( cssFileName: string, json: Object ) {
	const env = 'production' === process.env.NODE_ENV ? 'production' : 'development';
	return require( '../../../helpers/get-json' ).getJSON( env )( cssFileName, json );
}

// Change the result of the getPackageConfig function, so we can enable combined json.
jest.mock( '../../../helpers/package-config.ts', () => ( {
	...jest.requireActual( '../../../helpers/package-config.ts' ),
	getPackageConfig: () => ( {
		...jest.requireActual( '../../../helpers/package-config.ts' ),
		// Change this variable during the test.
		combinedJson: mockCombinedJson,
		// Point to our data directory for the theme_path.
		theme_path: 'jest/theme/',
	} ),
} ) );


// Prevent files from being written to disk.
jest.mock( 'fs-extra', () => {
	return {
		outputJsonSync: jest.fn().mockImplementation( ( file, contents ) => mockJsonContents = contents ),
		readJsonSync: jest.fn().mockImplementation( () => mockJsonContents ),
	};
} );

afterEach( () => {
	JsonModules._resetContent();
	mockCombinedJson = false;
	jest.clearAllMocks();
	process.env.NODE_ENV = 'test';
} );


describe( 'getJSON', () => {
	const {THEME_PATH} = process.env;

	test( 'combinedJson', () => {
		mockCombinedJson = true;
		getJSON( THEME_PATH + '/test.pcss', {
			'purple-bg': 'test_purple_bg_1',
		} );
		expect( fse.outputJsonSync ).toHaveBeenCalledTimes( 0 );
		JsonModules.flushToDisk( 'development' );
		expect( fse.outputJsonSync ).toHaveBeenCalledTimes( 1 );
		expect( fse.outputJsonSync ).toHaveBeenLastCalledWith( THEME_PATH + 'css/modules.json', {
			'test.pcss': {
				'purple-bg': 'test_purple_bg_1',
			},
		} );

		getJSON( THEME_PATH + '/template-parts/nav.pcss', {
			wrap: 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug',
			'global-composes': 'Ⓜnav__global-composes__bw site-title nothing',
			extra: 'Ⓜnav__extra__Ih',
		} );
		JsonModules.flushToDisk( 'development' );
		expect( fse.outputJsonSync ).toHaveBeenCalledTimes( 2 );
		expect( fse.outputJsonSync ).toHaveBeenLastCalledWith( THEME_PATH + 'css/modules.json', {
			'test.pcss': {
				'purple-bg': 'test_purple_bg_1',
			},
			'template-parts/nav.pcss': {
				wrap: 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug',
				'global-composes': 'Ⓜnav__global-composes__bw site-title nothing',
				extra: 'Ⓜnav__extra__Ih',
			},
		} );

		// Global pcss is excluded
		getJSON( THEME_PATH + 'pcss/globals/variables.pcss', {} );
		JsonModules.flushToDisk( 'development' );
		expect( fse.outputJsonSync ).toHaveBeenCalledTimes( 3 );
		expect( fse.outputJsonSync ).toHaveBeenLastCalledWith( THEME_PATH + 'css/modules.json', {
			'test.pcss': {
				'purple-bg': 'test_purple_bg_1',
			},
			'template-parts/nav.pcss': {
				wrap: 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug',
				'global-composes': 'Ⓜnav__global-composes__bw site-title nothing',
				extra: 'Ⓜnav__extra__Ih',
			},
		} );
	} );


	test( 'moduleFile', () => {
		mockCombinedJson = false;
		getJSON( THEME_PATH + '/test.pcss', {
			'purple-bg': 'Ⓜtest__purple-bg__ug',
		} );
		expect( fse.outputJsonSync ).toHaveBeenCalledTimes( 1 );
		expect( fse.outputJsonSync ).toHaveBeenLastCalledWith( 'jest/theme/_css-modules-json/test.pcss.json', {
			'purple-bg': 'Ⓜtest__purple-bg__ug',
		} );

		// Global pcss is excluded
		getJSON( THEME_PATH + 'pcss/globals/variables.pcss', {} );
		expect( fse.outputJsonSync ).toHaveBeenCalledTimes( 1 );

		getJSON( THEME_PATH + '/template-parts/nav.pcss', {
			wrap: 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug',
			'global-composes': 'Ⓜnav__global-composes__bw site-title nothing',
			extra: 'Ⓜnav__extra__Ih',
		} );
		expect( fse.outputJsonSync ).toHaveBeenCalledTimes( 2 );
		expect( fse.outputJsonSync ).toHaveBeenLastCalledWith( 'jest/theme/_css-modules-json/template-parts/nav.pcss.json', {
			wrap: 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug',
			'global-composes': 'Ⓜnav__global-composes__bw site-title nothing',
			extra: 'Ⓜnav__extra__Ih',
		} );
	} );


	test( 'Dist directory combined', () => {
		process.env.NODE_ENV = 'production';
		mockCombinedJson = true;
		getJSON( THEME_PATH + '/test.pcss', {
			'purple-bg': 'a',
		} );
		JsonModules.flushToDisk( 'production' );
		expect( fse.outputJsonSync ).toHaveBeenCalledTimes( 1 );
		expect( fse.outputJsonSync ).toHaveBeenLastCalledWith( THEME_PATH + 'css/modules.min.json', {
			'test.pcss': {
				'purple-bg': 'a',
			},
		} );
	} );


	test( 'Dist directory module', () => {
		process.env.NODE_ENV = 'production';

		getJSON( THEME_PATH + '/test.pcss', {
			'purple-bg': 'a',
		} );
		expect( fse.outputJsonSync ).toHaveBeenCalledTimes( 1 );
		expect( fse.outputJsonSync ).toHaveBeenLastCalledWith( 'jest/theme/_css-modules-json/min/test.pcss.json', {
			'purple-bg': 'a',
		} );
	} );
} );
