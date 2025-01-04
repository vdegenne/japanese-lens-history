import {bodyParser} from '@koa/bodyparser';
import cors from '@koa/cors';
import Router from '@koa/router';
import crypto from 'crypto';
import fs from 'fs-extra';
import Koa from 'koa';
import chalk from 'chalk';
import {exec} from 'child_process';
import {promisify} from 'util';

// Promisify exec so we can use async/await
const execPromise = promisify(exec);

// const __dirname = import.meta.dirname;
interface GoogleLensSession {
	id: string;
	timestamp: number;
	base64: string;
}

const PORT = 3020;
const DEBUG = true;
const IMAGES_DIRPATH = './dist/data/';
const CACHED_SESSIONS_FILEPATH = './lens-sessions.json';
const WRITTEN_SESSIONS_FILEPATH = './written-sessions.json';

const sessions: GoogleLensSession[] = JSON.parse(
	(() => {
		try {
			return fs.readFileSync(CACHED_SESSIONS_FILEPATH).toString();
		} catch {
			return '[]';
		}
	})(),
);
function saveSessions() {
	LOG('saving sessions to local fs.');
	fs.writeFileSync(CACHED_SESSIONS_FILEPATH, JSON.stringify(sessions));
}
function sessionExists(session: GoogleLensSession | string) {
	let sessionId = session instanceof Object ? session.id : session;
	const index = sessions.findIndex((s) => s.id === sessionId);
	return {
		exists: index >= 0,
		index,
		session: sessions[index],
	};
}
function addSession(session: GoogleLensSession) {
	const {exists, index} = sessionExists(session);
	let retCode = 1;
	if (exists) {
		sessions[index] = session;
	} else {
		retCode = 2;
		LOG('add session');
		sessions.push(session);
	}
	saveSessions();
	return retCode;
}
function removeSession(session: GoogleLensSession) {
	const {exists, index} = sessionExists(session);
	if (!exists) {
		return;
	}
	LOG('removing session');
	sessions.splice(index, 1);
	saveSessions();
}

const writtenSessions: string[] = JSON.parse(
	(() => {
		try {
			return fs.readFileSync(WRITTEN_SESSIONS_FILEPATH).toString();
		} catch {
			return '[]';
		}
	})(),
);
function saveWrittenSessions() {
	LOG('writing written-sessions.json');
	fs.writeFileSync(WRITTEN_SESSIONS_FILEPATH, JSON.stringify(writtenSessions));
}
function addWrittenSession(sessionId: string) {
	if (writtenSessions.indexOf(sessionId) === -1) {
		writtenSessions.push(sessionId);
	}
	saveWrittenSessions();
}

// Helper function to remove base64 header
function stripBase64Header(base64String: string): string {
	return base64String.replace(/^data:image\/\w+;base64,/, '');
}

// Helper function to generate hash from base64 image data
async function generateHashFromBase64(base64Data: string): Promise<string> {
	const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
	const hashBuffer = await crypto.subtle.digest('SHA-256', binaryData);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashFileExists(hash: string) {
	const files = await fs.readdir(IMAGES_DIRPATH);
	files.reverse(); // there is more chance that the hash we try to insert already exist from *recently*
	return files.some((filename) => {
		return new RegExp(`^[0-9]+_${hash}\.json$`).test(filename);
	});
}

export async function getClipboardImageAsBase64(): Promise<string> {
	try {
		// Run the shell command to get Base64 image data
		const {stdout, stderr} = await execPromise(
			'wl-paste | magick - -resize 50% - | base64',
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

const app = new Koa();
const router = new Router();

// let cachedBase64: string = '';
/**
 * This route is used to prepare the base64 data image of the current lens session.
 * A recent update prevents accessing the base64 data of the image loaded in lens.
 * Control page with controller "google-lens-new" module will convert the image in the clipboard
 * to base64 and can use this route to temporarily cache it before using "/api/upload".
 * If no image is cached "/api/upload" will throw.
 */
router.post('/api/save-lens-session', async (ctx) => {
	try {
		let {sessionId: id, base64} = ctx.request.body;
		if (!id) {
			LOG('missing sessionId');
			ctx.throw('missing "sessionId"', 400);
		}
		const {exists} = sessionExists(id);
		if (exists) {
			LOG('session already exists, skipping.');
			return (ctx.body = {});
		}
		if (!base64) {
			LOG('missing base64');
			ctx.throw(
				'base64 is required. (use "clipboard" as the value to use data from clipboard)',
				400,
			);
		}

		// Was it already written?
		if (writtenSessions.indexOf(id) >= 0) {
			LOG('this session was already written before, passing...');
			return (ctx.body = {});
		}

		if (base64 === 'clipboard') {
			base64 = await getClipboardImageAsBase64();
		}

		// Check if the file already exists
		const base64Data = stripBase64Header(base64);
		const imageHash = await generateHashFromBase64(base64Data);
		if (await hashFileExists(imageHash)) {
			LOG('this base64 was already saved, passing...');
			return (ctx.body = {});
		}

		const ret = addSession({id, base64, timestamp: Date.now()});
		LOG(`Lens session saved! (${ret === 1 ? 'replaced' : 'new'})`);
		ctx.status = 200;
		ctx.body = {};
	} catch (error) {
		ctx.status = 500;
		LOG('failed');
		LOG(error);
	}
});

// Define the /api/upload route
router.post('/api/upload', async (ctx) => {
	const {sessionId: id, base64, parts} = ctx.request.body;

	if (id === undefined) {
		LOG('sessionId is missing');
		ctx.throw('sessionId is missing', 400);
	}
	if (parts === undefined) {
		LOG('parts missing');
		ctx.throw('parts missing', 400);
	} else if (parts.length === 0) {
		LOG('parts are empty.');
		ctx.throw('parts are empty.', 400);
	}

	let {session} = sessionExists(id);
	if (!session) {
		if (!base64) {
			LOG(
				'no session found in the cache and "base64" was not provided. Make sure you call /api/save-lens-session first. This could also mean the image was already saved.',
			);
			ctx.throw(
				'no session found in the cache and "base64" was not provided.',
				400,
			);
		} else {
			session = {
				id,
				timestamp: Date.now(),
				base64,
			};
		}
	}

	// Strip the base64 header before hashing
	const base64Data = stripBase64Header(session.base64);

	try {
		const imageHash = await generateHashFromBase64(base64Data);

		// Check if the file already exists
		if (await hashFileExists(imageHash)) {
			LOG(`This lens is already saved. Ignoring.`);
			ctx.status = 200;
			ctx.body = {message: 'Image already exists, no new file created'};
			return;
		}

		// Prepare the data to store
		const imageData: ImageInformation = {
			image: session.base64,
			parts,
		};

		// Ensure the directory exists
		await fs.ensureDir(IMAGES_DIRPATH);

		const filePath = `${IMAGES_DIRPATH}/${session.timestamp}_${imageHash}.json`;
		const dataSize = Buffer.byteLength(base64Data, 'base64');

		// Write the data to a new file with the hash as the filename
		await fs.writeJson(filePath, imageData);
		LOG(`writing ${filePath} to system (size: ${dataSize}B)`);

		LOG('success writing data');
		addWrittenSession(session.id);
		removeSession(session);
		ctx.status = 201;
		ctx.body = {message: 'Image uploaded and saved'};
	} catch (error) {
		ctx.status = 500;
		ctx.body = {message: 'Internal server error', error: error.message};
	}
});

// Use middleware
app
	.use(cors())
	.use(
		bodyParser({
			encoding: 'utf-8',
			jsonLimit: '10mb',
		}),
	)
	.use(router.routes())
	.use(router.allowedMethods());

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

function LOG(text: string) {
	if (!DEBUG) {
		return;
	}
	if (typeof text !== 'string' || text.trim() === '') {
		throw new Error('Invalid text argument. It must be a non-empty string.');
	}
	console.log(chalk.blue(`[LENS-HIST]	${text.toUpperCase()}`));
	return;

	exec(
		`notify-send "${text.replace(/"/g, '\\"')}"`,
		(error, stdout, stderr) => {
			if (error) {
				console.error(`Error executing notify-send: ${error.message}`);
				return;
			}
			if (stderr) {
				console.error(`Error output from notify-send: ${stderr}`);
				return;
			}
			console.log(`Notification sent: ${text}`);
		},
	);
}
