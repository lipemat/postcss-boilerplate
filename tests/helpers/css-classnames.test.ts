import {ALPHABET, generateScopedName, getNextClass, resetCounters, SHORT_ALPHABET,} from '../../helpers/css-classnames';

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
} );
