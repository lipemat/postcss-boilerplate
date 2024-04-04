// Change this variable during tests.
import {getPackageConfig} from '../../../helpers/package-config';

let mockWatch: false | string[] = false;

// Change the result of the getPackageConfig function, so we can change shortCssClasses.
jest.mock( '../../../helpers/package-config.ts', () => ( {
	...jest.requireActual( '../../../helpers/package-config.ts' ),
	getPackageConfig: () => {
		if ( false === mockWatch ) {
			return jest.requireActual( '../../../helpers/package-config.ts' );
		}
		return {
			...jest.requireActual( '../../../helpers/package-config.ts' ),
			// Change this variable during the test.
			pcssWatch: mockWatch,
		};
	},
} ) );

function getWatchConfig() {
	jest.resetModules();
	return require( '../../../config/watch.ts' );
}

afterEach( () => {
	mockWatch = false;
} );

describe( 'Test watch files from package.json', () => {
	it( 'watch files from package.json', () => {
		expect( getWatchConfig().postcss.files ).toStrictEqual( [
			getPackageConfig().theme_path + 'pcss/**/*.{pcss,css}',
			getPackageConfig().theme_path + 'template-parts/**/*.{pcss,css}',
		] );

		mockWatch = [ 'woocommerce', 'template-parts', 'pcss' ];
		expect( getWatchConfig().postcss.files ).toStrictEqual( [
			getPackageConfig().theme_path + 'woocommerce/**/*.{pcss,css}',
			getPackageConfig().theme_path + 'template-parts/**/*.{pcss,css}',
			getPackageConfig().theme_path + 'pcss/**/*.{pcss,css}',
		] );
	} );

	it( 'matches snapshot', () => {
		expect( getWatchConfig() ).toMatchSnapshot();

		mockWatch = [ 'woocommerce', 'template-parts', 'pcss' ];
		expect( getWatchConfig() ).toMatchSnapshot();
	} );
} );
