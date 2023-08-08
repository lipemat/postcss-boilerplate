'use strict'

/**
 * Custom PostCSS plugin to format CSS output.
 *
 * - Fix indentation.
 *
 * Inspired by postcss-prettify.
 */


/**
 * Get the depth of the current node.
 */
function getDepth( node ) {
	let depth = 0
	let parent = node.parent
	while ( parent.type !== 'root' ) {
		depth += 1
		parent = parent.parent
	}
	return depth
}

function indent( node, depth, position = 'before' ) {
	if ( node.raws[ position ] === undefined ) {
		return;
	}
	const indentStr = '\t'.repeat( depth );
	node.raws[ position ] = node.raws[ position ].trim().concat( `\n${indentStr}` )
}

function processCss( node ) {
	const nodeDepth = getDepth( node )
	indent( node, nodeDepth, 'before' );
	indent( node, nodeDepth, 'after' );

	if ( 0 === nodeDepth ) {
		node.raws.before += '\n'
	}
}

module.exports = () => {
	return {
		postcssPlugin: 'js-boilerplate/postcss-pretty',
		OnceExit( css ) {
			css.walk( processCss );
			if ( css.first !== undefined && css.first.raws !== undefined ) {
				css.first.raws.before = ''
			}
		},
	};
};

module.exports.postcss = true;
