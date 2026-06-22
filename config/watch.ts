import fs from 'fs';
import {getPackageConfig, type PackageConfig} from '@lipemat/js-boilerplate-shared/helpers/package-config.js';
import {getDistFolder} from '../helpers/enum-modules';
import {LIVERELOAD_PORT_START} from '../helpers/livereload-port';
import {addTrailingSlash, removeTrailingSlash} from '@lipemat/js-boilerplate-shared/helpers/string.js';


type Event = 'all' | 'changed' | 'added' | 'deleted';

type LiveReload = boolean | { cert?: string; key?: string; port: number };

type Task = {
	files: string[];
	tasks?: string[];
	options: {
		atBegin?: boolean;
		dateFormat?: ( time: number ) => void;
		debounceDelay?: number;
		event?: Event | Event[];
		forever?: boolean;
		interval?: number;
		livereload?: LiveReload;
		reload?: boolean;
		spawn?: boolean;
	};
};


export type WatchGruntTasks = {
	postcss: Task;
	php: Task;
};

const packageConfig: PackageConfig = getPackageConfig();
const liveReloadPort: number = 'undefined' !== typeof process.env.LIPEMAT_LIVERELOAD_PORT
	? Number( process.env.LIPEMAT_LIVERELOAD_PORT )
	: LIVERELOAD_PORT_START;
let livereload: LiveReload = {
	port: liveReloadPort,
};

// Load local certificates for https if available.
if ( 'object' === typeof ( packageConfig.certificates ) && 'development' === process.env.NODE_ENV ) {
	livereload = {
		port: liveReloadPort,
		cert: fs.readFileSync( packageConfig.certificates.cert ).toString(),
		key: fs.readFileSync( packageConfig.certificates.key ).toString(),
	};
}

const postCSSTasks = [
	'postcss:toCSS',
];

postCSSTasks.unshift( 'caching:reset' );
postCSSTasks.push( 'caching:writeModules:development' );

if ( getPackageConfig().cssEnums ) {
	postCSSTasks.push( 'caching:reload' );
}

const themePath: string = addTrailingSlash( packageConfig.theme_path );

const config: WatchGruntTasks = {
	postcss: {
		files: packageConfig.pcssWatch.map( ( folder: string ) => {
			return addTrailingSlash( `${themePath}${removeTrailingSlash( folder )}` ) + `**/*.{pcss,css}`;
		} ),
		tasks: postCSSTasks,
		options: {
			spawn: false,
			livereload: false,
		},
	},
	php: {
		files: [
			...packageConfig.phpWatch.map( ( folder: string ): string => {
				return addTrailingSlash( `${themePath}${removeTrailingSlash( folder )}` ) + `**/*.php`;
			} ),
			`!${getDistFolder( 'development', true )}/**/*.php`,
		],
		options: {
			livereload,
		},
	},
};

module.exports = config;
