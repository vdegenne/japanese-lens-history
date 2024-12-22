import fs from 'fs/promises';
import path from 'path';

// Recreate __dirname for ESM
const __dirname = import.meta.dirname;

const DIST_DIR = path.join(__dirname, '../dist/data');
const OUTPUT_FILE = path.join(__dirname, '../src/files-array.json');

// Function to scan the directory and get the list of filenames along with their creation time
async function getFilesFromDirectory(dir) {
	try {
		const files = await fs.readdir(dir);
		return files.map((file) => file.replace(/\.json$/, ''));
	} catch (err) {
		throw new Error('Error reading directory: ' + err);
	}
}

// Function to write the files list to the output JSON
async function writeFilesArrayToJson(files) {
	const data = {files};
	try {
		await fs.writeFile(OUTPUT_FILE, JSON.stringify(data));
		console.log('File successfully written!');
	} catch (err) {
		throw new Error('Error writing to file: ' + err);
	}
}

// Main function
async function generateFilesArray() {
	try {
		const files = await getFilesFromDirectory(DIST_DIR);
		await writeFilesArrayToJson(files);
		console.log('files-array.json created successfully in src directory');
	} catch (error) {
		console.error('Error: ', error.message);
	}
}

generateFilesArray();
