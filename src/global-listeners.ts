import {getThemeStore} from './imports.js';
import {clickButton} from './utils.js';

window.addEventListener('keydown', async (e) => {
	if (e.altKey || e.ctrlKey) {
		return;
	}
	const target = e.composedPath()[0] as Element;
	if (['TEXTAREA', 'INPUT'].includes(target.tagName)) {
		return;
	}
	if (e.key === 'd') {
		(await getThemeStore()).toggleMode();
	}

	if (e.key === 'ArrowLeft') {
		clickButton('#arrow-back');
	}
	if (e.key === 'ArrowRight') {
		clickButton('#arrow-forward');
	}
});

export {};
