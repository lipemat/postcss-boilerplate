import browserslist from 'browserslist';
import {getBrowsersList} from '../helpers/config';

const help = `
	List browsers being targeted by PostCSS.

	Standard browserslist configurations will be honored.
	If no configuration is provided, this falls back to @wordpress/browserslist-config.

	Usage: lipemat-postcss-browserslist [options]

	--help, -h       Show help menu.`;

const args = process.argv.slice( 2 );
if ( args[0] && ( args[0] === '-h' || args[0] === '--help' ) ) {
	console.log( help );
	process.exit( 0 );
}


const provided = getBrowsersList();

console.log( '' );
console.log( 'CSS Provided Browserslist' );
console.table( provided );

console.log( '' );
console.log( 'CSS Included Browsers' );
console.table( browserslist( provided, {
	env: 'production'
} ) );

console.log( '' );
console.log( 'CSS Browser Coverage' );
console.table( browserslist.coverage( browserslist( provided, {
	env: 'production'
} ) ) );
