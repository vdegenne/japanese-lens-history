import {exec} from 'child_process';
import crypto from 'crypto';
import fs from 'node:fs/promises';
import {promisify} from 'util';
import {IMAGES_DIRPATH} from './constants.js';

// Promisify exec so we can use async/await
const execPromise = promisify(exec);

// Helper function to remove base64 header
export function stripBase64Header(base64String: string): string {
	return base64String.replace(/^data:image\/\w+;base64,/, '');
}

// Helper function to generate hash from base64 image data
export async function generateHashFromBase64(
	base64Data: string,
): Promise<string> {
	const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
	const hashBuffer = await crypto.subtle.digest('SHA-256', binaryData);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function getClipboardImageAsBase64(): Promise<string> {
	try {
		// Run the shell command to get Base64 image data
		const {stdout, stderr} = await execPromise(
			'wl-paste | magick - -resize 30% - | base64',
		);

		if (stderr) {
			throw new Error(`stderr: ${stderr}`);
		}

		// Return the Base64 result
		return `data:image/png;base64,${stdout.trim()}`;
	} catch (error) {
		throw new Error(
			`Error executing command: ${error instanceof Error ? error.message : error}`,
		);
	}
}

export async function hashFileExists(hash: string) {
	try {
		const files = await fs.readdir(IMAGES_DIRPATH);
		files.reverse(); // there is more chance that the hash we try to insert already exist from *recently*
		return files.some((filename) => {
			return new RegExp(`^[0-9]+_${hash}\.json$`).test(filename);
		});
	} catch {
		return false;
	}
}
