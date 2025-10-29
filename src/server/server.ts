import {Logger} from '@vdegenne/debug';
import {config} from '@vdegenne/koa';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import pathlib from 'path';
import type {LensHistoryAPI} from './api.js';
import {IMAGES_DIRPATH, PORT} from './constants.js';
import {
	generateHashFromBase64,
	getClipboardImageAsBase64,
	hashFileExists,
	stripBase64Header,
} from './utils.js';

// const __dirname = import.meta.dirname;

const logger = new Logger({color: chalk.yellow});
function log(text: any) {
	logger.log(text);
}

// const sessionsManager = new ArrayJsonDataFile<GoogleLensSession>(
// 	pathlib.resolve(`${__dirname}/../lens-sessions.json`),
// 	{createIfNotExist: true, logger},
// );
// console.log(await sessionsManager.getData());

// const sessions: GoogleLensSession[] = JSON.parse(
// 	(() => {
// 		try {
// 			return fs.readFileSync(CACHED_SESSIONS_FILEPATH).toString();
// 		} catch {
// 			return '[]';
// 		}
// 	})(),
// );
// function saveSessions() {
// 	log('saving sessions to local fs.');
// 	// fs.writeFileSync(CACHED_SESSIONS_FILEPATH, JSON.stringify(sessions));
// }
// async function sessionExists(session: GoogleLensSession | string) {
// 	const sessions = await sessionsManager.getItems();
// 	const sessionId = session instanceof Object ? session.id : session;
// 	const index = sessions.findIndex((s) => s.id === sessionId);
// 	return {
// 		exists: index >= 0,
// 		index,
// 		session: sessions[index],
// 	};
// }
// async function addSession(session: GoogleLensSession) {
// 	const sessions = await sessionsManager.getItems()
// 	const index = sessions.indexOf(session)
// 	const exists = index >= 0
// 	// const {exists, index} = sessionExists(session);
// 	let retCode = 1;
// 	if (exists) {
// 		log('replace session');
// 		sessions[index] = session;
// 	} else {
// 		retCode = 2;
// 		log('add session');
// 		sessionsManager.push(session)
// 	}
// 	// saveSessions();
// 	return retCode;
// }
// function removeSession(session: GoogleLensSession) {
// 	const {exists, index} = sessionExists(session);
// 	if (!exists) {
// 		return;
// 	}
// 	log('removing session');
// 	sessionsManager.splice(index, 1);
// 	saveSessions();
// }

// const writtenSessions: string[] = JSON.parse(
// 	(() => {
// 		try {
// 			return fs.readFileSync(WRITTEN_SESSIONS_FILEPATH).toString();
// 		} catch {
// 			return '[]';
// 		}
// 	})(),
// );
// function saveWrittenSessions() {
// 	log('writing written-sessions.json');
// 	fs.writeFileSync(WRITTEN_SESSIONS_FILEPATH, JSON.stringify(writtenSessions));
// }
// function addWrittenSession(sessionId: string) {
// 	if (writtenSessions.indexOf(sessionId) === -1) {
// 		writtenSessions.push(sessionId);
// 	}
// 	saveWrittenSessions();
// }

let savedIds: string[] = [];

config<LensHistoryAPI>({
	apiVersion: 'api',
	port: PORT,
	useCors: true,
	statics: ['./dist'],
	get: {
		'/ping': () => 'pong',
	},
	post: {
		async '/direct-upload'({ctx, guard}) {
			log('/api/direct-upload route called');
			const {id, base64, parts, directory} = guard({
				required: ['id', 'base64', 'parts'],
				allowAlien: true,
			});
			if (savedIds.includes(id)) {
				logger.error('session already saved');
				ctx.throw('session already saved.');
			}
			if (parts.length === 0) {
				logger.error('parts are empty.');
				ctx.throw(400, 'parts are empty.');
			}
			if (!base64) {
				logger.error('missing base64');
				ctx.throw(400, 'missing base64');
			}

			let base64Image = base64;
			if (base64 === 'clipboard') {
				base64Image = await getClipboardImageAsBase64();
			}
			const nakedBase64Image = stripBase64Header(base64Image);
			const imageHash = await generateHashFromBase64(nakedBase64Image);
			// TODO: we could also make a tighter check
			// take the x most recent files and check the parts if they match, of course the match
			// should make sense over at least parts of length y.
			if (await hashFileExists(imageHash)) {
				logger.log(`This lens is already saved. Ignoring.`);
				ctx.status = 200;
				ctx.body = {message: 'Image already exists, no new file created'};
				return;
			}

			// Prepare the data to store
			const imageData: ImageInformation = {
				image: base64Image,
				parts,
				text: parts.map((p) => p.label).join(''),
			};

			const timestamp = Date.now();

			const filepath = `${IMAGES_DIRPATH}${directory ? `/${directory}` : ''}/${timestamp}_${imageHash}.json`;
			const dataSize = Buffer.byteLength(nakedBase64Image, 'base64');

			logger.log(`writing ${filepath} to system (size: ${dataSize}B)`);

			// Make sure directory exists
			await fs.mkdir(pathlib.dirname(filepath), {recursive: true});
			// Write the data to a new file with the hash as the filename
			await fs.writeFile(filepath, JSON.stringify(imageData), 'utf8');

			log('success writing data');
			savedIds.push(id);
			ctx.status = 201;
			ctx.body = {message: 'Image uploaded and saved'};
		},
	},
});

// let cachedBase64: string = '';
/**
 * This route is used to prepare the base64 data image of the current lens session.
 * A recent update prevents accessing the base64 data of the image loaded in lens.
 * Control page with controller "google-lens-new" module will convert the image in the clipboard
 * to base64 and can use this route to temporarily cache it before using "/api/upload".
 * If no image is cached "/api/upload" will throw.
 */
// router.post('/api/save-lens-session', async (ctx) => {
// 	try {
// 		let {sessionId: id, base64} = ctx.request.body;
// 		if (!id) {
// 			log('missing sessionId');
// 			ctx.throw(400, 'missing "sessionId"');
// 		}
// 		const {exists} = sessionExists(id);
// 		if (exists) {
// 			log('session already exists, skipping.');
// 			return (ctx.body = {});
// 		}
// 		if (!base64) {
// 			log('missing base64');
// 			ctx.throw(
// 				400,
// 				'base64 is required. (use "clipboard" as the value to use data from clipboard)',
// 			);
// 		}
//
// 		// Was it already written?
// 		if (writtenSessions.indexOf(id) >= 0) {
// 			log('this session was already written before, passing...');
// 			return (ctx.body = {});
// 		}
//
// 		if (base64 === 'clipboard') {
// 			base64 = await getClipboardImageAsBase64();
// 		}
//
// 		// Check if the file already exists
// 		const base64Data = stripBase64Header(base64);
// 		const imageHash = await generateHashFromBase64(base64Data);
// 		if (await hashFileExists(imageHash)) {
// 			log('this base64 was already saved, passing...');
// 			return (ctx.body = {});
// 		}
//
// 		const ret = addSession({id, base64, timestamp: Date.now()});
// 		log(`Lens session saved! (${ret === 1 ? 'replaced' : 'new'})`);
// 		ctx.status = 200;
// 		ctx.body = {};
// 	} catch (error) {
// 		ctx.status = 500;
// 		log('failed');
// 		log(error);
// 	}
// });

// Define the /api/upload route
// router.post('/api/upload', async (ctx) => {
// 	const {sessionId: id, base64, parts} = ctx.request.body as UploadBodyParams;
//
// 	if (id === undefined) {
// 		log('sessionId is missing');
// 		ctx.throw(400, 'sessionId is missing');
// 	}
// 	if (parts === undefined) {
// 		log('parts missing');
// 		ctx.throw(400, 'parts missing');
// 	} else if (parts.length === 0) {
// 		log('parts are empty.');
// 		ctx.throw(400, 'parts are empty.');
// 	}
//
// 	let {session} = sessionExists(id);
// 	if (!session) {
// 		if (!base64) {
// 			log(
// 				'no session found in the cache and "base64" was not provided. Make sure you call /api/save-lens-session first. This could also mean the image was already saved.',
// 			);
// 			ctx.throw(
// 				400,
// 				'no session found in the cache and "base64" was not provided.',
// 			);
// 		} else {
// 			session = {
// 				id,
// 				timestamp: Date.now(),
// 				base64,
// 			};
// 		}
// 	}
//
// 	// Strip the base64 header before hashing
// 	const base64Data = stripBase64Header(session.base64);
//
// 	try {
// 		const imageHash = await generateHashFromBase64(base64Data);
//
// 		// Check if the file already exists
// 		if (await hashFileExists(imageHash)) {
// 			log(`This lens is already saved. Ignoring.`);
// 			ctx.status = 200;
// 			ctx.body = {message: 'Image already exists, no new file created'};
// 			return;
// 		}
//
// 		// Prepare the data to store
// 		const imageData: ImageInformation = {
// 			image: session.base64,
// 			parts,
// 			text: parts.map((p) => p.label).join(''),
// 		};
//
// 		// Ensure the directory exists
// 		await fs.ensureDir(IMAGES_DIRPATH);
//
// 		const filePath = `${IMAGES_DIRPATH}/${session.timestamp}_${imageHash}.json`;
// 		const dataSize = Buffer.byteLength(base64Data, 'base64');
//
// 		// Write the data to a new file with the hash as the filename
// 		await fs.writeJson(filePath, imageData);
// 		log(`writing ${filePath} to system (size: ${dataSize}B)`);
//
// 		log('success writing data');
// 		addWrittenSession(session.id);
// 		removeSession(session);
// 		ctx.status = 201;
// 		ctx.body = {message: 'Image uploaded and saved'};
// 	} catch (error) {
// 		ctx.status = 500;
// 		ctx.body = {message: 'Internal server error', error: error.message};
// 	}
// });

// // Use middleware
// app
// 	.use(cors())
// 	.use(
// 		bodyParser({
// 			encoding: 'utf-8',
// 			jsonLimit: '10mb',
// 		}),
// 	)
// 	.use(router.routes())
// 	.use(router.allowedMethods());
//
// // Start the server
// app.listen(PORT, () => {
// 	console.log(`Server is running on http://localhost:${PORT}`);
// });
//
// // TODO: old logger, reuse notify-send in the new one
// function _LOG(text: string) {
// 	logger.log(text);
// 	return;
// 	// if (!DEBUG()) {
// 	// 	return;
// 	// }
// 	// if (typeof text !== 'string' || text.trim() === '') {
// 	// 	throw new Error('Invalid text argument. It must be a non-empty string.');
// 	// }
// 	// console.log(chalk.blue(`[LENS-HIST]	${text.toUpperCase()}`));
// 	// return;
// 	//
// 	// exec(
// 	// 	`notify-send "${text.replace(/"/g, '\\"')}"`,
// 	// 	(error, stdout, stderr) => {
// 	// 		if (error) {
// 	// 			console.error(`Error executing notify-send: ${error.message}`);
// 	// 			return;
// 	// 		}
// 	// 		if (stderr) {
// 	// 			console.error(`Error output from notify-send: ${stderr}`);
// 	// 			return;
// 	// 		}
// 	// 		console.log(`Notification sent: ${text}`);
// 	// 	},
// 	// );
// }
