process.env.NODE_ENV = 'development';

const grunt = require( 'grunt' );

grunt.task.init = function () {
};

require( '../Gruntfile' )( grunt );

grunt.tasks( 'watch' );
