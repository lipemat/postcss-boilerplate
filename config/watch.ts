import fs from 'fs';
import {getPackageConfig, type PackageConfig} from '../helpers/package-config';
import {getDistFolder} from '../helpers/enum-modules';


type Event = 'all' | 'changed' | 'added' | 'deleted';

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
		livereload?: boolean | PackageConfig['certificates'];
		reload?: boolean;
		spawn?: boolean;
	};
};


export type WatchGruntTasks = {
	postcss: Task;
	php: Task;
};

const packageConfig: PackageConfig = getPackageConfig();
let livereload: boolean | PackageConfig['certificates'] = true;
// Load local certificates for https if available.
if ( 'object' === typeof ( packageConfig.certificates ) && 'development' === process.env.NODE_ENV ) {
	livereload = {
		cert: fs.readFileSync( packageConfig.certificates.cert ).toString(),
		key: fs.readFileSync( packageConfig.certificates.key ).toString(),
	};
}

const postCSSTasks = [
	'postcss:toCSS',
];

if ( getPackageConfig().combinedJson ) {
	postCSSTasks.unshift( 'caching:reset' );
	postCSSTasks.push( 'caching:writeModules:development' );
}

if ( getPackageConfig().cssEnums ) {
	postCSSTasks.push( 'caching:reload' );
}

const config: WatchGruntTasks = {
	postcss: {
		files: packageConfig.pcssWatch.map( ( folder: string ) => {
			return `${packageConfig.theme_path}${folder}/**/*.{pcss,css}`;
		} ),
		tasks: postCSSTasks,
		options: {
			spawn: false,
			livereload: false,
		},
	},
	php: {
		files: [
			`${packageConfig.theme_path}**/*.php`,
			`!${getDistFolder( 'development', true )}/**/*.php`,
		],
		options: {
			livereload,
		},
	},
};

module.exports = config;
