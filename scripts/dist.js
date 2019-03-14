process.env.NODE_ENV = 'production';
const grunt = require( 'grunt' );

grunt.task.init = function () {
};

require( '../Gruntfile' )( grunt );

grunt.tasks( 'postcss:min' );
