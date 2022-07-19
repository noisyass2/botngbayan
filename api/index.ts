import { promises as fs, rmSync } from 'fs';
import express, { Express, Request, Response } from 'express';
const api = require('./api')

const app:Express = express();

export async function setupAPI() {
	let appjs = await fs.readFile('./viewer/app.js', 'utf-8');
	appjs = appjs.replace('{CLIENTID}', process.env.CLIENT_ID ?? "")
	appjs = appjs.replace('{CLIENTSECRET}', process.env.CLIENT_SECRET ?? "")
	await fs.writeFile('./viewer/app.js',appjs,'utf-8');
	app.get('/',(req: Request, res: Response) => {
		res.send("HELLO FROM BOT NG BAYAN!");
	})

	app.use(express.static('viewer'));
    app.use('/api', api);

    //console.log(api);

	app.listen(process.env.PORT, () => {
		console.log(`⚡️[server]: Server is running at https://localhost:${process.env.PORT}`);
		
	});

}

