import fs from 'fs';
import {getPackageConfig, type PackageConfig} from '../helpers/package-config';
import {getDistFolder} from '../helpers/enum-modules';

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

module.exports = {
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
