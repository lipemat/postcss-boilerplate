import type {Config} from 'jest';
import config from '@lipemat/js-boilerplate-shared/config/jest.config.js';

const jestConfig: Config = config;

jestConfig.setupFilesAfterEnv = [
	'<rootDir>/setup.ts',
];

export default jestConfig;
