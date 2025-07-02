import {ReactiveController, state} from '@snar/lit';
import {files} from './data.js';
import {saveToLocalStorage} from 'snar-save-to-local-storage';

@saveToLocalStorage('lens-history:store')
export class AppStore extends ReactiveController {
	@state() viewIndex = 0;

	previous() {
		this.viewIndex = (this.viewIndex - 1 + files.length) % files.length;
	}

	next() {
		this.viewIndex = (this.viewIndex + 1) % files.length;
	}

	random() {
		this.viewIndex = Math.floor(Math.random() * files.length);
	}

	first() {
		this.viewIndex = 0;
	}
	last() {
		this.viewIndex = files.length - 1;
	}

	loadFromFileName(filename: string) {
		const index = files.indexOf(filename);
		if (index >= 0) {
			this.viewIndex = index;
		}
	}

	get files() {
		return files;
	}
}

export const store = new AppStore();

// @ts-ignore
window.store = store;
