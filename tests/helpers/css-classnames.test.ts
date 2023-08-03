import {ALPHABET, generateScopedName, getGenerateScopeName, getNextClass, resetCounters, SHORT_ALPHABET} from '../../helpers/css-classnames';

// Change this variable during tests.
let mockShortCssEnabled = false;

// Change the result of the getPackageConfig function, so we can change shortCssClasses.
jest.mock( '../../helpers/package-config.ts', () => ( {
	...jest.requireActual( '../../helpers/package-config.ts' ),
	getPackageConfig: () => ( {
		...jest.requireActual( '../../helpers/package-config.ts' ),
		// Change this variable during the test.
		shortCssClasses: mockShortCssEnabled,
	} ),
} ) );

afterEach( () => {
	process.env.NODE_ENV = 'test';
	mockShortCssEnabled = false;
} );


describe( 'Test CSS Classname Generation', () => {
	beforeEach( () => {
		resetCounters();
	} );


	it( 'getNextClass', () => {
		expect( getNextClass() ).toEqual( 'a' );
		expect( getNextClass() ).toEqual( 'b' );

		for ( let i = 0; i < SHORT_ALPHABET.length - 2; i++ ) {
			getNextClass();
		}
		expect( getNextClass() ).toEqual( 'aa' );
		expect( getNextClass() ).toEqual( 'ab' );

		const third = SHORT_ALPHABET.length * ALPHABET.length;
		for ( let i = 0; i < third - 2; i++ ) {
			getNextClass();
		}
		expect( getNextClass() ).toEqual( 'aaa' );
		expect( getNextClass() ).toEqual( 'aab' );
	} );


	it( 'generateScopedName', () => {
		expect( generateScopedName( 'a-class', 'E:/SVN/js-boilerplate/tests/fake.pcss' ) ).toEqual( 'a' );
		expect( generateScopedName( 'a-class', 'E:/SVN/js-boilerplate/tests/other.pcss' ) ).toEqual( 'b' );
		expect( generateScopedName( 'b-class', 'E:/SVN/js-boilerplate/tests/other.pcss' ) ).toEqual( 'c' );
		expect( generateScopedName( 'a-class', 'E:/SVN/js-boilerplate/tests/fake.pcss' ) ).toEqual( 'a' );
		expect( generateScopedName( 'b-class', 'E:/SVN/js-boilerplate/tests/other.pcss' ) ).toEqual( 'c' );
	} );

	test( 'getGenerateScopedName', () => {
		expect( getGenerateScopeName() ).toEqual( 'Ⓜ[name]__[local]__[contenthash:base52:2]' );

		process.env.NODE_ENV = 'production';
		expect( getGenerateScopeName() ).toEqual( '[contenthash:base52:5]' );

		jest.resetModules();
		mockShortCssEnabled = true;
		expect( getGenerateScopeName() ).toEqual( generateScopedName );
	} );
} );
