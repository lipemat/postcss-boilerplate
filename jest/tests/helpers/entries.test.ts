import {getEntries} from '../../../helpers/entries';

describe( 'entries', () => {
	it( 'should return entries', () => {
		expect( getEntries() ).toStrictEqual( {
			min: {
				'jest/theme/css/dist/admin.min.css': 'jest/theme/pcss/admin.pcss',
				'jest/theme/css/dist/front-end.min.css': 'jest/theme/pcss/front-end.pcss',
			},
			toCSS: {
				'jest/theme/css/dist/admin.css': 'jest/theme/pcss/admin.pcss',
				'jest/theme/css/dist/front-end.css': 'jest/theme/pcss/front-end.pcss',
			},
		} );
	} );
} );
