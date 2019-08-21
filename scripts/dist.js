process.env.NODE_ENV = 'production';
const runner = require( '../helpers/run-task' );
// Compile the .css file to .min.css.
runner.run( 'postcss:min' );
runner.run( 'revision' );
