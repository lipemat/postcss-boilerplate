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

module.exports = {
	postcss: {
		files: [
			`${packageConfig.theme_path}pcss/**/*.{pcss,css}`,
			`${packageConfig.theme_path}template-parts/**/*.{pcss,css}`,
		],
		tasks: [
			'postcss:toCSS',
		],
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
