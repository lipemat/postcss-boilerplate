module.exports = {
	theme : {
		options: {
			configFile: '<%= pkg.theme_path %>.stylelintrc',
			formatter: 'string',
			ignoreDisables: false,
			failOnError: true,
			outputFile: '',
			reportNeedlessDisables: false,
			syntax: '',
			fix: true,
		},
		src: [
            '<%= pkg.theme_path %>js/src/**/*.{pcss,css}',
			'<%= pkg.theme_path %>pcss/**/*.{pcss,css}',
			'<%= pkg.theme_path %>template-parts/**/*.{pcss,css}',
		]
	}
};
