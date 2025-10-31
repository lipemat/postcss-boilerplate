<?php
/** @noinspection PhpUnused, PhpMultipleClassDeclarationsInspection, EmptyClassInspection, AutoloadingIssuesInspection */
//phpcs:disable
declare( strict_types=1 );

namespace CSS_Modules {
	trait Utils {
		/**
		 * Get a list of all class names mapped to their class value.
		 *
		 * @return array<string, string> (classNames => classValue)
		 */
		public static function classNames(): array {
			return \array_combine( \array_map( fn( $case ) => $case->name, static::cases() ), \array_map( fn( $case ) => $case->value, static::cases() ) );
		}
	}
}

namespace CSS_Modules\Template_Parts {
	enum Nav: string {
		use \CSS_Modules\Utils;

		case wrap = 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug';
		case globalComposes = 'Ⓜnav__global-composes__bw site-title nothing';
		case extra = 'Ⓜnav__extra__Ih';
	}
}

namespace CSS_Modules\Template_Parts\Header {
	enum Deeper: string {
		use \CSS_Modules\Utils;

		case globalComposes = 'Ⓜdeeper__global-composes__bw nothing';
		case extra = 'Ⓜdeeper__extra__Ih';
	}
}
