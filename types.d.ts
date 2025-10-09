declare global {
	type AllKeysPresent<T, U extends readonly (keyof T)[]> =
		Exclude<keyof T, U[number]> extends never
			? true
			: ['❌ Missing keys', Exclude<keyof T, U[number]>];

	type AllValuesPresent<T, U extends readonly T[]> =
		Exclude<T, U[number]> extends never
			? true
			: ['❌ Missing values', Exclude<T, U[number]>];

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
