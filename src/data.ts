import filenamesTextsMap from './filenamesTextsMap.json' with {type: 'json'};

export {filenamesTextsMap};

export const filenames = Object.keys(filenamesTextsMap);

const filenamesTextsEntries = Object.entries(filenamesTextsMap);

/**
 * @returns {string[]} filenames
 */
export function search(search: string): string[] {
	let results = filenamesTextsEntries.filter((e) => e[1].includes(search));
	if (results.length === 0) {
		results = filenamesTextsEntries.filter((e) => e[0].includes(search));
	}
	return results.map((e) => e[0]).reverse();
}
