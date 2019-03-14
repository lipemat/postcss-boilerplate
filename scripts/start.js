process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

const webpack = require( 'webpack' );
const WebpackDevServer = require( 'webpack-dev-server' );
const webpackConfig = require( '../helpers/config' ).getConfig('webpack.dev.js');

new WebpackDevServer( webpack( webpackConfig ), {
	disableHostCheck: true,
	publicPath: webpackConfig.output.publicPath,
	hot: true,
	https: true,
	historyApiFallback: true,
	headers: {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
		'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
	}
} ).listen( 3000, 'localhost', function( err, result ) {
	if ( err ) {
		return console.log( err );
	}

	console.log( 'Listening at https://localhost:3000/' );
} );
