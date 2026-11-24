import grunt from 'grunt';
import {resolve} from 'path';
import stylelint, {type LintResult} from 'stylelint';
import type {StylelintGruntTasks} from '../../../config/stylelint';
import {modifyConfig} from '../../setup';

type Warning = {
	line: number;
	rule: string;
};


function getConfig(): StylelintGruntTasks {
	jest.resetModules();
	return require( '../../../config/stylelint.ts' );
}


function getLintedFiles(): string[] {
	return grunt.file.expand( getConfig().theme.src );
}


async function lintThemeFiles(): Promise<LintResult[]> {
	modifyConfig( {
		packageDirectory: 'jest/theme',
	} );
	const config = getConfig();
	const {results} = await stylelint.lint( {
		files: grunt.file.expand( config.theme.src ),
		configFile: config.theme.options.configFile,
		fix: false,
	} );
	modifyConfig( {} );
	return results;
}


function getResult( results: LintResult[], file: string ): LintResult {
	const result = results.find( item => resolve( item.source ?? '' ) === resolve( file ) );
	if ( undefined === result ) {
		throw new Error( `${file} was not linted.` );
	}
	return result;
}


function getWarnings( results: LintResult[], file: string ): Warning[] {
	return getResult( results, file ).warnings
		.map( ( warning: Warning ) => ( {
			line: warning.line,
			rule: warning.rule,
		} ) )
		.sort( ( a, b ) => a.line - b.line );
}


describe( 'stylelint config', () => {
	it( 'lints Svelte components in js/src', () => {
		expect( getLintedFiles() ).toContain( 'jest/theme/js/src/components/Widget.svelte' );
	} );


	it( 'skips Svelte TypeScript modules', () => {
		expect( grunt.file.exists( 'jest/theme/js/src/components/counter.svelte.ts' ) ).toBe( true );
		expect( getLintedFiles() ).not.toContain( 'jest/theme/js/src/components/counter.svelte.ts' );
	} );


	it( 'lints PostCSS files in pcss and template-parts', () => {
		expect( getLintedFiles() ).toEqual( expect.arrayContaining( [
			'jest/theme/pcss/admin.pcss',
			'jest/theme/template-parts/nav.pcss',
		] ) );
	} );
} );


describe( 'stylelint theme task', () => {
	let results: LintResult[];

	beforeAll( async () => {
		results = await lintThemeFiles();
	} );


	it( 'reports violations inside Svelte postcss style block at file line numbers', () => {
		expect( getWarnings( results, 'jest/theme/js/src/components/Invalid.svelte' ) ).toEqual( [
			{line: 7, rule: 'color-named'},
			{line: 10, rule: 'plugin/use-defensive-css'},
			{line: 11, rule: 'color-named'},
		] );
	} );


	it( 'reports nothing for valid Svelte style block', () => {
		expect( getWarnings( results, 'jest/theme/js/src/components/Widget.svelte' ) ).toEqual( [] );
	} );


	it( 'reports nothing for Svelte component without style block', () => {
		expect( getWarnings( results, 'jest/theme/js/src/components/Markup.svelte' ) ).toEqual( [] );
	} );


	it( 'marks Svelte component with violations as errored', () => {
		expect( getResult( results, 'jest/theme/js/src/components/Widget.svelte' ).errored ).toBeFalsy();
		expect( getResult( results, 'jest/theme/js/src/components/Invalid.svelte' ).errored ).toBe( true );
	} );
} );
