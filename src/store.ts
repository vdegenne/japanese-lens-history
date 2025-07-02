import {ReactiveController, state} from '@snar/lit';
import {filenames} from './data.js';
import {saveToLocalStorage} from 'snar-save-to-local-storage';

@saveToLocalStorage('lens-history:store')
export class AppStore extends ReactiveController {
	@state() viewIndex = 0;

	previous() {
		this.viewIndex = (this.viewIndex - 1 + filenames.length) % filenames.length;
	}

	next() {
		this.viewIndex = (this.viewIndex + 1) % filenames.length;
	}

	random() {
		this.viewIndex = Math.floor(Math.random() * filenames.length);
	}

	first() {
		this.viewIndex = 0;
	}
	last() {
		this.viewIndex = filenames.length - 1;
	}

	loadFromFileName(filename: string) {
		const index = filenames.indexOf(filename);
		if (index >= 0) {
			this.viewIndex = index;
		}
	}

	get files() {
		return filenames;
	}
}

export const store = new AppStore();

// @ts-ignore
window.store = store;
