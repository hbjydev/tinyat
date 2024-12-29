export class XRPCError extends Error {
	constructor(
		message: string,
		public code = 'SERVER_ERROR',
		public status = 500,
		public log = false,
	) {
		super(message);
	}
}
