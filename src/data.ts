import filenamesTextsMap from './filenamesTextsMap.json' with {type: 'json'};
import {store} from './store.js';

setTimeout(() => {
	const keys = Object.keys(filenamesTextsMap);
	const last = keys[keys.length - 1];
	console.log(last);
	store.updateViewIndexFromFilename(last);
}, 2000);

export const filenames = Object.keys(filenamesTextsMap);
export {filenamesTextsMap};

const filenamesTextsEntries = Object.entries(filenamesTextsMap);

/**
 * @returns {string[]} filenames
 */
export function search(search: string): string[] {
	const results = filenamesTextsEntries.filter((e) => e[1].includes(search));
	return results.map((e) => e[0]);
}
