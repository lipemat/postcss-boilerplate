process.env.NODE_ENV = 'development';
const lintRunner = require( '../helpers/run-task' );
lintRunner.run( 'stylelint:theme' );
