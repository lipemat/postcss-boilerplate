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
			return \array_column( static::cases(), 'value', 'name' );
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
