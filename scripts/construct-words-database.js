import {readdir, readFile, writeFile} from 'node:fs/promises';
import {join, parse} from 'node:path';
const __dirname = import.meta.dirname;

const words = [];
const filenamesWordsDatabase = {};

async function main() {
	const dirPath = join(__dirname, '../dist/data');
	const filenames = await readdir(dirPath);

	let i = 0;
	for (const filename of filenames) {
		if (++i === 20) {
			break;
		}
		const filePath = join(dirPath, filename);
		const contentRaw = await readFile(filePath, 'utf-8');
		const content = JSON.parse(contentRaw);

		const labels = [...new Set(content.parts.map((p) => p.label))];

		const fileWordIds = [];

		for (const label of labels) {
			let index = words.indexOf(label);
			if (index === -1) {
				words.push(label);
				index = words.length - 1;
			}
			fileWordIds.push(index);
		}

		const baseName = parse(filename).name;
		filenamesWordsDatabase[baseName] = fileWordIds;
	}

	await writeFile(
		join(__dirname, '../public/words.json'),
		JSON.stringify(words),
		'utf-8',
	);
	await writeFile(
		join(__dirname, '../public/filenamesWordsDatabase.json'),
		JSON.stringify(filenamesWordsDatabase),
		'utf-8',
	);

	console.log('Done.');
}

main().catch(console.error);
