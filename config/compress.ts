import {getPackageConfig} from '../helpers/package-config';

const folder = getPackageConfig().css_folder;

export type CompressGruntTasks = {
	brotli: Config;
}

type Options = {
	pretty?: boolean;
	createEmptyArchive?: boolean;

}

type OptionsZip = {
	level?: number;
	mode: 'zip' | 'gzip';
}

type OptionsBrotli = {
	mode: 'brotli';
	brotli?: { [ constant: number ]: number };

}

type OptionsTar = {
	mode: 'tar' | 'zip' | 'tgz';
	archive?: string | ( () => string );
}


type Config = {
	options: Options | OptionsZip | OptionsBrotli | OptionsTar;
	expand: boolean;
	cwd: string;
	dest: string;
	extDot: 'first' | 'last';
	src: string[];
	ext: string;
};


/**
 * Compress files using Brotli.
 *
 * Generates .br versions of the .min files if the package.json
 * has `brotliFiles` set to `true`.
 */
const config: CompressGruntTasks = {
	brotli: {
		options: {
			mode: 'brotli',
		},
		expand: true,
		cwd: folder,
		dest: folder,
		extDot: 'last',
		src: [ '**/*.min.css' ],
		ext: '.css.br',
	},
};

module.exports = config;
