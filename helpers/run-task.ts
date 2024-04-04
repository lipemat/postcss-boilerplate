import grunt from 'grunt';
import {EnumModules} from './enum-modules';
import {JsonModules} from './get-json';
import gruntConfig from '../Gruntfile';

export type GruntExposed = IGrunt & {
	task: IGrunt['task'] & {
		init: () => void;
	},
	tasks: ( taskName: string ) => void;
}


export function resetLocalCache() {
	EnumModules._resetContent();
	JsonModules._resetContent();
}


/**
 * Run a grunt task by name.
 */
export function run( taskName: string ) {
	const configured: GruntExposed = gruntConfig( grunt as GruntExposed );

	configured.tasks( taskName );

	// Reset the local cache between watch runs during the `start` command.
	configured.event.on( 'watch', resetLocalCache );
}

export default {
	run,
};
