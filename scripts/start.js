process.env.NODE_ENV = 'development';
const runner = require( '../helpers/run-task' );
runner.run( 'watch' );
