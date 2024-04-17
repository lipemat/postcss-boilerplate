import {getPackageConfig} from '../helpers/package-config';
import type {LinterOptions} from 'stylelint';

const minimist = require( 'minimist' );

type Config = {
	options: Omit<LinterOptions, 'files' | 'failOnError' | 'formatter'> & {
		configFile: string;
		formatter?: 'string' | 'verbose' | 'json';
		ignoreDisables?: boolean;
		failOnError?: boolean;
		outputFile: string;
		reportNeedlessDisables?: boolean;
		syntax: 'scss' | 'less' | 'sugarss' | '';
	};
	src: string[];
};

export type StylelintGruntTasks = {
	theme: Config;
};

// Command line arguments.
const flags = minimist( process.argv.slice( 2 ) );

const themePath = getPackageConfig().theme_path;

const config: StylelintGruntTasks = {
	theme: {
		options: {
			cache: true,
			cacheStrategy: 'content',
			configFile: `${themePath}.stylelintrc`,
			formatter: 'string',
			ignoreDisables: false,
			failOnError: true,
			outputFile: '',
			reportNeedlessDisables: false,
			syntax: '',
			fix: ( flags.fix ?? true ) !== 'false',
		},
		src: [
			`${themePath}js/src/**/*.{pcss,css}`,
			`${themePath}pcss/**/*.{pcss,css}`,
			`${themePath}template-parts/**/*.{pcss,css}`,
		],
	},
};

module.exports = config;
