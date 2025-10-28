import {Rest, type Endpoint} from '@vdegenne/mini-rest';

interface UploadBodyParams {
	id: string;
	base64: string;
	parts: ImageInformation['parts'];
}

export interface LensHistoryAPI {
	get: {
		'/ping': Endpoint<void, 'pong'>;
	};
	post: {
		'/api/direct-upload': Endpoint<UploadBodyParams, void>;
	};
}

export function getAPI(origin = 'http://localhost:3020/api') {
	return new Rest<LensHistoryAPI>(origin);
}
