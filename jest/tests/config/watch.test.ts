import {getPackageConfig} from '../../../helpers/package-config';

let mockWatch: false | string[] = false;
let mockCssEnums: boolean = false;
let mockCombinedJson: boolean = false;

// Change the result of the getPackageConfig function.
jest.mock( '../../../helpers/package-config.ts', () => ( {
	...jest.requireActual( '../../../helpers/package-config.ts' ),
	getPackageConfig: () => {
		const pkgConfig = jest.requireActual( '../../../helpers/package-config.ts' );
		pkgConfig.cssEnums = mockCssEnums;
		pkgConfig.combinedJson = mockCombinedJson;
		if ( false !== mockWatch ) {
			pkgConfig.pcssWatch = mockWatch;
		}
		return pkgConfig;
	},
} ) );

function getWatchConfig() {
	jest.resetModules();
	return require( '../../../config/watch.ts' );
}

afterEach( () => {
	mockWatch = false;
} );

describe( 'Test watch config', () => {
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
		mockCssEnums = true;
		mockCombinedJson = true;
		expect( getWatchConfig() ).toMatchSnapshot();

		mockWatch = [ 'woocommerce', 'template-parts', 'pcss' ];
		expect( getWatchConfig() ).toMatchSnapshot();

		mockCssEnums = false;
		expect( getWatchConfig() ).toMatchSnapshot();

		mockCombinedJson = false;
		expect( getWatchConfig() ).toMatchSnapshot();
	} );
} );
