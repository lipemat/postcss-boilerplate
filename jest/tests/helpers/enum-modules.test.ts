import {EnumModules, getDistFolder} from '../../../helpers/enum-modules';
import {getPackageConfig, type PackageConfig} from '../../../helpers/package-config';
import fs from 'fs';
import fse from 'fs-extra';


let mockPackageConfig: Partial<PackageConfig> = {
	css_folder: './css/dist/',
	theme_path: 'jest/theme/',
};
let mockEnumContents = {};

jest.mock( '../../../helpers/package-config.ts', () => ( {
	...jest.requireActual( '../../../helpers/package-config.ts' ),
	getPackageConfig: () => ( {
		...jest.requireActual( '../../../helpers/package-config.ts' ),
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
	};
	jest.clearAllMocks();
} );


describe( 'cssModuleEnums', () => {
	const {THEME_PATH} = process.env;


	test( 'getDistFolder', () => {
		mockPackageConfig.css_folder = 'css/';
		expect( getDistFolder() ).toBe( THEME_PATH + 'css' );

		mockPackageConfig.css_folder = './css/dist/';
		expect( getDistFolder() ).toBe( THEME_PATH + 'css' );

		mockPackageConfig.css_folder = 'css/dist/';
		expect( getDistFolder() ).toBe( THEME_PATH + 'css' );

		mockPackageConfig.css_folder = '';
		expect( getDistFolder() + '/' ).toBe( THEME_PATH );

		mockPackageConfig.css_folder = './css/dist/';
		mockPackageConfig.theme_path = './';
		expect( getDistFolder() ).toBe( getPackageConfig().workingDirectory + '/css' );

		mockPackageConfig.theme_path = '';
		expect( getDistFolder() ).toBe( getPackageConfig().workingDirectory + '/css' );
	} );


	test( 'addModuleToEnum', () => {
		const expected = fs.readFileSync( 'jest/fixtures/css-module-enums/module-enums.php', 'utf-8' );
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
		expect( fse.readFileSync ).toHaveBeenCalledTimes( 3 );
		expect( fse.outputFileSync ).toHaveBeenCalledTimes( 2 );
		expect( fse.outputFileSync ).toHaveBeenLastCalledWith( THEME_PATH + 'css/module-enums.min.php', expected );
		expect( mockEnumContents ).toEqual( expected );

		nav.addModuleToEnum( 'development' );
		deeper.addModuleToEnum( 'development' );
		expect( fse.outputFileSync ).toHaveBeenLastCalledWith(
			THEME_PATH + 'css/module-enums.php',
			expected );
		expect( mockEnumContents ).toEqual( expected );
	} );


	test( 'Through getJSON', () => {
		const expected = fs.readFileSync( 'jest/fixtures/css-module-enums/module-enums.php', 'utf-8' );
		const getJSON = require( '../../../helpers/get-json.ts' ).getJSON( 'production' );
		// Neither combinedJson nor cssEnums enabled.
		getJSON( THEME_PATH + 'template-parts/nav.pcss', {
			wrap: 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug',
			'global-composes': 'Ⓜnav__global-composes__bw site-title nothing',
			extra: 'Ⓜnav__extra__Ih',
		} );
		expect( mockEnumContents ).toEqual( '' );
		expect( fse.outputFileSync ).toHaveBeenCalledTimes( 0 );


		// Just enums enabled but not combinedJson.
		mockPackageConfig.cssEnums = true;
		getJSON( THEME_PATH + 'template-parts/nav.pcss', {
			wrap: 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug',
			'global-composes': 'Ⓜnav__global-composes__bw site-title nothing',
			extra: 'Ⓜnav__extra__Ih',
		} );
		expect( mockEnumContents ).toEqual( '' );
		expect( fse.outputFileSync ).toHaveBeenCalledTimes( 0 );


		// Both combinedJson and cssEnums enabled.
		mockPackageConfig.combinedJson = true;
		getJSON( THEME_PATH + 'template-parts/nav.pcss', {
			wrap: 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug',
			'global-composes': 'Ⓜnav__global-composes__bw site-title nothing',
			extra: 'Ⓜnav__extra__Ih',
		} );
		getJSON( THEME_PATH + 'template-parts/header/deeper.pcss', {
			'global-composes': 'Ⓜdeeper__global-composes__bw nothing',
			extra: 'Ⓜdeeper__extra__Ih',
		} );
		expect( fse.readFileSync ).toHaveBeenCalledTimes( 3 );
		expect( fse.outputFileSync ).toHaveBeenCalledTimes( 2 );
		expect( fse.outputFileSync ).toHaveBeenLastCalledWith( THEME_PATH + 'css/module-enums.min.php', expected );
		expect( mockEnumContents ).toEqual( expected );
	} );
} );
