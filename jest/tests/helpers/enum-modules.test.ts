import {EnumModules, getDistFolder} from '../../../helpers/enum-modules';
import {getPackageConfig, type PackageConfig} from '@lipemat/js-boilerplate-shared/helpers/package-config.js';
import fs from 'fs';
import fse from 'fs-extra';
import cachingTask from '../../../config/caching';


let mockPackageConfig: Partial<PackageConfig> = {
	css_folder: './css/dist/',
	theme_path: 'jest/theme/',
	cssEnums: true,
};
let mockEnumContents = {};

jest.mock( '@lipemat/js-boilerplate-shared/helpers/package-config.js', () => ( {
	...jest.requireActual( '@lipemat/js-boilerplate-shared/helpers/package-config.js' ),
	getPackageConfig: () => ( {
		...jest.requireActual( '@lipemat/js-boilerplate-shared/helpers/package-config.js' ).getPackageConfig(),
		...mockPackageConfig,
	} ),
} ) );

jest.mock( 'fs-extra', () => ( {
	...jest.requireActual( 'fs-extra' ),
	readFileSync: jest.fn().mockImplementation( ( file: string, encoding ) => {
		if ( ! [ '.json', '.ejs' ].includes( require( 'path' ).extname( file ) ) ) {
			if ( ! file.includes( 'fixtures' ) ) {
				return mockEnumContents;
			}
		}
		return jest.requireActual( 'fs-extra' ).readFileSync( file, encoding );
	} ),
	outputFileSync: jest.fn().mockImplementation( ( file, contents ) => mockEnumContents = contents ),
	outputJsonSync: jest.fn(),
	readJsonSync: jest.fn(),
} ) );


afterEach( () => {
	EnumModules._resetContent();
	mockEnumContents = '';
	mockPackageConfig = {
		css_folder: './css/dist/',
		theme_path: 'jest/theme/',
		cssEnums: true,
	};
	jest.clearAllMocks();
} );


describe( 'cssModuleEnums', () => {
	const {THEME_PATH} = process.env;


	test( 'getDistFolder', () => {
		mockPackageConfig.css_folder = 'css/';
		expect( getDistFolder( 'production' ) ).toBe( THEME_PATH + 'css' );
		expect( getDistFolder( 'development' ) ).toBe( THEME_PATH + 'css' );
		expect( getDistFolder( 'development', true ) ).toBe( getPackageConfig().theme_path + 'css' );

		mockPackageConfig.css_folder = './css/dist/';
		expect( getDistFolder( 'development' ) ).toBe( THEME_PATH + 'css' );
		expect( getDistFolder( 'production' ) ).toBe( THEME_PATH + 'css/dist' );
		expect( getDistFolder( 'development', true ) ).toBe( getPackageConfig().theme_path + 'css' );

		mockPackageConfig.css_folder = '';
		expect( getDistFolder( 'production' ) + '/' ).toBe( THEME_PATH );
		expect( getDistFolder( 'development' ) + '/' ).toBe( THEME_PATH );
		expect( getDistFolder( 'development', true ) ).toBe( getPackageConfig().theme_path );

		mockPackageConfig.css_folder = './css/dist/';
		mockPackageConfig.theme_path = './';
		expect( getDistFolder( 'production' ) ).toBe( getPackageConfig().workingDirectory + '/css/dist' );
		expect( getDistFolder( 'development' ) ).toBe( getPackageConfig().workingDirectory + '/css' );
		expect( getDistFolder( 'development', true ) ).toBe( './css' );

		mockPackageConfig.theme_path = '';
		mockPackageConfig.css_folder = './css/dist/';
		expect( getDistFolder( 'development' ) ).toBe( getPackageConfig().workingDirectory + '/css' );
		expect( getDistFolder( 'production' ) ).toBe( getPackageConfig().workingDirectory + '/css/dist' );
		expect( getDistFolder( 'development', true ) ).toBe( 'css' );
	} );


	test( 'addModuleToEnum', () => {
		const expected = fs.readFileSync( 'jest/fixtures/css-module-enums/module-enums.inc', 'utf-8' );
		const nav = new EnumModules( 'template-parts/nav.pcss/', {
			wrap: 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug',
			'global-composes': 'Ⓜnav__global-composes__bw site-title nothing',
			extra: 'Ⓜnav__extra__Ih',
		} );
		const deeper = new EnumModules( 'template-parts/header/deeper.pcss/', {
			'global-composes': 'Ⓜdeeper__global-composes__bw nothing',
			extra: 'Ⓜdeeper__extra__Ih',
		} );

		nav.addModuleToEnum( 'production' );
		deeper.addModuleToEnum( 'production' );
		expect( fse.readFileSync ).toHaveBeenCalledTimes( 2 );
		expect( fse.outputFileSync ).toHaveBeenCalledTimes( 0 );
		EnumModules.flushToDisk( 'production' );
		expect( fse.outputFileSync ).toHaveBeenCalledTimes( 1 );
		expect( fse.outputFileSync ).toHaveBeenLastCalledWith( THEME_PATH + 'css/dist/module-enums.min.inc', expected );
		expect( mockEnumContents ).toEqual( expected );

		nav.addModuleToEnum( 'development' );
		deeper.addModuleToEnum( 'development' );
		expect( fse.outputFileSync ).toHaveBeenCalledTimes( 1 );
		cachingTask( 'writeModules', 'development' );
		expect( fse.outputFileSync ).toHaveBeenCalledTimes( 2 );
		expect( fse.outputFileSync ).toHaveBeenLastCalledWith(
			THEME_PATH + 'css/module-enums.php',
			expected );
		expect( mockEnumContents ).toEqual( expected );
	} );

	test( 'No contents to write', () => {
		const consoleSpy = jest.spyOn( console, 'log' ).mockImplementation( () => {
		} );
		EnumModules.flushToDisk( 'production' );
		expect( fse.readFileSync ).toHaveBeenCalledTimes( 0 );
		expect( fse.outputFileSync ).toHaveBeenCalledTimes( 0 );
		expect( consoleSpy ).toHaveBeenCalledTimes( 1 );
		expect( consoleSpy ).toHaveBeenCalledWith( 'No CSS modules to write to disk.' );
	} );


	test( 'Through getJSON', () => {
		mockPackageConfig.cssEnums = false;
		const expected = fs.readFileSync( 'jest/fixtures/css-module-enums/module-enums.inc', 'utf-8' );
		const getJSON = require( '../../../helpers/get-json.ts' ).getJSON( 'production' );
		// Neither combinedJson nor cssEnums enabled.
		getJSON( THEME_PATH + 'template-parts/nav.pcss', {
			wrap: 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug',
			'global-composes': 'Ⓜnav__global-composes__bw site-title nothing',
			extra: 'Ⓜnav__extra__Ih',
		} );
		cachingTask( 'writeModules', 'production' );
		expect( mockEnumContents ).toEqual( '' );
		expect( fse.outputFileSync ).toHaveBeenCalledTimes( 0 );


		mockPackageConfig.cssEnums = true;
		// Both combinedJson and cssEnums enabled.
		getJSON( THEME_PATH + 'template-parts/nav.pcss', {
			wrap: 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug',
			'global-composes': 'Ⓜnav__global-composes__bw site-title nothing',
			extra: 'Ⓜnav__extra__Ih',
		} );
		getJSON( THEME_PATH + 'template-parts/header/deeper.pcss', {
			'global-composes': 'Ⓜdeeper__global-composes__bw nothing',
			extra: 'Ⓜdeeper__extra__Ih',
		} );
		cachingTask( 'writeModules', 'production' );
		expect( fse.readFileSync ).toHaveBeenCalledTimes( 1 );
		expect( fse.outputFileSync ).toHaveBeenCalledTimes( 1 );
		expect( fse.outputFileSync ).toHaveBeenLastCalledWith( THEME_PATH + 'css/dist/module-enums.min.inc', expected );
		expect( mockEnumContents ).toEqual( expected );
	} );
} );
