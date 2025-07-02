import {readdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const __dirname = import.meta.dirname;

async function processBatch(files, dirPath, data) {
	await Promise.all(
		files.map(async (filename) => {
			const filePath = join(dirPath, filename);
			const raw = await readFile(filePath, 'utf-8');
			const content = JSON.parse(raw);
			if (typeof content.text === 'string' && content.text.length > 0) {
				const key = filename.replace(/\.json$/i, '');
				data[key] = content.text;
			}
		}),
	);
}

async function main(batchSize = 5) {
	const dirPath = join(__dirname, '../dist/data');
	const filenames = await readdir(dirPath);

	const data = {};

	// console.time('Execution time');
	for (let i = 0; i < filenames.length; i += batchSize) {
		const batch = filenames.slice(i, i + batchSize);
		await processBatch(batch, dirPath, data);
	}
	// console.timeEnd('Execution time');

	const outputPath = join(__dirname, '../src/filenamesTextsMap.json');
	await writeFile(outputPath, JSON.stringify(data), 'utf-8');

	console.log(`Map filenamesTextsMap.json générée avec batchSize=${batchSize}`);
}

main(20).catch(console.error);
