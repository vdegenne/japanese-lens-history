import {ReactiveController, state} from '@snar/lit';
import {FormBuilder} from '@vdegenne/forms/FormBuilder';
import {PropertyValues} from 'snar';
import {saveToLocalStorage} from 'snar-save-to-local-storage';
import {filenames, search} from './data.js';

@saveToLocalStorage('lens-history:store')
export class AppStore extends ReactiveController {
	@state() viewIndex = 0;
	@state() page: Page = 'viewer';
	@state() search = '';
	@state() searchResult = [];

	previous = () => {
		this.viewIndex = (this.viewIndex - 1 + filenames.length) % filenames.length;
	};

	next = () => {
		this.viewIndex = (this.viewIndex + 1) % filenames.length;
	};

	random = () => {
		this.viewIndex = Math.floor(Math.random() * filenames.length);
	};

	first = () => {
		this.viewIndex = 0;
	};
	last = () => {
		this.viewIndex = filenames.length - 1;
	};

	updateViewIndexFromFilename(filename: string) {
		const index = filenames.indexOf(filename);
		if (index >= 0) {
			this.viewIndex = index;
		}
	}

	async updated(_changedProperties: PropertyValues<this>) {
		if (_changedProperties.has('page')) {
			switch (this.page) {
				case 'search':
					import('./pages/search-page.js');
					break;
				case 'viewer':
					import('./pages/viewer-page.js');
					break;
			}
		}
		if (_changedProperties.has('search') && this.search) {
			import('./router.js').then(({default: router}) => {
				router.hash.$('search', this.search);
			});
			if (!this.search) {
				this.searchResult = [];
			} else {
				this.searchResult = search(this.search);
			}
		}
	}

	togglePage() {
		if (store.page === 'viewer') {
			store.page = 'search';
		} else {
			store.page = 'viewer';
		}
	}
}

export const store = new AppStore();

export const F = new FormBuilder(store);

// @ts-ignore
window.store = store;
