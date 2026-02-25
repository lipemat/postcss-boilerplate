import fse from 'fs-extra';
import {JsonModules} from '../../../helpers/get-json';

// Change this variable during tests.
let mockJsonContents = {};

/**
 * To prevent: ReferenceError: Cannot access 'mockCombinedJson' before initialization
 */
function getJSON( cssFileName: string, json: object ) {
	const env = 'production' === process.env.NODE_ENV ? 'production' : 'development';
	return require( '../../../helpers/get-json' ).getJSON( env )( cssFileName, json );
}

// Change the result of the getPackageConfig function, so we can enable combined json.
jest.mock( '@lipemat/js-boilerplate-shared/helpers/package-config.js', () => ( {
	...jest.requireActual( '@lipemat/js-boilerplate-shared/helpers/package-config.js' ),
	getPackageConfig: () => ( {
		...jest.requireActual( '@lipemat/js-boilerplate-shared/helpers/package-config.js' ).getPackageConfig(),
		cssEnums: false,
		// Point to our data directory for the theme_path.
		theme_path: 'jest/theme/',
		css_folder: 'jest/theme/css/dist/',
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
	jest.clearAllMocks();
	process.env.NODE_ENV = 'test';
} );


describe( 'getJSON', () => {
	const {THEME_PATH} = process.env;

	test( 'combinedJson', () => {
		getJSON( THEME_PATH + '/test.pcss', {
			'purple-bg': 'test_purple_bg_1',
		} );
		expect( fse.outputJsonSync ).toHaveBeenCalledTimes( 0 );
		JsonModules.flushToDisk( 'development' );
		expect( fse.outputJsonSync ).toHaveBeenCalledTimes( 1 );
		expect( fse.outputJsonSync ).toHaveBeenLastCalledWith( THEME_PATH + 'css/dist/modules.json', {
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
		expect( fse.outputJsonSync ).toHaveBeenLastCalledWith( THEME_PATH + 'css/dist/modules.json', {
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
		expect( fse.outputJsonSync ).toHaveBeenLastCalledWith( THEME_PATH + 'css/dist/modules.json', {
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


	test( 'Dist directory combined', () => {
		process.env.NODE_ENV = 'production';
		getJSON( THEME_PATH + '/test.pcss', {
			'purple-bg': 'a',
		} );
		JsonModules.flushToDisk( 'production' );
		expect( fse.outputJsonSync ).toHaveBeenCalledTimes( 1 );
		expect( fse.outputJsonSync ).toHaveBeenLastCalledWith( THEME_PATH + 'css/dist/modules.min.json', {
			'test.pcss': {
				'purple-bg': 'a',
			},
		} );
	} );
} );
