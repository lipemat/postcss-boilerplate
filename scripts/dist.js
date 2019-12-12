process.env.NODE_ENV = 'production';
const runner = require( '../helpers/run-task' );
// Compile the /pcss/* files to .css
runner.run( 'postcss:toCSS' );
// Compile the /pcss/* files to .min.css
runner.run( 'postcss:min' );
runner.run( 'revision' );
