declare module 'tiny-lr' {
	type Options = {
		host: string;
		port: number;
	}

	interface Server {
		listen( port: number, callback?: () => void ): void;

		changed( done: () => void ): void;
	}

	interface TinyLR {
		( opts: Options ): Server,

		Server: Server;

		changed( filePath: string, done?: () => void ): void;
	}

	const tinyLR: TinyLR;
	export default tinyLR;
}
