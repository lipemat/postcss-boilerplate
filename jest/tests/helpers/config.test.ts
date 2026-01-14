import {getExternalFiles} from '../../../helpers/config';


afterEach( () => {
	delete process.env.BROWSERSLIST;
} );

describe( 'config', () => {
	test( 'getExternalFiles', () => {
		const currentPath = process.cwd();
		const expectedFiles = [
			currentPath + '\\jest\\theme\\pcss\\globals\\media-queries.pcss',
			currentPath + '\\jest\\theme\\pcss\\globals\\variables.pcss',
		];
		expect( getExternalFiles() ).toEqual( expectedFiles );
	} );
} );
