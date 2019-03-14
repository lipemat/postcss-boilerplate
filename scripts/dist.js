process.env.NODE_ENV = 'production';
const grunt = require( 'grunt' );
const configHelper = require( '../helpers/config' );
const config = require( '../helpers/package-config' );

grunt.task.init = function () {
};

grunt.initConfig( {pkg: config, postcss: configHelper.getConfig( 'postcss.js' )} );
grunt.loadNpmTasks( 'grunt-postcss' );

grunt.tasks( 'postcss:min' );
