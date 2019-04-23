process.env.NODE_ENV = 'production';
const runner = require( '../helpers/run-task' );
// Compile any .pcss files to CSS first in case the .css file is not included in git (preferred).
runner.run( 'postcss:toCSS' );
// Compile the .css file to .min.css.
runner.run( 'postcss:min' );
runner.run( 'revision' );
