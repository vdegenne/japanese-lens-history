import {readdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const __dirname = import.meta.dirname;

async function main() {
	const dirPath = join(__dirname, '../dist/data');
	const filenames = await readdir(dirPath);

	for (const filename of filenames) {
		const filePath = join(dirPath, filename);
		const raw = await readFile(filePath, 'utf-8');
		const content = JSON.parse(raw);

		if ('text' in content) {
			continue;
		}

		const labels = content.parts.map((p) => p.label);
		const joinedText = labels.join('');

		content.text = joinedText;

		await writeFile(filePath, JSON.stringify(content), 'utf-8');
	}

	console.log('Done.');
}

main().catch(console.error);
