import fs from 'fs-extra';

const imageDir = './dist/data';

async function hashFileExists(hash) {
	const files = await fs.readdir(imageDir);
	files.reverse(); // there is more chance that the hash we try to insert already exist from *recently*
	const e = files.some((filename) => {
		return new RegExp(`^[0-9]+_${hash}\.json$`).test(filename);
	});
	console.log(e);
}

hashFileExists(
	'e49af18651905152bd649e4451c0a57001c6f844a358c155bdbd05fe56064d5a',
);
