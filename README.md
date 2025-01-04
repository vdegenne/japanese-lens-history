This project consists of two codebase:

## front

Visualize lenses saved under `./dist/data/`

## back

Helper server used to compile data under `./dist/data/`.
Source file is unique and located at `./src/server.ts`.

The source mainly consists of two api routes:

- `/api/save-lens-session`: Used to associated base64 data (representing the image) with an Google Lens session id.
- `/api/upload`: Used to initiate an upload, saving the base64 data associated with the Google Lens session id on the local filesystem along with the various parts (text locations) found in the image.

This special architecture is enforced due to a recent update in the way Google Lens now operates.
