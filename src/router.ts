import {Hash, Router} from '@vdegenne/router';
import toast from 'toastit';
import {store} from './store.js';

export default new (class {
	hash = new Hash<{search: string; page: Page}>();

	#router = new Router(async ({}) => {
		await store.updateComplete;
		toast(`${store.search} ${store.page}`);
		if (this.hash.has('search')) {
			const search = this.hash.$('search');
			if (search !== store.search) {
				store.search = search;
				store.page = 'search';
			}
		}
		if (this.hash.has('page')) {
			store.page = this.hash.$('page') as Page;
		}
	});
})();
