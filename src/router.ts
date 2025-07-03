import {ReactiveController, state} from '@snar/lit';
import {installRouter} from 'pwa-helpers';
import {store} from './store.js';

export enum Page {
	HOME,
	SESSION,
}

class Router extends ReactiveController {
	@state() page: Page = Page.HOME;

	navigateComplete = Promise.resolve();

	constructor() {
		super();
		installRouter(async (location) => {
			this.navigateComplete = new Promise(async (resolve) => {
				await store.updateComplete;
				// const hash = location.hash.slice(1);
				// const hasParams = new URLSearchParams(hash);
				const params = new URLSearchParams(location.search);
				if (params.has('search')) {
					store.search = params.get('search');
				}
				resolve();
			});
		});
	}
}

export const router = new Router();
