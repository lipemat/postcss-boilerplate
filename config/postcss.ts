import {getGenerateScopeName} from '../helpers/css-classnames';
import {getPackageConfig} from '../helpers/package-config';
import {getEntries} from '../helpers/entries';
import {type Environment, getBrowsersList, getExternalFiles} from '../helpers/config';
import {getJSON} from '../helpers/get-json';
import type {Plugin, ProcessOptions, Processor} from 'postcss';
import PrettyPlugin from '../lib/postcss-pretty';
import {pluginOptions} from 'postcss-preset-env';
import type {AtImportOptions} from 'postcss-import';

const config = getPackageConfig();
const postcssPresetEnv = require( 'postcss-preset-env' );

export type PostCSSConfig = Pick<ProcessOptions, 'map' | 'parser'> & {
	processors: Plugin[];
	diff?: string| boolean;
	failOnError?: boolean;
	onError?: ( error: Error ) => void;
	sequential?: boolean;
	writeDest?: boolean;
}

export type PostCSSGruntTasks = {
	min: {
		options: PostCSSConfig;
		files: Record<string, string>;
	};
	toCSS: {
		options: PostCSSConfig;
		files: Record<string, string>;
	};
}

/**
 * Base postcss-presets-env config.
 *
 */
const presetEnv: pluginOptions = {
	browsers: [ ...getBrowsersList() ],
	features: {},
};

// Get a list of included postcss plugins based no the browsers list.
const includedPlugins: string[] = postcssPresetEnv( presetEnv ).plugins.map( ( plugin: Processor['plugins'][number] ) => {
	return 'postcssPlugin' in plugin ? plugin.postcssPlugin : '';
} );


if ( 'object' === typeof presetEnv.features && includedPlugins.includes( 'postcss-focus-visible' ) ) {
	presetEnv.features[ 'focus-visible-pseudo-class' ] = {
		/**
		 * Fixes `focus-visible` feature for CSS modules.
		 *
		 * Only needed if our browsers list includes non-supported browsers
		 * such as Safari 15.3 and below.
		 *
		 * Requires `focus-visible` polyfill to be loaded externally.
		 * Most will often need it site wide on pages, which do and don't use the JS app.
		 *
		 * @link https://unpkg.com/focus-visible@5.2.0/dist/focus-visible.min.js
		 */
		replaceWith: ':global(.focus-visible)',
	};
}

/**
 * A reusable config for postcss-import based on the environment.
 *
 * @param {'production'|'development'} env The environment to use.
 */
function getImportConfig( env: Environment ): AtImportOptions {
	return {
		plugins: [
			require( 'postcss-modules' )( {
				generateScopedName: getGenerateScopeName( env ),
				globalModulePaths: [
					new RegExp( '.*?' + config.theme_path.replace( /\//g, '\\\\' ) + 'pcss', 'i' ),
					new RegExp( '.*?' + config.theme_path + 'pcss', 'i' ),
				],
				getJSON: getJSON( env ),
			} ),
		],
		skipDuplicates: false,
	};
}


const compileOptions: PostCSSConfig = {
	map: true,
	processors: [
		require( '@csstools/postcss-global-data' )( {
			files: getExternalFiles(),
		} ),
		require( 'postcss-import' )( getImportConfig( 'development' ) ),
		require( 'postcss-custom-media' ),
		require( 'postcss-nested' ),
		postcssPresetEnv( presetEnv ),
		require( 'postcss-color-mod-function' ),
		require( 'postcss-sort-media-queries' )( {
			onlyTopLevel: true,
			sort: 'mobile-first',
			configuration: {
				unitlessMqAlwaysFirst: true,
			},
		} ),
		// Create a manifest for browser cache flushing.
		require( 'postcss-hash' )( {
			algorithm: 'md5',
			trim: 20,
			manifest: config.css_folder + '/manifest.json',
			name: ( {hash} ) => hash,
		} ),
	],
	parser: require( 'postcss-scss' ),
};

const minOptions = Object.assign( {}, compileOptions );
minOptions.map = false;
minOptions.processors = [ ...compileOptions.processors ].map( processor => {
	if ( 'postcss-import' === processor.postcssPlugin ) {
		return require( 'postcss-import' )( getImportConfig( 'production' ) );
	}
	return processor;
} );
minOptions.processors.push( require( '../lib/postcss-clean' )( {
	level: 2,
} ) );

// Add pretty output for development.
compileOptions.processors.push( PrettyPlugin );

const gruntTasks: PostCSSGruntTasks = {
	toCSS: {
		options: compileOptions,
		files: getEntries().toCSS,
	},
	min: {
		options: minOptions,
		files: getEntries().min,
	},
};

module.exports = gruntTasks;
