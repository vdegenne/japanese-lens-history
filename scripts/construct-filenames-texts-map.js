import {readdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const __dirname = import.meta.dirname;

async function processBatch(files, dirPath, data) {
	for (const filename of files) {
		const filePath = join(dirPath, filename);
		const raw = await readFile(filePath, 'utf-8');
		const content = JSON.parse(raw);
		if (typeof content.text === 'string' && content.text.length > 0) {
			const key = filename.replace(/\.json$/i, '');
			data[key] = content.text;
		}
	}
}

async function main(batchSize = 5) {
	const dirPath = join(__dirname, '../dist/data');
	let filenames = await readdir(dirPath);

	// Sort filenames by timestamp ascending
	filenames = filenames
		.filter((name) => /^\d+_/.test(name))
		.sort((a, b) => {
			const tsA = parseInt(a.split('_')[0], 10);
			const tsB = parseInt(b.split('_')[0], 10);
			return tsA - tsB;
		});

	const data = {};

	for (let i = 0; i < filenames.length; i += batchSize) {
		const batch = filenames.slice(i, i + batchSize);
		await processBatch(batch, dirPath, data);
	}

	const outputPath = join(__dirname, '../src/filenamesTextsMap.json');
	await writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');

	console.log(
		`Map filenamesTextsMap.json generated with batchSize=${batchSize}`,
	);
}

main(20).catch(console.error);
