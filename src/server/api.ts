import {Rest, type Endpoint} from '@vdegenne/mini-rest';

interface UploadBodyParams {
	id: string;
	base64: string;
	parts: {
		label: string;
		style: string;
	}[];
	directory?: string;
}

export interface LensHistoryAPI {
	get: {
		'/ping': Endpoint<void, 'pong'>;
	};
	post: {
		'/direct-upload': Endpoint<UploadBodyParams, void>;
	};
}

export function getApi(origin = 'http://localhost:3020/api') {
	return new Rest<LensHistoryAPI>(origin);
}
