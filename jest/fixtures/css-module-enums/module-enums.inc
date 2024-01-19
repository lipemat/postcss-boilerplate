<?php
/** @noinspection PhpUnused, PhpMultipleClassDeclarationsInspection, EmptyClassInspection */
//phpcs:disable
declare( strict_types=1 );

namespace CSS_Modules\Template_Parts {

	enum Nav: string {
		case wrap = 'Ⓜnav__wrap__Jm Ⓜtest__purple-bg__ug';
		case globalComposes = 'Ⓜnav__global-composes__bw site-title nothing';
		case extra = 'Ⓜnav__extra__Ih';
	}
}

namespace CSS_Modules\Template_Parts\Header {

	enum Deeper: string {
		case globalComposes = 'Ⓜdeeper__global-composes__bw nothing';
		case extra = 'Ⓜdeeper__extra__Ih';
	}
}
