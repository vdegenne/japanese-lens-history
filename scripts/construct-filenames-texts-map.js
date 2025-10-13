import {readdir, readFile, writeFile} from 'node:fs/promises';
import {join, extname} from 'node:path';

const __dirname = import.meta.dirname;

async function processBatch(files, data) {
	for (const filePath of files) {
		const raw = await readFile(filePath, 'utf-8');
		const content = JSON.parse(raw);
		if (typeof content.text === 'string' && content.text.length > 0) {
			const key = filePath
				.split('dist/data/')[1] // keep relative path
				.replace(/\.json$/i, '')
				.replaceAll('\\', '/'); // normalize Windows paths
			data[key] = content.text;
		}
	}
}

// Recursively get all .json files
async function getAllJsonFiles(dir) {
	const entries = await readdir(dir, {withFileTypes: true});
	const files = [];
	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await getAllJsonFiles(fullPath)));
		} else if (extname(entry.name).toLowerCase() === '.json') {
			files.push(fullPath);
		}
	}
	return files;
}

async function main(batchSize = 5) {
	const dirPath = join(__dirname, '../dist/data');
	let allFiles = await getAllJsonFiles(dirPath);

	// Sort files by timestamp in filename if available
	allFiles = allFiles
		.filter((f) => /^\d+_/.test(f.split('/').pop()))
		.sort((a, b) => {
			const tsA = parseInt(a.split('/').pop().split('_')[0], 10);
			const tsB = parseInt(b.split('/').pop().split('_')[0], 10);
			return tsA - tsB;
		});

	const data = {};

	for (let i = 0; i < allFiles.length; i += batchSize) {
		const batch = allFiles.slice(i, i + batchSize);
		await processBatch(batch, data);
	}

	const outputPath = join(__dirname, '../src/filenamesTextsMap.json');
	await writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');

	console.log(
		`Map filenamesTextsMap.json generated with batchSize=${batchSize}`,
	);
}

main(20).catch(console.error);
