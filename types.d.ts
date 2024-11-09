declare global {
	interface ImageInformation {
		image: string;
		parts: {
			label: string;
			style: string;
		}[];
	}
}

export {};
