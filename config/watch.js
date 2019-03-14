module.exports = {
	postcss: {
		files: [
			'<%= pkg.theme_path %>pcss/**/*.{pcss,css}',
			'<%= pkg.theme_path %>template-parts/**/*.{pcss,css}'
		],
		tasks: [
			'postcss:toCSS',
			'revision'
		],
		options: {
			spawn: false,
			livereload: false
		}
	},

	php: {
		files: ['<%= pkg.theme_path %>**/*.php'],
		options: {
			livereload: true
		}
	},
};
