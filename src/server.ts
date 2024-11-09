import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import {bodyParser} from '@koa/bodyparser';
import fs from 'fs-extra';
import crypto from 'crypto';

// Set up Koa app
const app = new Koa();
const router = new Router();

// Directory where images will be stored
const imageDir = './dist/data';

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

// Define the /api/upload route
router.post('/api/upload', async (ctx) => {
	const body: ImageInformation = ctx.request.body;

	// Ensure required fields exist
	if (!body || !body.image) {
		ctx.status = 400;
		ctx.body = {message: 'Missing image data'};
		return;
	}

	// Strip the base64 header before hashing
	const base64Data = stripBase64Header(body.image);

	try {
		// Generate a unique filename based on the image's hash
		const imageHash = await generateHashFromBase64(base64Data);
		const filePath = `${imageDir}/${imageHash}.json`;

		// Check if the file already exists
		if (fs.existsSync(filePath)) {
			ctx.status = 200;
			ctx.body = {message: 'Image already exists, no new file created'};
			return;
		}

		// Prepare the data to store
		const imageData = {
			image: body.image,
			parts: body.parts,
		};

		// Ensure the directory exists
		await fs.ensureDir(imageDir);

		// Write the data to a new file with the hash as the filename
		await fs.writeJson(filePath, imageData);

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
	.use(bodyParser())
	.use(router.routes())
	.use(router.allowedMethods());

// Start the server
const port = 3020;
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
