import config from '@lipemat/eslint-config';

export default [
	...config,
	{
		ignores: [
			'.pnp.cjs',
			'.pnp.loader.mjs',
			'eslint.config.mjs',
			'**/*.jsx',
			'jest/fixtures/*',
			'jest/mocks/*',
			'.worktrees/*',
			'.claude/*'
		],
	}
];
