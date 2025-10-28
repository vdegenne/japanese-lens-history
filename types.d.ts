declare global {
	type Page = 'viewer' | 'search';

	interface ImageInformation {
		image: string;
		parts: {
			label: string;
			style: string;
		}[];
		text: string;
	}

	interface GoogleLensSession {
		id: string;
		timestamp: number;
		base64: string;
	}
}

export {};
