import grunt from 'grunt';
import gruntConfig from '../Gruntfile';

export type GruntExposed = IGrunt & {
	task: IGrunt['task'] & {
		init: () => void;
	},
	tasks: ( taskName: string ) => void;
}

/**
 * Run a grunt task by name.
 */
export function run( taskName: string ) {
	const configured: GruntExposed = gruntConfig( grunt as GruntExposed );

	configured.tasks( taskName );
}

export default {
	run,
};
