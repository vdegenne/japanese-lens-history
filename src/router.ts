import {Hash, Router} from '@vdegenne/router';
import {store} from './store.js';

export default new (class {
	hash = new Hash<{search: string}>();

	#router = new Router(async ({}) => {
		await store.updateComplete;
		if (this.hash.has('search')) {
			const search = this.hash.$('search');
			if (search !== store.search) {
				store.search = search;
				store.page = 'search';
			}
		}
	});
})();
