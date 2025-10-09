import filenamesTextsMap from './filenamesTextsMap.json' with {type: 'json'};

export {filenamesTextsMap};

export const filenames = Object.keys(filenamesTextsMap);

const filenamesTextsEntries = Object.entries(filenamesTextsMap);

/**
 * @returns {string[]} filenames
 */
export function search(search: string): string[] {
	const results = filenamesTextsEntries.filter((e) => e[1].includes(search));
	return results.map((e) => e[0]).reverse();
}
