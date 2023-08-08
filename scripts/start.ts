process.env.NODE_ENV = 'development';
const startRunner = require( '../helpers/run-task' );
startRunner.run( 'watch' );
