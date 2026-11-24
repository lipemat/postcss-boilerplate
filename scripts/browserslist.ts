import browserslist from 'browserslist';
import {getBrowsersList} from '@lipemat/js-boilerplate-shared/helpers/browserslist';

const help = `
List browsers being targeted by PostCSS.

Standard browserslist configurations will be honored.
If no configuration is provided, this falls back to @wordpress/browserslist-config.

Usage: lipemat-postcss-browserslist [options]

--help, -h       Show help menu.`;

const args = process.argv.slice( 2 );
if ( '-h' === args[ 0 ] || '--help' === args[ 0 ] ) {
	console.debug( help );
	process.exit( 0 );
}


const provided = getBrowsersList();

console.debug( '' );
console.debug( 'CSS Provided Browserslist' );
console.table( provided );

console.debug( '' );
console.debug( 'CSS Included Browsers' );
console.table( browserslist( provided, {
	env: 'production',
} ) );

console.debug( '' );
console.debug( 'CSS Browser Coverage' );
console.debug( browserslist.coverage( browserslist( provided, {
	env: 'production',
} ) ) );
