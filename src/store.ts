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
}

export const store = new AppStore();
