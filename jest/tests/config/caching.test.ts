import cachingTask from '../../../config/caching';
import {EnumModules} from '../../../helpers/enum-modules';
import {getPackageConfig} from '../../../helpers/package-config';
import {resolve} from 'path';


// Change the result of the getPackageConfig function.
jest.mock( '../../../helpers/package-config.ts', () => ( {
	...jest.requireActual( '../../../helpers/package-config.ts' ),
	getPackageConfig: () => {
		const pkgConfig = jest.requireActual( '../../../helpers/package-config.ts' );
		const config = pkgConfig.getPackageConfig();
		config.cssEnums = true;
		return config;
	},
} ) );


describe( 'Test caching config', () => {
	test( 'reset', () => {
		( new EnumModules( 'template-parts/nav.pcss/', {
			wrap: 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug',
			'global-composes': 'Ⓜnav__global-composes__bw site-title nothing',
			extra: 'Ⓜnav__extra__Ih',
		} ) ).addModuleToEnum( 'development' );
		( new EnumModules( 'template-parts/header/deeper.pcss/', {
			'global-composes': 'Ⓜdeeper__global-composes__bw nothing',
			extra: 'Ⓜdeeper__extra__Ih',
		} ) ).addModuleToEnum( 'development' );


		expect( EnumModules.getCssClasses() ).toStrictEqual( [
			'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug',
			'Ⓜnav__global-composes__bw site-title nothing',
			'Ⓜnav__extra__Ih',
			'Ⓜdeeper__global-composes__bw nothing',
			'Ⓜdeeper__extra__Ih',
		] );
		cachingTask( 'reset', undefined );
		expect( EnumModules.getCssClasses() ).toStrictEqual( [] );
		// @ts-ignore --  Accessing a private field.
		expect( EnumModules.content ).toStrictEqual( {
			production: '',
			development: '',
		} );
	} );


	test( 'reload', () => {
		const triggerReload = jest.fn();
		const tinylr = require( 'tiny-lr' );
		tinylr.changed = triggerReload;
		const config = getPackageConfig();
		const directories = config.css_folder.split( '/' ).filter( ( part: string ) => '' !== part && '.' !== part );
		const dir = resolve( directories[ 0 ] ).replace( /\\/g, '/' );

		( new EnumModules( 'template-parts/nav.pcss/', {
			wrap: 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug',
			'global-composes': 'Ⓜnav__global-composes__bw site-title nothing',
			extra: 'Ⓜnav__extra__Ih',
		} ) ).addModuleToEnum( 'development' );
		( new EnumModules( 'template-parts/header/deeper.pcss/', {
			'global-composes': 'Ⓜdeeper__global-composes__bw nothing',
			extra: 'Ⓜdeeper__extra__Ih',
		} ) ).addModuleToEnum( 'development' );

		cachingTask( 'reload', undefined );
		expect( triggerReload ).toHaveBeenCalledTimes( 1 );
		expect( triggerReload ).toHaveBeenLastCalledWith( dir + '/module-enums.php', expect.any( Function ) );

		cachingTask( 'reload', undefined );
		expect( triggerReload ).toHaveBeenCalledTimes( 1 );

		( new EnumModules( 'template-parts/header/deeper.pcss/', {
			'global-composes': 'changed nothing',
		} ) ).addModuleToEnum( 'development' );
		cachingTask( 'reload', undefined );
		expect( triggerReload ).toHaveBeenCalledTimes( 2 );
		expect( triggerReload ).toHaveBeenLastCalledWith( dir + '/module-enums.php', expect.any( Function ) );
	} );


	it( 'matches snapshot', () => {
		expect( require( '../../../config/caching' ) ).toMatchSnapshot();
	} );
} );
